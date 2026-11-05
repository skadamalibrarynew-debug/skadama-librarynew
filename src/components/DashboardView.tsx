import React from 'react';
import {
  Users,
  BookOpen,
  CalendarCheck2,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  PlusCircle,
  RotateCcw,
  Library,
  BookMarked,
  Sparkles
} from 'lucide-react';
import { Peminjaman, DashboardStats, BukuPaket } from '../types/library';

interface DashboardViewProps {
  stats: DashboardStats;
  recentLoans: Peminjaman[];
  bukuList: BukuPaket[];
  onNavigateTab: (tab: string) => void;
  onQuickReturn: (loan: Peminjaman) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recentLoans,
  bukuList,
  onNavigateTab,
  onQuickReturn,
}) => {
  const returnRate =
    stats.totalBukuDipinjam > 0
      ? Math.round((stats.totalBukuSudahKembali / stats.totalBukuDipinjam) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 flex items-center justify-center pointer-events-none">
          <Library className="w-80 h-80 -mr-16 text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Administrasi Buku Paket Perpustakaan</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Selamat Datang di Perpustakaan Sekolah
          </h2>
          <p className="mt-2 text-sm text-blue-100 leading-relaxed">
            Kelola distribusi peminjaman dan pengembalian buku paket pelajaran siswa secara
            real-time dengan sinkronisasi Google Spreadsheet.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('formPinjam')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-xs shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Catat Peminjaman Baru</span>
            </button>
            <button
              onClick={() => onNavigateTab('kembaliBuku')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-800/60 hover:bg-blue-800/90 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Proses Pengembalian</span>
            </button>
            <button
              onClick={() => onNavigateTab('gasDeploy')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/30 hover:bg-sky-500/50 text-white font-semibold text-xs border border-white/20 transition-all"
            >
              <span>Lihat Kode Code.gs & index.html</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5 Main Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Stat 1: Total Siswa */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Siswa Meminjam</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {stats.totalSiswaMeminjam}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Siswa aktif terdata</p>
          </div>
        </div>

        {/* Stat 2: Total Buku Dipinjam */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Buku Dipinjam</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {stats.totalBukuDipinjam}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Total eksemplar buku</p>
          </div>
        </div>

        {/* Stat 3: Pinjam Hari Ini */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Peminjaman Hari Ini</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-800 tracking-tight">
              {stats.totalPeminjamanHariIni}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Transaksi tanggal ini</p>
          </div>
        </div>

        {/* Stat 4: Sudah Dikembalikan */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Sudah Dikembalikan</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-700 tracking-tight">
              {stats.totalBukuSudahKembali}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Selesai dikembalikan</p>
          </div>
        </div>

        {/* Stat 5: Belum Dikembalikan */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Belum Dikembalikan</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertOctagon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 tracking-tight">
              {stats.totalBukuBelumKembali}
            </div>
            <p className="text-[11px] text-rose-500 font-medium mt-0.5">Masih dipegang siswa</p>
          </div>
        </div>
      </div>

      {/* Progress & Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Return Rate Progress Card */}
        <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Tingkat Pengembalian Buku</h3>
            <span className="text-xs font-bold text-blue-600">{returnRate}% Selesai</span>
          </div>
          <div className="mt-4 w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 transition-all duration-500"
              style={{ width: `${returnRate}%` }}
              title={`Sudah: ${stats.totalBukuSudahKembali} buku`}
            />
            <div
              className="bg-rose-400 transition-all duration-500"
              style={{ width: `${100 - returnRate}%` }}
              title={`Belum: ${stats.totalBukuBelumKembali} buku`}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="text-emerald-700 font-bold block">{stats.totalBukuSudahKembali} Buku</span>
              <span className="text-emerald-600 text-[11px]">Sudah Dikembalikan</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
              <span className="text-rose-700 font-bold block">{stats.totalBukuBelumKembali} Buku</span>
              <span className="text-rose-600 text-[11px]">Belum Dikembalikan</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Koleksi Terdaftar: {bukuList.length} Judul Buku</span>
            <button
              onClick={() => onNavigateTab('daftarBuku')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Lihat Katalog &rarr;
            </button>
          </div>
        </div>

        {/* Quick Guide Card */}
        <div className="lg:col-span-2 p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Alur Administrasi Perpustakaan</h3>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                Panduan Cepat
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mb-2">
                  1
                </div>
                <h4 className="text-xs font-bold text-slate-800">Catat Peminjaman</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Input nama siswa, buku paket, kelas, dan jumlah buku yang dipinjam.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold mb-2">
                  2
                </div>
                <h4 className="text-xs font-bold text-slate-800">Pantau Data & Filter</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Lacak siswa yang belum mengembalikan dengan filter kelas dan buku.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold mb-2">
                  3
                </div>
                <h4 className="text-xs font-bold text-slate-800">Pengembalian</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  Klik 1 tombol untuk mengubah status menjadi 'Sudah Dikembalikan'.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              Integrasi penuh Google Apps Script & Google Spreadsheet
            </span>
            <button
              onClick={() => onNavigateTab('gasDeploy')}
              className="text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1"
            >
              <span>Buka Kode Deployment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Loans Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <BookMarked className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-base">Tabel Peminjaman Terbaru</h3>
          </div>
          <button
            onClick={() => onNavigateTab('dataPinjam')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Lihat Semua ({stats.totalSiswaMeminjam} siswa)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3.5 px-5">ID Pinjam</th>
                <th className="py-3.5 px-5">Nama Siswa</th>
                <th className="py-3.5 px-5">Buku Paket</th>
                <th className="py-3.5 px-5">Kelas</th>
                <th className="py-3.5 px-5">Tgl Pinjam</th>
                <th className="py-3.5 px-5">Jumlah</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLoans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Belum ada transaksi peminjaman.
                  </td>
                </tr>
              ) : (
                recentLoans.map((item) => {
                  const isReturned = item.status === 'Sudah Dikembalikan';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono font-medium text-slate-500">
                        {item.id}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-slate-800">{item.namaSiswa}</td>
                      <td className="py-3.5 px-5 text-slate-700 font-medium">
                        {item.bukuPaket}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold text-[11px]">
                          {item.kelas}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-600">{item.tanggalPinjam}</td>
                      <td className="py-3.5 px-5 font-semibold text-slate-800">
                        {item.jumlahBuku} eks
                      </td>
                      <td className="py-3.5 px-5">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Sudah Dikembalikan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Belum Dikembalikan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        {!isReturned ? (
                          <button
                            onClick={() => onQuickReturn(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Kembalikan</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Tuntas ({item.tanggalKembali})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
