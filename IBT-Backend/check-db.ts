import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const service = await prisma.service.findUnique({ where: { slug: 'gifit' } });
    console.log(service);
  } finally {
    await prisma.$disconnect();
  }
}

main();
