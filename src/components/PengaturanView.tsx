import React, { useState } from 'react';
import {
  Settings,
  Save,
  FileSpreadsheet,
  PlusCircle,
  ExternalLink,
  CheckCircle2,
  Building,
  School,
  MapPin,
  UserCheck,
  Phone,
  Clock,
  Sparkles
} from 'lucide-react';
import { PengaturanPerpustakaan } from '../types/library';
import { User } from 'firebase/auth';

interface PengaturanViewProps {
  pengaturan: PengaturanPerpustakaan;
  user: User | null;
  onSavePengaturan: (newConfig: PengaturanPerpustakaan) => Promise<void>;
  onCreateNewSpreadsheet: () => Promise<void>;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  pengaturan,
  user,
  onSavePengaturan,
  onCreateNewSpreadsheet,
}) => {
  const [namaPerpus, setNamaPerpus] = useState(pengaturan.namaPerpustakaan);
  const [namaSekolah, setNamaSekolah] = useState(pengaturan.namaSekolah);
  const [alamatSekolah, setAlamatSekolah] = useState(pengaturan.alamatSekolah);
  const [namaPustakawan, setNamaPustakawan] = useState(pengaturan.namaPustakawan);
  const [nipPustakawan, setNipPustakawan] = useState(pengaturan.nipPustakawan);
  const [kontak, setKontak] = useState(pengaturan.kontak);
  const [maxHariPinjam, setMaxHariPinjam] = useState(pengaturan.maxHariPinjam);
  const [customSpreadsheetId, setCustomSpreadsheetId] = useState(
    pengaturan.spreadsheetId || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSavePengaturan({
        namaPerpustakaan: namaPerpus.trim(),
        namaSekolah: namaSekolah.trim(),
        alamatSekolah: alamatSekolah.trim(),
        namaPustakawan: namaPustakawan.trim(),
        nipPustakawan: nipPustakawan.trim(),
        kontak: kontak.trim(),
        maxHariPinjam: Number(maxHariPinjam) || 14,
        spreadsheetId: customSpreadsheetId.trim(),
        spreadsheetUrl: customSpreadsheetId.trim()
          ? `https://docs.google.com/spreadsheets/d/${customSpreadsheetId.trim()}/edit`
          : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateSheet = async () => {
    try {
      setIsCreatingSheet(true);
      await onCreateNewSpreadsheet();
    } finally {
      setIsCreatingSheet(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Google Spreadsheet Integration Card */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">
                Koneksi Google Spreadsheet Database
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyimpanan data berbasis cloud untuk peminjaman, katalog buku, dan pengaturan.
              </p>
            </div>
          </div>

          {pengaturan.spreadsheetId && (
            <a
              href={
                pengaturan.spreadsheetUrl ||
                `https://docs.google.com/spreadsheets/d/${pengaturan.spreadsheetId}/edit`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Buka Google Sheet</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700">
            Spreadsheet ID Database
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSpreadsheetId}
              onChange={(e) => setCustomSpreadsheetId(e.target.value)}
              placeholder="Contoh: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Spreadsheet ID dapat disalin dari URL Google Sheets di antara bagian{' '}
            <code className="text-slate-600 font-mono">/d/[SPREADSHEET_ID]/edit</code>.
          </p>

          {user && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCreateSheet}
                disabled={isCreatingSheet}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold transition-all disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4 text-blue-600" />
                <span>
                  {isCreatingSheet
                    ? 'Sedang Membuat Spreadsheet...'
                    : 'Buat Spreadsheet Database Otomatis di Akun Google Anda'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Library Identity Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              Identitas Perpustakaan & Konfigurasi
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data ini tersimpan pada Sheet 3: 'Pengaturan' dan digunakan untuk kop/administrasi.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Perpustakaan</span>
              </label>
              <input
                type="text"
                required
                value={namaPerpus}
                onChange={(e) => setNamaPerpus(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Sekolah</span>
              </label>
              <input
                type="text"
                required
                value={namaSekolah}
                onChange={(e) => setNamaSekolah(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>Alamat Sekolah</span>
              </label>
              <input
                type="text"
                required
                value={alamatSekolah}
                onChange={(e) => setAlamatSekolah(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Nama Kepala Pustakawan</span>
              </label>
              <input
                type="text"
                required
                value={namaPustakawan}
                onChange={(e) => setNamaPustakawan(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">NIP Pustakawan</label>
              <input
                type="text"
                value={nipPustakawan}
                onChange={(e) => setNipPustakawan(e.target.value)}
                placeholder="19820514 200801 2 009"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Kontak / Email Perpustakaan</span>
              </label>
              <input
                type="text"
                value={kontak}
                onChange={(e) => setKontak(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Batas Waktu Peminjaman (Hari)</span>
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={maxHariPinjam}
                onChange={(e) => setMaxHariPinjam(parseInt(e.target.value, 10) || 14)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
