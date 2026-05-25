CREATE DATABASE IF NOT EXISTS `db_pelaporan_pengaduan_masyarakat`;

USE `db_pelaporan_pengaduan_masyarakat`;

-- Tabel Users
CREATE TABLE `Users` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MASYARAKAT') NOT NULL DEFAULT 'MASYARAKAT',
    `no_telp` VARCHAR(20) NULL,
    `provinsi` VARCHAR(100) NULL,
    `kota` VARCHAR(100) NULL,
    `alamat` TEXT NULL,
    `foto_profil` VARCHAR(255) NULL,
    `agree_terms` BOOLEAN NOT NULL DEFAULT FALSE,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Users` 
ADD `pekerjaan` VARCHAR(100) NULL AFTER `alamat`;

-- Tabel Laporan
CREATE TABLE `Laporan` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `judul` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'PROSES', 'SELESAI', 'DITOLAK') NOT NULL DEFAULT 'PENDING',
    `urgensi` VARCHAR(50) NULL DEFAULT 'Sedang',
    `foto` VARCHAR(191) NULL,
    `latitude` DECIMAL(10,8) NULL,
    `longitude` DECIMAL(11,8) NULL,
    `alamat` TEXT NULL,
    `kelurahan` VARCHAR(100) NULL,
    `kecamatan` VARCHAR(100) NULL,
    `kota` VARCHAR(100) NULL,
    `tanggal_kejadian` DATE NULL,
    `riwayat` VARCHAR(20) NULL DEFAULT 'Tidak',
    `userId` INT NOT NULL,
    `adminId` INT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `Laporan_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Laporan_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Laporan` 
ADD COLUMN `keterangan_selesai` TEXT NULL AFTER `riwayat`,
ADD COLUMN `foto_selesai` VARCHAR(255) NULL AFTER `keterangan_selesai`,
ADD COLUMN `jenis_laporan` ENUM('PUBLIK', 'INTERNAL', 'OFFLINE') NOT NULL DEFAULT 'PUBLIK' AFTER `foto_selesai`,
ADD COLUMN `nama_pelapor_offline` VARCHAR(191) NULL AFTER `jenis_laporan`;

-- Tabel Comment
CREATE TABLE `Comment` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `isi` TEXT NOT NULL,
    `userId` INT NOT NULL,
    `laporanId` INT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `Comment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Comment_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabel Notifikasi
