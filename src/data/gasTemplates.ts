export const GAS_CODE_GS = `/**
 * =========================================================================
 * SISTEM INFORMASI PERPUSTAKAAN SEKOLAH (BUKU PAKET)
 * BERBASIS GOOGLE APPS SCRIPT & GOOGLE SPREADSHEET
 * =========================================================================
 * Fitur:
 * - Manajemen Peminjaman & Pengembalian Buku Paket
 * - Katalog & Stok Buku Paket
 * - Pengaturan Pengguna (Petugas/Staf Perpustakaan)
 * - Pengaturan Kelas (Tingkat, Jurusan, Rombel)
 * - Impor & Ekspor Excel (.xlsx) & CSV (.csv)
 * - Pengaturan & Profil Perpustakaan Sekolah
 * =========================================================================
 */

// Ganti dengan Spreadsheet ID Anda jika menggunakan standalone script,
// atau biarkan kosong jika script terikat langsung (Bound Script via Extensions > Apps Script).
var SPREADSHEET_ID = ""; 

/**
 * Mendapatkan referensi Google Spreadsheet
 */
function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e) {
      throw new Error("Gagal membuka Spreadsheet dengan ID: " + SPREADSHEET_ID + ". Pastikan ID benar dan hak akses diberikan.");
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Menampilkan Web App
 */
function doGet(e) {
  // Inisialisasi sheet otomatis jika belum ada
  try {
    initDatabaseSheets();
  } catch (err) {
    Logger.log("Info init: " + err.message);
  }

  var template = HtmlService.createTemplateFromFile("index");
  return template.evaluate()
    .setTitle("Sistem Perpustakaan Sekolah - Manajemen Peminjaman Buku Paket")
    .addMetaTag("viewport", "width=device-width, initial-scale=1.0")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Inisialisasi 5 Sheet Utama otomatis jika belum ada:
 * 1. Peminjaman
 * 2. Daftar Buku
 * 3. Pengaturan
 * 4. Pengguna
 * 5. Kelas
 */
function initDatabaseSheets() {
  var ss = getSpreadsheet();
  if (!ss) throw new Error("Spreadsheet tidak dapat diakses.");

  // 1. Sheet Peminjaman
  var sheetPinjam = ss.getSheetByName("Peminjaman");
  if (!sheetPinjam) {
    sheetPinjam = ss.insertSheet("Peminjaman");
    var headersPinjam = [["ID", "Nama Siswa", "Buku Paket", "Kelas", "Tanggal Pinjam", "Jumlah Buku", "Tanggal Kembali", "Status", "Keterangan"]];
    sheetPinjam.getRange(1, 1, 1, 9).setValues(headersPinjam);
    sheetPinjam.getRange("A1:I1").setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    sheetPinjam.setFrozenRows(1);

    var samplePinjam = [
      ["PJ-20261101-001", "Ahmad Fauzi", "Matematika Tingkat Lanjut X", "X RPL 1", "2026-11-01", 1, "-", "Belum Dikembalikan", "Peminjaman semester ganjil"],
      ["PJ-20261102-002", "Siti Nurhaliza", "Fisika Terapan XI", "XI MIPA 2", "2026-11-02", 1, "2026-11-04", "Sudah Dikembalikan", "Buku dikembalikan rapi"],
      ["PJ-20261103-003", "Budi Santoso", "Informatika & Pemrograman Web X", "X RPL 2", "2026-11-03", 2, "-", "Belum Dikembalikan", "Untuk kelompok praktikum"]
    ];
    sheetPinjam.getRange(2, 1, samplePinjam.length, 9).setValues(samplePinjam);
  }

  // 2. Sheet Daftar Buku
  var sheetBuku = ss.getSheetByName("Daftar Buku");
  if (!sheetBuku) {
    sheetBuku = ss.insertSheet("Daftar Buku");
    var headersBuku = [["ID Buku", "Nama Buku", "Mata Pelajaran", "Kelas", "Stok Buku"]];
    sheetBuku.getRange(1, 1, 1, 5).setValues(headersBuku);
    sheetBuku.getRange("A1:E1").setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    sheetBuku.setFrozenRows(1);

    var sampleBuku = [
      ["BK-001", "Matematika Tingkat Lanjut X", "Matematika", "X", 45],
      ["BK-002", "Bahasa Indonesia Cerdas X", "Bahasa Indonesia", "X", 50],
      ["BK-003", "Fisika Terapan XI", "Fisika", "XI", 35],
      ["BK-004", "Kimia Dasar & Praktikum XI", "Kimia", "XI", 40],
      ["BK-005", "Biologi Lingkungan XI", "Biologi", "XI", 30],
      ["BK-006", "Bahasa Inggris: English in Action XII", "Bahasa Inggris", "XII", 40],
      ["BK-007", "Pendidikan Pancasila & Kewarganegaraan XII", "PPKN", "XII", 50],
      ["BK-008", "Informatika & Pemrograman Web X", "Informatika", "X", 35]
    ];
    sheetBuku.getRange(2, 1, sampleBuku.length, 5).setValues(sampleBuku);
  }

  // 3. Sheet Pengaturan
  var sheetPengaturan = ss.getSheetByName("Pengaturan");
  if (!sheetPengaturan) {
    sheetPengaturan = ss.insertSheet("Pengaturan");
    var headersPengaturan = [["Parameter", "Nilai"]];
    sheetPengaturan.getRange(1, 1, 1, 2).setValues(headersPengaturan);
    sheetPengaturan.getRange("A1:B1").setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    sheetPengaturan.setFrozenRows(1);

    var samplePengaturan = [
      ["Nama Perpustakaan", "Perpustakaan Cendekia Mandiri"],
      ["Nama Sekolah", "SMK Negeri 1 Teladan"],
      ["Alamat Sekolah", "Jl. Pendidikan No. 45, Kompleks Pelajar"],
      ["Nama Pustakawan", "Hj. Ratna Sari, S.Pd., M.M."],
      ["NIP Pustakawan", "19820514 200801 2 009"],
      ["Kontak", "perpustakaan@sekolah.sch.id / 0812-3456-7890"],
      ["Batas Hari Pinjam", "14"]
    ];
    sheetPengaturan.getRange(2, 1, samplePengaturan.length, 2).setValues(samplePengaturan);
  }

  // 4. Sheet Pengguna (Petugas/Staf Perpustakaan - Tanpa Login/Password)
  var sheetPengguna = ss.getSheetByName("Pengguna");
  if (!sheetPengguna) {
    sheetPengguna = ss.insertSheet("Pengguna");
    var headersPengguna = [["ID Pengguna", "Nama Pengguna", "Jabatan", "Keterangan"]];
    sheetPengguna.getRange(1, 1, 1, 4).setValues(headersPengguna);
    sheetPengguna.getRange("A1:D1").setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    sheetPengguna.setFrozenRows(1);

    var samplePengguna = [
      ["PG-001", "Hj. Ratna Sari, S.Pd., M.M.", "Kepala Perpustakaan", "Penanggung jawab utama operasional dan inventaris"],
      ["PG-002", "Bambang Sudarsono, S.I.Pust.", "Pustakawan Pelaksana", "Layanan sirkulasi peminjaman dan pengembalian"],
      ["PG-003", "Dewi Anggraini", "Staf Administrasi", "Pendataan buku paket dan administrasi kelas"]
    ];
    sheetPengguna.getRange(2, 1, samplePengguna.length, 4).setValues(samplePengguna);
  }

  // 5. Sheet Kelas (Tingkat, Jurusan, Rombel)
  var sheetKelas = ss.getSheetByName("Kelas");
  if (!sheetKelas) {
    sheetKelas = ss.insertSheet("Kelas");
    var headersKelas = [["ID Kelas", "Tingkat Kelas", "Jurusan", "Rombel"]];
    sheetKelas.getRange(1, 1, 1, 4).setValues(headersKelas);
    sheetKelas.getRange("A1:D1").setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    sheetKelas.setFrozenRows(1);

    var sampleKelas = [
      ["KL-001", "X", "RPL", "1"],
      ["KL-002", "X", "RPL", "2"],
      ["KL-003", "X", "TKJ", "1"],
      ["KL-004", "XI", "MIPA", "1"],
      ["KL-005", "XI", "MIPA", "2"],
      ["KL-006", "XI", "IPS", "1"],
      ["KL-007", "XII", "RPL", "1"],
      ["KL-008", "XII", "TKJ", "1"]
    ];
    sheetKelas.getRange(2, 1, sampleKelas.length, 4).setValues(sampleKelas);
  }

  return { success: true, message: "Seluruh 5 sheet database berhasil diinisialisasi!" };
}

/**
 * Format tanggal YYYY-MM-DD
 */
function formatDate(val) {
  if (!val || val === "-") return "-";
  if (val instanceof Date) {
    var yyyy = val.getFullYear();
    var mm = String(val.getMonth() + 1).padStart(2, '0');
    var dd = String(val.getDate()).padStart(2, '0');
    return yyyy + "-" + mm + "-" + dd;
  }
  return String(val);
}

// =========================================================================
// BAGIAN A: PEMINJAMAN
// =========================================================================

function getAllPeminjaman() {
  try {
    initDatabaseSheets();
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Peminjaman");
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, data: [] };

    var values = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    var list = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (row[0] && String(row[0]).trim() !== "") {
        list.push({
          id: String(row[0]),
          namaSiswa: String(row[1] || ""),
          bukuPaket: String(row[2] || ""),
          kelas: String(row[3] || ""),
          tanggalPinjam: formatDate(row[4]),
          jumlahBuku: parseInt(row[5] || 1, 10),
          tanggalKembali: formatDate(row[6]),
          status: String(row[7] || "Belum Dikembalikan"),
          keterangan: String(row[8] || "-")
        });
      }
    }
    return { success: true, data: list };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function getDashboardData() {
  try {
    var res = getAllPeminjaman();
    if (!res.success) throw new Error(res.message);

    var list = res.data;
    var uniqueStudents = {};
    var totalBukuDipinjam = 0;
    var totalPeminjamanHariIni = 0;
    var totalBukuSudahKembali = 0;
    var totalBukuBelumKembali = 0;

    var todayStr = formatDate(new Date());

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var qty = item.jumlahBuku || 1;
      uniqueStudents[item.namaSiswa.toLowerCase().trim()] = true;
      totalBukuDipinjam += qty;

      if (item.tanggalPinjam === todayStr) {
        totalPeminjamanHariIni += 1;
      }

      if (item.status === "Sudah Dikembalikan") {
        totalBukuSudahKembali += qty;
      } else {
        totalBukuBelumKembali += qty;
      }
    }

    var recent = list.slice().reverse().slice(0, 5);

    return {
      success: true,
      stats: {
        totalSiswaMeminjam: Object.keys(uniqueStudents).length,
        totalBukuDipinjam: totalBukuDipinjam,
        totalPeminjamanHariIni: totalPeminjamanHariIni,
        totalBukuSudahKembali: totalBukuSudahKembali,
        totalBukuBelumKembali: totalBukuBelumKembali
      },
      recentLoans: recent
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function addPeminjaman(form) {
  try {
    if (!form.namaSiswa || !form.bukuPaket || !form.kelas || !form.tanggalPinjam) {
      throw new Error("Semua kolom wajib harus diisi lengkap.");
    }

    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Peminjaman");

    var dateClean = form.tanggalPinjam.replace(/-/g, "");
    var randomSuffix = Math.floor(100 + Math.random() * 900);
    var id = "PJ-" + dateClean + "-" + randomSuffix;

    var rowData = [
      id,
      form.namaSiswa.trim(),
      form.bukuPaket.trim(),
      form.kelas.trim(),
      form.tanggalPinjam,
      parseInt(form.jumlahBuku || 1, 10),
      "-",
      "Belum Dikembalikan",
      form.keterangan ? form.keterangan.trim() : "-"
    ];

    sheet.appendRow(rowData);
    return { success: true, message: "Peminjaman berhasil disimpan!", id: id };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function editPeminjaman(form) {
  try {
    if (!form.id) throw new Error("ID transaksi tidak ditemukan.");

    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Peminjaman");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(form.id)) {
        targetRow = i + 1;
        break;
      }
    }

    if (targetRow === -1) throw new Error("Data peminjaman dengan ID tersebut tidak ditemukan.");

    var updateRow = [
      form.id,
      form.namaSiswa.trim(),
      form.bukuPaket.trim(),
      form.kelas.trim(),
      form.tanggalPinjam,
      parseInt(form.jumlahBuku || 1, 10),
      form.tanggalKembali || "-",
      form.status || "Belum Dikembalikan",
      form.keterangan ? form.keterangan.trim() : "-"
    ];

    sheet.getRange(targetRow, 1, 1, 9).setValues([updateRow]);
    return { success: true, message: "Data peminjaman berhasil diperbarui!" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deletePeminjaman(id) {
  try {
    if (!id) throw new Error("ID tidak boleh kosong.");

    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Peminjaman");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(id)) {
        targetRow = i + 1;
        break;
      }
    }

    if (targetRow === -1) throw new Error("Data tidak ditemukan.");

    sheet.deleteRow(targetRow);
    return { success: true, message: "Data peminjaman berhasil dihapus!" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function prosesPengembalian(id, tanggalKembali) {
  try {
    if (!id) throw new Error("ID tidak valid.");
    var tgl = tanggalKembali || formatDate(new Date());

    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Peminjaman");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(id)) {
        targetRow = i + 1;
        break;
      }
    }

    if (targetRow === -1) throw new Error("Data peminjaman tidak ditemukan.");

    sheet.getRange(targetRow, 7).setValue(tgl);
    sheet.getRange(targetRow, 8).setValue("Sudah Dikembalikan");

    return { success: true, message: "Buku berhasil dikembalikan pada tanggal " + tgl };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function importPeminjamanBatch(rows, mode) {
  try {
    if (!rows || rows.length === 0) throw new Error("Data impor kosong.");
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Peminjaman");

    if (mode === "replace") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 9).clearContent();
      }
    }

    var values = [];
    var todayStr = formatDate(new Date());

    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var id = r.id;
      if (!id || String(id).trim() === "" || id === "-") {
        var dateClean = (r.tanggalPinjam || todayStr).replace(/-/g, "");
        var rand = Math.floor(100 + Math.random() * 900);
        id = "PJ-" + dateClean + "-" + rand;
      }

      values.push([
        id,
        String(r.namaSiswa || "").trim(),
        String(r.bukuPaket || "").trim(),
        String(r.kelas || "X").trim(),
        r.tanggalPinjam || todayStr,
        parseInt(r.jumlahBuku || 1, 10),
        r.tanggalKembali || "-",
        r.status || "Belum Dikembalikan",
        r.keterangan ? String(r.keterangan).trim() : "-"
      ]);
    }

    if (values.length > 0) {
      if (mode === "replace") {
        sheet.getRange(2, 1, values.length, 9).setValues(values);
      } else {
        var startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, values.length, 9).setValues(values);
      }
    }

    return {
      success: true,
      message: "Berhasil mengimpor " + values.length + " data peminjaman!",
      count: values.length
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// =========================================================================
// BAGIAN B: KATALOG BUKU
// =========================================================================

function getDaftarBuku() {
  try {
    initDatabaseSheets();
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Daftar Buku");
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, data: [] };

    var values = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    var list = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (row[0]) {
        list.push({
          idBuku: String(row[0]),
          namaBuku: String(row[1] || ""),
          mataPelajaran: String(row[2] || ""),
          kelas: String(row[3] || ""),
          stokBuku: parseInt(row[4] || 0, 10)
        });
      }
    }
    return { success: true, data: list };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function saveBuku(buku) {
  try {
    if (!buku.namaBuku || !buku.mataPelajaran || !buku.kelas) {
      throw new Error("Lengkapi data buku paket.");
    }
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Daftar Buku");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    if (buku.idBuku) {
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][0]) === String(buku.idBuku)) {
          targetRow = i + 1;
          break;
        }
      }
    }

    if (targetRow > -1) {
      sheet.getRange(targetRow, 1, 1, 5).setValues([[
        buku.idBuku,
        buku.namaBuku.trim(),
        buku.mataPelajaran.trim(),
        buku.kelas.trim(),
        parseInt(buku.stokBuku || 0, 10)
      ]]);
      return { success: true, message: "Data buku berhasil diperbarui!" };
    } else {
      var newId = "BK-" + String(values.length).padStart(3, '0');
      sheet.appendRow([
        newId,
        buku.namaBuku.trim(),
        buku.mataPelajaran.trim(),
        buku.kelas.trim(),
        parseInt(buku.stokBuku || 0, 10)
      ]);
      return { success: true, message: "Buku paket baru berhasil ditambahkan!", idBuku: newId };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteBuku(idBuku) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Daftar Buku");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(idBuku)) {
        targetRow = i + 1;
        break;
      }
    }
    if (targetRow === -1) throw new Error("Buku tidak ditemukan.");

    sheet.deleteRow(targetRow);
    return { success: true, message: "Buku berhasil dihapus dari katalog." };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// =========================================================================
// BAGIAN C: PENGATURAN PENGGUNA (PETUGAS / STAF PERPUSTAKAAN)
// =========================================================================

function getAllPengguna() {
  try {
    initDatabaseSheets();
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Pengguna");
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, data: [] };

    var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    var list = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (row[0] && String(row[0]).trim() !== "") {
        list.push({
          id: String(row[0]),
          namaPengguna: String(row[1] || ""),
          jabatan: String(row[2] || ""),
          keterangan: String(row[3] || "-")
        });
      }
    }
    return { success: true, data: list };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function savePengguna(pengguna) {
  try {
    if (!pengguna.namaPengguna || !pengguna.jabatan) {
      throw new Error("Nama Pengguna dan Jabatan wajib diisi.");
    }
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Pengguna");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    if (pengguna.id) {
      for (var i = 1; i < values.length; i++) {
        if (String(values[i][0]) === String(pengguna.id)) {
          targetRow = i + 1;
          break;
        }
      }
    }

    if (targetRow > -1) {
      sheet.getRange(targetRow, 1, 1, 4).setValues([[
        pengguna.id,
        pengguna.namaPengguna.trim(),
        pengguna.jabatan.trim(),
        pengguna.keterangan ? pengguna.keterangan.trim() : "-"
      ]]);
      return { success: true, message: "Data pengguna perpustakaan berhasil diperbarui!" };
    } else {
      var rand = Math.floor(100 + Math.random() * 900);
      var newId = "PG-" + rand;
      sheet.appendRow([
        newId,
        pengguna.namaPengguna.trim(),
        pengguna.jabatan.trim(),
        pengguna.keterangan ? pengguna.keterangan.trim() : "-"
      ]);
      return { success: true, message: "Pengguna perpustakaan baru berhasil ditambahkan!", id: newId };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deletePengguna(id) {
  try {
    if (!id) throw new Error("ID Pengguna tidak boleh kosong.");
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Pengguna");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(id)) {
        targetRow = i + 1;
        break;
      }
    }
    if (targetRow === -1) throw new Error("Data pengguna tidak ditemukan.");

    sheet.deleteRow(targetRow);
    return { success: true, message: "Data pengguna perpustakaan berhasil dihapus." };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function importPenggunaBatch(rows, mode) {
  try {
    if (!rows || rows.length === 0) throw new Error("Data impor pengguna kosong.");
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Pengguna");

    if (mode === "replace") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 4).clearContent();
      }
    }

    var values = [];
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var id = r.id;
      if (!id || String(id).trim() === "") {
        id = "PG-" + Math.floor(100 + Math.random() * 900);
      }
      values.push([
        id,
        String(r.namaPengguna || "").trim(),
        String(r.jabatan || "").trim(),
        r.keterangan ? String(r.keterangan).trim() : "-"
      ]);
    }

    if (values.length > 0) {
      if (mode === "replace") {
        sheet.getRange(2, 1, values.length, 4).setValues(values);
      } else {
        var startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, values.length, 4).setValues(values);
      }
    }

    return {
      success: true,
      message: "Berhasil mengimpor " + values.length + " data pengguna perpustakaan!",
      count: values.length
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// =========================================================================
// BAGIAN D: PENGATURAN KELAS (TINGKAT, JURUSAN, ROMBEL)
// =========================================================================

function getAllKelas() {
  try {
    initDatabaseSheets();
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Kelas");
    var lastRow = sheet.getLastRow();
    if (lastRow <= 1) return { success: true, data: [] };

    var values = sheet.getRange(2, 1, lastRow - 1, 4).getValues();
    var list = [];
    for (var i = 0; i < values.length; i++) {
      var row = values[i];
      if (row[0] && String(row[0]).trim() !== "") {
        list.push({
          id: String(row[0]),
          tingkatKelas: String(row[1] || "").trim().toUpperCase(),
          jurusan: String(row[2] || "").trim().toUpperCase(),
          rombel: String(row[3] || "").trim()
        });
      }
    }
    return { success: true, data: list };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function saveKelas(kelas) {
  try {
    if (!kelas.tingkatKelas || !kelas.jurusan || !kelas.rombel) {
      throw new Error("Tingkat Kelas, Jurusan, dan Rombel wajib diisi.");
    }
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Kelas");
    var values = sheet.getDataRange().getValues();

    var cleanTingkat = String(kelas.tingkatKelas).trim().toUpperCase();
    var cleanJurusan = String(kelas.jurusan).trim().toUpperCase();
    var cleanRombel = String(kelas.rombel).trim();

    // Cek duplikasi kombinasi tingkat + jurusan + rombel
    var targetRow = -1;
    for (var i = 1; i < values.length; i++) {
      var rowId = String(values[i][0]);
      var rowTingkat = String(values[i][1]).trim().toUpperCase();
      var rowJurusan = String(values[i][2]).trim().toUpperCase();
      var rowRombel = String(values[i][3]).trim();

      if (rowTingkat === cleanTingkat && rowJurusan === cleanJurusan && rowRombel === cleanRombel) {
        if (!kelas.id || kelas.id !== rowId) {
          throw new Error("Kelas " + cleanTingkat + " " + cleanJurusan + " " + cleanRombel + " sudah ada. Duplikasi dicegah!");
        }
      }

      if (kelas.id && rowId === String(kelas.id)) {
        targetRow = i + 1;
      }
    }

    if (targetRow > -1) {
      sheet.getRange(targetRow, 1, 1, 4).setValues([[
        kelas.id,
        cleanTingkat,
        cleanJurusan,
        cleanRombel
      ]]);
      return { success: true, message: "Data kelas berhasil diperbarui!" };
    } else {
      var rand = Math.floor(100 + Math.random() * 900);
      var newId = "KL-" + rand;
      sheet.appendRow([
        newId,
        cleanTingkat,
        cleanJurusan,
        cleanRombel
      ]);
      return { success: true, message: "Kelas baru berhasil ditambahkan!", id: newId };
    }
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteKelas(id) {
  try {
    if (!id) throw new Error("ID Kelas tidak boleh kosong.");
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Kelas");
    var values = sheet.getDataRange().getValues();

    var targetRow = -1;
    for (var i = 1; i < values.length; i++) {
      if (String(values[i][0]) === String(id)) {
        targetRow = i + 1;
        break;
      }
    }
    if (targetRow === -1) throw new Error("Data kelas tidak ditemukan.");

    sheet.deleteRow(targetRow);
    return { success: true, message: "Data kelas berhasil dihapus." };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function importKelasBatch(rows, mode) {
  try {
    if (!rows || rows.length === 0) throw new Error("Data impor kelas kosong.");
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Kelas");

    if (mode === "replace") {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, 4).clearContent();
      }
    }

    // Ambil data yang sudah ada untuk validasi duplikasi jika mode append
    var existingKeys = {};
    if (mode === "append") {
      var currentVals = sheet.getDataRange().getValues();
      for (var k = 1; k < currentVals.length; k++) {
        var key = (String(currentVals[k][1]).trim().toUpperCase() + "_" +
                    String(currentVals[k][2]).trim().toUpperCase() + "_" +
                    String(currentVals[k][3]).trim());
        existingKeys[key] = true;
      }
    }

    var values = [];
    var skipped = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var tk = String(r.tingkatKelas || "").trim().toUpperCase();
      var jur = String(r.jurusan || "").trim().toUpperCase();
      var rom = String(r.rombel || "").trim();

      if (!tk || !jur || !rom) {
        skipped++;
        continue;
      }

      var key = tk + "_" + jur + "_" + rom;
      if (existingKeys[key]) {
        skipped++;
        continue;
      }

      existingKeys[key] = true;
      var id = r.id;
      if (!id || String(id).trim() === "") {
        id = "KL-" + Math.floor(100 + Math.random() * 900);
      }
      values.push([id, tk, jur, rom]);
    }

    if (values.length > 0) {
      if (mode === "replace") {
        sheet.getRange(2, 1, values.length, 4).setValues(values);
      } else {
        var startRow = sheet.getLastRow() + 1;
        sheet.getRange(startRow, 1, values.length, 4).setValues(values);
      }
    }

    return {
      success: true,
      message: "Berhasil mengimpor " + values.length + " kelas!" + (skipped > 0 ? " (" + skipped + " dilewati karena duplikasi/tidak lengkap)" : ""),
      count: values.length,
      skipped: skipped
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// =========================================================================
// BAGIAN E: PENGATURAN APLIKASI & IDENTITAS SEKOLAH
// =========================================================================

function getPengaturan() {
  try {
    initDatabaseSheets();
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Pengaturan");
    var values = sheet.getDataRange().getValues();

    var config = {};
    for (var i = 1; i < values.length; i++) {
      var param = String(values[i][0] || "").trim();
      var val = String(values[i][1] || "").trim();
      if (param) config[param] = val;
    }
    return { success: true, data: config };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function savePengaturan(config) {
  try {
    var ss = getSpreadsheet();
    var sheet = ss.getSheetByName("Pengaturan");
    sheet.clearContents();

    var rows = [["Parameter", "Nilai"]];
    for (var key in config) {
      if (config.hasOwnProperty(key)) {
        rows.push([key, config[key]]);
      }
    }
    sheet.getRange(1, 1, rows.length, 2).setValues(rows);
    sheet.getRange("A1:B1").setBackground("#1a73e8").setFontColor("#ffffff").setFontWeight("bold");
    return { success: true, message: "Pengaturan berhasil disimpan!" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
`;

