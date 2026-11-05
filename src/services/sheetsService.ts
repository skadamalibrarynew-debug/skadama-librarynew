import {
  Peminjaman,
  BukuPaket,
  PengaturanPerpustakaan,
  Pengguna,
  Kelas
} from '../types/library';
import { getAccessToken } from './firebaseAuth';

export const INITIAL_BUKU: BukuPaket[] = [
  { idBuku: 'BK-001', namaBuku: 'Matematika Tingkat Lanjut X', mataPelajaran: 'Matematika', kelas: 'X', stokBuku: 45 },
  { idBuku: 'BK-002', namaBuku: 'Bahasa Indonesia Cerdas X', mataPelajaran: 'Bahasa Indonesia', kelas: 'X', stokBuku: 50 },
  { idBuku: 'BK-003', namaBuku: 'Fisika Terapan XI', mataPelajaran: 'Fisika', kelas: 'XI', stokBuku: 35 },
  { idBuku: 'BK-004', namaBuku: 'Kimia Dasar & Praktikum XI', mataPelajaran: 'Kimia', kelas: 'XI', stokBuku: 40 },
  { idBuku: 'BK-005', namaBuku: 'Biologi Lingkungan XI', mataPelajaran: 'Biologi', kelas: 'XI', stokBuku: 30 },
  { idBuku: 'BK-006', namaBuku: 'Bahasa Inggris: English in Action XII', mataPelajaran: 'Bahasa Inggris', kelas: 'XII', stokBuku: 40 },
  { idBuku: 'BK-007', namaBuku: 'Pendidikan Pancasila & Kewarganegaraan XII', mataPelajaran: 'PPKN', kelas: 'XII', stokBuku: 50 },
  { idBuku: 'BK-008', namaBuku: 'Informatika & Pemrograman Web X', mataPelajaran: 'Informatika', kelas: 'X', stokBuku: 35 },
  { idBuku: 'BK-009', namaBuku: 'Sejarah Indonesia Modern XI', mataPelajaran: 'Sejarah', kelas: 'XI', stokBuku: 30 },
  { idBuku: 'BK-010', namaBuku: 'Ekonomi & Akuntansi Keuangan XII', mataPelajaran: 'Ekonomi', kelas: 'XII', stokBuku: 25 },
];

export const INITIAL_PEMINJAMAN: Peminjaman[] = [
  {
    id: 'PJ-20261101-001',
    namaSiswa: 'Ahmad Fauzi',
    bukuPaket: 'Matematika Tingkat Lanjut X',
    kelas: 'X RPL 1',
    tanggalPinjam: '2026-11-01',
    jumlahBuku: 1,
    tanggalKembali: '-',
    status: 'Belum Dikembalikan',
    keterangan: 'Peminjaman satu semester',
  },
  {
    id: 'PJ-20261102-002',
    namaSiswa: 'Siti Nurhaliza',
    bukuPaket: 'Fisika Terapan XI',
    kelas: 'XI MIPA 2',
    tanggalPinjam: '2026-11-02',
    jumlahBuku: 1,
    tanggalKembali: '2026-11-04',
    status: 'Sudah Dikembalikan',
    keterangan: 'Kondisi buku baik dan bersih',
  },
  {
    id: 'PJ-20261103-003',
    namaSiswa: 'Budi Santoso',
    bukuPaket: 'Informatika & Pemrograman Web X',
    kelas: 'X RPL 2',
    tanggalPinjam: '2026-11-03',
    jumlahBuku: 2,
    tanggalKembali: '-',
    status: 'Belum Dikembalikan',
    keterangan: 'Untuk kelompok praktikum',
  },
  {
    id: 'PJ-20261104-004',
    namaSiswa: 'Dewi Lestari',
    bukuPaket: 'Bahasa Inggris: English in Action XII',
    kelas: 'XII IPS 1',
    tanggalPinjam: '2026-11-04',
    jumlahBuku: 1,
    tanggalKembali: '-',
    status: 'Belum Dikembalikan',
    keterangan: 'Persiapan ujian semester',
  },
  {
    id: 'PJ-20261104-005',
    namaSiswa: 'Reza Pratama',
    bukuPaket: 'Biologi Lingkungan XI',
    kelas: 'XI MIPA 1',
    tanggalPinjam: '2026-11-04',
    jumlahBuku: 1,
    tanggalKembali: '2026-11-04',
    status: 'Sudah Dikembalikan',
    keterangan: 'Dikembalikan tepat waktu',
  },
];

