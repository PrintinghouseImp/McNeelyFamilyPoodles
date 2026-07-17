/**
 * Update the first ADMIN user's password in the database.
 * Usage: node scripts/set-admin-password.mjs "your-new-password"
 *
 * Does not print the password. Uses DATABASE_URL from .env.
 */
import "dotenv/config";
import { hash } from "bcryptjs";
import pg from "pg";

const password = process.argv[2];
if (!password || password.length < 8) {
  console.error('Usage: node scripts/set-admin-password.mjs "your-new-password"');
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const isSupabase = connectionString.includes("supabase.co");
const url = isSupabase
  ? connectionString
      .replace(/([?&])sslmode=[^&]*/g, "$1")
      .replace(/[?&]$/, "")
      .replace(/\?&/, "?")
  : connectionString;

const client = new pg.Client({
  connectionString: url,
  ssl: isSupabase ? { rejectUnauthorized: false } : undefined,
});

await client.connect();

try {
  const passwordHash = await hash(password, 12);
  const found = await client.query(
    `SELECT id, email FROM "User" WHERE role = 'ADMIN' ORDER BY "createdAt" ASC LIMIT 1`,
  );
  if (!found.rows[0]) {
    throw new Error("No ADMIN user found — run npm run db:seed first");
  }

  await client.query(`UPDATE "User" SET "passwordHash" = $1, "updatedAt" = NOW() WHERE id = $2`, [
    passwordHash,
    found.rows[0].id,
  ]);

  console.log("Admin password updated.");
  console.log("Email:", found.rows[0].email);
  console.log("Login username: admin");
} finally {
  await client.end();
}
