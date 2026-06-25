import { prisma } from './src/lib/prisma';

async function main() {
  const contacts = await prisma.contact.findMany({ where: { type: 'ADDRESS' } });
  console.log("Contacts Table:");
  console.log(JSON.stringify(contacts, null, 2));
}

main().finally(() => prisma.$disconnect());
