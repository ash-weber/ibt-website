import { Role } from "../generated/prisma/client";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

async function main() {
  const email = "admin@gmail.com";
  const password = "admin@123";

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log("⚠️ Admin user already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: "Admin",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("✅ Admin user created:");
  console.log({
    email: admin.email,
    password, // only for dev visibility
  });
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });