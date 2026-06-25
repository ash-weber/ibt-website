import { prisma } from './src/lib/prisma';

async function main() {
  const settings = await prisma.setting.findMany();
  console.log("All Settings Keys:");
  settings.forEach(s => console.log(s.key));
  
  const siteSettings = settings.find(s => s.key === 'global_settings' || s.key === 'site_settings' || s.key === 'contactBranches');
  if (siteSettings) {
    console.log("Found site settings:");
    console.log(JSON.stringify(siteSettings.value, null, 2));
  }
}

main().finally(() => prisma.$disconnect());
