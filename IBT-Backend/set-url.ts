import { prisma } from './src/lib/prisma';

async function main() {
  try {
    await prisma.service.update({
      where: { slug: 'gifit' },
      data: { projectUrl: 'https://greenestep.com' }
    });
    console.log('Successfully set projectUrl for GreeneStep to https://greenestep.com');
  } finally {
    await prisma.$disconnect();
  }
}

main();
