import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  GraduationCap,
  Plus,
  Search,
  Download,
  Upload,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  Layers,
  ChevronDown,
  CheckCircle2
} from 'lucide-react';
import { Kelas } from '../types/library';

interface KelasViewProps {
  kelasList: Kelas[];
  onSaveKelas: (kelas: Kelas) => Promise<void>;
  onDeleteKelas: (id: string) => void;
  onImportKelas: (importedList: Kelas[], mode: 'append' | 'replace') => Promise<{ successCount: number; failedCount: number }>;
}

export const KelasView: React.FC<KelasViewProps> = ({
  kelasList,
  onSaveKelas,
  onDeleteKelas,
  onImportKelas,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('');
  const [filterJurusan, setFilterJurusan] = useState('');

  // Modal Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [tingkatKelas, setTingkatKelas] = useState('X');
  const [jurusan, setJurusan] = useState('');
  const [rombel, setRombel] = useState('1');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Export menu
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [parsedImportRows, setParsedImportRows] = useState<Kelas[]>([]);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSummary, setImportSummary] = useState<{ total: number; valid: number; duplicates: number } | null>(null);
  const [isProcessingImport, setIsProcessingImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extract unique jurusans
  const availableJurusan = useMemo(() => {
    const set = new Set<string>();
    kelasList.forEach((k) => {
      if (k.jurusan) set.add(k.jurusan);
    });
    return Array.from(set).sort();
  }, [kelasList]);

  // Filtered classes
  const filteredList = useMemo(() => {
    return kelasList.filter((item) => {
      const matchSearch =
        !searchQuery.trim() ||
        item.namaKelasLengkap.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.jurusan.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchTingkat = !filterTingkat || item.tingkatKelas === filterTingkat;
      const matchJurusan = !filterJurusan || item.jurusan === filterJurusan;
      return matchSearch && matchTingkat && matchJurusan;
    });
  }, [kelasList, searchQuery, filterTingkat, filterJurusan]);

  const openAddModal = () => {
    setEditingKelas(null);
    setTingkatKelas('X');
    setJurusan('');
    setRombel('1');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Kelas) => {
    setEditingKelas(item);
    setTingkatKelas(item.tingkatKelas);
    setJurusan(item.jurusan);
    setRombel(item.rombel);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTingkat = tingkatKelas.trim().toUpperCase();
    const cleanJurusan = jurusan.trim().toUpperCase();
    const cleanRombel = rombel.trim();

    if (!cleanTingkat || !cleanJurusan || !cleanRombel) {
      setFormError('Lengkapi seluruh kolom: Tingkat Kelas, Jurusan, dan Rombel.');
      return;
    }

    const calculatedFullName = `${cleanTingkat} ${cleanJurusan} ${cleanRombel}`.trim();

    // Check duplicate
    const isDuplicate = kelasList.some(
      (k) =>
        k.id !== editingKelas?.id &&
        k.tingkatKelas.toUpperCase() === cleanTingkat &&
        k.jurusan.toUpperCase() === cleanJurusan &&
        k.rombel.toUpperCase() === cleanRombel.toUpperCase()
    );

    if (isDuplicate) {
      setFormError(`Kelas "${calculatedFullName}" sudah ada! Mohon gunakan nama rombel atau jurusan lain untuk mencegah data ganda.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const newOrUpdated: Kelas = {
        id: editingKelas?.id || `KLS-${String(kelasList.length + 1).padStart(3, '0')}`,
        tingkatKelas: cleanTingkat,
        jurusan: cleanJurusan,
        rombel: cleanRombel,
        namaKelasLengkap: calculatedFullName,
      };

      await onSaveKelas(newOrUpdated);
      setIsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      setFormError(error.message || 'Gagal menyimpan data kelas');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export to Excel (.xlsx)
  const exportToExcel = (dataToExport: Kelas[], filename: string) => {
    if (dataToExport.length === 0) return;

    const formattedData = dataToExport.map((k, idx) => ({
      No: idx + 1,
      'ID Kelas': k.id,
      'Tingkat Kelas': k.tingkatKelas,
      Jurusan: k.jurusan,
      Rombel: k.rombel,
      'Nama Kelas Lengkap': k.namaKelasLengkap,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Kelas');
    XLSX.writeFile(workbook, filename);
    setShowExportMenu(false);
  };

  // Export to CSV
  const exportToCSV = (dataToExport: Kelas[], filename: string) => {
    if (dataToExport.length === 0) return;

    const headers = ['No', 'ID Kelas', 'Tingkat Kelas', 'Jurusan', 'Rombel', 'Nama Kelas Lengkap'];
    const rows = dataToExport.map((k, idx) => [
      idx + 1,
      k.id,
      `"${k.tingkatKelas}"`,
      `"${k.jurusan}"`,
      `"${k.rombel}"`,
      `"${k.namaKelasLengkap.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // Download Templates
  const downloadTemplateExcel = () => {
    const templateData = [
      {
        'ID Kelas': 'KLS-101',
        'Tingkat Kelas': 'X',
        Jurusan: 'RPL',
        Rombel: '1',
      },
      {
        'ID Kelas': 'KLS-102',
        'Tingkat Kelas': 'X',
        Jurusan: 'TKJ',
        Rombel: '1',
      },
      {
        'ID Kelas': 'KLS-103',
        'Tingkat Kelas': 'XI',
        Jurusan: 'MIPA',
        Rombel: '1',
      },
      {
        'ID Kelas': 'KLS-104',
        'Tingkat Kelas': 'XII',
        Jurusan: 'IPS',
        Rombel: '1',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Kelas');
    XLSX.writeFile(workbook, 'Template_Import_Kelas.xlsx');
  };

  const downloadTemplateCSV = () => {
    const headers = ['ID Kelas', 'Tingkat Kelas', 'Jurusan', 'Rombel'];
    const sampleRows = [
      ['KLS-101', '"X"', '"RPL"', '"1"'],
      ['KLS-102', '"XI"', '"MIPA"', '"2"'],
      ['KLS-103', '"XII"', '"TKJ"', '"1"'],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Template_Import_Kelas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle File Upload for Kelas (.xlsx, .xls, .csv universally)
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
          throw new Error('File kosong atau format tidak sesuai.');
        }

        const parsed: Kelas[] = [];
        let duplicateCount = 0;
        const seenClassSignatures = new Set<string>();

        // If append mode, also consider current classes to prevent duplicates
        if (importMode === 'append') {
          kelasList.forEach((k) =>
            seenClassSignatures.add(
              `${k.tingkatKelas.toUpperCase()}-${k.jurusan.toUpperCase()}-${k.rombel.toUpperCase()}`
            )
          );
        }

        rawJson.forEach((row, idx) => {
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach((k) => {
            normalized[k.trim().toLowerCase()] = row[k];
          });

          const tingkat = (
            normalized['tingkat kelas'] ||
            normalized['tingkat'] ||
            normalized['jenjang'] ||
            normalized['kelas'] ||
            'X'
          ).toString().trim().toUpperCase();

          const jur = (
            normalized['jurusan'] ||
            normalized['program keahlian'] ||
            normalized['keahlian'] ||
            ''
          ).toString().trim().toUpperCase();

          const rmb = (
            normalized['rombel'] ||
            normalized['kelompok'] ||
            normalized['no rombel'] ||
            '1'
          ).toString().trim();

          let id = (
            normalized['id kelas'] ||
            normalized['id'] ||
            normalized['kode'] ||
            ''
          ).toString().trim();

          if (!id || id === '-') {
            id = `KLS-${String(idx + 1 + kelasList.length).padStart(3, '0')}`;
          }

          if (jur) {
            const signature = `${tingkat}-${jur}-${rmb}`;
            if (seenClassSignatures.has(signature)) {
              duplicateCount++;
            } else {
              seenClassSignatures.add(signature);
              const fullName = `${tingkat} ${jur} ${rmb}`.trim();
              parsed.push({
                id,
                tingkatKelas: tingkat,
                jurusan: jur,
                rombel: rmb,
                namaKelasLengkap: fullName,
              });
            }
          }
        });

        if (parsed.length === 0) {
          throw new Error('Tidak ditemukan kolom "Jurusan" atau "Tingkat Kelas" yang valid.');
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
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleConfirmImport = async () => {
    if (parsedImportRows.length === 0) return;
    try {
      setIsProcessingImport(true);
      await onImportKelas(parsedImportRows, importMode);
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
      {/* Top Banner & Action Bar */}
      <div className="p-5 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">Pengaturan Data Kelas & Rombel</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daftar kelas otomatis terhubung dengan formulir peminjaman & filter data (Sheet: Kelas).
            </p>
          </div>
        </div>

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
            <span>Impor Data</span>
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
              <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() =>
                    exportToExcel(filteredList, `Data_Kelas_Terfilter_${todayStr}.xlsx`)
                  }
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ekspor ke Excel (.xlsx) ({filteredList.length})</span>
                </button>
                <button
                  onClick={() =>
                    exportToCSV(filteredList, `Data_Kelas_Terfilter_${todayStr}.csv`)
                  }
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ekspor ke CSV (.csv) ({filteredList.length})</span>
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={() =>
                    exportToExcel(kelasList, `Data_Seluruh_Kelas_${todayStr}.xlsx`)
                  }
                  className="w-full text-left px-4 py-2 hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Ekspor Seluruh Data Excel ({kelasList.length})</span>
                </button>
              </div>
            )}
          </div>

          {/* Add Button */}
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kelas</span>
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
              placeholder="Cari kelas / jurusan..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          <select
            value={filterTingkat}
            onChange={(e) => setFilterTingkat(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50 text-slate-700"
          >
            <option value="">Semua Tingkat</option>
            <option value="X">Kelas X</option>
            <option value="XI">Kelas XI</option>
            <option value="XII">Kelas XII</option>
          </select>

          <select
            value={filterJurusan}
            onChange={(e) => setFilterJurusan(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50 text-slate-700"
          >
            <option value="">Semua Jurusan</option>
            {availableJurusan.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Menampilkan <strong className="text-slate-800">{filteredList.length}</strong> rombel kelas
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4 w-28">ID Kelas</th>
                <th className="py-3.5 px-4">Tingkat Kelas</th>
                <th className="py-3.5 px-4">Jurusan</th>
                <th className="py-3.5 px-4 text-center">Rombel</th>
                <th className="py-3.5 px-4">Nama Lengkap Kelas</th>
                <th className="py-3.5 px-4 text-right w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">Belum ada data kelas.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Tambahkan kelas baru atau gunakan fitur Impor Excel / CSV.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-500">{item.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-[11px]">
                        Kelas {item.tingkatKelas}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{item.jurusan}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-700">{item.rombel}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        {item.namaKelasLengkap}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          title="Edit Kelas"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteKelas(item.id)}
                          title="Hapus Kelas"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH / EDIT KELAS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingKelas ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Tingkat Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={tingkatKelas}
                  onChange={(e) => setTingkatKelas(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="X">Kelas X</option>
                  <option value="XI">Kelas XI</option>
                  <option value="XII">Kelas XII</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Jurusan / Program Keahlian <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="jurusanSuggestions"
                  value={jurusan}
                  onChange={(e) => setJurusan(e.target.value)}
                  placeholder="Contoh: RPL, TKJ, MIPA, IPS, AKL, OTKP"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 uppercase"
                />
                <datalist id="jurusanSuggestions">
                  <option value="RPL" />
                  <option value="TKJ" />
                  <option value="AKL" />
                  <option value="OTKP" />
                  <option value="MIPA" />
                  <option value="IPS" />
                  <option value="BDP" />
                  <option value="DKV" />
                </datalist>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Rombel (Nomor / Huruf) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rombel}
                  onChange={(e) => setRombel(e.target.value)}
                  placeholder="Contoh: 1, 2, 3, A, B"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>

              {/* Preview Name */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <span className="text-slate-500">Nama Kelas Lengkap:</span>
                <span className="font-bold text-blue-700">
                  {tingkatKelas} {jurusan.toUpperCase() || '...'} {rombel}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPORT KELAS (.xlsx / .csv) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Import Data Kelas (.xlsx / .csv)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Mendukung file Excel (.xlsx, .xls) dan CSV (.csv).
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

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Template notice & buttons */}
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
                      <span>Template Excel</span>
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
                  Kolom yang dikenali: <strong>Tingkat Kelas</strong>, <strong>Jurusan</strong>, dan <strong>Rombel</strong>.
                </p>
              </div>

              {/* File input */}
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

              {/* Mode */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Metode Impor:</label>
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
                      name="kelasImportMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                    />
                    <div>
                      <span>Tambahkan (Append)</span>
                      <p className="text-[10px] font-normal text-slate-500">
                        Tambahkan ke kelas yang ada
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
                      name="kelasImportMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
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

              {/* Preview table */}
              {parsedImportRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Pratinjau ({parsedImportRows.length} kelas valid siap diimpor):
                    </span>
                    {importSummary && importSummary.duplicates > 0 && (
                      <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {importSummary.duplicates} kelas duplikat diabaikan
                      </span>
                    )}
                  </div>
                  <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-40 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200 font-bold">
                        <tr>
                          <th className="py-1.5 px-3">Tingkat</th>
                          <th className="py-1.5 px-3">Jurusan</th>
                          <th className="py-1.5 px-3 text-center">Rombel</th>
                          <th className="py-1.5 px-3">Nama Lengkap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedImportRows.map((r, idx) => (
                          <tr key={idx}>
                            <td className="py-1 px-3 font-semibold text-slate-800">
                              {r.tingkatKelas}
                            </td>
                            <td className="py-1 px-3 text-slate-700">{r.jurusan}</td>
                            <td className="py-1 px-3 text-center font-bold">{r.rombel}</td>
                            <td className="py-1 px-3 font-semibold text-blue-700">
                              {r.namaKelasLengkap}
                            </td>
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
                {isProcessingImport
                  ? 'Menyimpan...'
                  : `Impor ${parsedImportRows.length} Kelas`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
