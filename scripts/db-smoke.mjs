import "dotenv/config";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Strip sslmode from URI so node-pg does not force verify-full (breaks Supabase).
const cleanUrl = connectionString
  .replace(/([?&])sslmode=[^&]*/g, "$1")
  .replace(/[?&]$/, "")
  .replace(/\?&/, "?");

const client = new pg.Client({
  connectionString: cleanUrl,
  ssl: connectionString.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : undefined,
});

await client.connect();

const tables = [
  "User",
  "ParentDog",
  "Litter",
  "Puppy",
  "Article",
  "SiteSetting",
];

console.log("=== McNeely Family Poodles DB smoke check ===\n");

for (const table of tables) {
  const count = await client.query(`SELECT COUNT(*)::int AS n FROM "${table}"`);
  console.log(`${table.padEnd(14)} ${count.rows[0].n} row(s)`);
}

console.log("\n--- Admin users ---");
const users = await client.query(
  `SELECT email, role, name FROM "User" ORDER BY role, email`,
);
for (const row of users.rows) {
  console.log(`  ${row.role}: ${row.email} (${row.name ?? "—"})`);
}

console.log("\n--- Parents ---");
const parents = await client.query(
  `SELECT name, sex, color, "isRetired" FROM "ParentDog" ORDER BY "sortOrder"`,
);
for (const row of parents.rows) {
  console.log(
    `  ${row.name} · ${row.sex} · ${row.color ?? "—"} · retired=${row.isRetired}`,
  );
}

console.log("\n--- Litters ---");
const litters = await client.query(
  `SELECT l.name, l."birthDate", d.name AS dam, s.name AS sire
   FROM "Litter" l
   JOIN "ParentDog" d ON d.id = l."damId"
   JOIN "ParentDog" s ON s.id = l."sireId"`,
);
for (const row of litters.rows) {
  console.log(
    `  ${row.name} · born ${row.birthDate.toISOString().slice(0, 10)} · dam=${row.dam} · sire=${row.sire}`,
  );
}

console.log("\n--- Puppies ---");
const puppies = await client.query(
  `SELECT name, sex, color, status, "priceCents" FROM "Puppy"`,
);
for (const row of puppies.rows) {
  const price =
    row.priceCents != null ? `$${(row.priceCents / 100).toFixed(0)}` : "—";
  console.log(
    `  ${row.name} · ${row.sex} · ${row.color ?? "—"} · ${row.status} · ${price}`,
  );
}

console.log("\n--- Articles ---");
const articles = await client.query(
  `SELECT title, "isPublished" FROM "Article"`,
);
for (const row of articles.rows) {
  console.log(`  ${row.title} · published=${row.isPublished}`);
}

await client.end();
console.log("\nDone.");
