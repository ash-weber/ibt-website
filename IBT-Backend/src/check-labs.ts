import { prisma } from "./lib/prisma";

async function main() {
  const projects = await prisma.labProject.findMany({
    orderBy: { order: "asc" }
  });
  console.log("=== LAB PROJECTS IN DB ===");
  console.log(JSON.stringify(projects, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
