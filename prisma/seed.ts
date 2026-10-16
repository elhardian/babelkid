import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, AuthPortal, UserRole } from "../src/generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "babelkid",
});

const prisma = new PrismaClient({ adapter });

const users = [
  {
    id: "t1",
    email: "maya@babelkids.id",
    name: "Maya Santoso",
    role: UserRole.owner,
    portal: AuthPortal.staff,
    password: "babelkids123",
    phone: "+62 812-1000-1001",
  },
  {
    id: "t2",
    email: "rina@babelkids.id",
    name: "Rina Wijaya",
    role: UserRole.admin,
    portal: AuthPortal.staff,
    password: "staff123",
    phone: "+62 812-1000-1002",
  },
  {
    id: "t3",
    email: "dewi@babelkids.id",
    name: "Dewi Kartika",
    role: UserRole.teacher,
    portal: AuthPortal.staff,
    password: "guru123",
    phone: "+62 812-1000-1003",
  },
  {
    id: "p-sari",
    email: "sari.rahman@email.com",
    name: "Sari Rahman",
    role: UserRole.parent,
    portal: AuthPortal.parent,
    password: "parent123",
    phone: "+62 812-2000-1001",
    childIds: ["s1", "s9"],
  },
  {
    id: "p-budi",
    email: "budi.rahman@email.com",
    name: "Budi Rahman",
    role: UserRole.parent,
    portal: AuthPortal.parent,
    password: "parent123",
    phone: "+62 812-2000-1002",
    childIds: ["s1", "s9"],
  },
] as const;

async function main() {
  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        portal: u.portal,
        phone: u.phone,
        passwordHash,
        childIds: "childIds" in u ? [...u.childIds] : undefined,
        active: true,
      },
      update: {
        name: u.name,
        role: u.role,
        portal: u.portal,
        phone: u.phone,
        passwordHash,
        childIds: "childIds" in u ? [...u.childIds] : undefined,
        active: true,
      },
    });
    console.log(`✓ ${u.portal} · ${u.email} / ${u.password}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