export const GAS_INDEX_HTML = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sistem Perpustakaan Sekolah - Manajemen Buku Paket</title>
  <!-- Bootstrap 5 CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Bootstrap Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
  <!-- Google Fonts: Inter -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <!-- SweetAlert2 -->
  <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
  <!-- SheetJS (XLSX & CSV) -->
  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
  
  <style>
    :root {
      --primary-color: #1a73e8;
      --primary-hover: #1557b0;
      --secondary-color: #e8f0fe;
      --text-dark: #202124;
      --text-muted: #5f6368;
      --border-color: #dadce0;
      --sidebar-width: 260px;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f8f9fa;
      color: var(--text-dark);
      overflow-x: hidden;
    }
    /* Sidebar */
    #sidebar-wrapper {
      min-height: 100vh;
      width: var(--sidebar-width);
      background: #ffffff;
      border-right: 1px solid var(--border-color);
      transition: all 0.3s ease;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
    }
    #sidebar-wrapper .sidebar-heading {
      padding: 1.25rem 1.5rem;
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--primary-color);
      border-bottom: 1px solid #f1f3f4;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .list-group-item {
      border: none;
      padding: 0.8rem 1.4rem;
      font-weight: 500;
      font-size: 0.9rem;
      color: #3c4043;
      border-radius: 0 50px 50px 0;
      margin-right: 12px;
      margin-top: 3px;
      display: flex;
      align-items: center;
      gap: 12px;
      transition: all 0.2s;
    }
    .list-group-item:hover {
      background-color: #f1f3f4;
      color: var(--primary-color);
    }
    .list-group-item.active {
      background-color: var(--secondary-color);
      color: var(--primary-color);
      font-weight: 600;
      border: none;
    }
    /* Main Content */
    #page-content-wrapper {
      margin-left: var(--sidebar-width);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }
    .top-navbar {
      background: #ffffff;
      border-bottom: 1px solid var(--border-color);
      padding: 0.85rem 1.75rem;
    }
    .stat-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      border: 1px solid #e8eaed;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    .badge-returned {
      background-color: #e6f4ea;
      color: #137333;
      font-weight: 600;
      border: 1px solid #ceead6;
      padding: 0.4em 0.8em;
      border-radius: 20px;
    }
    .badge-borrowed {
      background-color: #fef7e0;
      color: #b06000;
      font-weight: 600;
      border: 1px solid #feefc3;
      padding: 0.4em 0.8em;
      border-radius: 20px;
    }
    .table-card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e8eaed;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .table thead th {
      background-color: #f8f9fa;
      color: #5f6368;
      font-weight: 600;
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #dadce0;
      padding: 0.9rem 1rem;
    }
    .table tbody td {
      padding: 0.9rem 1rem;
      vertical-align: middle;
      font-size: 0.9rem;
    }
    .btn-primary {
      background-color: var(--primary-color);
      border-color: var(--primary-color);
    }
    .btn-primary:hover {
      background-color: var(--primary-hover);
      border-color: var(--primary-hover);
    }
    @media (max-width: 991.98px) {
      #sidebar-wrapper {
        margin-left: -var(--sidebar-width);
      }
      #sidebar-wrapper.toggled {
        margin-left: 0;
      }
      #page-content-wrapper {
        margin-left: 0;
      }
    }
  </style>
