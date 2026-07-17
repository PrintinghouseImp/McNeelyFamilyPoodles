/** Print row counts for key content tables. */
import "dotenv/config";
import pg from "pg";

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
  const tables = [
    "User",
    "ParentDog",
    "Litter",
    "Puppy",
    "Photo",
    "MedicalRecord",
    "Application",
    "DepositRequest",
    "Article",
    "ForeverHome",
    "ShopItem",
    "SocialPost",
    "DogOwnership",
    "SiteSetting",
  ];
  for (const t of tables) {
    const r = await client.query(`SELECT count(*)::int AS n FROM "${t}"`);
    console.log(`${t.padEnd(18)} ${r.rows[0].n}`);
  }
} finally {
  await client.end();
}
