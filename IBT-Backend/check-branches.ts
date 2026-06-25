import { prisma } from './src/lib/prisma';

async function main() {
  const settings = await prisma.setting.findFirst();
  console.log("Contact Branches (Settings):");
  console.log(JSON.stringify(settings?.contactBranches, null, 2));

  const branches = await prisma.branch.findMany();
  console.log("\nBranches Table:");
  console.log(JSON.stringify(branches, null, 2));
}

main().finally(() => prisma.$disconnect());