</head>
<body>

<div class="d-flex" id="wrapper">
  <!-- SIDEBAR -->
  <div id="sidebar-wrapper">
    <div class="sidebar-heading">
      <i class="bi bi-book-half text-primary fs-3"></i>
      <div>
        <div class="fw-bold fs-6 lh-1">Perpustakaan</div>
        <small class="text-muted" style="font-size: 11px;">Buku Paket Siswa</small>
      </div>
    </div>
    <div class="list-group list-group-flush my-3">
      <a href="#" class="list-group-item list-group-item-action active" onclick="switchTab('dashboard')">
        <i class="bi bi-grid-1x2-fill"></i> Dashboard
      </a>
      <a href="#" class="list-group-item list-group-item-action" onclick="switchTab('formPinjam')">
        <i class="bi bi-plus-circle-fill"></i> Form Peminjaman
      </a>
      <a href="#" class="list-group-item list-group-item-action" onclick="switchTab('dataPinjam')">
        <i class="bi bi-journal-bookmark-fill"></i> Data Peminjaman
      </a>
      <a href="#" class="list-group-item list-group-item-action" onclick="switchTab('kembaliBuku')">
        <i class="bi bi-arrow-return-left"></i> Pengembalian Buku
      </a>
      <a href="#" class="list-group-item list-group-item-action" onclick="switchTab('daftarBuku')">
        <i class="bi bi-collection-fill"></i> Katalog Buku Paket
      </a>
      <a href="#" class="list-group-item list-group-item-action" onclick="switchTab('pengguna')">
        <i class="bi bi-people-fill"></i> Pengguna Perpustakaan
      </a>
      <a href="#" class="list-group-item list-group-item-action" onclick="switchTab('kelas')">
        <i class="bi bi-mortarboard-fill"></i> Pengaturan Kelas
      </a>
      <a href="#" class="list-group-item list-group-item-action" onclick="switchTab('pengaturan')">
        <i class="bi bi-gear-fill"></i> Pengaturan
      </a>
    </div>
  </div>

  <!-- PAGE CONTENT -->
  <div id="page-content-wrapper">
    <!-- TOP NAV -->
    <nav class="navbar top-navbar">
      <div class="container-fluid px-0">
        <button class="btn btn-outline-secondary d-lg-none" id="sidebarToggle">
          <i class="bi bi-list"></i>
        </button>
        <div class="d-none d-sm-block">
          <span class="fw-bold text-dark fs-5" id="headerTitle">Dashboard Perpustakaan</span>
          <span class="badge bg-primary-subtle text-primary ms-2 rounded-pill px-3 py-1">Google Sheets DB</span>
        </div>
        <div class="ms-auto d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="refreshCurrentTab()">
            <i class="bi bi-arrow-clockwise"></i> Refresh Data
          </button>
        </div>
      </div>
    </nav>

    <!-- MAIN BODY -->
    <div class="container-fluid p-4">
      
      <!-- TAB 1: DASHBOARD -->
      <div id="tab-dashboard" class="tab-pane-content">
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-6 col-xl-2">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-medium">Siswa Pinjam</div>
                  <h3 class="fw-bold my-1 text-primary" id="statSiswa">-</h3>
                  <small class="text-muted">Total siswa aktif</small>
                </div>
                <div class="stat-icon bg-primary-subtle text-primary">
                  <i class="bi bi-people-fill"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-xl-2">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-medium">Buku Dipinjam</div>
                  <h3 class="fw-bold my-1 text-dark" id="statBukuDipinjam">-</h3>
                  <small class="text-muted">Akumulasi eksemplar</small>
                </div>
                <div class="stat-icon bg-info-subtle text-info">
                  <i class="bi bi-book-fill"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-medium">Pinjam Hari Ini</div>
                  <h3 class="fw-bold my-1 text-primary" id="statHariIni">-</h3>
                  <small class="text-muted">Transaksi baru</small>
                </div>
                <div class="stat-icon bg-warning-subtle text-warning">
                  <i class="bi bi-calendar2-check-fill"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-xl-2">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-medium">Dikembalikan</div>
                  <h3 class="fw-bold my-1 text-success" id="statSudahKembali">-</h3>
                  <small class="text-muted">Telah selesai</small>
                </div>
                <div class="stat-icon bg-success-subtle text-success">
                  <i class="bi bi-check-circle-fill"></i>
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-sm-6 col-xl-3">
            <div class="stat-card">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <div class="text-muted small fw-medium">Belum Dikembalikan</div>
                  <h3 class="fw-bold my-1 text-danger" id="statBelumKembali">-</h3>
                  <small class="text-danger fw-medium">Perlu pengembalian</small>
                </div>
                <div class="stat-icon bg-danger-subtle text-danger">
                  <i class="bi bi-exclamation-octagon-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="table-card">
          <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0 text-dark"><i class="bi bi-clock-history me-2 text-primary"></i>5 Peminjaman Terbaru</h6>
            <button class="btn btn-sm btn-link text-decoration-none" onclick="switchTab('dataPinjam')">Lihat Semua Data &rarr;</button>
          </div>
          <div class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Siswa</th>
                  <th>Buku Paket</th>
                  <th>Kelas</th>
                  <th>Tgl Pinjam</th>
                  <th>Jumlah</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody id="tbodyRecentLoans">
                <tr><td colspan="8" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 2: FORM PEMINJAMAN -->
      <div id="tab-formPinjam" class="tab-pane-content d-none">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-header bg-white border-bottom p-4">
                <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-journal-plus me-2"></i>Formulir Peminjaman Buku Paket</h5>
                <p class="text-muted small mb-0">Isi data peminjaman buku paket untuk siswa dengan teliti.</p>
              </div>
              <div class="card-body p-4">
                <form id="formInputPinjam" onsubmit="handleSimpanPeminjaman(event)">
                  <input type="hidden" id="editPinjamId" value="">
                  
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Nama Siswa <span class="text-danger">*</span></label>
                      <input type="text" class="form-control" id="inputNamaSiswa" required placeholder="Contoh: Muhammad Farhan">
                    </div>
                    
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Kelas <span class="text-danger">*</span></label>
                      <select class="form-select" id="selectKelasPinjam" required>
                        <option value="">-- Pilih Kelas --</option>
                      </select>
                      <small class="text-muted">Data kelas diambil dari Pengaturan Kelas.</small>
                    </div>

                    <div class="col-12">
                      <label class="form-label fw-semibold">Buku Paket yang Dipinjam <span class="text-danger">*</span></label>
                      <select class="form-select" id="selectBukuPaket" required>
                        <option value="">-- Pilih Buku Paket --</option>
                      </select>
                      <small class="text-muted">Pilih dari katalog atau kelola buku di menu Katalog Buku Paket.</small>
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Tanggal Peminjaman <span class="text-danger">*</span></label>
                      <input type="date" class="form-control" id="inputTanggalPinjam" required>
                    </div>

                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Jumlah Buku <span class="text-danger">*</span></label>
                      <input type="number" class="form-control" id="inputJumlahBuku" min="1" max="50" value="1" required>
                    </div>

                    <div class="col-12">
                      <label class="form-label fw-semibold">Keterangan Tambahan</label>
                      <textarea class="form-control" id="inputKeterangan" rows="3" placeholder="Contoh: Buku paket pegangan semester genap / kondisi baik"></textarea>
                    </div>
                  </div>

                  <hr class="my-4">

                  <div class="d-flex gap-2 justify-content-end">
                    <button type="button" class="btn btn-outline-secondary px-4 rounded-pill" onclick="resetFormPinjam()">
                      <i class="bi bi-arrow-counterclockwise"></i> Reset Form
                    </button>
                    <button type="submit" class="btn btn-primary px-4 rounded-pill" id="btnSubmitPinjam">
                      <i class="bi bi-check-lg"></i> Simpan Peminjaman
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: DATA PEMINJAMAN -->
      <div id="tab-dataPinjam" class="tab-pane-content d-none">
        <div class="table-card mb-4">
          <div class="p-3 border-bottom bg-light-subtle">
            <div class="row g-2 align-items-center">
              <div class="col-12 col-md-4">
                <div class="input-group">
                  <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" id="searchKeyword" placeholder="Cari nama siswa / ID..." oninput="filterTableData()">
                </div>
              </div>
              <div class="col-6 col-md-2">
                <select class="form-select" id="filterKelas" onchange="filterTableData()">
                  <option value="">Semua Kelas</option>
                </select>
              </div>
              <div class="col-6 col-md-3">
                <select class="form-select" id="filterBuku" onchange="filterTableData()">
                  <option value="">Semua Judul Buku</option>
                </select>
              </div>
              <div class="col-12 col-md-3">
                <select class="form-select" id="filterStatus" onchange="filterTableData()">
                  <option value="">Semua Status</option>
                  <option value="Belum Dikembalikan">Belum Dikembalikan</option>
                  <option value="Sudah Dikembalikan">Sudah Dikembalikan</option>
                </select>
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style="width: 50px;">No</th>
                  <th>ID Pinjam</th>
                  <th>Nama Siswa</th>
                  <th>Buku Paket</th>
                  <th>Kelas</th>
                  <th>Tgl Pinjam</th>
                  <th>Jml</th>
                  <th>Tgl Kembali</th>
                  <th>Status</th>
                  <th style="width: 140px;">Aksi</th>
                </tr>
              </thead>
              <tbody id="tbodyAllLoans">
                <tr><td colspan="10" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Memuat data...</td></tr>
              </tbody>
            </table>
          </div>
          <div class="p-3 border-top bg-white d-flex flex-wrap justify-content-between align-items-center gap-2">
            <small class="text-muted" id="totalRecordsInfo">Menampilkan 0 data</small>
            <div class="d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="openModalImport('pinjam')">
                <i class="bi bi-upload me-1"></i> Import Excel / CSV
              </button>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-success rounded-pill px-3 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  <i class="bi bi-download me-1"></i> Export Data
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                  <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportPinjam('filtered', 'xlsx')"><i class="bi bi-file-earmark-excel text-success me-2"></i>Ekspor Terfilter (.xlsx)</a></li>
                  <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportPinjam('all', 'xlsx')"><i class="bi bi-file-earmark-spreadsheet text-success me-2"></i>Ekspor Seluruh Data (.xlsx)</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportPinjam('filtered', 'csv')"><i class="bi bi-file-earmark-text text-primary me-2"></i>Ekspor Terfilter (.csv)</a></li>
                  <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportPinjam('all', 'csv')"><i class="bi bi-file-earmark-text text-primary me-2"></i>Ekspor Seluruh Data (.csv)</a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item small" href="javascript:void(0)" onclick="downloadTemplatePinjam()"><i class="bi bi-cloud-arrow-down text-warning me-2"></i>Unduh Template Import (.xlsx)</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: PENGEMBALIAN BUKU -->
      <div id="tab-kembaliBuku" class="tab-pane-content d-none">
        <div class="row g-4">
          <div class="col-12 col-lg-5">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-header bg-white p-4 border-bottom">
                <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-arrow-return-left me-2"></i>Proses Pengembalian</h5>
                <p class="text-muted small mb-0">Cari transaksi yang masih berstatus 'Belum Dikembalikan' dan kembalikan.</p>
              </div>
              <div class="card-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-semibold">Pilih Peminjaman Belum Kembali</label>
                  <select class="form-select" id="selectPinjamKembali" onchange="handleSelectPinjamKembali()">
                    <option value="">-- Pilih Transaksi --</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label fw-semibold">Tanggal Pengembalian</label>
                  <input type="date" class="form-control" id="inputTanggalKembaliProses">
                </div>
                <div class="p-3 bg-light rounded-3 mb-3 d-none" id="detailKembaliBox">
                  <div class="fw-bold text-dark" id="kembaliNamaSiswa">-</div>
                  <div class="small text-muted" id="kembaliBuku">-</div>
                  <div class="small text-muted" id="kembaliKelas">-</div>
                </div>
                <button class="btn btn-success w-100 rounded-pill py-2 fw-semibold" id="btnKonfirmasiKembali" onclick="submitPengembalian()" disabled>
                  <i class="bi bi-check-circle-fill me-1"></i> Konfirmasi Pengembalian Buku
                </button>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-7">
            <div class="table-card">
              <div class="p-3 border-bottom">
                <h6 class="fw-bold mb-0 text-success"><i class="bi bi-clock-history me-2"></i>Riwayat Buku yang Sudah Dikembalikan</h6>
              </div>
              <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nama Siswa</th>
                      <th>Buku Paket</th>
                      <th>Kelas</th>
                      <th>Tgl Kembali</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody id="tbodyRiwayatKembali">
                    <tr><td colspan="5" class="text-center py-4 text-muted">Belum ada riwayat.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: KATALOG BUKU PAKET -->
      <div id="tab-daftarBuku" class="tab-pane-content d-none">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-0">Katalog Buku Paket Pelajaran</h5>
            <small class="text-muted">Kelola koleksi buku paket dan pantau stok perpustakaan.</small>
          </div>
          <button class="btn btn-primary rounded-pill px-3" onclick="openModalTambahBuku()">
            <i class="bi bi-plus-lg"></i> Tambah Buku Baru
          </button>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>ID Buku</th>
                  <th>Nama Buku Paket</th>
                  <th>Mata Pelajaran</th>
                  <th>Kelas</th>
                  <th>Total Stok</th>
                  <th style="width: 120px;">Aksi</th>
                </tr>
              </thead>
              <tbody id="tbodyDaftarBuku">
                <tr><td colspan="6" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Memuat daftar buku...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 6: PENGGUNA PERPUSTAKAAN (PETUGAS / STAF) -->
      <div id="tab-pengguna" class="tab-pane-content d-none">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-0">Pengguna Perpustakaan (Staf & Petugas)</h5>
            <small class="text-muted">Kelola nama pengguna, jabatan, dan keterangan staf tanpa perlu login atau password.</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="openModalImport('pengguna')">
              <i class="bi bi-upload me-1"></i> Import Excel / CSV
            </button>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-success rounded-pill px-3 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-download me-1"></i> Export Data
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportPengguna('xlsx')"><i class="bi bi-file-earmark-excel text-success me-2"></i>Ekspor Excel (.xlsx)</a></li>
                <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportPengguna('csv')"><i class="bi bi-file-earmark-text text-primary me-2"></i>Ekspor CSV (.csv)</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item small" href="javascript:void(0)" onclick="downloadTemplatePengguna()"><i class="bi bi-cloud-arrow-down text-warning me-2"></i>Unduh Template Import (.xlsx)</a></li>
              </ul>
            </div>
            <button class="btn btn-primary rounded-pill px-3" onclick="openModalTambahPengguna()">
              <i class="bi bi-person-plus-fill me-1"></i> Tambah Pengguna
            </button>
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style="width: 60px;">No</th>
                  <th>ID</th>
                  <th>Nama Pengguna</th>
                  <th>Jabatan</th>
                  <th>Keterangan</th>
                  <th style="width: 120px;">Aksi</th>
                </tr>
              </thead>
              <tbody id="tbodyPengguna">
                <tr><td colspan="6" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Memuat pengguna...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 7: PENGATURAN KELAS -->
      <div id="tab-kelas" class="tab-pane-content d-none">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h5 class="fw-bold text-dark mb-0">Pengaturan Kelas Sekolah</h5>
            <small class="text-muted">Kelola daftar tingkat kelas, jurusan, dan rombel. Data kelas otomatis muncul pada formulir peminjaman.</small>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-sm btn-outline-primary rounded-pill px-3" onclick="openModalImport('kelas')">
              <i class="bi bi-upload me-1"></i> Import Excel / CSV
            </button>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-success rounded-pill px-3 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="bi bi-download me-1"></i> Export Data
              </button>
              <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0 rounded-3">
                <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportKelas('xlsx')"><i class="bi bi-file-earmark-excel text-success me-2"></i>Ekspor Excel (.xlsx)</a></li>
                <li><a class="dropdown-item small" href="javascript:void(0)" onclick="exportKelas('csv')"><i class="bi bi-file-earmark-text text-primary me-2"></i>Ekspor CSV (.csv)</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item small" href="javascript:void(0)" onclick="downloadTemplateKelas()"><i class="bi bi-cloud-arrow-down text-warning me-2"></i>Unduh Template Import (.xlsx)</a></li>
              </ul>
            </div>
            <button class="btn btn-primary rounded-pill px-3" onclick="openModalTambahKelas()">
              <i class="bi bi-plus-lg me-1"></i> Tambah Kelas
            </button>
          </div>
        </div>

        <div class="table-card">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th style="width: 60px;">No</th>
                  <th>ID Kelas</th>
                  <th>Tingkat</th>
                  <th>Jurusan</th>
                  <th>Rombel</th>
                  <th>Format Lengkap</th>
                  <th style="width: 120px;">Aksi</th>
                </tr>
              </thead>
              <tbody id="tbodyKelas">
                <tr><td colspan="7" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Memuat kelas...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 8: PENGATURAN -->
      <div id="tab-pengaturan" class="tab-pane-content d-none">
        <div class="row justify-content-center">
          <div class="col-12 col-lg-8">
            <div class="card border-0 shadow-sm rounded-4">
              <div class="card-header bg-white p-4 border-bottom">
                <h5 class="fw-bold mb-1 text-primary"><i class="bi bi-sliders me-2"></i>Pengaturan & Identitas Perpustakaan</h5>
                <p class="text-muted small mb-0">Informasi ini akan tercatat pada Sheet 'Pengaturan' di Google Spreadsheet.</p>
              </div>
              <div class="card-body p-4">
                <form id="formPengaturan" onsubmit="handleSimpanPengaturan(event)">
                  <div class="row g-3">
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Nama Perpustakaan</label>
                      <input type="text" class="form-control" id="cfgNamaPerpus" required>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Nama Sekolah</label>
                      <input type="text" class="form-control" id="cfgNamaSekolah" required>
                    </div>
                    <div class="col-12">
                      <label class="form-label fw-semibold">Alamat Sekolah</label>
                      <input type="text" class="form-control" id="cfgAlamat" required>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Nama Kepala Pustakawan</label>
                      <input type="text" class="form-control" id="cfgPustakawan" required>
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">NIP Pustakawan</label>
                      <input type="text" class="form-control" id="cfgNIP">
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Kontak / Email</label>
                      <input type="text" class="form-control" id="cfgKontak">
                    </div>
                    <div class="col-12 col-md-6">
                      <label class="form-label fw-semibold">Batas Hari Peminjaman (Hari)</label>
                      <input type="number" class="form-control" id="cfgBatasHari" value="14">
                    </div>
                  </div>
                  <hr class="my-4">
                  <div class="text-end">
                    <button type="submit" class="btn btn-primary px-4 rounded-pill">
                      <i class="bi bi-save"></i> Simpan Pengaturan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</div>

