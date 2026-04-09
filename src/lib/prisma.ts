import { PrismaClient } from "@prisma/client";

// In development, Next.js hot-reload creates new module instances.
// Attach a single PrismaClient to the global object to avoid exhausting
// the database connection pool.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
