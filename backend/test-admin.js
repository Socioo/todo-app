const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function makeUserAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { role: 'ADMIN' }
    });
    console.log(`✅ ${email} is now an ADMIN`);
    console.log('User:', user);
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Replace with your email
makeUserAdmin('badamaceeee@gmail.com');