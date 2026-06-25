import { prisma } from './src/lib/prisma';

async function main() {
  try {
    console.log('Adding projectUrl column to Service table...');
    await prisma.$executeRawUnsafe(`ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "projectUrl" TEXT;`);
    console.log('Successfully added projectUrl column.');
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
