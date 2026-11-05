import React from 'react';
import {
  RotateCw,
  ExternalLink,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { User } from 'firebase/auth';

interface HeaderProps {
  title: string;
  subtitle: string;
  user: User | null;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  isSyncing: boolean;
  isLoggingIn: boolean;
  onLogin: () => void;
  onRefresh: () => void;
  onCreateSpreadsheet: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  user,
  spreadsheetId,
  spreadsheetUrl,
  isSyncing,
  isLoggingIn,
  onLogin,
  onRefresh,
  onCreateSpreadsheet,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 px-8 py-4.5 sticky top-0 z-20 flex items-center justify-between shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          {title}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Spreadsheet Status */}
        {spreadsheetId ? (
          <a
            href={spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 transition-colors"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Database Terhubung</span>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
          </a>
        ) : user ? (
          <button
            onClick={onCreateSpreadsheet}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors shadow-2xs"
          >
            <PlusCircle className="w-4 h-4 text-blue-600" />
            <span>Buat Spreadsheet Database Baru</span>
          </button>
        ) : (
          <div className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200">
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>Database Lokal Aktif</span>
          </div>
        )}

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-colors shadow-2xs disabled:opacity-50"
          title="Segarkan data terbaru"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Google Sign In Button */}
        {!user && (
          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            type="button"
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-xs hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 transition-all disabled:opacity-60"
          >
            {/* Official Google 'G' icon */}
            <svg
              className="w-4 h-4 flex-shrink-0"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{isLoggingIn ? 'Menghubungkan...' : 'Hubungkan Google Sheets'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
