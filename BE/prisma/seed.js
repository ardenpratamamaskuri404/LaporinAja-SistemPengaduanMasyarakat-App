const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  const hash = await bcrypt.hash('password123', 10);

  // Users
  const superAdmin = await prisma.user.upsert({ where: { email: 'superadmin@gmail.com' }, update: { password: hash }, create: { nama: 'Super Admin', email: 'superadmin@gmail.com', password: hash, role: 'SUPER_ADMIN', provinsi: 'DKI Jakarta', kota: 'Jakarta Pusat' } });
  const admin = await prisma.user.upsert({ where: { email: 'admin@gmail.com' }, update: { password: hash }, create: { nama: 'Admin', email: 'admin@gmail.com', password: hash, role: 'ADMIN', provinsi: 'DKI Jakarta', kota: 'Jakarta Pusat' } });
  const arden = await prisma.user.upsert({ where: { email: 'arden@gmail.com' }, update: { password: hash }, create: { nama: 'Arden', email: 'arden@gmail.com', password: hash, role: 'MASYARAKAT', provinsi: 'Jawa Barat', kota: 'Depok', agree_terms: true } });

  // Kategori
  const kategoriData = [
    { nama: 'Infrastruktur', slug: 'infrastruktur', warna: '#1a3d0f', icon: '🛣️' },
    { nama: 'Kesehatan', slug: 'kesehatan', warna: '#2d5a1e', icon: '🏥' },
    { nama: 'Pendidikan', slug: 'pendidikan', warna: '#52bf5c', icon: '🎓' },
    { nama: 'Lingkungan', slug: 'lingkungan', warna: '#a8d5a2', icon: '🌿' },
    { nama: 'Fasilitas Umum', slug: 'fasilitas-umum', warna: '#3b82f6', icon: '🏛️' },
    { nama: 'Kebersihan', slug: 'kebersihan', warna: '#10b981', icon: '🧹' },
    { nama: 'Lainnya', slug: 'lainnya', warna: '#6b7280', icon: '💬' },
  ];
  for (const k of kategoriData) {
    await prisma.kategori.upsert({ where: { nama: k.nama }, update: {}, create: k });
  }

  // Laporan
  const lap1 = await prisma.laporan.create({ data: { judul: 'Jalan Berlubang di Sudirman', deskripsi: 'Terdapat lubang besar yang membahayakan pengendara motor.', kategori: 'Infrastruktur', status: 'PENDING', urgensi: 'Tinggi', userId: arden.id, alamat: 'Jl. Sudirman No. 10', kota: 'Depok', latitude: -6.4025, longitude: 106.7942 } });
  const lap2 = await prisma.laporan.create({ data: { judul: 'Lampu Jalan Mati', deskripsi: 'Lampu jalan di komplek mawar mati sejak seminggu.', kategori: 'Fasilitas Umum', status: 'PROSES', urgensi: 'Sedang', userId: arden.id, adminId: admin.id, alamat: 'Komplek Mawar Blok A', kota: 'Depok', latitude: -6.3900, longitude: 106.8100 } });

  // Comments
  await prisma.comment.createMany({ data: [
    { isi: 'Terima kasih laporannya, laporan sudah kami terima.', userId: admin.id, laporanId: lap1.id },
    { isi: 'Tolong segera diperbaiki karena sering kecelakaan.', userId: arden.id, laporanId: lap1.id },
    { isi: 'Tim sedang memperbaiki lampu jalan, mohon ditunggu.', userId: superAdmin.id, laporanId: lap2.id },
  ]});

  // Notifikasi
  await prisma.notifikasi.createMany({ data: [
    { pesan: 'Laporan Anda "Jalan Berlubang di Sudirman" telah diterima.', userId: arden.id, laporanId: lap1.id },
    { pesan: 'Laporan "Lampu Jalan Mati" sedang diproses oleh Admin.', userId: arden.id, laporanId: lap2.id },
  ]});

  // StatusHistory
  await prisma.statusHistory.create({ data: { statusLama: 'PENDING', statusBaru: 'PROSES', laporanId: lap2.id, changedBy: admin.id } });

  console.log('Seeding completed!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