<!-- MODAL TAMBAH/EDIT BUKU -->
<div class="modal fade" id="modalBuku" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0">
      <div class="modal-header border-bottom">
        <h5 class="modal-title fw-bold text-primary" id="modalBukuTitle">Tambah Buku Paket</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form id="formBukuMaster" onsubmit="handleSimpanBuku(event)">
        <div class="modal-body">
          <input type="hidden" id="masterBukuId">
          <div class="mb-3">
            <label class="form-label fw-semibold">Nama Buku Paket <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="masterBukuNama" required placeholder="Contoh: Matematika Wajib X">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Mata Pelajaran <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="masterBukuMapel" required placeholder="Contoh: Matematika">
          </div>
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="form-label fw-semibold">Tingkat Kelas <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="masterBukuKelas" required placeholder="Contoh: X, XI, atau XII">
            </div>
            <div class="col-6">
              <label class="form-label fw-semibold">Stok Buku <span class="text-danger">*</span></label>
              <input type="number" class="form-control" id="masterBukuStok" min="0" value="40" required>
            </div>
          </div>
        </div>
        <div class="modal-footer border-top">
          <button type="button" class="btn btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-primary rounded-pill px-4">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- MODAL TAMBAH/EDIT PENGGUNA -->
<div class="modal fade" id="modalPengguna" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0">
      <div class="modal-header border-bottom">
        <h5 class="modal-title fw-bold text-primary" id="modalPenggunaTitle">Tambah Pengguna Perpustakaan</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form id="formPenggunaMaster" onsubmit="handleSimpanPengguna(event)">
        <div class="modal-body">
          <input type="hidden" id="masterPenggunaId">
          <div class="mb-3">
            <label class="form-label fw-semibold">Nama Pengguna / Petugas <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="masterPenggunaNama" required placeholder="Contoh: Hj. Ratna Sari, S.Pd.">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Jabatan <span class="text-danger">*</span></label>
            <input type="text" class="form-control" id="masterPenggunaJabatan" required placeholder="Contoh: Pustakawan / Staf Administrasi">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Keterangan</label>
            <textarea class="form-control" id="masterPenggunaKet" rows="3" placeholder="Contoh: Bertugas di bagian sirkulasi peminjaman"></textarea>
          </div>
        </div>
        <div class="modal-footer border-top">
          <button type="button" class="btn btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-primary rounded-pill px-4">Simpan</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- MODAL TAMBAH/EDIT KELAS -->