export const INITIAL_PENGGUNA: Pengguna[] = [
  {
    id: 'USR-001',
    namaPengguna: 'Hj. Ratna Sari, S.Pd., M.M.',
    jabatan: 'Kepala Perpustakaan',
    keterangan: 'Penanggung jawab utama administrasi perpustakaan',
  },
  {
    id: 'USR-002',
    namaPengguna: 'Bambang Supriyanto, S.I.Pust.',
    jabatan: 'Pustakawan Pelaksana',
    keterangan: 'Petugas pengelolaan sirkulasi & inventaris buku paket',
  },
  {
    id: 'USR-003',
    namaPengguna: 'Dewi Anggraini, A.Md.',
    jabatan: 'Staf Administrasi',
    keterangan: 'Pencatatan peminjaman, pengembalian, dan data siswa',
  },
];

export const INITIAL_KELAS: Kelas[] = [
  { id: 'KLS-001', tingkatKelas: 'X', jurusan: 'RPL', rombel: '1', namaKelasLengkap: 'X RPL 1' },
  { id: 'KLS-002', tingkatKelas: 'X', jurusan: 'RPL', rombel: '2', namaKelasLengkap: 'X RPL 2' },
  { id: 'KLS-003', tingkatKelas: 'X', jurusan: 'TKJ', rombel: '1', namaKelasLengkap: 'X TKJ 1' },
  { id: 'KLS-004', tingkatKelas: 'X', jurusan: 'AKL', rombel: '1', namaKelasLengkap: 'X AKL 1' },
  { id: 'KLS-005', tingkatKelas: 'XI', jurusan: 'MIPA', rombel: '1', namaKelasLengkap: 'XI MIPA 1' },
  { id: 'KLS-006', tingkatKelas: 'XI', jurusan: 'MIPA', rombel: '2', namaKelasLengkap: 'XI MIPA 2' },
  { id: 'KLS-007', tingkatKelas: 'XI', jurusan: 'IPS', rombel: '1', namaKelasLengkap: 'XI IPS 1' },
  { id: 'KLS-008', tingkatKelas: 'XI', jurusan: 'RPL', rombel: '1', namaKelasLengkap: 'XI RPL 1' },
  { id: 'KLS-009', tingkatKelas: 'XII', jurusan: 'RPL', rombel: '1', namaKelasLengkap: 'XII RPL 1' },
  { id: 'KLS-010', tingkatKelas: 'XII', jurusan: 'TKJ', rombel: '1', namaKelasLengkap: 'XII TKJ 1' },
  { id: 'KLS-011', tingkatKelas: 'XII', jurusan: 'MIPA', rombel: '1', namaKelasLengkap: 'XII MIPA 1' },
];

export const DEFAULT_PENGATURAN: PengaturanPerpustakaan = {
  namaPerpustakaan: 'Perpustakaan Cendekia Mandiri',
  namaSekolah: 'SMK Negeri 1 Teladan',
  alamatSekolah: 'Jl. Pendidikan No. 45, Kompleks Pelajar',
  namaPustakawan: 'Hj. Ratna Sari, S.Pd., M.M.',
  nipPustakawan: '19820514 200801 2 009',
  kontak: 'perpustakaan@sekolah.sch.id / 0812-3456-7890',
  spreadsheetId: '',
  maxHariPinjam: 14,
};

export const getInitialData = () => {
  const localPeminjaman = localStorage.getItem('perpus_peminjaman');
  const localBuku = localStorage.getItem('perpus_buku');
  const localPengaturan = localStorage.getItem('perpus_pengaturan');
  const localPengguna = localStorage.getItem('perpus_pengguna');
  const localKelas = localStorage.getItem('perpus_kelas');

  return {
    peminjaman: localPeminjaman ? JSON.parse(localPeminjaman) : INITIAL_PEMINJAMAN,
    daftarBuku: localBuku ? JSON.parse(localBuku) : INITIAL_BUKU,
    pengaturan: localPengaturan ? JSON.parse(localPengaturan) : DEFAULT_PENGATURAN,
    pengguna: localPengguna ? JSON.parse(localPengguna) : INITIAL_PENGGUNA,
    kelas: localKelas ? JSON.parse(localKelas) : INITIAL_KELAS,
  };
};

export const saveLocalData = (
  peminjaman: Peminjaman[],
  daftarBuku: BukuPaket[],
  pengaturan: PengaturanPerpustakaan,
  pengguna?: Pengguna[],
  kelas?: Kelas[]
) => {
  localStorage.setItem('perpus_peminjaman', JSON.stringify(peminjaman));
  localStorage.setItem('perpus_buku', JSON.stringify(daftarBuku));
  localStorage.setItem('perpus_pengaturan', JSON.stringify(pengaturan));
  if (pengguna) localStorage.setItem('perpus_pengguna', JSON.stringify(pengguna));
  if (kelas) localStorage.setItem('perpus_kelas', JSON.stringify(kelas));
};

