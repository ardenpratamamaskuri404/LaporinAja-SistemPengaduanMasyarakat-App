========================================================================================
PANDUAN HIERARKI DATA DAN ALUR PENGGUNA (flow-user.txt) - CORE 3-PERAN & 4-USER DEMO
========================================================================================

Dokumen ini menjelaskan pembagian hak akses (role) dan alur pergerakan laporan secara detail 
menggunakan 3 peran utama (Masyarakat, Admin Kota, Super Admin) yang diuji coba lewat 4 akun spesifik.

----------------------------------------------------------------------------------------
1. PEMETAAN 4 AKUN DEMO YANG DIINTEGRASIKAN
----------------------------------------------------------------------------------------

- **User 1 (Masyarakat Depok)**: Domisili Depok. Hanya bisa membuat aduan dan melihat progress 
  laporannya sendiri, memberikan rating ulasan, serta mengunduh PDF resminya.
- **User 2 (Masyarakat Jakarta)**: Domisili Jakarta. Untuk menunjukkan fitur otonom multi-wilayah.
- **User 3 (Admin Kota Depok)**: Petugas Depok. Hanya berwewenang melihat dan mengelola laporan di Depok.
- **User 4 (Super Admin)**: Otoritas tertinggi. Memantau seluruh keluhan nasional lintas daerah.

----------------------------------------------------------------------------------------
2. DIAGRAM ALUR DATA PENGADUAN (DATA FLOW WORKFLOW)
----------------------------------------------------------------------------------------

[Warga (Siti - Depok)] ---> (Buat Aduan Baru) ---> [Laporan.kota = "Depok" | Status = PENDING]
                                                           |
[Admin (Rian - Depok)] ---> (Input Aduan Offline/Internal) +
                                                           v
                                            +--------------+--------------+
                                            |                             |
                                            v                             v
                              [Admin Depok (Rian)]               [Super Admin (Hendra)]
                              (Hanya melihat aduan Depok)        (Melihat semua aduan nasional)
                                            |                             |
                                            v                             |
                              (Verifikasi & Klik "Terima")                |
                                            |                             |
                                            v                             |
                              [Status = PROSES | Rian Chat]               |
                                            |                             |
                                            v                             |
                              (Pengerjaan & Klik "Tandai Selesai")        |
                                            |                             |
                                            v                             |
                              [Mengisi Keterangan & Foto Bukti]           |
                                            |                             |
                                            v                             |
                              [Status = SELESAI] <------------------------+
                                            |
                                            v
                              [Siti Beri Bintang & Unduh PDF]

----------------------------------------------------------------------------------------
3. DETAIL ALUR PROSES KERJA (THE LIFECYCLE STEPS)
----------------------------------------------------------------------------------------

Langkah 1: Pembuatan Pengaduan (Input Warga & Admin)
   - Siti (Depok) membuat aduan kerusakan jalan via aplikasi (Jenis: PUBLIK).
   - Budi (Jakarta) membuat aduan saluran mampet via aplikasi (Jenis: PUBLIK).
   - Rian (Admin Depok) menginput keluhan warga lansia di kantor kelurahan (Jenis: OFFLINE) 
     atau mencatat temuan pohon tumbang saat patroli (Jenis: INTERNAL).
   - Status semua aduan baru: **PENDING**.

Langkah 2: Perutean Lokasi Cerdas (Location Filtering)
   - Rian (Admin Depok) membuka dashboard: Hanya Laporan Siti yang muncul! Ini membuktikan 
     keamanan isolasi wilayah data daerah agar Rian fokus bekerja.
   - Bapak Hendra (Super Admin) membuka dashboard: Melihat laporan Siti DAN Budi secara terpusat.

Langkah 3: Pengerjaan Lapangan & Komunikasi (Handling & Real-time Chat)
   - Rian meninjau aduan Siti, klik "Terima Laporan" (Status ➔ **PROSES**), dan mengklik "Ambil Alih" 
     sebagai penanggung jawab (`adminId` = Rian).
   - Rian & Siti berdiskusi secara real-time di kolom diskusi mengenai progress pengerjaan.

Langkah 4: Penyelesaian Resmi & Unggah Foto Bukti Realisasi (The Completion Form)
   - Tim lapangan Depok menyelesaikan perbaikan saluran/jalan.
   - Rian mengklik tombol "Tandai Selesai". Aplikasi memunculkan **Form Bukti Selesai**.
   - Rian menulis deskripsi penanganan dan mengunggah **Foto Bukti Selesai (Realisasi Fisik)**.
   - Status Laporan berubah menjadi **SELESAI** secara resmi.
   - Catatan dan Foto hasil kerja Rian tampil pada halaman Detail Laporan Siti secara terpisah 
     dan eksklusif, sehingga aduan asli Siti tidak dirusak/diedit oleh Admin.

Langkah 5: Evaluasi & Ekspor Arsip (Feedback & Export PDF)
   - Siti melihat notifikasi selesai, memberikan rating kepuasan (Star 1-5) beserta ulasan tertulis.
   - Siti mengklik "Unduh PDF" untuk menyimpan salinan berkas pengaduan resmi dari instansi pemerintah.
========================================================================================
