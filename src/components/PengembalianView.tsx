import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  User,
  GraduationCap,
  BookOpen,
  Search,
  Clock,
  Sparkles,
  Layers
} from 'lucide-react';
import { Peminjaman } from '../types/library';

interface PengembalianViewProps {
  loans: Peminjaman[];
  onProcessReturn: (id: string, tanggalKembali: string) => Promise<void>;
}

export const PengembalianView: React.FC<PengembalianViewProps> = ({
  loans,
  onProcessReturn,
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [historySearch, setHistorySearch] = useState('');

  // Unreturned loans
  const pendingLoans = loans.filter((l) => l.status === 'Belum Dikembalikan');
  // Returned loans history
  const returnedLoans = loans.filter((l) => l.status === 'Sudah Dikembalikan');

  const selectedLoan = pendingLoans.find((l) => l.id === selectedLoanId);

  // Filter history
  const filteredHistory = returnedLoans.filter(
    (l) =>
      !historySearch.trim() ||
      l.namaSiswa.toLowerCase().includes(historySearch.toLowerCase().trim()) ||
      l.bukuPaket.toLowerCase().includes(historySearch.toLowerCase().trim()) ||
      l.id.toLowerCase().includes(historySearch.toLowerCase().trim())
  );

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;

    try {
      setIsSubmitting(true);
      await onProcessReturn(selectedLoanId, tanggalKembali);
      setSelectedLoanId('');
      setTanggalKembali(new Date().toISOString().split('T')[0]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Card: Return Processing Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Proses Pengembalian Buku</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tandai buku yang telah diserahkan kembali oleh siswa.
                </p>
              </div>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-5">
              {/* Select Transaction */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Pilih Transaksi Peminjaman</span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    {pendingLoans.length} Belum Kembali
                  </span>
                </label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                >
                  <option value="">-- Pilih Siswa / Buku yang Belum Kembali --</option>
                  {pendingLoans.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.namaSiswa} ({l.kelas}) - {l.bukuPaket} [{l.id}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Detail Preview Card if Selected */}
              {selectedLoan && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-mono text-slate-500">{selectedLoan.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                      Belum Dikembalikan
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-800">{selectedLoan.namaSiswa}</span>
                    <span className="text-slate-400">({selectedLoan.kelas})</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700">
                    <BookOpen className="w-4 h-4 text-slate-400" />
                    <span>{selectedLoan.bukuPaket}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Pinjam: {selectedLoan.tanggalPinjam}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Layers className="w-3.5 h-3.5" />
                      Jumlah: {selectedLoan.jumlahBuku} eks
                    </span>
                  </div>
                </div>
              )}

              {/* Tanggal Pengembalian */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tanggal Pengembalian</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalKembali}
                  onChange={(e) => setTanggalKembali(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                />
                <p className="text-[11px] text-slate-400">
                  Tanggal buku diserahkan kembali secara fisik ke perpustakaan.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!selectedLoanId || isSubmitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memperbarui Status di Spreadsheet...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Konfirmasi Pengembalian Buku</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Card: Return History */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-base">Riwayat Buku Sudah Dikembalikan</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                {returnedLoans.length} Transaksi Selesai
              </span>
            </div>

            {/* Filter in history */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Cari dalam riwayat pengembalian..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all bg-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto max-h-[520px]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-slate-50 border-b border-slate-200/80 text-slate-500 uppercase tracking-wider font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Nama Siswa</th>
                    <th className="py-3 px-4">Buku Paket</th>
                    <th className="py-3 px-4">Kelas</th>
                    <th className="py-3 px-4">Tgl Pinjam</th>
                    <th className="py-3 px-4">Tgl Kembali</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Belum ada riwayat pengembalian buku.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-800">{item.namaSiswa}</td>
                        <td className="py-3 px-4 text-slate-700">{item.bukuPaket}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {item.kelas}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{item.tanggalPinjam}</td>
                        <td className="py-3 px-4 font-semibold text-emerald-700">
                          {item.tanggalKembali}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Selesai
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
