import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Search,
  Plus,
  Download,
  Upload,
  RotateCcw,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertOctagon,
  BookOpen,
  FileSpreadsheet,
  FileText,
  X,
  AlertCircle,
  Check,
  ChevronDown,
  Layers,
  User,
  GraduationCap,
  Calendar
} from 'lucide-react';
import { Peminjaman, BukuPaket, Kelas } from '../types/library';

interface DataPinjamViewProps {
  loans: Peminjaman[];
  bukuList: BukuPaket[];
  kelasList?: Kelas[];
  onNavigateToForm?: () => void;
  onQuickAddLoan?: (loanData: Omit<Peminjaman, 'id' | 'status' | 'tanggalKembali'>) => Promise<void>;
  onEditLoan: (loan: Peminjaman) => void;
  onDeleteLoan: (id: string) => void;
  onReturnLoan: (loan: Peminjaman) => void;
  onImportLoans: (importedLoans: Peminjaman[], mode: 'append' | 'replace') => Promise<void>;
}

export const DataPinjamView: React.FC<DataPinjamViewProps> = ({
  loans,
  bukuList,
  kelasList = [],
  onNavigateToForm,
  onQuickAddLoan,
  onEditLoan,
  onDeleteLoan,
  onReturnLoan,
  onImportLoans,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [filterBuku, setFilterBuku] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Export dropdown state
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Quick Add Loan Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addNamaSiswa, setAddNamaSiswa] = useState('');
  const [addBukuPaket, setAddBukuPaket] = useState('');
  const [addKelas, setAddKelas] = useState('');
  const [addTanggalPinjam, setAddTanggalPinjam] = useState(new Date().toISOString().split('T')[0]);
  const [addJumlahBuku, setAddJumlahBuku] = useState<number>(1);
  const [addKeterangan, setAddKeterangan] = useState('');
  const [addFormError, setAddFormError] = useState<string | null>(null);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  // Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedImportRows, setParsedImportRows] = useState<Peminjaman[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ total: number; valid: number; duplicates: number } | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique classes from both registered classes & existing loans
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    kelasList.forEach((k) => set.add(k.namaKelasLengkap));
    loans.forEach((l) => {
      if (l.kelas) set.add(l.kelas);
    });
    return Array.from(set).sort();
  }, [kelasList, loans]);

  // Extract unique book names
  const availableBooks = useMemo(() => {
    const set = new Set<string>();
    bukuList.forEach((b) => set.add(b.namaBuku));
    loans.forEach((l) => {
      if (l.bukuPaket) set.add(l.bukuPaket);
    });
    return Array.from(set).sort();
  }, [bukuList, loans]);

  // Filtered loans list
  const filteredLoans = useMemo(() => {
    return loans.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.namaSiswa.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(searchQuery.toLowerCase().trim()));

      const matchKelas = !filterKelas || item.kelas === filterKelas;
      const matchBuku = !filterBuku || item.bukuPaket === filterBuku;
      const matchStatus = !filterStatus || item.status === filterStatus;

      return matchSearch && matchKelas && matchBuku && matchStatus;
    });
  }, [loans, searchQuery, filterKelas, filterBuku, filterStatus]);

  // ==========================================
  // QUICK ADD LOAN HANDLER
  // ==========================================
  const handleOpenAddModal = () => {
    if (onNavigateToForm) {
      onNavigateToForm();
      return;
    }
    setAddNamaSiswa('');
    setAddBukuPaket(bukuList.length > 0 ? bukuList[0].namaBuku : '');
    setAddKelas(availableClasses.length > 0 ? availableClasses[0] : 'X RPL 1');
    setAddTanggalPinjam(new Date().toISOString().split('T')[0]);
    setAddJumlahBuku(1);
    setAddKeterangan('');
    setAddFormError(null);
    setIsAddModalOpen(true);
  };

  const handleQuickAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormError(null);

    if (!addNamaSiswa.trim()) {
      setAddFormError('Nama siswa wajib diisi.');
      return;
    }
    if (!addBukuPaket.trim()) {
      setAddFormError('Pilih buku paket yang dipinjam.');
      return;
    }
    if (!addKelas.trim()) {
      setAddFormError('Pilih atau masukkan kelas siswa.');
      return;
    }

    try {
      setIsSubmittingAdd(true);
      if (onQuickAddLoan) {
        await onQuickAddLoan({
          namaSiswa: addNamaSiswa.trim(),
          bukuPaket: addBukuPaket.trim(),
          kelas: addKelas.trim(),
          tanggalPinjam: addTanggalPinjam,
          jumlahBuku: Math.max(1, addJumlahBuku),
          keterangan: addKeterangan.trim() || 'Peminjaman buku paket semester',
        });
      }
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setAddFormError(error.message || 'Gagal menyimpan peminjaman');
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  // ==========================================
  // EXPORT FUNCTIONS (EXCEL .xlsx & CSV .csv)
  // ==========================================
  const exportLoansToExcel = (dataToExport: Peminjaman[], filename: string) => {
    if (dataToExport.length === 0) return;

    const formattedData = dataToExport.map((l, index) => ({
      No: index + 1,
      'ID Peminjaman': l.id,
      'Nama Siswa': l.namaSiswa,
      'Buku Paket': l.bukuPaket,
      Kelas: l.kelas,
      'Tanggal Pinjam': l.tanggalPinjam,
      'Jumlah Buku': l.jumlahBuku || 1,
      'Tanggal Kembali': l.tanggalKembali || '-',
      'Status Pengembalian': l.status || 'Belum Dikembalikan',
      Keterangan: l.keterangan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Peminjaman');
    XLSX.writeFile(workbook, filename);
    setShowExportMenu(false);
  };

  const exportLoansToCSV = (dataToExport: Peminjaman[], filename: string) => {
    if (dataToExport.length === 0) return;

    const formattedData = dataToExport.map((l, index) => ({
      No: index + 1,
      'ID Peminjaman': l.id,
      'Nama Siswa': l.namaSiswa,
      'Buku Paket': l.bukuPaket,
      Kelas: l.kelas,
      'Tanggal Pinjam': l.tanggalPinjam,
      'Jumlah Buku': l.jumlahBuku || 1,
      'Tanggal Kembali': l.tanggalKembali || '-',
      'Status Pengembalian': l.status || 'Belum Dikembalikan',
      Keterangan: l.keterangan || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Peminjaman');
    XLSX.writeFile(workbook, filename, { bookType: 'csv' });
    setShowExportMenu(false);
  };

  // Templates
  const downloadTemplateExcel = () => {
    const templateData = [
      {
        'ID Peminjaman': 'PJ-20261105-101',
        'Nama Siswa': 'Andi Firmansyah',
        'Buku Paket': 'Matematika Tingkat Lanjut X',
        Kelas: 'X RPL 1',
        'Tanggal Pinjam': '2026-11-05',
        'Jumlah Buku': 1,
        'Tanggal Kembali': '-',
        'Status Pengembalian': 'Belum Dikembalikan',
        Keterangan: 'Peminjaman pegangan semester ganjil',
      },
      {
        'ID Peminjaman': 'PJ-20261105-102',
        'Nama Siswa': 'Siti Rahmawati',
        'Buku Paket': 'Bahasa Indonesia Cerdas X',
        Kelas: 'X RPL 2',
        'Tanggal Pinjam': '2026-11-05',
        'Jumlah Buku': 1,
        'Tanggal Kembali': '2026-11-08',
        'Status Pengembalian': 'Sudah Dikembalikan',
        Keterangan: 'Kondisi buku baik dan rapi',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Peminjaman');
    XLSX.writeFile(workbook, 'Template_Import_Peminjaman.xlsx');
  };

  const downloadTemplateCSV = () => {
    const templateData = [
      {
        'ID Peminjaman': 'PJ-20261105-101',
        'Nama Siswa': 'Andi Firmansyah',
        'Buku Paket': 'Matematika Tingkat Lanjut X',
        Kelas: 'X RPL 1',
        'Tanggal Pinjam': '2026-11-05',
        'Jumlah Buku': 1,
        'Tanggal Kembali': '-',
        'Status Pengembalian': 'Belum Dikembalikan',
        Keterangan: 'Peminjaman pegangan semester ganjil',
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Peminjaman');
    XLSX.writeFile(workbook, 'Template_Import_Peminjaman.csv', { bookType: 'csv' });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterKelas('');
    setFilterBuku('');
    setFilterStatus('');
  };

  // ==========================================
  // UNIVERSAL FILE IMPORT PARSER (.xlsx, .xls, .csv)
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setParsedImportRows([]);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('File kosong atau lembar kerja tidak memiliki data.');
        }

        const parsed: Peminjaman[] = [];
        const today = new Date().toISOString().split('T')[0];
        let duplicateCount = 0;
        const seenSignatures = new Set<string>();

        // If append mode, check against existing loans to detect duplicates
        if (importMode === 'append') {
          loans.forEach((l) => {
            seenSignatures.add(`${l.namaSiswa.toLowerCase()}_${l.bukuPaket.toLowerCase()}_${l.tanggalPinjam}`);
          });
        }

        rawJson.forEach((row, idx) => {
          // Normalize object keys to lowercase trimmed
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            normalized[k.trim().toLowerCase()] = row[k];
          });

          // Match columns flexibly
          const nama = (
            normalized['nama siswa'] ||
            normalized['nama'] ||
            normalized['siswa'] ||
            normalized['peminjam'] ||
            ''
          ).toString().trim();

          const buku = (
            normalized['buku paket'] ||
            normalized['nama buku'] ||
            normalized['buku'] ||
            normalized['judul'] ||
            normalized['paket'] ||
            ''
          ).toString().trim();

          const kls = (
            normalized['kelas'] ||
            normalized['tingkat'] ||
            normalized['rombel'] ||
            'Umum'
          ).toString().trim();

          let tglP = (
            normalized['tanggal pinjam'] ||
            normalized['tgl pinjam'] ||
            normalized['pinjam'] ||
            today
          ).toString().trim();

          // Handle Excel serial date or normalize
          if (typeof row['Tanggal Pinjam'] === 'number' || typeof row['tanggal pinjam'] === 'number') {
            const num = row['Tanggal Pinjam'] || row['tanggal pinjam'];
            const dateObj = new Date((num - (25567 + 2)) * 86400 * 1000);
            tglP = !isNaN(dateObj.getTime()) ? dateObj.toISOString().split('T')[0] : today;
          } else if (tglP.includes('/') || tglP.includes('-')) {
            const parts = tglP.split(/[/-]/);
            if (parts.length === 3 && parts[2].length === 4) {
              tglP = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          const jml = parseInt(
            normalized['jumlah buku'] ||
            normalized['jumlah'] ||
            normalized['qty'] ||
            normalized['jml'] ||
            '1',
            10
          ) || 1;

          let tglK = (
            normalized['tanggal kembali'] ||
            normalized['tgl kembali'] ||
            normalized['kembali'] ||
            '-'
          ).toString().trim();

          const rawStatus = (
            normalized['status pengembalian'] ||
            normalized['status'] ||
            ''
          ).toString().trim().toLowerCase();

          const isReturned = rawStatus.includes('sudah') || rawStatus.includes('selesai') || (tglK !== '-' && tglK !== '');
          const status = isReturned ? 'Sudah Dikembalikan' : 'Belum Dikembalikan';
          if (!isReturned) tglK = '-';

          const ket = (
            normalized['keterangan'] ||
            normalized['ket'] ||
            normalized['catatan'] ||
            '-'
          ).toString().trim();

          let idVal = (
            normalized['id peminjaman'] ||
            normalized['id'] ||
            normalized['kode'] ||
            ''
          ).toString().trim();

          if (!idVal || idVal === '-' || idVal.length < 4) {
            const dateClean = (tglP || today).replace(/-/g, '');
            const rand = Math.floor(100 + Math.random() * 900);
            idVal = `PJ-${dateClean}-${rand}`;
          }

          if (nama && buku) {
            const sig = `${nama.toLowerCase()}_${buku.toLowerCase()}_${tglP}`;
            if (seenSignatures.has(sig)) {
              duplicateCount++;
            } else {
              seenSignatures.add(sig);
              parsed.push({
                id: idVal,
                namaSiswa: nama,
                bukuPaket: buku,
                kelas: kls || 'X RPL 1',
                tanggalPinjam: tglP || today,
                jumlahBuku: jml,
                tanggalKembali: tglK,
                status,
                keterangan: ket || '-',
              });
            }
          }
        });

        if (parsed.length === 0) {
          throw new Error('Tidak ditemukan kolom "Nama Siswa" dan "Buku Paket" yang valid dalam file.');
        }

        setParsedImportRows(parsed);
        setImportSummary({
          total: rawJson.length,
          valid: parsed.length,
          duplicates: duplicateCount,
        });
      } catch (err: unknown) {
        const error = err as Error;
        setImportError(error.message || 'Gagal memproses file. Pastikan format tabel sesuai.');
        setParsedImportRows([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    if (parsedImportRows.length === 0) return;
    try {
      setIsProcessingImport(true);
      await onImportLoans(parsedImportRows, importMode);
      setIsImportModalOpen(false);
      setParsedImportRows([]);
      setImportSummary(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsProcessingImport(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Top Banner & Main Action Toolbar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Data Peminjaman Buku Paket</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola, cari, filter, ekspor, dan impor seluruh data peminjaman buku perpustakaan.
            </p>
          </div>
        </div>

        {/* Action Buttons: Tambah, Impor, Ekspor */}
        <div className="flex items-center gap-2">
          {/* Import Button */}
          <button
            onClick={() => {
              setParsedImportRows([]);
              setImportError(null);
              setImportSummary(null);
              setIsImportModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            <span>Impor Data (.xlsx / .csv)</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Ekspor Data</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showExportMenu && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() =>
                    exportLoansToExcel(
                      filteredLoans,
                      `Data_Peminjaman_Terfilter_${todayStr}.xlsx`
                    )
                  }
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ekspor Terfilter ke Excel (.xlsx) ({filteredLoans.length})</span>
                </button>

                <button
                  onClick={() =>
                    exportLoansToExcel(
                      loans,
                      `Data_Seluruh_Peminjaman_${todayStr}.xlsx`
                    )
                  }
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ekspor Seluruh Data ke Excel ({loans.length})</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={() =>
                    exportLoansToCSV(
                      filteredLoans,
                      `Data_Peminjaman_Terfilter_${todayStr}.csv`
                    )
                  }
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ekspor Terfilter ke CSV (.csv)</span>
                </button>

                <button
                  onClick={() =>
                    exportLoansToCSV(
                      loans,
                      `Data_Seluruh_Peminjaman_${todayStr}.csv`
                    )
                  }
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-700" />
                  <span>Ekspor Seluruh Data ke CSV</span>
                </button>

                <div className="border-t border-slate-100 my-1" />

                <button
                  onClick={downloadTemplateExcel}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-600 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>Unduh Template Excel (.xlsx)</span>
                </button>
              </div>
            )}
          </div>

          {/* "+ Tambah Peminjaman" Button */}
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Peminjaman</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search by student name or ID */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama siswa / ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          {/* Filter Kelas */}
          <div>
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 text-slate-700"
            >
              <option value="">Semua Kelas</option>
              {availableClasses.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Judul Buku */}
          <div>
            <select
              value={filterBuku}
              onChange={(e) => setFilterBuku(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 text-slate-700 truncate"
            >
              <option value="">Semua Buku Paket</option>
              {availableBooks.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-slate-50/50 text-slate-700"
            >
              <option value="">Semua Status Pengembalian</option>
              <option value="Belum Dikembalikan">Belum Dikembalikan</option>
              <option value="Sudah Dikembalikan">Sudah Dikembalikan</option>
            </select>
          </div>
        </div>

        {/* Toolbar Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <span>
              Menampilkan <strong className="text-slate-800">{filteredLoans.length}</strong> dari{' '}
              {loans.length} transaksi peminjaman
            </span>
            {(searchQuery || filterKelas || filterBuku || filterStatus) && (
              <button
                onClick={handleResetFilters}
                className="text-blue-600 hover:text-blue-700 font-bold ml-2 underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">ID Transaksi</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Buku Paket</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4">Tgl Pinjam</th>
                <th className="py-3.5 px-4 text-center">Jml</th>
                <th className="py-3.5 px-4">Tgl Kembali</th>
                <th className="py-3.5 px-4">Status Pengembalian</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada data peminjaman yang cocok.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Klik tombol <strong>"+ Tambah Peminjaman"</strong> atau gunakan fitur <strong>"Impor Data"</strong>.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLoans.map((item, index) => {
                  const isReturned = item.status === 'Sudah Dikembalikan';
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block">{item.namaSiswa}</span>
                        {item.keterangan && item.keterangan !== '-' && (
                          <span className="text-[11px] text-slate-400 block truncate max-w-xs">
                            {item.keterangan}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{item.bukuPaket}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          {item.kelas}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{item.tanggalPinjam}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {item.jumlahBuku}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {item.tanggalKembali || '-'}
                      </td>
                      <td className="py-3.5 px-4">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah Dikembalikan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Belum Dikembalikan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isReturned && (
                            <button
                              onClick={() => onReturnLoan(item)}
                              title="Kembalikan Buku Ini"
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditLoan(item)}
                            title="Edit Data Peminjaman"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteLoan(item.id)}
                            title="Hapus Data (Dengan Konfirmasi)"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ADD MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">
                  Tambah Peminjaman Baru
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="p-6 space-y-4 text-xs">
              {addFormError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{addFormError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>Nama Siswa <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={addNamaSiswa}
                  onChange={(e) => setAddNamaSiswa(e.target.value)}
                  placeholder="Contoh: Muhammad Farhan"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                    <span>Kelas <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    list="classListModal"
                    value={addKelas}
                    onChange={(e) => setAddKelas(e.target.value)}
                    placeholder="Pilih atau ketik kelas"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                  <datalist id="classListModal">
                    {availableClasses.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Tanggal Pinjam <span className="text-rose-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    required
                    value={addTanggalPinjam}
                    onChange={(e) => setAddTanggalPinjam(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buku Paket <span className="text-rose-500">*</span></span>
                </label>
                <select
                  required
                  value={addBukuPaket}
                  onChange={(e) => setAddBukuPaket(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="">-- Pilih Buku Paket --</option>
                  {bukuList.map((b) => (
                    <option key={b.idBuku} value={b.namaBuku}>
                      {b.namaBuku} (Kelas {b.kelas} - Stok: {b.stokBuku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-600" />
                    <span>Jumlah Buku</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={addJumlahBuku}
                    onChange={(e) => setAddJumlahBuku(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-bold text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Keterangan</label>
                  <input
                    type="text"
                    value={addKeterangan}
                    onChange={(e) => setAddKeterangan(e.target.value)}
                    placeholder="Contoh: Pegangan semester"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAdd}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmittingAdd ? 'Menyimpan...' : 'Simpan Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL (EXCEL & CSV) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Import Data Peminjaman (.xlsx / .csv)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mendukung file Excel (.xlsx, .xls) dan CSV (.csv) untuk memasukkan data secara massal.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Template Download Notice */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">Format Kolom:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={downloadTemplateExcel}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold rounded-lg text-[11px] flex items-center gap-1"
                    >
                      <FileSpreadsheet className="w-3 h-3" />
                      <span>Template Excel (.xlsx)</span>
                    </button>
                    <button
                      type="button"
                      onClick={downloadTemplateCSV}
                      className="px-2.5 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 font-bold rounded-lg text-[11px] flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Template CSV</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Kolom wajib: <strong>Nama Siswa, Buku Paket, Kelas, Tanggal Pinjam</strong>.
                  Kolom opsional: <em>Jumlah Buku, Tanggal Kembali, Status Pengembalian, Keterangan</em>.
                </p>
              </div>

              {/* Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Pilih File (.xlsx, .xls, .csv):</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-2xl p-2 bg-slate-50/50"
                />
              </div>

              {/* Error Message */}
              {importError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Mode Selection */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Metode Impor Data:</label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      importMode === 'append'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="append"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-blue-600"
                    />
                    <div>
                      <span>Tambahkan (Append)</span>
                      <p className="text-[10px] font-normal text-slate-500">
                        Tambahkan ke data yang sudah ada
                      </p>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      importMode === 'replace'
                        ? 'border-rose-600 bg-rose-50/50 text-rose-900 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-rose-600"
                    />
                    <div>
                      <span>Timpa (Replace)</span>
                      <p className="text-[10px] font-normal text-rose-500">
                        Gantikan seluruh data lama
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Parsed Preview Table */}
              {parsedImportRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Pratinjau Data ({parsedImportRows.length} transaksi siap diimpor):
                    </span>
                    {importSummary && importSummary.duplicates > 0 && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                        {importSummary.duplicates} duplikat diabaikan
                      </span>
                    )}
                  </div>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="py-2 px-3">Nama Siswa</th>
                          <th className="py-2 px-3">Buku Paket</th>
                          <th className="py-2 px-3">Kelas</th>
                          <th className="py-2 px-3">Tgl Pinjam</th>
                          <th className="py-2 px-3 text-center">Jml</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedImportRows.slice(0, 15).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-3 font-semibold text-slate-800">
                              {row.namaSiswa}
                            </td>
                            <td className="py-1.5 px-3 text-slate-600">{row.bukuPaket}</td>
                            <td className="py-1.5 px-3">{row.kelas}</td>
                            <td className="py-1.5 px-3 text-slate-500">{row.tanggalPinjam}</td>
                            <td className="py-1.5 px-3 text-center font-bold">{row.jumlahBuku}</td>
                            <td className="py-1.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  row.status === 'Sudah Dikembalikan'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedImportRows.length > 15 && (
                    <p className="text-[10px] text-slate-400 text-right">
                      ...dan {parsedImportRows.length - 15} baris lainnya
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={parsedImportRows.length === 0 || isProcessingImport}
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {isProcessingImport ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan ke Database...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Impor {parsedImportRows.length} Peminjaman</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
