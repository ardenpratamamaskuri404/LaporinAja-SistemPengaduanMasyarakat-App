const bcrypt = require('bcryptjs');
const prisma = require('./config/database');

async function fixPasswords() {
  try {
    const hash = await bcrypt.hash('password123', 10);
    console.log('New hash:', hash);

    const result = await prisma.user.updateMany({
      data: { password: hash }
    });
    console.log('Updated', result.count, 'users');

    // Verify
    const users = await prisma.user.findMany({
      select: { id: true, nama: true, email: true, role: true, password: true }
    });

    for (const user of users) {
      const match = await bcrypt.compare('password123', user.password);
      console.log(`${user.email} (${user.role}): password123 match = ${match}`);
    }

    await prisma.$disconnect();
  } catch (err) {
    console.error('Error:', err);
    await prisma.$disconnect();
  }
}

fixPasswords();
