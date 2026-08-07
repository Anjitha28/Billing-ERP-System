import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


async function testAuth() {
  console.log("Listing all users...");
  const users = await prisma.user.findMany();
  for (const u of users) {
    console.log(u.email, u.role, u.isActive);
  }
}


testAuth()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
