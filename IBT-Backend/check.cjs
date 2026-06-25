const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.setting.findMany({ where: { key: { in: ['labs_initiatives', 'labs_rigor_title', 'labs_hero_title'] } } })
  .then(s => console.log(s))
  .catch(console.error)
  .finally(() => prisma.$disconnect());