/**
 * Creates a brand-new structured Google Spreadsheet with 5 Sheets:
 * 1. Peminjaman
 * 2. Daftar Buku
 * 3. Pengaturan
 * 4. Pengguna
 * 5. Kelas
 */
export const createGoogleSpreadsheet = async (
  title = 'Database Perpustakaan Sekolah'
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error('Access token tidak ditemukan. Silakan login dengan Google.');
  }

  const payload = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Peminjaman',
          gridProperties: { rowCount: 1000, columnCount: 15, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Daftar Buku',
          gridProperties: { rowCount: 500, columnCount: 10, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Pengaturan',
          gridProperties: { rowCount: 100, columnCount: 5, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Pengguna',
          gridProperties: { rowCount: 200, columnCount: 6, frozenRowCount: 1 },
        },
      },
      {
        properties: {
          title: 'Kelas',
          gridProperties: { rowCount: 200, columnCount: 8, frozenRowCount: 1 },
        },
      },
    ],
  };

  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error?.message || 'Gagal membuat Google Spreadsheet baru');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Seed initial headers & sample data
  await initializeSpreadsheetSheets(spreadsheetId, accessToken);

  return { spreadsheetId, spreadsheetUrl };
};

/**
 * Ensures headers and default data exist in all 5 sheets
 */
export const initializeSpreadsheetSheets = async (
  spreadsheetId: string,
  token?: string
) => {
  const accessToken = token || (await getAccessToken());
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  // 1. Peminjaman
  const peminjamanValues = [
    ['ID', 'Nama Siswa', 'Buku Paket', 'Kelas', 'Tanggal Pinjam', 'Jumlah Buku', 'Tanggal Kembali', 'Status', 'Keterangan'],
    ...INITIAL_PEMINJAMAN.map((p) => [
      p.id,
      p.namaSiswa,
      p.bukuPaket,
      p.kelas,
      p.tanggalPinjam,
      p.jumlahBuku,
      p.tanggalKembali,
      p.status,
      p.keterangan,
    ]),
  ];

  // 2. Daftar Buku
  const bukuValues = [
    ['ID Buku', 'Nama Buku', 'Mata Pelajaran', 'Kelas', 'Stok Buku'],
    ...INITIAL_BUKU.map((b) => [b.idBuku, b.namaBuku, b.mataPelajaran, b.kelas, b.stokBuku]),
  ];

  // 3. Pengaturan
  const pengaturanValues = [
    ['Parameter', 'Nilai'],
    ['Nama Perpustakaan', DEFAULT_PENGATURAN.namaPerpustakaan],
    ['Nama Sekolah', DEFAULT_PENGATURAN.namaSekolah],
    ['Alamat Sekolah', DEFAULT_PENGATURAN.alamatSekolah],
    ['Nama Pustakawan', DEFAULT_PENGATURAN.namaPustakawan],
    ['NIP Pustakawan', DEFAULT_PENGATURAN.nipPustakawan],
    ['Kontak', DEFAULT_PENGATURAN.kontak],
    ['Batas Hari Pinjam', String(DEFAULT_PENGATURAN.maxHariPinjam)],
  ];

  // 4. Pengguna
  const penggunaValues = [
    ['ID Pengguna', 'Nama Pengguna', 'Jabatan', 'Keterangan'],
    ...INITIAL_PENGGUNA.map((u) => [u.id, u.namaPengguna, u.jabatan, u.keterangan]),
  ];

  // 5. Kelas
  const kelasValues = [
    ['ID Kelas', 'Tingkat Kelas', 'Jurusan', 'Rombel', 'Nama Kelas Lengkap'],
    ...INITIAL_KELAS.map((k) => [k.id, k.tingkatKelas, k.jurusan, k.rombel, k.namaKelasLengkap]),
  ];

  // First create missing sheets if needed
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { addSheet: { properties: { title: 'Pengguna' } } },
          { addSheet: { properties: { title: 'Kelas' } } },
        ],
      }),
    });
  } catch {
    // Sheets may already exist, ignore error
  }

  // Batch update values
  const updateBody = {
    valueInputOption: 'USER_ENTERED',
    data: [
      { range: 'Peminjaman!A1:I', values: peminjamanValues },
      { range: 'Daftar Buku!A1:E', values: bukuValues },
      { range: 'Pengaturan!A1:B', values: pengaturanValues },
      { range: 'Pengguna!A1:D', values: penggunaValues },
      { range: 'Kelas!A1:E', values: kelasValues },
    ],
  };

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    }
  );
};

