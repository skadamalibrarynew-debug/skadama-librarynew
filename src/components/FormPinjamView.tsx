import React, { useState, useEffect } from 'react';
import {
  FilePlus2,
  Save,
  RotateCcw,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  Layers,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Peminjaman, BukuPaket, Kelas } from '../types/library';

interface FormPinjamViewProps {
  bukuList: BukuPaket[];
  kelasList?: Kelas[];
  editingLoan: Peminjaman | null;
  onSaveLoan: (loanData: Omit<Peminjaman, 'id' | 'status' | 'tanggalKembali'> & { id?: string }) => Promise<void>;
  onResetEdit: () => void;
  onDeleteLoan?: (id: string) => void;
}

export const FormPinjamView: React.FC<FormPinjamViewProps> = ({
  bukuList,
  kelasList = [],
  editingLoan,
  onSaveLoan,
  onResetEdit,
  onDeleteLoan,
}) => {
  const [namaSiswa, setNamaSiswa] = useState('');
  const [bukuPaket, setBukuPaket] = useState('');
  const [kelas, setKelas] = useState('');
  const [tanggalPinjam, setTanggalPinjam] = useState(new Date().toISOString().split('T')[0]);
  const [jumlahBuku, setJumlahBuku] = useState<number>(1);
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync when editingLoan changes
  useEffect(() => {
    if (editingLoan) {
      setNamaSiswa(editingLoan.namaSiswa);
      setBukuPaket(editingLoan.bukuPaket);
      setKelas(editingLoan.kelas);
      setTanggalPinjam(editingLoan.tanggalPinjam);
      setJumlahBuku(editingLoan.jumlahBuku);
      setKeterangan(editingLoan.keterangan === '-' ? '' : editingLoan.keterangan);
    } else {
      resetForm();
    }
  }, [editingLoan]);

  const resetForm = () => {
    setNamaSiswa('');
    setBukuPaket('');
    setKelas('');
    setTanggalPinjam(new Date().toISOString().split('T')[0]);
    setJumlahBuku(1);
    setKeterangan('');
    setErrorMsg(null);
    onResetEdit();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!namaSiswa.trim()) {
      setErrorMsg('Nama siswa wajib diisi');
      return;
    }
    if (!bukuPaket.trim()) {
      setErrorMsg('Pilih atau masukkan buku paket yang dipinjam');
      return;
    }
    if (!kelas.trim()) {
      setErrorMsg('Kelas siswa wajib diisi');
      return;
    }
    if (jumlahBuku < 1) {
      setErrorMsg('Jumlah buku minimal 1 eksemplar');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSaveLoan({
        id: editingLoan ? editingLoan.id : undefined,
        namaSiswa: namaSiswa.trim(),
        bukuPaket: bukuPaket.trim(),
        kelas: kelas.trim(),
        tanggalPinjam,
        jumlahBuku,
        keterangan: keterangan.trim() || 'Peminjaman buku paket semester',
      });
      resetForm();
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || 'Gagal menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Find selected book's remaining stock
  const selectedBookObj = bukuList.find((b) => b.namaBuku === bukuPaket);

  return (
    <div className="max-w-4xl mx-auto">
      {editingLoan && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-200 text-amber-800 rounded-xl">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Mode Edit Data Transaksi: <span className="font-mono">{editingLoan.id}</span>
              </p>
              <p className="text-xs text-amber-700">
                Perubahan akan otomatis diperbarui ke Google Spreadsheet database.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onDeleteLoan && (
              <button
                type="button"
                onClick={() => onDeleteLoan(editingLoan.id)}
                className="px-3 py-1.5 rounded-xl bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Data</span>
              </button>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-bold transition-colors"
            >
              Batalkan Edit
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                {editingLoan ? 'Perbarui Peminjaman Buku Paket' : 'Formulir Peminjaman Buku Paket'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan data nama siswa dan buku paket sesuai dengan administrasi perpustakaan.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 1. Nama Siswa */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Lengkap Siswa</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={namaSiswa}
                onChange={(e) => setNamaSiswa(e.target.value)}
                placeholder="Contoh: Muhammad Rian Pratama"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
              />
              <p className="text-[11px] text-slate-400">Masukkan nama lengkap sesuai absen.</p>
            </div>

            {/* 2. Kelas */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                <span>Kelas Siswa</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  list="kelasList"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                  placeholder="Ketik atau pilih kelas (cth: X RPL 1)"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
                />
                <datalist id="kelasList">
                  {kelasList.map((c) => (
                    <option key={c.id || c.namaKelasLengkap} value={c.namaKelasLengkap} />
                  ))}
                </datalist>
              </div>
              <p className="text-[11px] text-slate-400">Tingkat kelas beserta jurusan/rombongan belajar.</p>
            </div>

            {/* 3. Buku Paket yang Dipinjam */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buku Paket yang Dipinjam</span>
                  <span className="text-rose-500">*</span>
                </span>
                {selectedBookObj && (
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Stok Katalog: {selectedBookObj.stokBuku} eksemplar
                  </span>
                )}
              </label>
              <select
                required
                value={bukuPaket}
                onChange={(e) => setBukuPaket(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
              >
                <option value="">-- Pilih Buku Paket dari Katalog --</option>
                {bukuList.map((b) => (
                  <option key={b.idBuku} value={b.namaBuku}>
                    {b.namaBuku} (Kelas {b.kelas} - {b.mataPelajaran}) - Stok: {b.stokBuku}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Pilih buku paket pelajaran resmi sekolah.
              </p>
            </div>

            {/* 4. Tanggal Peminjaman */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Tanggal Peminjaman</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggalPinjam}
                onChange={(e) => setTanggalPinjam(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all bg-white"
              />
              <p className="text-[11px] text-slate-400">Tanggal penyerahan buku paket ke siswa.</p>
            </div>

            {/* 5. Jumlah Buku yang Dipinjam */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Jumlah Buku (Eksemplar)</span>
                <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setJumlahBuku((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={jumlahBuku}
                  onChange={(e) => setJumlahBuku(parseInt(e.target.value, 10) || 1)}
                  className="flex-1 text-center font-bold px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setJumlahBuku((prev) => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Standar peminjaman individu adalah 1 eksemplar.</p>
            </div>

            {/* 6. Keterangan Tambahan */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>Keterangan Tambahan</span>
              </label>
              <textarea
                rows={3}
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: Peminjaman pegangan semester ganjil / kondisi buku ada cap perpus..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Formulir</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Menyimpan ke Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{editingLoan ? 'Perbarui Peminjaman' : 'Simpan Peminjaman'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
