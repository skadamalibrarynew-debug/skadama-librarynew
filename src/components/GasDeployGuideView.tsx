import React, { useState } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Download,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { GAS_CODE_GS, GAS_INDEX_HTML } from '../data/gasTemplates';

interface GasDeployGuideViewProps {
  activeSpreadsheetId?: string;
  activeSpreadsheetUrl?: string;
}

export const GasDeployGuideView: React.FC<GasDeployGuideViewProps> = ({
  activeSpreadsheetId,
  activeSpreadsheetUrl,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'guide' | 'codeGs' | 'indexHtml'>('guide');
  const [copiedCodeGs, setCopiedCodeGs] = useState(false);
  const [copiedIndexHtml, setCopiedIndexHtml] = useState(false);

  // Customized Code.gs with activeSpreadsheetId if present
  const customizedCodeGs = activeSpreadsheetId
    ? GAS_CODE_GS.replace(
        'var SPREADSHEET_ID = "";',
        `var SPREADSHEET_ID = "${activeSpreadsheetId}"; // ID Spreadsheet Anda yang sedang aktif`
      )
    : GAS_CODE_GS;

  const handleCopyCodeGs = () => {
    navigator.clipboard.writeText(customizedCodeGs);
    setCopiedCodeGs(true);
    setTimeout(() => setCopiedCodeGs(false), 2000);
  };

  const handleCopyIndexHtml = () => {
    navigator.clipboard.writeText(GAS_INDEX_HTML);
    setCopiedIndexHtml(true);
    setTimeout(() => setCopiedIndexHtml(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Pusat Kode & Deployment Google Apps Script</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
            Deploy Aplikasi ke Google Apps Script (Web App)
          </h2>
          <p className="mt-2 text-sm text-slate-300 max-w-3xl leading-relaxed">
            Dapatkan kode lengkap 100% siap pakai untuk <strong className="text-white">Code.gs</strong> (Backend)
            dan <strong className="text-white">index.html</strong> (Frontend Bootstrap 5). Anda dapat langsung
            memasangnya ke Google Spreadsheet sekolah tanpa server tambahan!
          </p>

          {activeSpreadsheetId && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Spreadsheet ID aktif Anda telah otomatis dimasukkan ke dalam kode di bawah:</span>
              <code className="font-mono bg-black/40 px-2 py-0.5 rounded text-white text-[11px]">
                {activeSpreadsheetId}
              </code>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveCodeTab('guide')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeCodeTab === 'guide'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Petunjuk Langkah Demi Langkah</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('codeGs')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeCodeTab === 'codeGs'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCode2 className="w-4 h-4" />
          <span>File 1: Code.gs (Backend)</span>
        </button>

        <button
          onClick={() => setActiveCodeTab('indexHtml')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeCodeTab === 'indexHtml'
              ? 'border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>File 2: index.html (Frontend)</span>
        </button>
      </div>

      {/* TAB 1: STEP-BY-STEP DEPLOYMENT GUIDE */}
      {activeCodeTab === 'guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1 */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  1
                </span>
                <h4 className="font-bold text-slate-800 text-sm">
                  Membuat Google Spreadsheet Database
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buka <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline">sheets.new</a> di browser untuk membuat spreadsheet baru dengan nama misalnya: <strong className="text-slate-800">"Database Perpustakaan Sekolah"</strong>.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <p className="font-semibold text-slate-800">
                  Aplikasi secara otomatis membuat 5 Sheet saat pertama kali dijalankan:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500">
                  <li><strong>Sheet 1: Peminjaman</strong> (Kolom: ID, Nama Siswa, Buku Paket, Kelas, Tanggal Pinjam, Jumlah Buku, Tanggal Kembali, Status, Keterangan)</li>
                  <li><strong>Sheet 2: Daftar Buku</strong> (Kolom: ID Buku, Nama Buku, Mata Pelajaran, Kelas, Stok Buku)</li>
                  <li><strong>Sheet 3: Pengaturan</strong> (Kolom: Parameter, Nilai)</li>
                  <li><strong>Sheet 4: Pengguna</strong> (Kolom: ID Pengguna, Nama Pengguna, Jabatan, Keterangan)</li>
                  <li><strong>Sheet 5: Kelas</strong> (Kolom: ID Kelas, Tingkat Kelas, Jurusan, Rombel)</li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  2
                </span>
                <h4 className="font-bold text-slate-800 text-sm">
                  Membuka Google Apps Script Editor
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Di Google Spreadsheet Anda, klik menu atas:
              </p>
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-100 text-xs font-mono text-blue-900 font-bold">
                Ekstensi (Extensions) &rarr; Apps Script
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Jendela baru Google Apps Script Editor akan terbuka secara otomatis.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  3
                </span>
                <h4 className="font-bold text-slate-800 text-sm">
                  Memasang File Code.gs & index.html
                </h4>
              </div>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-2 leading-relaxed">
                <li>
                  Buka file bawaan <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">Code.gs</code>, hapus seluruh isinya lalu tempelkan seluruh kode dari tab <strong>"File 1: Code.gs"</strong>.
                </li>
                <li>
                  Klik ikon tanda tambah <strong>(+)</strong> di samping tulisan Files &rarr; pilih <strong>HTML</strong>.
                </li>
                <li>
                  Beri nama persis: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold text-blue-600">index</code> (tanpa ekstensi .html).
                </li>
                <li>
                  Hapus kode bawaan di file index, lalu tempelkan seluruh kode dari tab <strong>"File 2: index.html"</strong>.
                </li>
                <li>
                  Klik ikon disket <strong>Save (Simpan)</strong> atau tekan <kbd className="bg-slate-100 border px-1 rounded text-[10px]">Ctrl + S</kbd>.
                </li>
              </ol>
            </div>

            {/* Step 4 */}
            <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                  4
                </span>
                <h4 className="font-bold text-slate-800 text-sm">
                  Deployment sebagai Web App
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Di pojok kanan atas Apps Script Editor, lakukan langkah deployment berikut:
              </p>
              <ol className="list-decimal list-inside text-xs text-slate-600 space-y-1.5 leading-relaxed">
                <li>Klik tombol biru <strong>Deploy (Terapkan)</strong> &rarr; pilih <strong>New deployment (Penerapan baru)</strong>.</li>
                <li>Klik ikon gerigi &rarr; pilih jenis <strong>Web app (Aplikasi web)</strong>.</li>
                <li><strong>Description</strong>: <em>Sistem Perpustakaan Sekolah v1</em></li>
                <li><strong>Execute as (Jalankan sebagai)</strong>: <code className="text-blue-700 font-bold">Me (Saya)</code></li>
                <li><strong>Who has access (Siapa yang memiliki akses)</strong>: <code className="text-emerald-700 font-bold">Anyone (Siapa saja)</code></li>
                <li>Klik tombol <strong>Deploy</strong> &rarr; Izinkan hak akses (Authorize access) &rarr; Selesai!</li>
              </ol>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="p-6 rounded-3xl bg-blue-50 border border-blue-200/80 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-blue-950 text-sm">
                Siap Menyalin Kode Aplikasi Perpustakaan?
              </h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Klik tab file di atas atau gunakan tombol salin cepat di bawah ini:
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCodeGs}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                {copiedCodeGs ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCodeGs ? 'Tersalin!' : 'Salin Code.gs'}</span>
              </button>

              <button
                onClick={handleCopyIndexHtml}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-blue-700 border border-blue-300 font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5"
              >
                {copiedIndexHtml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedIndexHtml ? 'Tersalin!' : 'Salin index.html'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CODE.GS VIEWER */}
      {activeCodeTab === 'codeGs' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-slate-300 ml-2">Code.gs</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile('Code.gs', customizedCodeGs)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
              <button
                onClick={handleCopyCodeGs}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedCodeGs ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCodeGs ? 'Berhasil Tersalin!' : 'Salin Seluruh Kode'}</span>
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
            <pre>{customizedCodeGs}</pre>
          </div>
        </div>
      )}

      {/* TAB 3: INDEX.HTML VIEWER */}
      {activeCodeTab === 'indexHtml' && (
        <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold text-slate-300 ml-2">index.html</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDownloadFile('index.html', GAS_INDEX_HTML)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
              <button
                onClick={handleCopyIndexHtml}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                {copiedIndexHtml ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedIndexHtml ? 'Berhasil Tersalin!' : 'Salin Seluruh Kode'}</span>
              </button>
            </div>
          </div>
          <div className="p-6 max-h-[600px] overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed">
            <pre>{GAS_INDEX_HTML}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