<div class="modal fade" id="modalKelas" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content rounded-4 border-0">
      <div class="modal-header border-bottom">
        <h5 class="modal-title fw-bold text-primary" id="modalKelasTitle">Tambah Kelas Baru</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <form id="formKelasMaster" onsubmit="handleSimpanKelas(event)">
        <div class="modal-body">
          <input type="hidden" id="masterKelasId">
          <div class="row g-2 mb-3">
            <div class="col-4">
              <label class="form-label fw-semibold">Tingkat <span class="text-danger">*</span></label>
              <select class="form-select" id="masterKelasTingkat" required>
                <option value="X">X</option>
                <option value="XI">XI</option>
                <option value="XII">XII</option>
              </select>
            </div>
            <div class="col-5">
              <label class="form-label fw-semibold">Jurusan <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="masterKelasJurusan" required placeholder="Contoh: RPL / MIPA">
            </div>
            <div class="col-3">
              <label class="form-label fw-semibold">Rombel <span class="text-danger">*</span></label>
              <input type="text" class="form-control" id="masterKelasRombel" required placeholder="1">
            </div>
          </div>
          <div class="p-2 bg-light rounded text-muted small">
            Kombinasi Tingkat, Jurusan, dan Rombel harus unik (misal: <strong>X RPL 1</strong>). Duplikasi kelas akan dicegah.
          </div>
        </div>
        <div class="modal-footer border-top">
          <button type="button" class="btn btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Batal</button>
          <button type="submit" class="btn btn-primary rounded-pill px-4">Simpan Kelas</button>
        </div>
      </form>
    </div>
  </div>
</div>

<!-- MODAL UNIVERSAL IMPORT (EXCEL .xlsx & CSV .csv) -->
<div class="modal fade" id="modalUniversalImport" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered modal-lg">
    <div class="modal-content rounded-4 border-0">
      <div class="modal-header border-bottom">
        <h5 class="modal-title fw-bold text-primary" id="universalImportTitle"><i class="bi bi-file-earmark-arrow-up me-2"></i>Impor Data dari Excel / CSV</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-4">
        <div class="p-3 bg-light rounded-3 mb-3 border">
          <div class="d-flex justify-content-between align-items-center mb-1">
            <strong class="text-dark small" id="universalImportFormatGuide">Format Kolom:</strong>
            <button class="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill small" id="btnDownloadTemplateImport">
              <i class="bi bi-download"></i> Unduh Template Excel
            </button>
          </div>
          <p class="text-muted small mb-0" id="universalImportColumnsDesc">-</p>
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Pilih File (.xlsx atau .csv):</label>
          <input type="file" id="universalInputFile" class="form-control" accept=".xlsx,.xls,.csv" onchange="handleUniversalFileSelected(event)">
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold">Metode Impor:</label>
          <div class="d-flex gap-3">
            <div class="form-check">
              <input class="form-check-input" type="radio" name="universalImportMode" id="importModeAppend" value="append" checked>
              <label class="form-check-label small" for="importModeAppend">
                <strong>Tambahkan (Append)</strong> - Tambah ke data yang ada
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="radio" name="universalImportMode" id="importModeReplace" value="replace">
              <label class="form-check-label small text-danger" for="importModeReplace">
                <strong>Timpa (Replace)</strong> - Gantikan seluruh data lama
              </label>
            </div>
          </div>
        </div>

        <!-- Preview Box -->
        <div id="universalImportPreviewBox" class="d-none">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-bold small text-dark" id="universalImportCountInfo">0 baris siap diimpor</span>
            <span class="badge bg-success-subtle text-success">Pratinjau Data</span>
          </div>
          <div class="table-responsive border rounded-3" style="max-height: 220px;">
            <table class="table table-sm table-hover mb-0 text-nowrap" style="font-size: 12px;">
              <thead class="table-light sticky-top" id="universalImportTheadPreview"></thead>
              <tbody id="universalImportTbodyPreview"></tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer border-top">
        <button type="button" class="btn btn-secondary rounded-pill px-3" data-bs-dismiss="modal">Batal</button>
        <button type="submit" class="btn btn-primary rounded-pill px-4" id="btnUniversalSubmitImport" onclick="submitUniversalImport()" disabled>
          <i class="bi bi-check-lg me-1"></i> Impor Data Sekarang
        </button>
      </div>
    </div>
  </div>
</div>

