import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_XGPvM1i2alzg@50.16.189.237:5432/neondb?sslmode=require&options=endpoint%3Dep-rapid-pond-avlt9dfu-pooler";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
