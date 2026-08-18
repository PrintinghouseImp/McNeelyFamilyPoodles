import "dotenv/config";
import pg from "pg";

const cs = process.env.DATABASE_URL;
const isS = cs.includes("supabase.co");
const url = isS
  ? cs
      .replace(/([?&])sslmode=[^&]*/g, "$1")
      .replace(/[?&]$/, "")
      .replace(/\?&/, "?")
  : cs;
const c = new pg.Client({
  connectionString: url,
  ssl: isS ? { rejectUnauthorized: false } : undefined,
});
await c.connect();
const r = await c.query(
  `SELECT id, email, name, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC LIMIT 20`,
);
console.log(JSON.stringify(r.rows, null, 2));
const a = await c.query(
  `SELECT id, "userId", provider, "providerAccountId" FROM "Account" LIMIT 20`,
);
console.log("accounts", JSON.stringify(a.rows, null, 2));
await c.end();
