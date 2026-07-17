/**
 * Verify admin credentials against DB + Auth.js authorize logic.
 * Usage: node scripts/verify-admin-login.mjs [password]
 * Default password from ADMIN_PASSWORD env or argv.
 */
import "dotenv/config";
import { compare } from "bcryptjs";
import pg from "pg";

const password = process.argv[2] || process.env.ADMIN_PASSWORD;
if (!password) {
  console.error("Provide password as argv or ADMIN_PASSWORD env");
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
  // Mirror auth.ts: username must be "admin"; first ADMIN user by createdAt
  const username = "admin";
  if (username !== "admin") {
    throw new Error("username gate failed");
  }

  const found = await client.query(
    `SELECT id, email, name, role, "passwordHash" FROM "User" WHERE role = 'ADMIN' ORDER BY "createdAt" ASC LIMIT 1`,
  );
  const user = found.rows[0];
  if (!user?.passwordHash) {
    console.log(JSON.stringify({ ok: false, reason: "no admin user or hash" }));
    process.exit(1);
  }

  const valid = await compare(password, user.passwordHash);
  console.log(
    JSON.stringify(
      {
        ok: valid,
        username: "admin",
        email: user.email,
        name: user.name,
        role: user.role,
        passwordMatches: valid,
      },
      null,
      2,
    ),
  );
  process.exit(valid ? 0 : 1);
} finally {
  await client.end();
}
