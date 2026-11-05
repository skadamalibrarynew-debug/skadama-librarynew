import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken
} from './services/firebaseAuth';
import {
  Peminjaman,
  BukuPaket,
  PengaturanPerpustakaan,
  DashboardStats,
  Pengguna,
  Kelas
} from './types/library';
import {
  getInitialData,
  saveLocalData,
  createGoogleSpreadsheet,
  readSpreadsheetData,
  appendLoanToSheet,
  syncAllPeminjamanToSheet,
  syncAllBukuToSheet,
  syncPengaturanToSheet,
  syncAllPenggunaToSheet,
  syncAllKelasToSheet,
  DEFAULT_PENGATURAN,
  INITIAL_PENGGUNA,
  INITIAL_KELAS
} from './services/sheetsService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { FormPinjamView } from './components/FormPinjamView';
import { DataPinjamView } from './components/DataPinjamView';
import { PengembalianView } from './components/PengembalianView';
import { DaftarBukuView } from './components/DaftarBukuView';
import { PenggunaView } from './components/PenggunaView';
import { KelasView } from './components/KelasView';
import { GasDeployGuideView } from './components/GasDeployGuideView';
import { PengaturanView } from './components/PengaturanView';
import { ConfirmModal } from './components/ConfirmModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // App Data
  const [peminjamanList, setPeminjamanList] = useState<Peminjaman[]>([]);
  const [bukuList, setBukuList] = useState<BukuPaket[]>([]);
  const [pengaturan, setPengaturan] = useState<PengaturanPerpustakaan>(DEFAULT_PENGATURAN);
  const [penggunaList, setPenggunaList] = useState<Pengguna[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  // Interaction State
  const [editingLoan, setEditingLoan] = useState<Peminjaman | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Mandatory Workspace User Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    detailItem?: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  }, []);

  // Initialize Data & Auth
  useEffect(() => {
    const initial = getInitialData();
    setPeminjamanList(initial.peminjaman);
    setBukuList(initial.daftarBuku);
    setPengaturan(initial.pengaturan);
    setPenggunaList(initial.pengguna || INITIAL_PENGGUNA);
    setKelasList(initial.kelas || INITIAL_KELAS);

    // Init Firebase Auth
    initAuth(
      (authedUser) => {
        setUser(authedUser);
      },
      () => {
        setUser(null);
      }
    );
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    if (peminjamanList.length > 0 || bukuList.length > 0 || penggunaList.length > 0 || kelasList.length > 0) {
      saveLocalData(peminjamanList, bukuList, pengaturan, penggunaList, kelasList);
    }
  }, [peminjamanList, bukuList, pengaturan, penggunaList, kelasList]);

  // Compute Dashboard Statistics
  const dashboardStats: DashboardStats = useMemo(() => {
    const uniqueStudents = new Set<string>();
    let totalBukuDipinjam = 0;
    let totalPeminjamanHariIni = 0;
    let totalBukuSudahKembali = 0;
    let totalBukuBelumKembali = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    peminjamanList.forEach((item) => {
      uniqueStudents.add(item.namaSiswa.toLowerCase().trim());
      const qty = item.jumlahBuku || 1;
      totalBukuDipinjam += qty;

      if (item.tanggalPinjam === todayStr) {
        totalPeminjamanHariIni += 1;
      }

      if (item.status === 'Sudah Dikembalikan') {
        totalBukuSudahKembali += qty;
      } else {
        totalBukuBelumKembali += qty;
      }
    });

    return {
      totalSiswaMeminjam: uniqueStudents.size,
      totalBukuDipinjam,
      totalPeminjamanHariIni,
      totalBukuSudahKembali,
      totalBukuBelumKembali,
    };
  }, [peminjamanList]);

  // 5 Most recent loans
  const recentLoans = useMemo(() => {
    return [...peminjamanList].reverse().slice(0, 5);
  }, [peminjamanList]);

  // Handle Google Login
  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        showToast('success', `Berhasil masuk sebagai ${res.user.displayName || res.user.email}`);

        // If spreadsheet ID is already set, load from it
        if (pengaturan.spreadsheetId) {
          handleRefreshData(pengaturan.spreadsheetId);
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      showToast('error', error.message || 'Gagal masuk dengan Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    showToast('info', 'Anda telah keluar dari akun Google.');
  };

  // Handle Creating New Spreadsheet
  const handleCreateNewSpreadsheet = async () => {
    const token = await getAccessToken();
    if (!token) {
      showToast('error', 'Silakan masuk dengan akun Google terlebih dahulu.');
      return;
    }

    try {
      setIsSyncing(true);
      showToast('info', 'Membuat Google Spreadsheet Database baru di Google Drive Anda...');

      const result = await createGoogleSpreadsheet('Database Perpustakaan Sekolah');
      const updatedConfig: PengaturanPerpustakaan = {
        ...pengaturan,
        spreadsheetId: result.spreadsheetId,
        spreadsheetUrl: result.spreadsheetUrl,
      };

      setPengaturan(updatedConfig);
      saveLocalData(peminjamanList, bukuList, updatedConfig);

      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      showToast('success', 'Spreadsheet Database Perpustakaan berhasil dibuat dan disinkronkan!');
    } catch (err: unknown) {
      const error = err as Error;
      showToast('error', error.message || 'Gagal membuat Google Spreadsheet');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Refresh Data from Spreadsheet
  const handleRefreshData = async (targetId?: string) => {
    const sheetId = targetId || pengaturan.spreadsheetId;
    if (!sheetId) {
      showToast('info', 'Data lokal dimuat.');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      showToast('info', 'Masuk dengan Google untuk menyinkronkan data langsung dari Spreadsheet.');
      return;
    }

    try {
      setIsSyncing(true);
      const data = await readSpreadsheetData(sheetId);
      if (data.peminjaman.length > 0) setPeminjamanList(data.peminjaman);
      if (data.daftarBuku.length > 0) setBukuList(data.daftarBuku);
      if (data.pengguna && data.pengguna.length > 0) setPenggunaList(data.pengguna);
      if (data.kelas && data.kelas.length > 0) setKelasList(data.kelas);
      setPengaturan((prev) => ({
        ...prev,
        ...data.pengaturan,
        spreadsheetId: sheetId,
      }));
      showToast('success', 'Data berhasil disinkronkan dengan Google Spreadsheet.');
    } catch (err: unknown) {
      const error = err as Error;
      showToast('error', error.message || 'Gagal sinkronisasi data');
    } finally {
      setIsSyncing(false);
    }
  };

  // Save / Update Loan
  const handleSaveLoan = async (
    loanData: Omit<Peminjaman, 'id' | 'status' | 'tanggalKembali'> & { id?: string }
  ) => {
    if (loanData.id) {
      // EDIT MODE: Required user confirmation for modifying existing data
      setConfirmModal({
        isOpen: true,
        title: 'Perbarui Data Peminjaman?',
        message: 'Anda akan memperbarui rincian peminjaman siswa ini di database.',
        detailItem: `ID Transaksi: ${loanData.id} | Siswa: ${loanData.namaSiswa} | Buku: ${loanData.bukuPaket}`,
        confirmLabel: 'Ya, Perbarui',
        isDestructive: false,
        onConfirm: async () => {
          try {
            setConfirmModal((prev) => ({ ...prev, isLoading: true }));
            const updatedList = peminjamanList.map((item) => {
              if (item.id === loanData.id) {
                return {
                  ...item,
                  namaSiswa: loanData.namaSiswa,
                  bukuPaket: loanData.bukuPaket,
                  kelas: loanData.kelas,
                  tanggalPinjam: loanData.tanggalPinjam,
                  jumlahBuku: loanData.jumlahBuku,
                  keterangan: loanData.keterangan,
                };
              }
              return item;
            });

            setPeminjamanList(updatedList);
            setEditingLoan(null);

            // Sync with Google Sheets if connected
            if (pengaturan.spreadsheetId) {
              const token = await getAccessToken();
              if (token) {
                await syncAllPeminjamanToSheet(pengaturan.spreadsheetId, updatedList);
              }
            }

            showToast('success', 'Data peminjaman berhasil diperbarui!');
            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
            setCurrentTab('dataPinjam');
          } catch (err: unknown) {
            const error = err as Error;
            showToast('error', error.message || 'Gagal memperbarui data');
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          }
        },
      });
      return;
    }

    // NEW LOAN MODE
    const dateClean = loanData.tanggalPinjam.replace(/-/g, '');
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newId = `PJ-${dateClean}-${randomSuffix}`;

    const newLoan: Peminjaman = {
      id: newId,
      namaSiswa: loanData.namaSiswa,
      bukuPaket: loanData.bukuPaket,
      kelas: loanData.kelas,
      tanggalPinjam: loanData.tanggalPinjam,
      jumlahBuku: loanData.jumlahBuku,
      tanggalKembali: '-',
      status: 'Belum Dikembalikan',
      keterangan: loanData.keterangan,
    };

    const nextList = [...peminjamanList, newLoan];
    setPeminjamanList(nextList);

    // Sync with Google Sheets if connected
    if (pengaturan.spreadsheetId) {
      const token = await getAccessToken();
      if (token) {
        try {
          await appendLoanToSheet(pengaturan.spreadsheetId, newLoan);
        } catch {
          await syncAllPeminjamanToSheet(pengaturan.spreadsheetId, nextList);
        }
      }
    }

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    showToast('success', `Peminjaman berhasil dicatat dengan ID: ${newId}`);
    setCurrentTab('dataPinjam');
  };

  // Delete Loan (MANDATORY User Confirmation for Destructive Action)
  const handleDeleteLoan = (id: string) => {
    const target = peminjamanList.find((l) => l.id === id);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Peminjaman?',
      message:
        'Tindakan ini akan menghapus data peminjaman secara permanen dari basis data perpustakaan.',
      detailItem: `ID: ${target.id} | Siswa: ${target.namaSiswa} (${target.kelas}) | Buku: ${target.bukuPaket}`,
      confirmLabel: 'Ya, Hapus Permanen',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const nextList = peminjamanList.filter((l) => l.id !== id);
          setPeminjamanList(nextList);

          if (pengaturan.spreadsheetId) {
            const token = await getAccessToken();
            if (token) {
              await syncAllPeminjamanToSheet(pengaturan.spreadsheetId, nextList);
            }
          }

          if (editingLoan?.id === id) setEditingLoan(null);

          showToast('success', `Data transaksi ${id} berhasil dihapus.`);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err: unknown) {
          const error = err as Error;
          showToast('error', error.message || 'Gagal menghapus data');
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Process Return
  const handleProcessReturn = async (id: string, tanggalKembali: string) => {
    const updatedList = peminjamanList.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          status: 'Sudah Dikembalikan' as const,
          tanggalKembali: tanggalKembali || new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });

    setPeminjamanList(updatedList);

    if (pengaturan.spreadsheetId) {
      const token = await getAccessToken();
      if (token) {
        await syncAllPeminjamanToSheet(pengaturan.spreadsheetId, updatedList);
      }
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    showToast('success', 'Buku telah berhasil ditandai sebagai Sudah Dikembalikan!');
  };

  // Quick return from dashboard or table
  const handleQuickReturn = (loan: Peminjaman) => {
    const today = new Date().toISOString().split('T')[0];
    setConfirmModal({
      isOpen: true,
      title: 'Kembalikan Buku Sekarang?',
      message: `Konfirmasi pengembalian buku "${loan.bukuPaket}" oleh ${loan.namaSiswa}? Status akan diubah menjadi 'Sudah Dikembalikan' per hari ini (${today}).`,
      detailItem: `ID: ${loan.id} | Siswa: ${loan.namaSiswa} | Buku: ${loan.bukuPaket}`,
      confirmLabel: 'Ya, Kembalikan Buku',
      isDestructive: false,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isLoading: true }));
        await handleProcessReturn(loan.id, today);
        setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
      },
    });
  };

  // Import Loans (Batch append or replace)
  const handleImportLoans = async (importedLoans: Peminjaman[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      // Destructive replace requires user confirmation
      setConfirmModal({
        isOpen: true,
        title: 'Timpa Seluruh Data Peminjaman?',
        message: `Anda akan menggantikan seluruh ${peminjamanList.length} data peminjaman yang ada dengan ${importedLoans.length} data dari file impor. Data lama akan dihapus permanen.`,
        detailItem: `Jumlah Data Baru: ${importedLoans.length} transaksi`,
        confirmLabel: 'Ya, Timpa Seluruh Data',
        isDestructive: true,
        onConfirm: async () => {
          try {
            setConfirmModal((prev) => ({ ...prev, isLoading: true }));
            setPeminjamanList(importedLoans);

            if (pengaturan.spreadsheetId) {
              const token = await getAccessToken();
              if (token) {
                await syncAllPeminjamanToSheet(pengaturan.spreadsheetId, importedLoans);
              }
            }

            confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
            showToast('success', `Berhasil mengimpor dan menimpa ${importedLoans.length} data peminjaman!`);
            setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
          } catch (err: unknown) {
            const error = err as Error;
            showToast('error', error.message || 'Gagal mengimpor data');
            setConfirmModal((prev) => ({ ...prev, isLoading: false }));
          }
        },
      });
      return;
    }

    // Append mode
    const existingIds = new Set(peminjamanList.map((l) => l.id));
    const toAppend: Peminjaman[] = [];

    importedLoans.forEach((item) => {
      let finalId = item.id;
      // If ID already exists in current list, create a unique one
      if (existingIds.has(finalId)) {
        const dateClean = (item.tanggalPinjam || new Date().toISOString().split('T')[0]).replace(/-/g, '');
        const rand = Math.floor(100 + Math.random() * 900);
        finalId = `PJ-${dateClean}-${rand}`;
      }
      existingIds.add(finalId);
      toAppend.push({ ...item, id: finalId });
    });

    const nextList = [...peminjamanList, ...toAppend];
    setPeminjamanList(nextList);

    if (pengaturan.spreadsheetId) {
      const token = await getAccessToken();
      if (token) {
        try {
          await syncAllPeminjamanToSheet(pengaturan.spreadsheetId, nextList);
        } catch {
          // Fallback to local
        }
      }
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    showToast('success', `Berhasil menambahkan ${toAppend.length} data peminjaman dari file impor!`);
  };

  // Save Book
  const handleSaveBuku = async (buku: BukuPaket) => {
    const existingIndex = bukuList.findIndex((b) => b.idBuku === buku.idBuku);
    let nextList: BukuPaket[];

    if (existingIndex > -1) {
      nextList = [...bukuList];
      nextList[existingIndex] = buku;
      showToast('success', `Buku "${buku.namaBuku}" berhasil diperbarui.`);
    } else {
      nextList = [...bukuList, buku];
      showToast('success', `Buku baru "${buku.namaBuku}" berhasil ditambahkan.`);
    }

    setBukuList(nextList);

    if (pengaturan.spreadsheetId) {
      const token = await getAccessToken();
      if (token) {
        await syncAllBukuToSheet(pengaturan.spreadsheetId, nextList);
      }
    }
  };

  // Delete Book (MANDATORY User Confirmation)
  const handleDeleteBuku = (idBuku: string) => {
    const target = bukuList.find((b) => b.idBuku === idBuku);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Buku Paket?',
      message: `Anda akan menghapus buku "${target.namaBuku}" dari katalog perpustakaan.`,
      detailItem: `ID: ${target.idBuku} | Nama: ${target.namaBuku} | Kelas: ${target.kelas} | Stok: ${target.stokBuku} eks`,
      confirmLabel: 'Ya, Hapus Buku',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const nextList = bukuList.filter((b) => b.idBuku !== idBuku);
          setBukuList(nextList);

          if (pengaturan.spreadsheetId) {
            const token = await getAccessToken();
            if (token) {
              await syncAllBukuToSheet(pengaturan.spreadsheetId, nextList);
            }
          }

          showToast('success', `Buku ${target.namaBuku} berhasil dihapus dari katalog.`);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err: unknown) {
          const error = err as Error;
          showToast('error', error.message || 'Gagal menghapus buku');
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Import Buku
  const handleImportBuku = async (
    imported: BukuPaket[],
    mode: 'append' | 'replace'
  ) => {
    let nextList: BukuPaket[] = [];
    if (mode === 'replace') {
      nextList = imported;
    } else {
      const seenNames = new Set(bukuList.map((b) => b.namaBuku.toLowerCase()));
      const toAdd: BukuPaket[] = [];
      imported.forEach((b) => {
        if (!seenNames.has(b.namaBuku.toLowerCase())) {
          seenNames.add(b.namaBuku.toLowerCase());
          toAdd.push(b);
        }
      });
      nextList = [...bukuList, ...toAdd];
    }

    setBukuList(nextList);

    if (pengaturan.spreadsheetId) {
      try {
        const token = await getAccessToken();
        if (token) {
          await syncAllBukuToSheet(pengaturan.spreadsheetId, nextList);
        }
      } catch (sheetErr) {
        console.warn('Gagal sinkronisasi Buku ke spreadsheet:', sheetErr);
      }
    }

    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    showToast('success', `Berhasil mengimpor ${imported.length} data buku paket!`);
  };

  // Save Pengguna
  const handleSavePengguna = async (pengguna: Pengguna) => {
    const existingIndex = penggunaList.findIndex((u) => u.id === pengguna.id);
    let nextList: Pengguna[];
    if (existingIndex > -1) {
      nextList = [...penggunaList];
      nextList[existingIndex] = pengguna;
      showToast('success', `Data pengguna "${pengguna.namaPengguna}" berhasil diperbarui.`);
    } else {
      nextList = [...penggunaList, pengguna];
      showToast('success', `Pengguna baru "${pengguna.namaPengguna}" berhasil ditambahkan.`);
    }
    setPenggunaList(nextList);

    if (pengaturan.spreadsheetId) {
      try {
        const token = await getAccessToken();
        if (token) {
          await syncAllPenggunaToSheet(pengaturan.spreadsheetId, nextList);
        }
      } catch (sheetErr) {
        console.warn('Gagal sinkronisasi Pengguna ke spreadsheet:', sheetErr);
      }
    }
  };

  // Delete Pengguna (MANDATORY User Confirmation)
  const handleDeletePengguna = (id: string) => {
    const target = penggunaList.find((u) => u.id === id);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Pengguna?',
      message: `Anda akan menghapus data pengguna "${target.namaPengguna}" (${target.jabatan}) dari sistem perpustakaan.`,
      detailItem: `ID: ${target.id} | Nama: ${target.namaPengguna} | Jabatan: ${target.jabatan}`,
      confirmLabel: 'Ya, Hapus Pengguna',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const nextList = penggunaList.filter((u) => u.id !== id);
          setPenggunaList(nextList);

          if (pengaturan.spreadsheetId) {
            try {
              const token = await getAccessToken();
              if (token) {
                await syncAllPenggunaToSheet(pengaturan.spreadsheetId, nextList);
              }
            } catch (sheetErr) {
              console.warn('Gagal sinkronisasi hapus Pengguna ke spreadsheet:', sheetErr);
            }
          }

          showToast('success', `Pengguna "${target.namaPengguna}" berhasil dihapus.`);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err: unknown) {
          const error = err as Error;
          showToast('error', error.message || 'Gagal menghapus pengguna');
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Import Pengguna
  const handleImportPengguna = async (
    imported: Pengguna[],
    mode: 'append' | 'replace'
  ): Promise<{ successCount: number; failedCount: number }> => {
    let nextList: Pengguna[] = [];
    if (mode === 'replace') {
      nextList = imported;
    } else {
      const seenNames = new Set(penggunaList.map((u) => u.namaPengguna.toLowerCase()));
      const toAdd: Pengguna[] = [];
      imported.forEach((u) => {
        if (!seenNames.has(u.namaPengguna.toLowerCase())) {
          seenNames.add(u.namaPengguna.toLowerCase());
          toAdd.push(u);
        }
      });
      nextList = [...penggunaList, ...toAdd];
    }

    setPenggunaList(nextList);

    if (pengaturan.spreadsheetId) {
      try {
        const token = await getAccessToken();
        if (token) {
          await syncAllPenggunaToSheet(pengaturan.spreadsheetId, nextList);
        }
      } catch (sheetErr) {
        console.warn('Gagal sinkronisasi impor Pengguna ke spreadsheet:', sheetErr);
      }
    }

    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    showToast('success', `Berhasil mengimpor ${imported.length} data pengguna!`);
    return { successCount: imported.length, failedCount: 0 };
  };

  // Save Kelas
  const handleSaveKelas = async (kelas: Kelas) => {
    const existingIndex = kelasList.findIndex((k) => k.id === kelas.id);
    let nextList: Kelas[];
    if (existingIndex > -1) {
      nextList = [...kelasList];
      nextList[existingIndex] = kelas;
      showToast('success', `Data kelas "${kelas.namaKelasLengkap}" berhasil diperbarui.`);
    } else {
      nextList = [...kelasList, kelas];
      showToast('success', `Kelas baru "${kelas.namaKelasLengkap}" berhasil ditambahkan.`);
    }
    setKelasList(nextList);

    if (pengaturan.spreadsheetId) {
      try {
        const token = await getAccessToken();
        if (token) {
          await syncAllKelasToSheet(pengaturan.spreadsheetId, nextList);
        }
      } catch (sheetErr) {
        console.warn('Gagal sinkronisasi Kelas ke spreadsheet:', sheetErr);
      }
    }
  };

  // Delete Kelas (MANDATORY User Confirmation)
  const handleDeleteKelas = (id: string) => {
    const target = kelasList.find((k) => k.id === id);
    if (!target) return;

    setConfirmModal({
      isOpen: true,
      title: 'Hapus Data Kelas?',
      message: `Anda akan menghapus kelas "${target.namaKelasLengkap}" dari sistem perpustakaan.`,
      detailItem: `ID: ${target.id} | Tingkat: ${target.tingkatKelas} | Jurusan: ${target.jurusan} | Rombel: ${target.rombel}`,
      confirmLabel: 'Ya, Hapus Kelas',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          const nextList = kelasList.filter((k) => k.id !== id);
          setKelasList(nextList);

          if (pengaturan.spreadsheetId) {
            try {
              const token = await getAccessToken();
              if (token) {
                await syncAllKelasToSheet(pengaturan.spreadsheetId, nextList);
              }
            } catch (sheetErr) {
              console.warn('Gagal sinkronisasi hapus Kelas ke spreadsheet:', sheetErr);
            }
          }

          showToast('success', `Kelas "${target.namaKelasLengkap}" berhasil dihapus.`);
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        } catch (err: unknown) {
          const error = err as Error;
          showToast('error', error.message || 'Gagal menghapus kelas');
          setConfirmModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Import Kelas
  const handleImportKelas = async (
    imported: Kelas[],
    mode: 'append' | 'replace'
  ): Promise<{ successCount: number; failedCount: number }> => {
    let nextList: Kelas[] = [];
    if (mode === 'replace') {
      nextList = imported;
    } else {
      const seenSignatures = new Set(
        kelasList.map(
          (k) =>
            `${k.tingkatKelas.toUpperCase()}-${k.jurusan.toUpperCase()}-${k.rombel.toUpperCase()}`
        )
      );
      const toAdd: Kelas[] = [];
      imported.forEach((k) => {
        const sig = `${k.tingkatKelas.toUpperCase()}-${k.jurusan.toUpperCase()}-${k.rombel.toUpperCase()}`;
        if (!seenSignatures.has(sig)) {
          seenSignatures.add(sig);
          toAdd.push(k);
        }
      });
      nextList = [...kelasList, ...toAdd];
    }

    setKelasList(nextList);

    if (pengaturan.spreadsheetId) {
      try {
        const token = await getAccessToken();
        if (token) {
          await syncAllKelasToSheet(pengaturan.spreadsheetId, nextList);
        }
      } catch (sheetErr) {
        console.warn('Gagal sinkronisasi impor Kelas ke spreadsheet:', sheetErr);
      }
    }

    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    showToast('success', `Berhasil mengimpor ${imported.length} data kelas!`);
    return { successCount: imported.length, failedCount: 0 };
  };

  // Save Settings
  const handleSavePengaturan = async (newConfig: PengaturanPerpustakaan) => {
    setPengaturan(newConfig);
    saveLocalData(peminjamanList, bukuList, newConfig, penggunaList, kelasList);

    if (newConfig.spreadsheetId) {
      const token = await getAccessToken();
      if (token) {
        await syncPengaturanToSheet(newConfig.spreadsheetId, newConfig);
      }
    }

    showToast('success', 'Pengaturan perpustakaan berhasil disimpan!');
  };

  const getPageTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Dashboard Perpustakaan',
          subtitle: `${pengaturan.namaPerpustakaan} - ${pengaturan.namaSekolah}`,
        };
      case 'formPinjam':
        return {
          title: editingLoan ? 'Edit Data Peminjaman' : 'Formulir Peminjaman Buku',
          subtitle: 'Catat transaksi peminjaman buku paket untuk siswa sekolah',
        };
      case 'dataPinjam':
        return {
          title: 'Data Lengkap Peminjaman',
          subtitle: 'Pencarian, filter, edit, dan rekapitulasi data peminjaman buku',
        };
      case 'kembaliBuku':
        return {
          title: 'Pengembalian Buku Paket',
          subtitle: 'Proses pengembalian cepat dan riwayat buku yang telah dikembalikan',
        };
      case 'daftarBuku':
        return {
          title: 'Katalog Buku Paket Pelajaran',
          subtitle: 'Manajemen koleksi buku paket dan pemantauan stok perpustakaan',
        };
      case 'pengguna':
        return {
          title: 'Pengaturan Pengguna & Petugas',
          subtitle: 'Manajemen data staf dan pustakawan perpustakaan sekolah (Sheet: Pengguna)',
        };
      case 'kelas':
        return {
          title: 'Pengaturan Kelas & Rombel',
          subtitle: 'Daftar kelas otomatis terhubung ke formulir peminjaman & filter (Sheet: Kelas)',
        };
      case 'gasDeploy':
        return {
          title: 'Generator & Panduan Google Apps Script',
          subtitle: 'Kode lengkap Code.gs & index.html siap pasang di Google Spreadsheet',
        };
      case 'pengaturan':
        return {
          title: 'Pengaturan & Basis Data',
          subtitle: 'Konfigurasi Google Spreadsheet dan identitas perpustakaan sekolah',
        };
      default:
        return {
          title: 'Sistem Perpustakaan Sekolah',
          subtitle: 'Manajemen Buku Paket Berbasis Google Apps Script',
        };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-800">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          if (editingLoan && tab !== 'formPinjam') {
            setEditingLoan(null);
          }
          setCurrentTab(tab);
        }}
        user={user}
        spreadsheetId={pengaturan.spreadsheetId}
        spreadsheetUrl={pengaturan.spreadsheetUrl}
        onLogout={handleLogout}
        onOpenSpreadsheet={() => {
          if (pengaturan.spreadsheetUrl) {
            window.open(pengaturan.spreadsheetUrl, '_blank');
          } else if (pengaturan.spreadsheetId) {
            window.open(
              `https://docs.google.com/spreadsheets/d/${pengaturan.spreadsheetId}/edit`,
              '_blank'
            );
          }
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-72 flex flex-col min-h-screen">
        {/* Header */}
        <Header
          title={title}
          subtitle={subtitle}
          user={user}
          spreadsheetId={pengaturan.spreadsheetId}
          spreadsheetUrl={pengaturan.spreadsheetUrl}
          isSyncing={isSyncing}
          isLoggingIn={isLoggingIn}
          onLogin={handleLogin}
          onRefresh={() => handleRefreshData()}
          onCreateSpreadsheet={handleCreateNewSpreadsheet}
        />

        {/* Dynamic Toast Notification */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold border ${
                toast.type === 'success'
                  ? 'bg-emerald-900/95 text-emerald-100 border-emerald-700/50 backdrop-blur-md'
                  : toast.type === 'error'
                  ? 'bg-rose-900/95 text-rose-100 border-rose-700/50 backdrop-blur-md'
                  : 'bg-slate-900/95 text-slate-100 border-slate-700/50 backdrop-blur-md'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />}
              <span className="max-w-md leading-tight">{toast.message}</span>
              <button
                onClick={() => setToast(null)}
                className="ml-2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Content */}
        <main className="flex-1 p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              stats={dashboardStats}
              recentLoans={recentLoans}
              bukuList={bukuList}
              onNavigateTab={setCurrentTab}
              onQuickReturn={handleQuickReturn}
            />
          )}

          {currentTab === 'formPinjam' && (
            <FormPinjamView
              bukuList={bukuList}
              kelasList={kelasList}
              editingLoan={editingLoan}
              onSaveLoan={handleSaveLoan}
              onResetEdit={() => setEditingLoan(null)}
              onDeleteLoan={handleDeleteLoan}
            />
          )}

          {currentTab === 'dataPinjam' && (
            <DataPinjamView
              loans={peminjamanList}
              bukuList={bukuList}
              kelasList={kelasList}
              onNavigateToForm={() => {
                setEditingLoan(null);
                setCurrentTab('formPinjam');
              }}
              onQuickAddLoan={async (loanData) => {
                await handleSaveLoan(loanData);
              }}
              onEditLoan={(loan) => {
                setEditingLoan(loan);
                setCurrentTab('formPinjam');
              }}
              onDeleteLoan={handleDeleteLoan}
              onReturnLoan={handleQuickReturn}
              onImportLoans={handleImportLoans}
            />
          )}

          {currentTab === 'kembaliBuku' && (
            <PengembalianView
              loans={peminjamanList}
              onProcessReturn={handleProcessReturn}
            />
          )}

          {currentTab === 'daftarBuku' && (
            <DaftarBukuView
              bukuList={bukuList}
              loans={peminjamanList}
              onSaveBuku={handleSaveBuku}
              onDeleteBuku={handleDeleteBuku}
              onImportBuku={handleImportBuku}
            />
          )}

          {currentTab === 'pengguna' && (
            <PenggunaView
              penggunaList={penggunaList}
              onSavePengguna={handleSavePengguna}
              onDeletePengguna={handleDeletePengguna}
              onImportPengguna={handleImportPengguna}
            />
          )}

          {currentTab === 'kelas' && (
            <KelasView
              kelasList={kelasList}
              onSaveKelas={handleSaveKelas}
              onDeleteKelas={handleDeleteKelas}
              onImportKelas={handleImportKelas}
            />
          )}

          {currentTab === 'gasDeploy' && (
            <GasDeployGuideView
              activeSpreadsheetId={pengaturan.spreadsheetId}
              activeSpreadsheetUrl={pengaturan.spreadsheetUrl}
            />
          )}

          {currentTab === 'pengaturan' && (
            <PengaturanView
              pengaturan={pengaturan}
              user={user}
              onSavePengaturan={handleSavePengaturan}
              onCreateNewSpreadsheet={handleCreateNewSpreadsheet}
            />
          )}
        </main>
      </div>

      {/* Confirmation Modal for Destructive Operations */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        detailItem={confirmModal.detailItem}
        confirmLabel={confirmModal.confirmLabel}
        isDestructive={confirmModal.isDestructive}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
