const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const columns = await prisma.$queryRaw`DESCRIBE Laporan`;
    console.log('Columns of Laporan table:');
    console.table(columns);
  } catch (error) {
    console.error('Error describing Laporan table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
