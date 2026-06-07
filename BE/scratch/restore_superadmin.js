const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'superadmin@gmail.com';
  console.log(`Searching for user with email: ${email}`);
  const user = await prisma.users.findUnique({
    where: { email }
  });

  if (!user) {
    console.error('User not found!');
    return;
  }

  console.log('Current User Data:', {
    id: user.id,
    nama: user.nama,
    email: user.email,
    role: user.role
  });

  const updatedUser = await prisma.users.update({
    where: { id: user.id },
    data: { role: 'SUPER_ADMIN' }
  });

  console.log('Successfully updated user to SUPER_ADMIN:', {
    id: updatedUser.id,
    nama: updatedUser.nama,
    email: updatedUser.email,
    role: updatedUser.role
  });
}

main()
  .catch(err => {
    console.error('Error executing script:', err);
  })
  .finally(() => prisma.$disconnect());