/**
 * Read data from Google Spreadsheet for all sheets
 */
export const readSpreadsheetData = async (
  spreadsheetId: string
): Promise<{
  peminjaman: Peminjaman[];
  daftarBuku: BukuPaket[];
  pengaturan: PengaturanPerpustakaan;
  pengguna: Pengguna[];
  kelas: Kelas[];
}> => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  const ranges = [
    'Peminjaman!A2:I',
    'Daftar Buku!A2:E',
    'Pengaturan!A2:B',
    'Pengguna!A2:D',
    'Kelas!A2:E',
  ];
  const query = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join('&');

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${query}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Gagal membaca data dari Google Spreadsheet');
  }

  const result = await res.json();
  const valueRanges = result.valueRanges || [];

  // Parse Peminjaman
  const rawPeminjaman = valueRanges[0]?.values || [];
  const peminjaman: Peminjaman[] = rawPeminjaman.map((row: string[]) => ({
    id: row[0] || '',
    namaSiswa: row[1] || '',
    bukuPaket: row[2] || '',
    kelas: row[3] || '',
    tanggalPinjam: row[4] || '',
    jumlahBuku: parseInt(row[5] || '1', 10) || 1,
    tanggalKembali: row[6] || '-',
    status: (row[7] === 'Sudah Dikembalikan' ? 'Sudah Dikembalikan' : 'Belum Dikembalikan'),
    keterangan: row[8] || '',
  })).filter((p: Peminjaman) => p.id && p.namaSiswa);

  // Parse Daftar Buku
  const rawBuku = valueRanges[1]?.values || [];
  const daftarBuku: BukuPaket[] = rawBuku.map((row: string[]) => ({
    idBuku: row[0] || '',
    namaBuku: row[1] || '',
    mataPelajaran: row[2] || '',
    kelas: row[3] || '',
    stokBuku: parseInt(row[4] || '0', 10) || 0,
  })).filter((b: BukuPaket) => b.idBuku && b.namaBuku);

  // Parse Pengaturan
  const rawPengaturan = valueRanges[2]?.values || [];
  const settingsMap: Record<string, string> = {};
  rawPengaturan.forEach((row: string[]) => {
    if (row[0]) settingsMap[row[0].trim()] = row[1] || '';
  });

  const pengaturan: PengaturanPerpustakaan = {
    namaPerpustakaan: settingsMap['Nama Perpustakaan'] || DEFAULT_PENGATURAN.namaPerpustakaan,
    namaSekolah: settingsMap['Nama Sekolah'] || DEFAULT_PENGATURAN.namaSekolah,
    alamatSekolah: settingsMap['Alamat Sekolah'] || DEFAULT_PENGATURAN.alamatSekolah,
    namaPustakawan: settingsMap['Nama Pustakawan'] || DEFAULT_PENGATURAN.namaPustakawan,
    nipPustakawan: settingsMap['NIP Pustakawan'] || DEFAULT_PENGATURAN.nipPustakawan,
    kontak: settingsMap['Kontak'] || DEFAULT_PENGATURAN.kontak,
    spreadsheetId,
    spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    maxHariPinjam: parseInt(settingsMap['Batas Hari Pinjam'] || '14', 10) || 14,
  };

  // Parse Pengguna
  const rawPengguna = valueRanges[3]?.values || [];
  const pengguna: Pengguna[] = rawPengguna.map((row: string[], idx: number) => ({
    id: row[0] || `USR-${String(idx + 1).padStart(3, '0')}`,
    namaPengguna: row[1] || '',
    jabatan: row[2] || 'Staf Perpustakaan',
    keterangan: row[3] || '-',
  })).filter((u: Pengguna) => u.namaPengguna);

  // Parse Kelas
  const rawKelas = valueRanges[4]?.values || [];
  const kelas: Kelas[] = rawKelas.map((row: string[], idx: number) => ({
    id: row[0] || `KLS-${String(idx + 1).padStart(3, '0')}`,
    tingkatKelas: row[1] || 'X',
    jurusan: row[2] || '',
    rombel: row[3] || '',
    namaKelasLengkap: row[4] || `${row[1]} ${row[2]} ${row[3]}`.trim(),
  })).filter((k: Kelas) => k.tingkatKelas && k.jurusan);

  return {
    peminjaman,
    daftarBuku,
    pengaturan,
    pengguna: pengguna.length > 0 ? pengguna : INITIAL_PENGGUNA,
    kelas: kelas.length > 0 ? kelas : INITIAL_KELAS,
  };
};

