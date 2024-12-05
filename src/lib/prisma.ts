import { PrismaClient } from "@prisma/client";

// In development, don't try to reuse connections
const prisma = new PrismaClient({
  log: ["error", "warn"],
  datasourceUrl: process.env.DATABASE_URL,
});

export default prisma;
