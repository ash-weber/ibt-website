import { prisma } from './src/lib/prisma';

async function main() {
  const settings = await prisma.siteSettings.findFirst();
  console.log("Contact Branches:");
  console.log(JSON.stringify(settings?.contactBranches, null, 2));

  const branches = await prisma.branch.findMany();
  console.log("\nBranches Table:");
  console.log(JSON.stringify(branches, null, 2));

  const contacts = await prisma.contact.findMany({ where: { type: 'ADDRESS' } });
  console.log("\nContacts Table:");
  console.log(JSON.stringify(contacts, null, 2));
}

main().finally(() => prisma.$disconnect());
