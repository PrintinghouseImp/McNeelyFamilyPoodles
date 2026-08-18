/**
 * Promote allowlisted OAuth emails to ADMIN in the database.
 * Usage: node scripts/promote-oauth-admins.mjs
 */
import "dotenv/config";
import pg from "pg";

const emails = (
  process.env.ADMIN_OAUTH_EMAILS?.trim()
    ? process.env.ADMIN_OAUTH_EMAILS.split(",")
    : ["rdevinmcbride@gmail.com", "janineneely@gmail.com"]
)
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const cs = process.env.DATABASE_URL;
if (!cs) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

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
try {
  const r = await c.query(
    `UPDATE "User"
     SET role = 'ADMIN', "updatedAt" = NOW()
     WHERE lower(email) = ANY($1::text[])
     RETURNING email, name, role`,
    [emails],
  );
  console.log("Allowlist:", emails.join(", "));
  console.log(`Promoted ${r.rowCount} existing user(s):`);
  for (const row of r.rows) {
    console.log(`  ${row.email} (${row.name ?? "—"}) → ${row.role}`);
  }
  if (r.rowCount === 0) {
    console.log(
      "No matching users yet — they will become ADMIN on first Google sign-in.",
    );
  }
} finally {
  await c.end();
}