/**
 * Append a new loan row to Google Sheets
 */
export const appendLoanToSheet = async (
  spreadsheetId: string,
  peminjaman: Peminjaman
) => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  const values = [
    [
      peminjaman.id,
      peminjaman.namaSiswa,
      peminjaman.bukuPaket,
      peminjaman.kelas,
      peminjaman.tanggalPinjam,
      peminjaman.jumlahBuku,
      peminjaman.tanggalKembali || '-',
      peminjaman.status,
      peminjaman.keterangan || '-',
    ],
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Peminjaman!A:I:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
};

/**
 * Overwrite full Peminjaman sheet data
 */
export const syncAllPeminjamanToSheet = async (
  spreadsheetId: string,
  peminjamanList: Peminjaman[]
) => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Peminjaman!A2:I1000:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (peminjamanList.length === 0) return;

  const values = peminjamanList.map((p) => [
    p.id,
    p.namaSiswa,
    p.bukuPaket,
    p.kelas,
    p.tanggalPinjam,
    p.jumlahBuku,
    p.tanggalKembali || '-',
    p.status,
    p.keterangan || '-',
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Peminjaman!A2:I?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
};

/**
 * Overwrite full Daftar Buku sheet data
 */
export const syncAllBukuToSheet = async (
  spreadsheetId: string,
  bukuList: BukuPaket[]
) => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Daftar Buku!A2:E500:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (bukuList.length === 0) return;

  const values = bukuList.map((b) => [
    b.idBuku,
    b.namaBuku,
    b.mataPelajaran,
    b.kelas,
    b.stokBuku,
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Daftar Buku!A2:E?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
};

/**
 * Save Pengaturan to Google Sheets
 */
export const syncPengaturanToSheet = async (
  spreadsheetId: string,
  pengaturan: PengaturanPerpustakaan
) => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  const values = [
    ['Nama Perpustakaan', pengaturan.namaPerpustakaan],
    ['Nama Sekolah', pengaturan.namaSekolah],
    ['Alamat Sekolah', pengaturan.alamatSekolah],
    ['Nama Pustakawan', pengaturan.namaPustakawan],
    ['NIP Pustakawan', pengaturan.nipPustakawan],
    ['Kontak', pengaturan.kontak],
    ['Batas Hari Pinjam', String(pengaturan.maxHariPinjam)],
  ];

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pengaturan!A2:B8?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
};

/**
 * Ensures a sheet exists in Google Spreadsheet, creating it with headers if missing
 */
export const ensureSheet = async (
  spreadsheetId: string,
  sheetName: string,
  headers: string[],
  accessToken: string
) => {
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { addSheet: { properties: { title: sheetName } } },
        ],
      }),
    });
    // Add header row
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:Z1?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: [headers] }),
      }
    );
  } catch {
    // Sheet probably already exists
  }
};

/**
 * Overwrite full Pengguna sheet data
 */
export const syncAllPenggunaToSheet = async (
  spreadsheetId: string,
  penggunaList: Pengguna[]
) => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  await ensureSheet(
    spreadsheetId,
    'Pengguna',
    ['ID Pengguna', 'Nama Pengguna', 'Jabatan', 'Keterangan'],
    accessToken
  );

  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pengguna!A2:D500:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch {
    // Ignore clear error if sheet was just created
  }

  if (penggunaList.length === 0) return;

  const values = penggunaList.map((u) => [
    u.id,
    u.namaPengguna,
    u.jabatan,
    u.keterangan || '-',
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pengguna!A2:D?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
};

/**
 * Overwrite full Kelas sheet data
 */
export const syncAllKelasToSheet = async (
  spreadsheetId: string,
  kelasList: Kelas[]
) => {
  const accessToken = await getAccessToken();
  if (!accessToken) throw new Error('Akses ditolak: Token tidak tersedia');

  await ensureSheet(
    spreadsheetId,
    'Kelas',
    ['ID Kelas', 'Tingkat Kelas', 'Jurusan', 'Rombel', 'Nama Kelas Lengkap'],
    accessToken
  );

  try {
    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Kelas!A2:E500:clear`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch {
    // Ignore clear error if sheet was just created
  }

  if (kelasList.length === 0) return;

  const values = kelasList.map((k) => [
    k.id,
    k.tingkatKelas,
    k.jurusan,
    k.rombel,
    k.namaKelasLengkap || `${k.tingkatKelas} ${k.jurusan} ${k.rombel}`.trim(),
  ]);

  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Kelas!A2:E?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );
};
