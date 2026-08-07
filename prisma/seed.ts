import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.SEED_ADMIN_PASSWORD || "admin123";

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: "System Administrator",
        email: email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log(`Seeded admin user with email: ${email}`);
  } else {
    console.log("Admin user already exists. Skipping admin seed.");
  }

  const userEmail = "user@example.com";
  const userPassword = "user123";

  const existingUser = await prisma.user.findFirst({
    where: { email: userEmail },
  });

  if (!existingUser) {
    const hashedUserPassword = await bcrypt.hash(userPassword, 10);

    await prisma.user.create({
      data: {
        name: "Standard User",
        email: userEmail,
        password: hashedUserPassword,
        role: "USER",
      },
    });
    console.log(`Seeded standard user with email: ${userEmail}`);
  } else {
    console.log("Standard user already exists. Skipping user seed.");
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
