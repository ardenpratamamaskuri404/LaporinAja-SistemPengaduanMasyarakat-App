const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const id = 12;
    const adminId = 12; // Admin Kota Bogor
    const userId = 1; // Super Admin id is 1

    const laporan = await prisma.laporan.findUnique({ where: { id: parseInt(id) } });
    if (!laporan) {
      console.log('Laporan not found');
      return;
    }

    console.log('Found Laporan. status is:', laporan.status);

    const updatedLaporan = await prisma.laporan.update({
      where: { id: parseInt(id) },
      data: { 
        adminId: parseInt(adminId),
        status: 'PROSES' 
      },
      include: { 
        user: { select: { id: true, nama: true } },
        assignedAdmin: { select: { id: true, nama: true } }
      }
    });
    console.log('Updated Laporan successfully!', updatedLaporan);

    // Create status history
    const history = await prisma.statusHistory.create({
      data: {
        statusLama: laporan.status,
        statusBaru: 'PROSES',
        laporanId: parseInt(id),
        changedBy: userId
      }
    });
    console.log('Created history:', history);

    // Notify the user
    const userNotification = await prisma.notifikasi.create({
      data: {
        userId: laporan.userId,
        laporanId: parseInt(id),
        pesan: `Laporan Anda "${laporan.judul}" telah ditugaskan ke Admin dan sedang diproses.`
      }
    });
    console.log('Created user notification:', userNotification);

    // Notify the assigned Admin
    const adminNotification = await prisma.notifikasi.create({
      data: {
        userId: parseInt(adminId),
        laporanId: parseInt(id),
        pesan: `Anda telah ditugaskan untuk menangani laporan: "${laporan.judul}".`
      }
    });
    console.log('Created admin notification:', adminNotification);

  } catch (error) {
    console.error('CRASH DETECTED IN SIMULATION:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