CREATE TABLE `Notifikasi` (
  `id`           INT NOT NULL AUTO_INCREMENT,
  `pesan`        VARCHAR(255) NOT NULL,
  `sudahDibaca`  BOOLEAN NOT NULL DEFAULT FALSE,
  `tersembunyi`  BOOLEAN NOT NULL DEFAULT FALSE,
  `userId`       INT NOT NULL,
  `laporanId`    INT NULL,
  `createdAt`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `Notifikasi_userId_fkey`    FOREIGN KEY (`userId`)    REFERENCES `Users`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `Notifikasi_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabel StatusHistory
CREATE TABLE `StatusHistory` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `statusLama`  ENUM('PENDING', 'PROSES', 'SELESAI', 'DITOLAK') NOT NULL,
  `statusBaru`  ENUM('PENDING', 'PROSES', 'SELESAI', 'DITOLAK') NOT NULL,
  `laporanId`   INT NOT NULL,
  `changedBy`   INT NOT NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  CONSTRAINT `StatusHistory_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE,
  CONSTRAINT `StatusHistory_changedBy_fkey` FOREIGN KEY (`changedBy`) REFERENCES `Users`(`id`)   ON DELETE RESTRICT
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabel Rating (Penilaian laporan setelah status SELESAI)
CREATE TABLE `Rating` (
  `id`         INT NOT NULL AUTO_INCREMENT,
  `nilai`      INT NOT NULL DEFAULT 0,
  `komentar`   TEXT NULL,
  `userId`     INT NOT NULL,
  `laporanId`  INT NOT NULL,
  `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Rating_laporanId_key`(`laporanId`),
  CONSTRAINT `Rating_userId_fkey`    FOREIGN KEY (`userId`)    REFERENCES `Users`(`id`)    ON DELETE CASCADE,
  CONSTRAINT `Rating_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabel Kategori
CREATE TABLE `Kategori` (
  `id`          INT NOT NULL AUTO_INCREMENT,
  `nama`        VARCHAR(191) NOT NULL,
  `slug`        VARCHAR(191) NOT NULL,
  `warna`       VARCHAR(50) NULL,
  `icon`        VARCHAR(50) NULL,
  `deskripsi`   TEXT NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Kategori_nama_key`(`nama`),
  UNIQUE INDEX `Kategori_slug_key`(`slug`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabel ActivityLog
CREATE TABLE `ActivityLog` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `aksi` VARCHAR(191) NOT NULL,
    `detail` TEXT NULL,
    `userId` INT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tabel LaporanFoto (Dokumentasi Foto Laporan)
CREATE TABLE `LaporanFoto` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `url` VARCHAR(191) NOT NULL,
    `laporanId` INT NOT NULL,
    PRIMARY KEY (`id`),
    CONSTRAINT `LaporanFoto_laporanId_fkey` FOREIGN KEY (`laporanId`) REFERENCES `Laporan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `laporanselesaifoto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `url` VARCHAR(255) NOT NULL,
  `laporanId` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `LaporanSelesaiFoto_laporanId_fkey` (`laporanId`),
  CONSTRAINT `LaporanSelesaiFoto_laporanId_fkey` 
    FOREIGN KEY (`laporanId`) 
    REFERENCES `laporan` (`id`) 
    ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `LaporanSelesaiFoto` (`url`, `laporanId`)
SELECT `foto_selesai`, `id` 
FROM `Laporan` 
WHERE `foto_selesai` IS NOT NULL;

ALTER TABLE `Laporan` DROP COLUMN `foto_selesai`;

-- Data Users
-- Catatan: Password disimulasikan menggunakan hash bcrypt untuk kata sandi "password123" agar tetap bisa dites login melalui API backend.
INSERT INTO `Users` (`nama`, `email`, `password`, `role`, `provinsi`, `kota`) VALUES
('Super Admin', 'superadmin@gmail.com', '$2a$10$wEIfL/A0uDqTf2zJ9iE.f.hD1oQc/1DXY5M8Cg/t5k8P1hWl.rX/.', 'SUPER_ADMIN', 'DKI Jakarta', 'Jakarta Pusat'),
('Admin', 'admin@gmail.com', '$2a$10$wEIfL/A0uDqTf2zJ9iE.f.hD1oQc/1DXY5M8Cg/t5k8P1hWl.rX/.', 'ADMIN', 'DKI Jakarta', 'Jakarta Pusat'),
('Arden', 'arden@gmail.com', '$2a$10$wEIfL/A0uDqTf2zJ9iE.f.hD1oQc/1DXY5M8Cg/t5k8P1hWl.rX/.', 'MASYARAKAT', 'Jawa Barat', 'Depok');

-- Data Laporan
INSERT INTO `Laporan` (`judul`, `deskripsi`, `kategori`, `status`, `urgensi`, `userId`, `foto`, `alamat`, `kota`, `latitude`, `longitude`) VALUES
('Jalan Berlubang di Sudirman', 'Terdapat lubang besar yang membahayakan pengendara motor di depan gedung sentral.', 'Infrastruktur', 'PENDING', 'Tinggi', 3, 'jalan-berlubang.jpg', 'Jl. Sudirman No. 10', 'Depok', -6.4025, 106.7942),
('Lampu Jalan Mati', 'Lampu jalan di komplek mawar mati sejak seminggu yang lalu.', 'Fasilitas Umum', 'PROSES', 'Sedang', 3, NULL, 'Komplek Mawar Blok A', 'Depok', -6.3900, 106.8100);

-- Data Comment
INSERT INTO `Comment` (`isi`, `userId`, `laporanId`) VALUES
('Terima kasih laporannya pak, laporan sudah kami terima dan sedang diteruskan ke tim lapangan.', 2, 1),
('Sama-sama pak, tolong segera diperbaiki ya karena sering terjadi kecelakaan.', 3, 1),
('Tim kami sedang melakukan perbaikan lampu jalan, mohon ditunggu prosesnya maksimal 2 hari kerja.', 1, 2);

-- Data Notifikasi
INSERT INTO `Notifikasi` (`pesan`, `userId`, `laporanId`) VALUES
('Laporan Anda "Jalan Berlubang di Sudirman" telah diterima dan sedang menunggu verifikasi.', 3, 1),
('Laporan Anda "Lampu Jalan Mati" sedang diproses oleh Admin.', 3, 2);

-- Data StatusHistory
INSERT INTO `StatusHistory` (`statusLama`, `statusBaru`, `laporanId`, `changedBy`) VALUES
('PENDING', 'PROSES', 2, 2);

-- Data Kategori
INSERT INTO `Kategori` (`nama`, `slug`, `warna`, `icon`) VALUES
('Infrastruktur', 'infrastruktur', '#1a3d0f', '🛣️'),
('Kesehatan', 'kesehatan', '#2d5a1e', '🏥'),
('Pendidikan', 'pendidikan', '#52bf5c', '🎓'),
('Lingkungan', 'lingkungan', '#a8d5a2', '🌿'),
('Utilitas', 'utilitas', '#f59e0b', '⚡'),
('Fasilitas Umum', 'fasilitas-umum', '#3b82f6', '🏛️'),
('Kebersihan', 'kebersihan', '#10b981', '🧹'),
('Lainnya', 'lainnya', '#6b7280', '💬');

UPDATE `Kategori` SET `deskripsi` = 'Laporan terkait pembangunan, perbaikan, atau kerusakan infrastruktur seperti jalan, jembatan, dan fasilitas pendukung lainnya'
WHERE `nama` = 'Infrastruktur';
UPDATE `Kategori` SET `deskripsi` = 'Laporan terkait layanan kesehatan, fasilitas medis, rumah sakit, puskesmas, atau kebutuhan kesehatan masyarakat'
WHERE `nama` = 'Kesehatan';
UPDATE `Kategori` SET `deskripsi` = 'Laporan terkait pendidikan, sekolah, sarana belajar, atau kegiatan pendidikan masyarakat'
WHERE `nama` = 'Pendidikan';
UPDATE `Kategori` SET `deskripsi` = 'Laporan terkait lingkungan seperti penghijauan, pencemaran, sampah, dan pelestarian lingkungan'
WHERE `nama` = 'Lingkungan';
UPDATE `Kategori` SET `deskripsi` = 'Laporan terkait utilitas seperti listrik, air, jaringan, atau layanan publik lainnya'
WHERE `nama` = 'Utilitas';
UPDATE `Kategori` SET `deskripsi` = 'Laporan terkait fasilitas umum seperti taman, tempat ibadah, area publik, dan sarana masyarakat'
WHERE `nama` = 'Fasilitas Umum';
UPDATE `Kategori` SET `deskripsi` = 'Laporan terkait kebersihan seperti sampah menumpuk, saluran tersumbat, atau kebersihan lingkungan'
WHERE `nama` = 'Kebersihan';
UPDATE `Kategori` SET `deskripsi` = 'Laporan untuk kategori lain yang tidak termasuk dalam kategori yang tersedia'
WHERE `nama` = 'Lainnya';

UPDATE `Kategori` SET `icon` = 'Road' WHERE `nama` = 'Infrastruktur';
UPDATE `Kategori` SET `icon` = 'Hospital' WHERE `nama` = 'Kesehatan';
UPDATE `Kategori` SET `icon` = 'GraduationCap' WHERE `nama` = 'Pendidikan';
UPDATE `Kategori` SET `icon` = 'Leaf' WHERE `nama` = 'Lingkungan';
UPDATE `Kategori` SET `icon` = 'Zap' WHERE `nama` = 'Utilitas';
UPDATE `Kategori` SET `icon` = 'Building2' WHERE `nama` = 'Fasilitas Umum';
UPDATE `Kategori` SET `icon` = 'Sparkles' WHERE `nama` = 'Kebersihan';
UPDATE `Kategori` SET `icon` = 'MessageCircle' WHERE `nama` = 'Lainnya';

-- Menampilkan data Users 
SELECT 
    id AS ID_Pengguna, 
    nama AS Nama_Lengkap, 
    email AS Alamat_Email, 
    role AS Hak_Akses,
    provinsi AS Provinsi,
    kota AS Kota,
    createdAt AS Tanggal_Daftar 
FROM `Users`;

-- Menampilkan data Laporan dengan alias (AS)
SELECT 
    id AS ID_Laporan,
    judul AS Judul_Laporan,
    deskripsi AS Deskripsi_Kejadian,
    kategori AS Kategori_Laporan,
    status AS Status_Penanganan,
    urgensi AS Urgensi,
    alamat AS Alamat_Lokasi,
    createdAt AS Tanggal_Lapor
FROM `Laporan`;

-- Menampilkan data Comment dengan alias 
SELECT 
    id AS ID_Komentar,
    isi AS Isi_Tanggapan,
    userId AS ID_Pengirim,
    laporanId AS ID_Laporan_Terkait,
    createdAt AS Waktu_Tanggapan
FROM `Comment`;

-- Query JOIN: Melihat laporan beserta nama pelapornya
SELECT 
    L.id AS ID_Laporan, 
    L.judul AS Judul_Laporan, 
    L.kategori AS Kategori,
    L.status AS Status_Laporan,
    L.urgensi AS Urgensi,
    U.nama AS Nama_Pelapor, 
    U.email AS Email_Pelapor
FROM `Laporan` L
JOIN `Users` U ON L.userId = U.id;

select * from users;
select * from laporan;
select * from comment;
select * from notifikasi;
select * from statushistory;
select * from rating;
select * from kategori;
select * from activitylog;
select * from laporanfoto;
select * from LaporanSelesaiFoto;

SHOW TABLES;
DESCRIBE Users;
DESCRIBE Laporan;
DESCRIBE Comment;
DESCRIBE Notifikasi;
DESCRIBE Rating;

-- Menghapus tabel jika sudah ada (berguna saat melakukan reset data)
DROP TABLE IF EXISTS `Rating`;
DROP TABLE IF EXISTS `StatusHistory`;
DROP TABLE IF EXISTS `Notifikasi`;
DROP TABLE IF EXISTS `Comment`;
DROP TABLE IF EXISTS `Laporan`;
DROP TABLE IF EXISTS `Kategori`;
DROP TABLE IF EXISTS `Users`;

DROP DATABASE IF EXISTS `db_pelaporan_pengaduan_masyarakat`;