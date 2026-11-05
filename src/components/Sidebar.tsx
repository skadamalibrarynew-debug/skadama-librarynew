import {
  LayoutDashboard,
  FilePlus2,
  BookMarked,
  RotateCcw,
  Library,
  Users,
  GraduationCap,
  FileCode2,
  Settings,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  TableProperties
} from 'lucide-react';
import { User } from 'firebase/auth';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user?: User | null;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  onLogout?: () => void;
  onOpenSpreadsheet: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  user,
  spreadsheetId,
  spreadsheetUrl,
  onLogout,
  onOpenSpreadsheet,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Utama',
    },
    {
      id: 'formPinjam',
      label: 'Form Peminjaman',
      icon: FilePlus2,
    },
    {
      id: 'dataPinjam',
      label: 'Data Peminjaman',
      icon: BookMarked,
    },
    {
      id: 'kembaliBuku',
      label: 'Pengembalian Buku',
      icon: RotateCcw,
    },
    {
      id: 'daftarBuku',
      label: 'Katalog Buku Paket',
      icon: Library,
    },
    {
      id: 'pengguna',
      label: 'Pengaturan Pengguna',
      icon: Users,
    },
    {
      id: 'kelas',
      label: 'Pengaturan Kelas',
      icon: GraduationCap,
    },
    {
      id: 'gasDeploy',
      label: 'Kode & Panduan GAS',
      icon: FileCode2,
      badge: 'Code.gs + HTML',
      highlight: true,
    },
    {
      id: 'pengaturan',
      label: 'Pengaturan & Sheets',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-slate-200/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
          <Library className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-slate-800 text-base leading-tight">Perpustakaan</h1>
            <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-blue-100 text-blue-700 rounded-md">
              GAS
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Sistem Buku Paket Siswa</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu Aplikasi
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive
                      ? 'text-blue-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.highlight
                      ? 'bg-emerald-100 text-emerald-700'
                      : isActive
                      ? 'bg-blue-200 text-blue-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Database Status Card in Sidebar */}
        <div className="pt-4">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Basis Data Google
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <TableProperties className="w-3.5 h-3.5 text-blue-600" />
                Google Spreadsheet
              </span>
              {spreadsheetId ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Terhubung
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Lokal / Siap Sync
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {spreadsheetId
                ? 'Terhubung dengan 3 Sheet: Peminjaman, Daftar Buku & Pengaturan.'
                : 'Bisa langsung digunakan & disinkronkan ke Google Spreadsheet.'}
            </p>
            {spreadsheetId && (
              <button
                onClick={onOpenSpreadsheet}
                className="mt-2.5 w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 bg-white hover:bg-blue-100/50 py-1.5 px-3 rounded-xl border border-blue-200 transition-colors shadow-2xs"
              >
                <span>Buka Google Sheet</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Administration Footer */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-800 truncate">
              Petugas Perpustakaan
            </p>
            <p className="text-[10px] text-slate-500 truncate">Akses Penuh Tanpa Login</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
