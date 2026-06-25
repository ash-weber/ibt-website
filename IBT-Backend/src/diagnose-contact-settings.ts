import { prisma } from "./lib/prisma";
import { settingSchemas } from "./validators/setting.validator";

async function main() {
  const settings = await prisma.setting.findMany({
    where: {
      key: {
        contains: "contact",
      },
    },
  });

  console.log("Checking database values against settingSchemas:");
  for (const item of settings) {
    const schema = settingSchemas[item.key];
    if (!schema) {
      console.log(`⚠️ No schema found for key: ${item.key}`);
      continue;
    }
    const result = schema.safeParse(item.value);
    if (!result.success) {
      console.log(`❌ Key: ${item.key}`);
      console.log(`   Value: ${JSON.stringify(item.value)}`);
      console.log(`   Error:`, result.error.flatten().formErrors);
    } else {
      console.log(`✅ Key: ${item.key} is valid`);
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