<script>
  // STATE MANAGEMENT
  let allLoans = [];
  let allBooks = [];
  let allPengguna = [];
  let allKelas = [];
  let currentTab = 'dashboard';
  let activeImportCategory = 'pinjam'; // 'pinjam' | 'pengguna' | 'kelas'
  let parsedUniversalRows = [];

  window.addEventListener('DOMContentLoaded', function() {
    // Tanggal default hari ini pada form pinjam & proses kembali
    const today = new Date().toISOString().split('T')[0];
    const tglPinjam = document.getElementById('inputTanggalPinjam');
    if (tglPinjam) tglPinjam.value = today;
    const tglKembali = document.getElementById('inputTanggalKembaliProses');
    if (tglKembali) tglKembali.value = today;

    // Toggle sidebar responsive
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('sidebar-wrapper').classList.toggle('toggled');
      });
    }

    loadAllData();
  });

  function switchTab(tabId) {
    currentTab = tabId;
    document.querySelectorAll('.tab-pane-content').forEach(el => el.classList.add('d-none'));
    const target = document.getElementById('tab-' + tabId);
    if (target) target.classList.remove('d-none');

    document.querySelectorAll('#sidebar-wrapper .list-group-item').forEach(el => el.classList.remove('active'));
    const activeLink = document.querySelector(\`#sidebar-wrapper a[onclick="switchTab('\${tabId}')"]\`);
    if (activeLink) activeLink.classList.add('active');

    const titles = {
      dashboard: 'Dashboard Perpustakaan',
      formPinjam: 'Formulir Peminjaman Buku Paket',
      dataPinjam: 'Data Seluruh Peminjaman',
      kembaliBuku: 'Pengembalian Buku Paket',
      daftarBuku: 'Katalog Buku Paket Pelajaran',
      pengguna: 'Pengguna Perpustakaan (Staf & Petugas)',
      kelas: 'Pengaturan Kelas Sekolah',
      pengaturan: 'Pengaturan Perpustakaan'
    };
    document.getElementById('headerTitle').textContent = titles[tabId] || 'Perpustakaan Sekolah';

    if (window.innerWidth < 992) {
      document.getElementById('sidebar-wrapper').classList.remove('toggled');
    }
  }

  function refreshCurrentTab() {
    loadAllData();
  }

  function loadAllData() {
    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          document.getElementById('statSiswa').textContent = res.stats.totalSiswaMeminjam;
          document.getElementById('statBukuDipinjam').textContent = res.stats.totalBukuDipinjam;
          document.getElementById('statHariIni').textContent = res.stats.totalPeminjamanHariIni;
          document.getElementById('statSudahKembali').textContent = res.stats.totalBukuSudahKembali;
          document.getElementById('statBelumKembali').textContent = res.stats.totalBukuBelumKembali;
          renderRecentLoans(res.recentLoans);
        }
      })
      .getDashboardData();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          allLoans = res.data;
          renderAllLoansTable(allLoans);
          populateFilterOptions(allLoans);
          populateKembaliDropdown(allLoans);
          renderRiwayatKembali(allLoans);
        }
      })
      .getAllPeminjaman();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          allBooks = res.data;
          renderBooksTable(allBooks);
          populateBukuDropdown(allBooks);
        }
      })
      .getDaftarBuku();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          allPengguna = res.data;
          renderPenggunaTable(allPengguna);
        }
      })
      .getAllPengguna();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          allKelas = res.data;
          renderKelasTable(allKelas);
          populateKelasDropdown(allKelas);
        }
      })
      .getAllKelas();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          populateSettingsUI(res.data);
        }
      })
      .getPengaturan();
  }

  // RECENT LOANS & ALL LOANS
  function renderRecentLoans(list) {
    const tbody = document.getElementById('tbodyRecentLoans');
    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4 text-muted">Belum ada transaksi peminjaman.</td></tr>';
      return;
    }
    let html = '';
    list.forEach(item => {
      const isReturned = item.status === 'Sudah Dikembalikan';
      const badge = isReturned 
        ? '<span class="badge badge-returned"><i class="bi bi-check-circle me-1"></i>Sudah Kembali</span>' 
        : '<span class="badge badge-borrowed"><i class="bi bi-clock me-1"></i>Dipinjam</span>';
      
      html += \`
        <tr>
          <td><span class="badge bg-light text-dark border">\${item.id}</span></td>
          <td class="fw-semibold">\${item.namaSiswa}</td>
          <td>\${item.bukuPaket}</td>
          <td><span class="badge bg-primary-subtle text-primary">\${item.kelas}</span></td>
          <td>\${item.tanggalPinjam}</td>
          <td><strong>\${item.jumlahBuku}</strong> eks</td>
          <td>\${badge}</td>
          <td>
            \${!isReturned ? \`<button class="btn btn-sm btn-outline-success rounded-pill px-2 py-0" onclick="quickReturn('\${item.id}')"><i class="bi bi-arrow-return-left"></i></button>\` : '<i class="bi bi-check text-success fs-5"></i>'}
          </td>
        </tr>
      \`;
    });
    tbody.innerHTML = html;
  }

  function renderAllLoansTable(list) {
    const tbody = document.getElementById('tbodyAllLoans');
    document.getElementById('totalRecordsInfo').textContent = 'Menampilkan ' + list.length + ' data peminjaman';

    if (!list || list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" class="text-center py-4 text-muted">Tidak ada data peminjaman yang cocok.</td></tr>';
      return;
    }

    let html = '';
    list.forEach((item, index) => {
      const isReturned = item.status === 'Sudah Dikembalikan';
      const badge = isReturned 
        ? '<span class="badge badge-returned">Sudah Dikembalikan</span>' 
        : '<span class="badge badge-borrowed">Belum Dikembalikan</span>';

      html += \`
        <tr>
          <td>\${index + 1}</td>
          <td><span class="badge bg-light text-dark border">\${item.id}</span></td>
          <td class="fw-semibold">\${item.namaSiswa}</td>
          <td>\${item.bukuPaket}</td>
          <td><span class="badge bg-primary-subtle text-primary">\${item.kelas}</span></td>
          <td>\${item.tanggalPinjam}</td>
          <td>\${item.jumlahBuku}</td>
          <td>\${item.tanggalKembali}</td>
          <td>\${badge}</td>
          <td>
            <div class="btn-group btn-group-sm">
              \${!isReturned ? \`<button class="btn btn-outline-success" title="Kembalikan" onclick="quickReturn('\${item.id}')"><i class="bi bi-arrow-return-left"></i></button>\` : ''}
              <button class="btn btn-outline-primary" title="Edit" onclick="prepareEditPinjam('\${item.id}')"><i class="bi bi-pencil-square"></i></button>
              <button class="btn btn-outline-danger" title="Hapus" onclick="confirmHapusPinjam('\${item.id}')"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>
      \`;
    });
    tbody.innerHTML = html;
  }

  function populateFilterOptions(list) {
    const kelasSet = new Set();
    const bukuSet = new Set();
    list.forEach(i => {
      if (i.kelas) kelasSet.add(i.kelas);
      if (i.bukuPaket) bukuSet.add(i.bukuPaket);
    });

    const selKelas = document.getElementById('filterKelas');
    selKelas.innerHTML = '<option value="">Semua Kelas</option>';
    kelasSet.forEach(k => {
      selKelas.innerHTML += \`<option value="\${k}">\${k}</option>\`;
    });

    const selBuku = document.getElementById('filterBuku');
    selBuku.innerHTML = '<option value="">Semua Judul Buku</option>';
    bukuSet.forEach(b => {
      selBuku.innerHTML += \`<option value="\${b}">\${b}</option>\`;
    });
  }

  function filterTableData() {
    const keyword = document.getElementById('searchKeyword').value.toLowerCase().trim();
    const kelas = document.getElementById('filterKelas').value;
    const buku = document.getElementById('filterBuku').value;
    const status = document.getElementById('filterStatus').value;

    const filtered = allLoans.filter(item => {
      const matchKey = !keyword || item.namaSiswa.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword);
      const matchKelas = !kelas || item.kelas === kelas;
      const matchBuku = !buku || item.bukuPaket === buku;
      const matchStatus = !status || item.status === status;
      return matchKey && matchKelas && matchBuku && matchStatus;
    });

    renderAllLoansTable(filtered);
  }

  function populateBukuDropdown(books) {
    const select = document.getElementById('selectBukuPaket');
    select.innerHTML = '<option value="">-- Pilih Buku Paket --</option>';
    books.forEach(b => {
      select.innerHTML += \`<option value="\${b.namaBuku}">\${b.namaBuku} (Kelas \${b.kelas} - Stok: \${b.stokBuku})</option>\`;
    });
  }

  function populateKelasDropdown(classes) {
    const select = document.getElementById('selectKelasPinjam');
    select.innerHTML = '<option value="">-- Pilih Kelas --</option>';
    classes.forEach(c => {
      const label = c.tingkatKelas + ' ' + c.jurusan + ' ' + c.rombel;
      select.innerHTML += \`<option value="\${label}">\${label}</option>\`;
    });
  }

  function populateKembaliDropdown(loans) {
    const select = document.getElementById('selectPinjamKembali');
    select.innerHTML = '<option value="">-- Pilih Transaksi --</option>';
    const pending = loans.filter(l => l.status === 'Belum Dikembalikan');
    pending.forEach(p => {
      select.innerHTML += \`<option value="\${p.id}">\${p.id} - \${p.namaSiswa} (\${p.bukuPaket} - \${p.kelas})</option>\`;
    });
  }

  function handleSelectPinjamKembali() {
    const id = document.getElementById('selectPinjamKembali').value;
    const box = document.getElementById('detailKembaliBox');
    const btn = document.getElementById('btnKonfirmasiKembali');

    if (!id) {
      box.classList.add('d-none');
      btn.disabled = true;
      return;
    }

    const item = allLoans.find(l => l.id === id);
    if (item) {
      document.getElementById('kembaliNamaSiswa').textContent = item.namaSiswa;
      document.getElementById('kembaliBuku').textContent = 'Buku: ' + item.bukuPaket + ' (' + item.jumlahBuku + ' buku)';
      document.getElementById('kembaliKelas').textContent = 'Kelas: ' + item.kelas + ' | Pinjam: ' + item.tanggalPinjam;
      box.classList.remove('d-none');
      btn.disabled = false;
    }
  }

  function submitPengembalian() {
    const id = document.getElementById('selectPinjamKembali').value;
    const tgl = document.getElementById('inputTanggalKembaliProses').value;
    if (!id) return;

    Swal.fire({
      title: 'Konfirmasi Pengembalian',
      text: 'Ubah status transaksi menjadi "Sudah Dikembalikan"?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Kembalikan',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        Swal.showLoading();
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              Swal.fire('Berhasil!', response.message, 'success');
              document.getElementById('selectPinjamKembali').value = '';
              handleSelectPinjamKembali();
              loadAllData();
            } else {
              Swal.fire('Gagal!', response.message, 'error');
            }
          })
          .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
          .prosesPengembalian(id, tgl);
      }
    });
  }

  function quickReturn(id) {
    const today = new Date().toISOString().split('T')[0];
    Swal.fire({
      title: 'Kembalikan Buku Sekarang?',
      text: 'Status akan diubah menjadi "Sudah Dikembalikan" per hari ini.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Selesaikan',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        Swal.showLoading();
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              Swal.fire('Sukses!', response.message, 'success');
              loadAllData();
            } else {
              Swal.fire('Gagal!', response.message, 'error');
            }
          })
          .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
          .prosesPengembalian(id, today);
      }
    });
  }

  function renderRiwayatKembali(loans) {
    const tbody = document.getElementById('tbodyRiwayatKembali');
    const returned = loans.filter(l => l.status === 'Sudah Dikembalikan');
    if (returned.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Belum ada buku yang dikembalikan.</td></tr>';
      return;
    }
    let html = '';
    returned.forEach(item => {
      html += \`
        <tr>
          <td class="fw-semibold">\${item.namaSiswa}</td>
          <td>\${item.bukuPaket}</td>
          <td>\${item.kelas}</td>
          <td>\${item.tanggalKembali}</td>
          <td><span class="badge badge-returned">Selesai</span></td>
        </tr>
      \`;
    });
    tbody.innerHTML = html;
  }

  // FORM PEMINJAMAN HANDLERS
  function handleSimpanPeminjaman(e) {
    e.preventDefault();
    const editId = document.getElementById('editPinjamId').value;
    const form = {
      id: editId || '',
      namaSiswa: document.getElementById('inputNamaSiswa').value,
      bukuPaket: document.getElementById('selectBukuPaket').value,
      kelas: document.getElementById('selectKelasPinjam').value,
      tanggalPinjam: document.getElementById('inputTanggalPinjam').value,
      jumlahBuku: document.getElementById('inputJumlahBuku').value,
      keterangan: document.getElementById('inputKeterangan').value
    };

    Swal.fire({
      title: 'Menyimpan...',
      text: 'Menghubungkan ke Google Spreadsheet',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    if (editId) {
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            Swal.fire('Berhasil!', res.message, 'success');
            resetFormPinjam();
            switchTab('dataPinjam');
            loadAllData();
          } else {
            Swal.fire('Gagal!', res.message, 'error');
          }
        })
        .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
        .editPeminjaman(form);
    } else {
      google.script.run
        .withSuccessHandler(function(res) {
          if (res.success) {
            Swal.fire('Berhasil!', res.message, 'success');
            resetFormPinjam();
            switchTab('dataPinjam');
            loadAllData();
          } else {
            Swal.fire('Gagal!', res.message, 'error');
          }
        })
        .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
        .addPeminjaman(form);
    }
  }

  function resetFormPinjam() {
    document.getElementById('editPinjamId').value = '';
    document.getElementById('formInputPinjam').reset();
    document.getElementById('inputTanggalPinjam').value = new Date().toISOString().split('T')[0];
    document.getElementById('inputJumlahBuku').value = 1;
    document.getElementById('btnSubmitPinjam').innerHTML = '<i class="bi bi-check-lg"></i> Simpan Peminjaman';
  }

  function prepareEditPinjam(id) {
    const item = allLoans.find(l => l.id === id);
    if (!item) return;

    document.getElementById('editPinjamId').value = item.id;
    document.getElementById('inputNamaSiswa').value = item.namaSiswa;
    document.getElementById('selectBukuPaket').value = item.bukuPaket;
    document.getElementById('selectKelasPinjam').value = item.kelas;
    document.getElementById('inputTanggalPinjam').value = item.tanggalPinjam;
    document.getElementById('inputJumlahBuku').value = item.jumlahBuku;
    document.getElementById('inputKeterangan').value = item.keterangan === '-' ? '' : item.keterangan;

    document.getElementById('btnSubmitPinjam').innerHTML = '<i class="bi bi-save"></i> Perbarui Data Peminjaman';
    switchTab('formPinjam');
  }

  function confirmHapusPinjam(id) {
    Swal.fire({
      title: 'Hapus Data Peminjaman?',
      text: 'Data dengan ID ' + id + ' akan dihapus permanen dari Google Spreadsheet.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        Swal.showLoading();
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              Swal.fire('Terhapus!', response.message, 'success');
              loadAllData();
            } else {
              Swal.fire('Gagal!', response.message, 'error');
            }
          })
          .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
          .deletePeminjaman(id);
      }
    });
  }

  // ==========================================
  // PENGGUNA PERPUSTAKAAN (CRUD)
  // ==========================================
  let modalPenggunaInstance = null;

  function renderPenggunaTable(users) {
    const tbody = document.getElementById('tbodyPengguna');
    if (!users || users.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada data pengguna/petugas perpustakaan.</td></tr>';
      return;
    }
    let html = '';
    users.forEach((u, idx) => {
      html += \`
        <tr>
          <td>\${idx + 1}</td>
          <td><span class="badge bg-light text-dark border">\${u.id}</span></td>
          <td class="fw-semibold text-dark">\${u.namaPengguna}</td>
          <td><span class="badge bg-primary-subtle text-primary">\${u.jabatan}</span></td>
          <td class="text-muted small">\${u.keterangan || '-'}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="prepareEditPengguna('\${u.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger" onclick="confirmHapusPengguna('\${u.id}')"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>
      \`;
    });
    tbody.innerHTML = html;
  }

  function openModalTambahPengguna() {
    document.getElementById('formPenggunaMaster').reset();
    document.getElementById('masterPenggunaId').value = '';
    document.getElementById('modalPenggunaTitle').textContent = 'Tambah Pengguna Perpustakaan';
    if (!modalPenggunaInstance) modalPenggunaInstance = new bootstrap.Modal(document.getElementById('modalPengguna'));
    modalPenggunaInstance.show();
  }

  function prepareEditPengguna(id) {
    const u = allPengguna.find(item => item.id === id);
    if (!u) return;
    document.getElementById('masterPenggunaId').value = u.id;
    document.getElementById('masterPenggunaNama').value = u.namaPengguna;
    document.getElementById('masterPenggunaJabatan').value = u.jabatan;
    document.getElementById('masterPenggunaKet').value = u.keterangan === '-' ? '' : u.keterangan;
    document.getElementById('modalPenggunaTitle').textContent = 'Edit Pengguna Perpustakaan (' + u.id + ')';
    if (!modalPenggunaInstance) modalPenggunaInstance = new bootstrap.Modal(document.getElementById('modalPengguna'));
    modalPenggunaInstance.show();
  }

  function handleSimpanPengguna(e) {
    e.preventDefault();
    const payload = {
      id: document.getElementById('masterPenggunaId').value,
      namaPengguna: document.getElementById('masterPenggunaNama').value,
      jabatan: document.getElementById('masterPenggunaJabatan').value,
      keterangan: document.getElementById('masterPenggunaKet').value
    };

    if (modalPenggunaInstance) modalPenggunaInstance.hide();
    Swal.showLoading();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          Swal.fire('Berhasil!', res.message, 'success');
          loadAllData();
        } else {
          Swal.fire('Gagal!', res.message, 'error');
        }
      })
      .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
      .savePengguna(payload);
  }

  function confirmHapusPengguna(id) {
    Swal.fire({
      title: 'Hapus Pengguna Perpustakaan?',
      text: 'Data pengguna dengan ID ' + id + ' akan dihapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        Swal.showLoading();
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              Swal.fire('Terhapus!', response.message, 'success');
              loadAllData();
            } else {
              Swal.fire('Gagal!', response.message, 'error');
            }
          })
          .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
          .deletePengguna(id);
      }
    });
  }

  // ==========================================
  // PENGATURAN KELAS (CRUD & VALIDATION)
  // ==========================================
  let modalKelasInstance = null;

  function renderKelasTable(classes) {
    const tbody = document.getElementById('tbodyKelas');
    if (!classes || classes.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4 text-muted">Belum ada data kelas yang terdaftar.</td></tr>';
      return;
    }
    let html = '';
    classes.forEach((c, idx) => {
      const fullLabel = c.tingkatKelas + ' ' + c.jurusan + ' ' + c.rombel;
      html += \`
        <tr>
          <td>\${idx + 1}</td>
          <td><span class="badge bg-light text-dark border">\${c.id}</span></td>
          <td><span class="badge bg-secondary-subtle text-secondary fw-bold">\${c.tingkatKelas}</span></td>
          <td class="fw-semibold">\${c.jurusan}</td>
          <td>\${c.rombel}</td>
          <td><span class="badge bg-primary-subtle text-primary fw-bold px-2 py-1">\${fullLabel}</span></td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="prepareEditKelas('\${c.id}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger" onclick="confirmHapusKelas('\${c.id}')"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>
      \`;
    });
    tbody.innerHTML = html;
  }

  function openModalTambahKelas() {
    document.getElementById('formKelasMaster').reset();
    document.getElementById('masterKelasId').value = '';
    document.getElementById('masterKelasTingkat').value = 'X';
    document.getElementById('modalKelasTitle').textContent = 'Tambah Kelas Baru';
    if (!modalKelasInstance) modalKelasInstance = new bootstrap.Modal(document.getElementById('modalKelas'));
    modalKelasInstance.show();
  }

  function prepareEditKelas(id) {
    const c = allKelas.find(item => item.id === id);
    if (!c) return;
    document.getElementById('masterKelasId').value = c.id;
    document.getElementById('masterKelasTingkat').value = c.tingkatKelas;
    document.getElementById('masterKelasJurusan').value = c.jurusan;
    document.getElementById('masterKelasRombel').value = c.rombel;
    document.getElementById('modalKelasTitle').textContent = 'Edit Data Kelas (' + c.id + ')';
    if (!modalKelasInstance) modalKelasInstance = new bootstrap.Modal(document.getElementById('modalKelas'));
    modalKelasInstance.show();
  }

  function handleSimpanKelas(e) {
    e.preventDefault();
    const payload = {
      id: document.getElementById('masterKelasId').value,
      tingkatKelas: document.getElementById('masterKelasTingkat').value,
      jurusan: document.getElementById('masterKelasJurusan').value,
      rombel: document.getElementById('masterKelasRombel').value
    };

    if (modalKelasInstance) modalKelasInstance.hide();
    Swal.showLoading();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          Swal.fire('Berhasil!', res.message, 'success');
          loadAllData();
        } else {
          Swal.fire('Gagal!', res.message, 'error');
        }
      })
      .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
      .saveKelas(payload);
  }

  function confirmHapusKelas(id) {
    Swal.fire({
      title: 'Hapus Kelas?',
      text: 'Data kelas ini akan dihapus dari Google Spreadsheet.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        Swal.showLoading();
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              Swal.fire('Terhapus!', response.message, 'success');
              loadAllData();
            } else {
              Swal.fire('Gagal!', response.message, 'error');
            }
          })
          .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
          .deleteKelas(id);
      }
    });
  }

  // ==========================================
  // BUKU MANAGEMENT
  // ==========================================
  let bukuModalInstance = null;
  function renderBooksTable(books) {
    const tbody = document.getElementById('tbodyDaftarBuku');
    if (!books || books.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">Belum ada daftar buku paket.</td></tr>';
      return;
    }
    let html = '';
    books.forEach(b => {
      html += \`
        <tr>
          <td><span class="badge bg-light text-dark border">\${b.idBuku}</span></td>
          <td class="fw-semibold">\${b.namaBuku}</td>
          <td>\${b.mataPelajaran}</td>
          <td><span class="badge bg-primary-subtle text-primary">Kelas \${b.kelas}</span></td>
          <td><strong>\${b.stokBuku}</strong> eks</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" onclick="prepareEditBuku('\${b.idBuku}')"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger" onclick="confirmHapusBuku('\${b.idBuku}')"><i class="bi bi-trash"></i></button>
            </div>
          </td>
        </tr>
      \`;
    });
    tbody.innerHTML = html;
  }

  function openModalTambahBuku() {
    document.getElementById('formBukuMaster').reset();
    document.getElementById('masterBukuId').value = '';
    document.getElementById('modalBukuTitle').textContent = 'Tambah Buku Paket';
    if (!bukuModalInstance) bukuModalInstance = new bootstrap.Modal(document.getElementById('modalBuku'));
    bukuModalInstance.show();
  }

  function prepareEditBuku(idBuku) {
    const b = allBooks.find(item => item.idBuku === idBuku);
    if (!b) return;
    document.getElementById('masterBukuId').value = b.idBuku;
    document.getElementById('masterBukuNama').value = b.namaBuku;
    document.getElementById('masterBukuMapel').value = b.mataPelajaran;
    document.getElementById('masterBukuKelas').value = b.kelas;
    document.getElementById('masterBukuStok').value = b.stokBuku;
    document.getElementById('modalBukuTitle').textContent = 'Edit Buku Paket (' + b.idBuku + ')';
    if (!bukuModalInstance) bukuModalInstance = new bootstrap.Modal(document.getElementById('modalBuku'));
    bukuModalInstance.show();
  }

  function handleSimpanBuku(e) {
    e.preventDefault();
    const payload = {
      idBuku: document.getElementById('masterBukuId').value,
      namaBuku: document.getElementById('masterBukuNama').value,
      mataPelajaran: document.getElementById('masterBukuMapel').value,
      kelas: document.getElementById('masterBukuKelas').value,
      stokBuku: document.getElementById('masterBukuStok').value
    };

    if (bukuModalInstance) bukuModalInstance.hide();
    Swal.showLoading();

    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          Swal.fire('Berhasil!', res.message, 'success');
          loadAllData();
        } else {
          Swal.fire('Gagal!', res.message, 'error');
        }
      })
      .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
      .saveBuku(payload);
  }

  function confirmHapusBuku(idBuku) {
    Swal.fire({
      title: 'Hapus Buku Paket?',
      text: 'Buku dengan ID ' + idBuku + ' akan dihapus dari katalog.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        Swal.showLoading();
        google.script.run
          .withSuccessHandler(function(response) {
            if (response.success) {
              Swal.fire('Terhapus!', response.message, 'success');
              loadAllData();
            } else {
              Swal.fire('Gagal!', response.message, 'error');
            }
          })
          .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
          .deleteBuku(idBuku);
      }
    });
  }

  // ==========================================
  // SETTINGS
  // ==========================================
  function populateSettingsUI(cfg) {
    if (cfg['Nama Perpustakaan']) document.getElementById('cfgNamaPerpus').value = cfg['Nama Perpustakaan'];
    if (cfg['Nama Sekolah']) document.getElementById('cfgNamaSekolah').value = cfg['Nama Sekolah'];
    if (cfg['Alamat Sekolah']) document.getElementById('cfgAlamat').value = cfg['Alamat Sekolah'];
    if (cfg['Nama Pustakawan']) document.getElementById('cfgPustakawan').value = cfg['Nama Pustakawan'];
    if (cfg['NIP Pustakawan']) document.getElementById('cfgNIP').value = cfg['NIP Pustakawan'];
    if (cfg['Kontak']) document.getElementById('cfgKontak').value = cfg['Kontak'];
    if (cfg['Batas Hari Pinjam']) document.getElementById('cfgBatasHari').value = cfg['Batas Hari Pinjam'];
  }

  function handleSimpanPengaturan(e) {
    e.preventDefault();
    const config = {
      'Nama Perpustakaan': document.getElementById('cfgNamaPerpus').value,
      'Nama Sekolah': document.getElementById('cfgNamaSekolah').value,
      'Alamat Sekolah': document.getElementById('cfgAlamat').value,
      'Nama Pustakawan': document.getElementById('cfgPustakawan').value,
      'NIP Pustakawan': document.getElementById('cfgNIP').value,
      'Kontak': document.getElementById('cfgKontak').value,
      'Batas Hari Pinjam': document.getElementById('cfgBatasHari').value
    };

    Swal.showLoading();
    google.script.run
      .withSuccessHandler(function(res) {
        if (res.success) {
          Swal.fire('Tersimpan!', res.message, 'success');
        } else {
          Swal.fire('Gagal!', res.message, 'error');
        }
      })
      .withFailureHandler(function(err) { Swal.fire('Error', err.message, 'error'); })
      .savePengaturan(config);
  }

  // ==========================================
  // UNIVERSAL EXPORT (XLSX & CSV WITH SHEETJS)
  // ==========================================
  function exportPinjam(scope, format) {
    let dataset = allLoans;
    if (scope === 'filtered') {
      const keyword = document.getElementById('searchKeyword').value.toLowerCase().trim();
      const kelas = document.getElementById('filterKelas').value;
      const buku = document.getElementById('filterBuku').value;
      const status = document.getElementById('filterStatus').value;
      dataset = allLoans.filter(item => {
        const matchKey = !keyword || item.namaSiswa.toLowerCase().includes(keyword) || item.id.toLowerCase().includes(keyword);
        const matchKelas = !kelas || item.kelas === kelas;
        const matchBuku = !buku || item.bukuPaket === buku;
        const matchStatus = !status || item.status === status;
        return matchKey && matchKelas && matchBuku && matchStatus;
      });
    }

    if (!dataset || dataset.length === 0) {
      Swal.fire('Info', 'Tidak ada data untuk diekspor.', 'info');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const filename = \`Data_Peminjaman_\${scope === 'filtered' ? 'Terfilter_' : 'Semua_'}\${todayStr}.\${format}\`;
    const exportRows = dataset.map((r, i) => ({
      'No': i + 1,
      'ID Peminjaman': r.id,
      'Nama Siswa': r.namaSiswa,
      'Buku Paket': r.bukuPaket,
      'Kelas': r.kelas,
      'Tanggal Pinjam': r.tanggalPinjam,
      'Jumlah Buku': r.jumlahBuku,
      'Tanggal Kembali': r.tanggalKembali,
      'Status': r.status,
      'Keterangan': r.keterangan || '-'
    }));

    downloadSheetData(exportRows, filename, format);
  }

  function exportPengguna(format) {
    if (!allPengguna || allPengguna.length === 0) {
      Swal.fire('Info', 'Tidak ada data pengguna untuk diekspor.', 'info');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = \`Data_Pengguna_\${todayStr}.\${format}\`;
    const exportRows = allPengguna.map((u, i) => ({
      'No': i + 1,
      'ID Pengguna': u.id,
      'Nama Pengguna': u.namaPengguna,
      'Jabatan': u.jabatan,
      'Keterangan': u.keterangan || '-'
    }));
    downloadSheetData(exportRows, filename, format);
  }

  function exportKelas(format) {
    if (!allKelas || allKelas.length === 0) {
      Swal.fire('Info', 'Tidak ada data kelas untuk diekspor.', 'info');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    const filename = \`Data_Kelas_\${todayStr}.\${format}\`;
    const exportRows = allKelas.map((c, i) => ({
      'No': i + 1,
      'ID Kelas': c.id,
      'Tingkat Kelas': c.tingkatKelas,
      'Jurusan': c.jurusan,
      'Rombel': c.rombel,
      'Nama Lengkap': c.tingkatKelas + ' ' + c.jurusan + ' ' + c.rombel
    }));
    downloadSheetData(exportRows, filename, format);
  }

  function downloadSheetData(rows, filename, format) {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    if (format === 'csv') {
      XLSX.writeFile(wb, filename, { bookType: 'csv' });
    } else {
      XLSX.writeFile(wb, filename, { bookType: 'xlsx' });
    }
  }

  // TEMPLATES DOWNLOAD
  function downloadTemplatePinjam() {
    const sample = [
      {
        'ID': 'PJ-20261105-101',
        'Nama Siswa': 'Andi Firmansyah',
        'Buku Paket': 'Matematika Tingkat Lanjut X',
        'Kelas': 'X RPL 1',
        'Tanggal Pinjam': '2026-11-05',
        'Jumlah Buku': 1,
        'Tanggal Kembali': '-',
        'Status': 'Belum Dikembalikan',
        'Keterangan': 'Peminjaman pegangan semester ganjil'
      },
      {
        'ID': 'PJ-20261105-102',
        'Nama Siswa': 'Siti Rahmawati',
        'Buku Paket': 'Bahasa Indonesia Cerdas X',
        'Kelas': 'X RPL 2',
        'Tanggal Pinjam': '2026-11-05',
        'Jumlah Buku': 1,
        'Tanggal Kembali': '2026-11-08',
        'Status': 'Sudah Dikembalikan',
        'Keterangan': 'Kondisi buku baik'
      }
    ];
    downloadSheetData(sample, 'Template_Import_Peminjaman.xlsx', 'xlsx');
  }

  function downloadTemplatePengguna() {
    const sample = [
      {
        'Nama Pengguna': 'Hj. Ratna Sari, S.Pd., M.M.',
        'Jabatan': 'Kepala Perpustakaan',
        'Keterangan': 'Penanggung jawab utama operasional dan inventaris'
      },
      {
        'Nama Pengguna': 'Bambang Sudarsono, S.I.Pust.',
        'Jabatan': 'Pustakawan Pelaksana',
        'Keterangan': 'Layanan sirkulasi peminjaman buku paket'
      }
    ];
    downloadSheetData(sample, 'Template_Import_Pengguna.xlsx', 'xlsx');
  }

  function downloadTemplateKelas() {
    const sample = [
      { 'Tingkat Kelas': 'X', 'Jurusan': 'RPL', 'Rombel': '1' },
      { 'Tingkat Kelas': 'X', 'Jurusan': 'RPL', 'Rombel': '2' },
      { 'Tingkat Kelas': 'XI', 'Jurusan': 'MIPA', 'Rombel': '1' },
      { 'Tingkat Kelas': 'XII', 'Jurusan': 'TKJ', 'Rombel': '1' }
    ];
    downloadSheetData(sample, 'Template_Import_Kelas.xlsx', 'xlsx');
  }

  // ==========================================
  // UNIVERSAL IMPORT (PINJAM, PENGGUNA, KELAS)
  // ==========================================
  let universalImportModalInstance = null;

  function openModalImport(category) {
    activeImportCategory = category;
    parsedUniversalRows = [];
    document.getElementById('universalInputFile').value = '';
    document.getElementById('universalImportPreviewBox').classList.add('d-none');
    document.getElementById('btnUniversalSubmitImport').disabled = true;

    const titles = {
      pinjam: 'Impor Data Peminjaman Buku Paket',
      pengguna: 'Impor Data Pengguna Perpustakaan',
      kelas: 'Impor Data Kelas Sekolah'
    };
    const colDescs = {
      pinjam: 'Kolom: Nama Siswa, Buku Paket, Kelas, Tanggal Pinjam, Jumlah Buku, Tanggal Kembali, Status, Keterangan',
      pengguna: 'Kolom: Nama Pengguna, Jabatan, Keterangan (opsional)',
      kelas: 'Kolom: Tingkat Kelas (X/XI/XII), Jurusan (RPL/MIPA dll), Rombel (1/2/3)'
    };

    document.getElementById('universalImportTitle').innerHTML = \`<i class="bi bi-file-earmark-arrow-up me-2"></i>\${titles[category]}\`;
    document.getElementById('universalImportColumnsDesc').textContent = colDescs[category];

    const btnDownload = document.getElementById('btnDownloadTemplateImport');
    btnDownload.onclick = function() {
      if (category === 'pinjam') downloadTemplatePinjam();
      else if (category === 'pengguna') downloadTemplatePengguna();
      else if (category === 'kelas') downloadTemplateKelas();
    };

    if (!universalImportModalInstance) {
      universalImportModalInstance = new bootstrap.Modal(document.getElementById('modalUniversalImport'));
    }
    universalImportModalInstance.show();
  }

  function handleUniversalFileSelected(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          Swal.fire('Error', 'File kosong atau lembar kerja tidak memiliki baris data.', 'error');
          return;
        }

        processParsedImportData(rawJson);
      } catch (err) {
        Swal.fire('Gagal Membaca File', 'Terjadi kesalahan: ' + err.message, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function processParsedImportData(rawRows) {
    parsedUniversalRows = [];
    const today = new Date().toISOString().split('T')[0];

    if (activeImportCategory === 'pinjam') {
      rawRows.forEach((row, i) => {
        let nama = '';
        let buku = '';
        let kelas = 'X';
        let tgl = today;
        let jml = 1;
        let tglKembali = '-';
        let status = 'Belum Dikembalikan';
        let ket = '-';

        for (let key in row) {
          const lk = key.toLowerCase();
          const val = String(row[key]).trim();
          if (lk.includes('nama') || lk.includes('siswa')) nama = val;
          else if (lk.includes('buku') || lk.includes('paket')) buku = val;
          else if (lk.includes('kelas') || lk.includes('tingkat')) kelas = val;
          else if (lk.includes('tanggal pinjam') || lk === 'tgl pinjam' || lk === 'pinjam') tgl = val;
          else if (lk.includes('jumlah') || lk.includes('jml') || lk.includes('qty')) jml = parseInt(val, 10) || 1;
          else if (lk.includes('kembali')) tglKembali = val;
          else if (lk.includes('status')) status = val;
          else if (lk.includes('ket') || lk.includes('catatan')) ket = val;
        }

        if (nama && buku) {
          const rand = Math.floor(100 + Math.random() * 900);
          parsedUniversalRows.push({
            id: 'PJ-' + (tgl ? tgl.replace(/-/g, '') : today.replace(/-/g, '')) + '-' + rand,
            namaSiswa: nama,
            bukuPaket: buku,
            kelas: kelas || 'X',
            tanggalPinjam: tgl || today,
            jumlahBuku: jml,
            tanggalKembali: tglKembali || '-',
            status: status.toLowerCase().includes('sudah') ? 'Sudah Dikembalikan' : 'Belum Dikembalikan',
            keterangan: ket || '-'
          });
        }
      });
    } else if (activeImportCategory === 'pengguna') {
      rawRows.forEach((row, i) => {
        let nama = '';
        let jabatan = '';
        let ket = '-';

        for (let key in row) {
          const lk = key.toLowerCase();
          const val = String(row[key]).trim();
          if (lk.includes('nama') || lk.includes('pengguna') || lk.includes('petugas')) nama = val;
          else if (lk.includes('jabatan') || lk.includes('posisi') || lk.includes('role')) jabatan = val;
          else if (lk.includes('ket') || lk.includes('catatan')) ket = val;
        }

        if (nama && jabatan) {
          parsedUniversalRows.push({
            id: 'PG-' + Math.floor(100 + Math.random() * 900),
            namaPengguna: nama,
            jabatan: jabatan,
            keterangan: ket || '-'
          });
        }
      });
    } else if (activeImportCategory === 'kelas') {
      const seen = new Set();
      rawRows.forEach((row, i) => {
        let tingkat = '';
        let jurusan = '';
        let rombel = '';

        for (let key in row) {
          const lk = key.toLowerCase();
          const val = String(row[key]).trim();
          if (lk.includes('tingkat') || lk === 'kelas' || lk === 'grade') tingkat = val.toUpperCase();
          else if (lk.includes('jurusan') || lk.includes('program') || lk.includes('keahlian')) jurusan = val.toUpperCase();
          else if (lk.includes('rombel') || lk.includes('nomor') || lk.includes('paralel') || lk === 'no') rombel = val;
        }

        if (tingkat && jurusan && rombel) {
          const combo = tingkat + '_' + jurusan + '_' + rombel;
          if (!seen.has(combo)) {
            seen.add(combo);
            parsedUniversalRows.push({
              id: 'KL-' + Math.floor(100 + Math.random() * 900),
              tingkatKelas: tingkat,
              jurusan: jurusan,
              rombel: rombel
            });
          }
        }
      });
    }

    if (parsedUniversalRows.length === 0) {
      Swal.fire('Peringatan', 'Tidak ditemukan baris data yang valid sesuai kolom yang dibutuhkan.', 'warning');
      return;
    }

    // Render Preview
    renderUniversalPreview();
  }

  function renderUniversalPreview() {
    const thead = document.getElementById('universalImportTheadPreview');
    const tbody = document.getElementById('universalImportTbodyPreview');
    let theadHtml = '';
    let tbodyHtml = '';

    if (activeImportCategory === 'pinjam') {
      theadHtml = '<tr><th>Nama Siswa</th><th>Buku Paket</th><th>Kelas</th><th>Tgl Pinjam</th><th>Jml</th><th>Status</th></tr>';
      parsedUniversalRows.slice(0, 10).forEach(r => {
        tbodyHtml += \`
          <tr>
            <td class="fw-bold">\${r.namaSiswa}</td>
            <td>\${r.bukuPaket}</td>
            <td>\${r.kelas}</td>
            <td>\${r.tanggalPinjam}</td>
            <td class="text-center font-bold">\${r.jumlahBuku}</td>
            <td><span class="badge \${r.status === 'Sudah Dikembalikan' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}">\${r.status}</span></td>
          </tr>
        \`;
      });
    } else if (activeImportCategory === 'pengguna') {
      theadHtml = '<tr><th>Nama Pengguna</th><th>Jabatan</th><th>Keterangan</th></tr>';
      parsedUniversalRows.slice(0, 10).forEach(u => {
        tbodyHtml += \`
          <tr>
            <td class="fw-bold">\${u.namaPengguna}</td>
            <td><span class="badge bg-primary-subtle text-primary">\${u.jabatan}</span></td>
            <td>\${u.keterangan}</td>
          </tr>
        \`;
      });
    } else if (activeImportCategory === 'kelas') {
      theadHtml = '<tr><th>Tingkat</th><th>Jurusan</th><th>Rombel</th><th>Format Lengkap</th></tr>';
      parsedUniversalRows.slice(0, 10).forEach(c => {
        tbodyHtml += \`
          <tr>
            <td>\${c.tingkatKelas}</td>
            <td class="fw-bold">\${c.jurusan}</td>
            <td>\${c.rombel}</td>
            <td><span class="badge bg-primary-subtle text-primary">\${c.tingkatKelas} \${c.jurusan} \${c.rombel}</span></td>
          </tr>
        \`;
      });
    }

    thead.innerHTML = theadHtml;
    tbody.innerHTML = tbodyHtml;
    document.getElementById('universalImportCountInfo').textContent = parsedUniversalRows.length + ' baris siap diimpor';
    document.getElementById('universalImportPreviewBox').classList.remove('d-none');
    document.getElementById('btnUniversalSubmitImport').disabled = false;
  }

  function submitUniversalImport() {
    if (parsedUniversalRows.length === 0) return;

    const mode = document.querySelector('input[name="universalImportMode"]:checked').value;
    const count = parsedUniversalRows.length;
    const categoryName = activeImportCategory === 'pinjam' ? 'Peminjaman' : (activeImportCategory === 'pengguna' ? 'Pengguna' : 'Kelas');

    Swal.fire({
      title: mode === 'replace' ? 'Timpa Seluruh Data ' + categoryName + '?' : 'Impor ' + count + ' Data ' + categoryName + '?',
      text: mode === 'replace' ? 'Seluruh data lama akan dihapus dan digantikan data impor baru.' : 'Data baru akan ditambahkan ke sheet database.',
      icon: mode === 'replace' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: mode === 'replace' ? '#d33' : '#1a73e8',
      confirmButtonText: 'Ya, Jalankan Impor',
      cancelButtonText: 'Batal'
    }).then(res => {
      if (res.isConfirmed) {
        if (universalImportModalInstance) universalImportModalInstance.hide();
        Swal.fire({
          title: 'Sedang Mengimpor Data...',
          text: 'Menyimpan ke Google Spreadsheet',
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        if (activeImportCategory === 'pinjam') {
          google.script.run
            .withSuccessHandler(handleImportSuccess)
            .withFailureHandler(handleImportError)
            .importPeminjamanBatch(parsedUniversalRows, mode);
        } else if (activeImportCategory === 'pengguna') {
          google.script.run
            .withSuccessHandler(handleImportSuccess)
            .withFailureHandler(handleImportError)
            .importPenggunaBatch(parsedUniversalRows, mode);
        } else if (activeImportCategory === 'kelas') {
          google.script.run
            .withSuccessHandler(handleImportSuccess)
            .withFailureHandler(handleImportError)
            .importKelasBatch(parsedUniversalRows, mode);
        }
      }
    });
  }

  function handleImportSuccess(response) {
    if (response.success) {
      Swal.fire('Berhasil!', response.message, 'success');
      loadAllData();
    } else {
      Swal.fire('Gagal!', response.message, 'error');
    }
  }

  function handleImportError(err) {
    Swal.fire('Error', err.message, 'error');
  }
</script>

</body>
</html>
`;
