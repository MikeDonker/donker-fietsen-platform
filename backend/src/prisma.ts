import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function initSqlitePragmas(client: PrismaClient) {
  const pragmas = [
    "PRAGMA journal_mode = WAL;",
    "PRAGMA foreign_keys = ON;",
    "PRAGMA busy_timeout = 10000;",
    "PRAGMA synchronous = NORMAL;",
  ];

  for (const pragma of pragmas) {
    try {
      await client.$queryRawUnsafe(pragma);
    } catch (error) {
      console.error(`[Prisma] Failed to execute ${pragma}`, error);
    }
  }
  console.log("[Prisma] SQLite pragmas initialized");
}

/** Awaitable promise that resolves once pragmas are applied. */
export const prismaReady = initSqlitePragmas(prisma);

export { prisma };
