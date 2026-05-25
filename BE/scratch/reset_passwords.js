const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetPasswords() {
  const hash = '$2b$10$uYdCc0Ig66RMBAvqJu8Bo.tGJ6u/18eWdecCE5QaEEvsIBgir72E2'; // hash for password123
  await prisma.user.updateMany({
    data: {
      password: hash
    }
  });
  console.log('Passwords reset successfully to "password123"');
}

resetPasswords().catch(e => console.error(e)).finally(() => prisma.$disconnect());
