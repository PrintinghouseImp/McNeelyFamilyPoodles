import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

/**
 * Supabase (and most managed Postgres) use TLS. Recent `pg` builds treat
 * `sslmode=require` in the URI as verify-full, which fails on the pooler chain.
 * Strip sslmode and set rejectUnauthorized: false for Supabase hosts.
 */
function createPool(connectionString: string) {
  const isSupabase = connectionString.includes("supabase.co");
  const url = isSupabase
    ? connectionString
        .replace(/([?&])sslmode=[^&]*/g, "$1")
        .replace(/[?&]$/, "")
        .replace(/\?&/, "?")
    : connectionString;

  return new Pool({
    connectionString: url,
    ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
    // Serverless: keep pool small; Netlify reuses warm isolates
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
  });
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = globalForPrisma.pgPool ?? createPool(connectionString);
  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

// Reuse client across warm serverless invocations (Netlify / Node)
globalForPrisma.prisma = db;
