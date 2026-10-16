import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient, AuthPortal, UserRole } from "../src/generated/prisma/client";
import { rosterStaffSeed } from "../src/lib/seed/roster";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? "root",
  password: process.env.DATABASE_PASSWORD ?? "",
  database: process.env.DATABASE_NAME ?? "babelkid",
});

const prisma = new PrismaClient({ adapter });

const roleMap: Record<string, UserRole> = {
  owner: UserRole.owner,
  admin: UserRole.admin,
  teacher: UserRole.teacher,
  parent: UserRole.parent,
};

const portalMap: Record<string, AuthPortal> = {
  staff: AuthPortal.staff,
  parent: AuthPortal.parent,
};

async function main() {
  // Full replace so staff/parent ids stay aligned with the roster
  await prisma.user.deleteMany({});
  console.log("– cleared users table");

  for (const u of rosterStaffSeed) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    const childIds =
      "childIds" in u && Array.isArray(u.childIds) ? [...u.childIds] : undefined;

    await prisma.user.create({
      data: {
        id: u.id,
        email: u.email,
        name: u.name,
        role: roleMap[u.role],
        portal: portalMap[u.portal],
        phone: u.phone,
        passwordHash,
        childIds,
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
