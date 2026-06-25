import { prisma } from "./lib/prisma";

async function main() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        startsWith: "SERVICES_"
      }
    }
  });
  console.log("=== SERVICES SETTINGS IN DB ===");
  console.log(JSON.stringify(settings, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
