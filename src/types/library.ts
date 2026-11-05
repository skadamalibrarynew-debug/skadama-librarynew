export interface Peminjaman {
  id: string;
  namaSiswa: string;
  bukuPaket: string;
  kelas: string;
  tanggalPinjam: string;
  jumlahBuku: number;
  tanggalKembali: string;
  status: 'Belum Dikembalikan' | 'Sudah Dikembalikan';
  keterangan: string;
}

export interface BukuPaket {
  idBuku: string;
  namaBuku: string;
  mataPelajaran: string;
  kelas: string;
  stokBuku: number;
}

export interface PengaturanPerpustakaan {
  namaPerpustakaan: string;
  namaSekolah: string;
  alamatSekolah: string;
  namaPustakawan: string;
  nipPustakawan: string;
  kontak: string;
  spreadsheetId: string;
  spreadsheetUrl?: string;
  maxHariPinjam: number;
}

export interface Pengguna {
  id: string;
  namaPengguna: string;
  jabatan: string;
  keterangan: string;
}

export interface Kelas {
  id: string;
  tingkatKelas: string;
  jurusan: string;
  rombel: string;
  namaKelasLengkap: string;
}

export interface DashboardStats {
  totalSiswaMeminjam: number;
  totalBukuDipinjam: number;
  totalPeminjamanHariIni: number;
  totalBukuSudahKembali: number;
  totalBukuBelumKembali: number;
}
