import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  const database = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
  if (!database) {
    throw new Error("DATABASE_URL is missing a database name");
  }
  return {
    host: parsed.hostname || "127.0.0.1",
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username || "root"),
    password: decodeURIComponent(parsed.password || ""),
    database,
  };
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }

  const conn = parseDatabaseUrl(url);
  // Prefer TCP over unix socket when host is "localhost"
  const host = conn.host === "localhost" ? "127.0.0.1" : conn.host;

  const adapter = new PrismaMariaDb({
    host,
    port: conn.port,
    user: conn.user,
    password: conn.password,
    database: conn.database,
    connectionLimit: Number(process.env.DATABASE_POOL_SIZE ?? 10),
    acquireTimeout: 20_000,
    connectTimeout: 10_000,
    allowPublicKeyRetrieval: true,
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache across HMR (dev) and accidental re-imports (prod / PM2)
globalForPrisma.prisma = prisma;
