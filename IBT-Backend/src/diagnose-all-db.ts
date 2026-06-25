import { prisma } from "./lib/prisma";
import { settingSchemas } from "./validators/setting.validator";

async function main() {
  const dbSettings = await prisma.setting.findMany();
  console.log("Checking ALL DB keys against settingSchemas:");
  for (const item of dbSettings) {
    const schema = settingSchemas[item.key];
    if (!schema) {
      console.log(`⚠️ No schema for key: ${item.key}`);
      continue;
    }
    const result = schema.safeParse(item.value);
    if (!result.success) {
      console.log(`❌ INVALID: ${item.key}`);
      console.log(`   Value: ${JSON.stringify(item.value)}`);
      console.log(`   Error:`, result.error.issues.map(i => i.message));
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
