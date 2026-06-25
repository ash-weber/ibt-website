import { prisma } from './src/lib/prisma';

async function main() {
  const setting = await prisma.setting.findUnique({ where: { key: 'siteSettings' } });
  console.log("Site Settings:");
  console.log(JSON.stringify(setting?.value, null, 2));
}

main().finally(() => prisma.$disconnect());
