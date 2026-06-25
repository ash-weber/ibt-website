import { prisma } from "../src/lib/prisma";
import { BlogStatus } from "../generated/prisma/client";

async function main() {
  const blogs = [
    {
      title: "The Future of Web Development: 2024 Trends",
      slug: "future-of-web-development-2024",
      content: "Explore the cutting-edge technologies shaping the web this year, from AI-integrated components to the rise of serverless architectures and performance-first frameworks. The landscape of web development is evolving faster than ever, with tools like Next.js and Tailwind CSS leading the charge in developer experience and performance.",
      category: "Web Development",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Mastering React Hooks",
      slug: "mastering-react-hooks",
      content: "A deep dive into advanced patterns for using useEffect and custom hooks to build scalable applications. Hooks have revolutionized how we manage state and side effects in React, but they come with their own set of pitfalls if not understood correctly.",
      category: "Web Development",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Ethics in Modern AI",
      slug: "ethics-in-modern-ai",
      content: "As artificial intelligence becomes more integrated into our daily lives, the conversation around ethics, bias, and transparency has never been more important. We explore the challenges of building responsible AI systems that benefit everyone.",
      category: "AI & ML",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "The IBT Internship Journey",
      slug: "ibt-internship-journey",
      content: "Hear from our latest batch of interns about their experiences working on real-world projects and learning from industry experts. At I-BACUS-TECH, we believe in empowering the next generation of engineers through hands-on mentorship.",
      category: "Internship",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Building Scalable Cloud Architectures",
      slug: "building-scalable-cloud-architectures",
      content: "Scaling an application to millions of users requires a robust cloud strategy. In this article, we discuss the best practices for leveraging AWS and Azure to build resilient systems that can handle any load.",
      category: "Cloud Computing",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Why Cyber Security is Non-Negotiable",
      slug: "cyber-security-non-negotiable",
      content: "Data breaches can be catastrophic for businesses. We outline the essential security protocols every development team should implement to protect user data and maintain trust.",
      category: "Security",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "The Rise of Edge Computing",
      slug: "rise-of-edge-computing",
      content: "Edge computing is bringing processing closer to the data source, reducing latency and improving real-time performance. Learn how this technology is transforming industries from manufacturing to healthcare.",
      category: "Technology",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Introduction to Web3 and Decentralization",
      slug: "intro-to-web3-decentralization",
      content: "Web3 is the next evolution of the internet, powered by blockchain technology. We explore the concepts of decentralization, smart contracts, and how they could reshape the digital economy.",
      category: "Blockchain",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Designing for Accessibility: A Guide",
      slug: "designing-for-accessibility-guide",
      content: "Inclusion in design is not just a trend, it's a necessity. This guide covers the essential principles of web accessibility, ensuring your digital products are usable by everyone.",
      category: "Design",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "The Power of Serverless Functions",
      slug: "power-of-serverless-functions",
      content: "Serverless architecture allows developers to focus on code without worrying about infrastructure. We look at the benefits of using AWS Lambda and Vercel Functions for modern web apps.",
      category: "Cloud Computing",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Machine Learning in Customer Service",
      slug: "ml-in-customer-service",
      content: "AI-powered chatbots and sentiment analysis are transforming customer support. Discover how machine learning can improve response times and customer satisfaction.",
      category: "AI & ML",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Modern DevOps Practices for 2024",
      slug: "modern-devops-practices-2024",
      content: "CI/CD, Infrastructure as Code, and automated testing are the pillars of modern DevOps. Learn how to streamline your development lifecycle for faster, more reliable deployments.",
      category: "Engineering",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
    {
      title: "Exploring the World of Digital Twins",
      slug: "exploring-digital-twins",
      content: "Digital twins are virtual representations of physical objects or systems. We explore how they are used in urban planning, manufacturing, and healthcare to simulate and optimize real-world performance.",
      category: "Technology",
      status: BlogStatus.PUBLISHED,
      featured: true,
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },

  ];

  console.log("🌱 Seeding sample blogs...");

  for (const blog of blogs) {
    await prisma.blog.upsert({
      where: { slug: blog.slug },
      update: blog,
      create: blog,
    });
  }

  console.log(`✅ Successfully seeded ${blogs.length} sample blogs.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
