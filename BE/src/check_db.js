const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    const superCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
    const citizenCount = await prisma.user.count({ where: { role: 'MASYARAKAT' } });
    const laporanCount = await prisma.laporan.count();
    
    console.log('--- Database Check ---');
    console.log('Total Users:', userCount);
    console.log('Admins:', adminCount);
    console.log('Super Admins:', superCount);
    console.log('Citizens:', citizenCount);
    console.log('Total Reports:', laporanCount);
    console.log('----------------------');
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
