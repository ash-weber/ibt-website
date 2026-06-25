const { PrismaClient } = require('./generated/prisma'); 
const prisma = new PrismaClient(); 
prisma.setting.findUnique({ where: { key: 'SERVICES_WHY_ITEMS' } })
  .then(res => { console.log(JSON.stringify(res, null, 2)); prisma.$disconnect(); })
  .catch(e => { console.error(e); prisma.$disconnect(); });
