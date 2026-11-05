import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Library,
  Plus,
  Search,
  BookOpen,
  Edit2,
  Trash2,
  Download,
  Upload,
  X,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  ChevronDown,
  Check
} from 'lucide-react';
import { BukuPaket, Peminjaman } from '../types/library';

interface DaftarBukuViewProps {
  bukuList: BukuPaket[];
  loans: Peminjaman[];
  onSaveBuku: (buku: BukuPaket) => Promise<void>;
  onDeleteBuku: (idBuku: string) => void;
  onImportBuku?: (imported: BukuPaket[], mode: 'append' | 'replace') => Promise<void>;
}

export const DaftarBukuView: React.FC<DaftarBukuViewProps> = ({
  bukuList,
  loans,
  onSaveBuku,
  onDeleteBuku,
  onImportBuku,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuku, setEditingBuku] = useState<BukuPaket | null>(null);

  // Form states
  const [namaBuku, setNamaBuku] = useState('');
  const [mataPelajaran, setMataPelajaran] = useState('');
  const [kelas, setKelas] = useState('X');
  const [stokBuku, setStokBuku] = useState<number>(40);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Export menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedImportRows, setParsedImportRows] = useState<BukuPaket[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate borrowed stock per book from active unreturned loans
  const borrowedMap = useMemo(() => {
    const map: Record<string, number> = {};
    loans
      .filter((l) => l.status === 'Belum Dikembalikan')
      .forEach((l) => {
        map[l.bukuPaket] = (map[l.bukuPaket] || 0) + (l.jumlahBuku || 1);
      });
    return map;
  }, [loans]);

  const openAddModal = () => {
    setEditingBuku(null);
    setNamaBuku('');
    setMataPelajaran('');
    setKelas('X');
    setStokBuku(40);
    setIsModalOpen(true);
  };

  const openEditModal = (buku: BukuPaket) => {
    setEditingBuku(buku);
    setNamaBuku(buku.namaBuku);
    setMataPelajaran(buku.mataPelajaran);
    setKelas(buku.kelas);
    setStokBuku(buku.stokBuku);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBuku(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaBuku.trim() || !mataPelajaran.trim()) return;

    try {
      setIsSubmitting(true);
      const newOrUpdatedBuku: BukuPaket = {
        idBuku:
          editingBuku?.idBuku ||
          `BK-${String(bukuList.length + 1).padStart(3, '0')}`,
        namaBuku: namaBuku.trim(),
        mataPelajaran: mataPelajaran.trim(),
        kelas: kelas.trim(),
        stokBuku: Math.max(0, stokBuku),
      };

      await onSaveBuku(newOrUpdatedBuku);
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks = useMemo(() => {
    return bukuList.filter((b) => {
      const matchSearch =
        !searchQuery.trim() ||
        b.namaBuku.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        b.mataPelajaran.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        b.idBuku.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchKelas = !filterKelas || b.kelas === filterKelas;
      return matchSearch && matchKelas;
    });
  }, [bukuList, searchQuery, filterKelas]);

  // Export functions
  const exportToExcel = (data: BukuPaket[], filename: string) => {
    const formatted = data.map((b, idx) => ({
      No: idx + 1,
      'ID Buku': b.idBuku,
      'Nama Buku Paket': b.namaBuku,
      'Mata Pelajaran': b.mataPelajaran,
      Kelas: b.kelas,
      'Total Stok': b.stokBuku,
      Dipinjam: borrowedMap[b.namaBuku] || 0,
      Tersedia: Math.max(0, b.stokBuku - (borrowedMap[b.namaBuku] || 0)),
    }));
    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Katalog Buku');
    XLSX.writeFile(wb, filename);
    setShowExportMenu(false);
  };

  const exportToCSV = (data: BukuPaket[], filename: string) => {
    const formatted = data.map((b, idx) => ({
      No: idx + 1,
      'ID Buku': b.idBuku,
      'Nama Buku Paket': b.namaBuku,
      'Mata Pelajaran': b.mataPelajaran,
      Kelas: b.kelas,
      'Total Stok': b.stokBuku,
    }));
    const ws = XLSX.utils.json_to_sheet(formatted);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Katalog Buku');
    XLSX.writeFile(wb, filename, { bookType: 'csv' });
    setShowExportMenu(false);
  };

  const downloadTemplateExcel = () => {
    const sample = [
      {
        'ID Buku': 'BK-101',
        'Nama Buku Paket': 'Matematika Tingkat Lanjut X',
        'Mata Pelajaran': 'Matematika',
        Kelas: 'X',
        'Total Stok': 45,
      },
      {
        'ID Buku': 'BK-102',
        'Nama Buku Paket': 'Fisika Terapan XI',
        'Mata Pelajaran': 'Fisika',
        Kelas: 'XI',
        'Total Stok': 35,
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Buku');
    XLSX.writeFile(wb, 'Template_Import_Buku_Paket.xlsx');
  };

  // Import Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setParsedImportRows([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const rawJson: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('File kosong atau format tidak sesuai.');
        }

        const parsed: BukuPaket[] = [];
        rawJson.forEach((row, idx) => {
          const norm: Record<string, any> = {};
          Object.keys(row).forEach((k) => (norm[k.trim().toLowerCase()] = row[k]));

          const nama = (norm['nama buku paket'] || norm['nama buku'] || norm['buku'] || norm['judul'] || '').toString().trim();
          const mapel = (norm['mata pelajaran'] || norm['mapel'] || norm['pelajaran'] || 'Umum').toString().trim();
          const kls = (norm['kelas'] || norm['tingkat'] || 'X').toString().trim();
          const stok = parseInt(norm['total stok'] || norm['stok buku'] || norm['stok'] || '30', 10) || 30;
          let id = (norm['id buku'] || norm['id'] || norm['kode'] || '').toString().trim();
          if (!id || id === '-') id = `BK-${String(idx + 1 + bukuList.length).padStart(3, '0')}`;

          if (nama) {
            parsed.push({
              idBuku: id,
              namaBuku: nama,
              mataPelajaran: mapel,
              kelas: kls,
              stokBuku: stok,
            });
          }
        });

        if (parsed.length === 0) {
          throw new Error('Tidak ditemukan kolom "Nama Buku Paket" yang valid.');
        }

        setParsedImportRows(parsed);
      } catch (err: unknown) {
        const error = err as Error;
        setImportError(error.message || 'Gagal membaca file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    if (parsedImportRows.length === 0 || !onImportBuku) return;
    try {
      setIsProcessingImport(true);
      await onImportBuku(parsedImportRows, importMode);
      setIsImportModalOpen(false);
      setParsedImportRows([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setIsProcessingImport(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Top Header & Actions */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Katalog Buku Paket Pelajaran</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Manajemen koleksi buku paket dan pemantauan stok perpustakaan (Sheet: Daftar Buku).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Import Button */}
          {onImportBuku && (
            <button
              onClick={() => {
                setParsedImportRows([]);
                setImportError(null);
                setIsImportModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition-colors shadow-2xs"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Impor Data</span>
            </button>
          )}

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
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => exportToExcel(filteredBooks, `Katalog_Buku_Terfilter_${todayStr}.xlsx`)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ekspor ke Excel (.xlsx) ({filteredBooks.length})</span>
                </button>
                <button
                  onClick={() => exportToCSV(filteredBooks, `Katalog_Buku_Terfilter_${todayStr}.csv`)}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ekspor ke CSV (.csv)</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={downloadTemplateExcel}
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-600 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
                  <span>Unduh Template Excel</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Book Button */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Buku Paket</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari buku / mapel..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <select
            value={filterKelas}
            onChange={(e) => setFilterKelas(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50 text-slate-700"
          >
            <option value="">Semua Tingkat</option>
            <option value="X">Kelas X</option>
            <option value="XI">Kelas XI</option>
            <option value="XII">Kelas XII</option>
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Menampilkan <strong className="text-slate-800">{filteredBooks.length}</strong> buku paket
        </span>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3.5 px-4 w-24">ID Buku</th>
                <th className="py-3.5 px-4">Nama Buku Paket</th>
                <th className="py-3.5 px-4">Mata Pelajaran</th>
                <th className="py-3.5 px-4">Kelas</th>
                <th className="py-3.5 px-4 text-center">Total Stok</th>
                <th className="py-3.5 px-4 text-center">Dipinjam</th>
                <th className="py-3.5 px-4 text-center">Tersedia</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <BookOpen className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Tidak ada buku paket ditemukan.</p>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((buku) => {
                  const dipinjam = borrowedMap[buku.namaBuku] || 0;
                  const tersedia = Math.max(0, buku.stokBuku - dipinjam);

                  return (
                    <tr key={buku.idBuku} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-500">
                        {buku.idBuku}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{buku.namaBuku}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {buku.mataPelajaran}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                          Kelas {buku.kelas}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">
                        {buku.stokBuku}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-rose-600">
                        {dipinjam}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-700">
                        {tersedia}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(buku)}
                            title="Edit Buku"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteBuku(buku.idBuku)}
                            title="Hapus Buku"
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

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingBuku ? 'Edit Buku Paket' : 'Tambah Buku Paket Baru'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Nama Buku Paket <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={namaBuku}
                  onChange={(e) => setNamaBuku(e.target.value)}
                  placeholder="Contoh: Matematika Tingkat Lanjut X"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={mataPelajaran}
                  onChange={(e) => setMataPelajaran(e.target.value)}
                  placeholder="Contoh: Matematika, Fisika, Biologi"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Tingkat Kelas <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={kelas}
                    onChange={(e) => setKelas(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                  >
                    <option value="X">Kelas X</option>
                    <option value="XI">Kelas XI</option>
                    <option value="XII">Kelas XII</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    Stok Buku (Eks) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stokBuku}
                    onChange={(e) => setStokBuku(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Buku'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Import Buku Paket (.xlsx / .csv)
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-blue-900">Format Kolom:</span>
                  <p className="text-[11px] text-blue-700 mt-0.5">
                    Nama Buku Paket, Mata Pelajaran, Kelas, Total Stok
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplateExcel}
                  className="px-2.5 py-1 bg-white text-emerald-700 border border-emerald-300 font-bold rounded-lg text-[11px]"
                >
                  Unduh Template
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Pilih File:</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-2xl p-2 bg-slate-50/50"
                />
              </div>

              {importError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {parsedImportRows.length > 0 && (
                <div className="space-y-2">
                  <span className="font-bold text-slate-800">
                    Pratinjau ({parsedImportRows.length} buku siap diimpor):
                  </span>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="py-1.5 px-3">Nama Buku</th>
                          <th className="py-1.5 px-3">Mapel</th>
                          <th className="py-1.5 px-3">Kelas</th>
                          <th className="py-1.5 px-3 text-center">Stok</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedImportRows.map((r, idx) => (
                          <tr key={idx}>
                            <td className="py-1 px-3 font-semibold text-slate-800">{r.namaBuku}</td>
                            <td className="py-1 px-3 text-slate-600">{r.mataPelajaran}</td>
                            <td className="py-1 px-3">{r.kelas}</td>
                            <td className="py-1 px-3 text-center font-bold">{r.stokBuku}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

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
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isProcessingImport ? 'Menyimpan...' : `Impor ${parsedImportRows.length} Buku`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
