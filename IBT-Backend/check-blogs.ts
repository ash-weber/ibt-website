import { prisma } from './src/lib/prisma';

async function main() {
  try {
    const blog = await prisma.blog.findFirst({
      where: { slug: 'demo3' }
    });
    console.log(JSON.stringify(blog, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
