import pg from "pg";

const adminUrl =
  process.env.ADMIN_DATABASE_URL ??
  "postgres://postgres:postgres@localhost:51218/template1?sslmode=disable";
const dbName = process.env.DB_NAME ?? "mcneely_family_poodles";

const client = new pg.Client({ connectionString: adminUrl });
await client.connect();

const existing = await client.query(
  "SELECT 1 FROM pg_database WHERE datname = $1",
  [dbName],
);

if (existing.rowCount === 0) {
  await client.query(`CREATE DATABASE "${dbName}"`);
  console.log(`Created database ${dbName}`);
} else {
  console.log(`Database ${dbName} already exists`);
}

await client.end();
