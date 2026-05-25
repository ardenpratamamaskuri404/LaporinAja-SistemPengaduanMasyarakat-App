========================================================================================
ALUR INTI APLIKASI LAPORINAJA (alur-inti-aplikasi.txt) - VERSI CORE 3-PERAN SINKRON
========================================================================================

Sistem Pelaporan Pengaduan Masyarakat ("LaporinAja") dirancang untuk menghubungkan warga 
secara langsung dengan pemerintah daerah tingkat kota/kabupaten secara transparan, otonom, 
dan diawasi langsung oleh pemerintah pusat (Super Admin).

Berikut adalah alur inti dari awal penggunaan aplikasi hingga laporan dinyatakan selesai:

----------------------------------------------------------------------------------------
FASE 1: AKSES & AUTENTIKASI (Pendaftaran & Login)
----------------------------------------------------------------------------------------
1. MASYARAKAT (User)
   - Warga melakukan registrasi dengan mengisi domisili kota (misal: "Depok").
   - Setelah registrasi, login untuk masuk ke halaman beranda warga di mobile/web.
2. ADMIN KOTA (Petugas Daerah)
   - Login dengan akun Admin yang memiliki kewenangan wilayah kota spesifik (misal: "Depok").
3. SUPER ADMIN (Pusat)
   - Login sebagai pemantau performa pelayanan nasional.

----------------------------------------------------------------------------------------
FASE 2: PEMBUATAN LAPORAN PENGADUAN (Oleh Warga & Admin)
----------------------------------------------------------------------------------------
1. Warga (Siti - Depok) mengklik menu "Buat Laporan".
2. Warga mengisi form 3-langkah:
   - Info Utama: Judul aduan, Kategori (Infrastruktur, dll), Urgensi (Rendah/Sedang/Tinggi).
   - Detail Laporan: Deskripsi pengaduan, tanggal kejadian, dan riwayat.
   - Lokasi & Bukti: Menandai pin koordinat di Leaflet Map (otomatis mendeteksi nama kota "Depok" 
     melalui reverse geocoding), alamat lengkap, serta mengunggah 1-3 foto keluhan di lapangan.
3. Sebagai alternatif, **Admin (Rian)** juga dapat menginputkan laporan di dashboard-nya untuk:
   - **Aduan Offline:** Mewakili warga yang melapor langsung ke kantor/kelurahan.
   - **Temuan Petugas (Internal):** Mencatat masalah fasilitas umum yang ditemukan saat patroli.
4. Setelah dikirim, laporan masuk ke database dengan status awal: **PENDING**.

----------------------------------------------------------------------------------------
FASE 3: PERUTEAN WILAYAH & VERIFIKASI (Oleh Admin Kota)
----------------------------------------------------------------------------------------
1. Laporan yang baru dikirim secara otomatis diarahkan ke dashboard **Admin Depok** (karena kota cocok). 
   Admin Jakarta tidak dapat melihat laporan tersebut, menjaga fokus penanganan daerah.
2. Admin Depok (Rian) meninjau aduan. Jika valid, Rian mengklik **"Terima Laporan"** dan **"Ambil Alih"**.
3. Status laporan berubah menjadi **PROSES** di database.

----------------------------------------------------------------------------------------
FASE 4: DISKUSI REAL-TIME & PROGRESS (Selama Status PROSES)
----------------------------------------------------------------------------------------
1. Warga (Siti) dan Admin (Rian) dapat berkomunikasi dua arah secara real-time di kolom diskusi.
2. Warga menanyakan update, dan Admin membalas detail progress pengerjaan dinas setempat.
3. Admin Pusat / Super Admin dapat ikut memantau perbincangan ini sebagai bentuk pengawasan mutu layanan.

----------------------------------------------------------------------------------------
FASE 5: FORMULIR BUKTI SELESAI & REALISASI KINERJA (Oleh Admin Kota)
----------------------------------------------------------------------------------------
1. Setelah perbaikan fisik di lapangan tuntas, Rian (Admin Depok) mengklik tombol **"Tandai Selesai"**.
2. Rian wajib mengisi **Form Bukti Selesai**:
   - Catatan pengerjaan resmi dinas.
   - Mengunggah **Foto Bukti Realisasi** (keadaan fisik infrastruktur setelah diperbaiki).
3. Setelah dikirim, status laporan resmi berganti menjadi **SELESAI**.
4. Catatan & Foto hasil kerja Admin ditampilkan secara eksklusif pada halaman detail laporan milik warga, 
   sehingga aduan keluhan asli warga tidak diubah/diedit oleh petugas.

----------------------------------------------------------------------------------------
FASE 6: RATING & EVALUASI LAYANAN (Oleh Warga)
----------------------------------------------------------------------------------------
1. Tombol rating ulasan pada halaman detail warga Siti otomatis terbuka (Unlock).
2. Warga memberikan kepuasan bintang (Star 1-5) beserta ulasan tertulis terhadap kinerja petugas daerah.
3. Warga dapat mengunduh berkas laporan resmi instansi tersebut dalam format **PDF** atau membagikannya.

----------------------------------------------------------------------------------------
FASE 7: MONITORING & ANALITIK NASIONAL (Oleh Super Admin)
----------------------------------------------------------------------------------------
1. Super Admin memantau efektivitas, rata-rata durasi penanganan, dan kepuasan rating seluruh 
   kabupaten/kota di Indonesia melalui dashboard eksekutif terpusat.
========================================================================================
