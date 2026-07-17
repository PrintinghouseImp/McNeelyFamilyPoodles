/**
 * Promote legacy free-text `genetics` into structured geneticsData JSON.
 * Safe to re-run (skips rows that already have geneticsData).
 */
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
  const parents = await client.query(
    `UPDATE "ParentDog"
     SET "geneticsData" = jsonb_build_object(
       'version', 1,
       'entries', jsonb_build_array(
         jsonb_build_object(
           'id', 'legacy-summary',
           'label', 'Genotype summary',
           'value', genetics,
           'source', 'legacy'
         )
       )
     ),
     "updatedAt" = NOW()
     WHERE genetics IS NOT NULL
       AND btrim(genetics) <> ''
       AND "geneticsData" IS NULL
     RETURNING slug, name`,
  );
  console.log(`Parents backfilled: ${parents.rowCount}`);
  for (const r of parents.rows) console.log(`  - ${r.name} (${r.slug})`);

  const puppies = await client.query(
    `UPDATE "Puppy"
     SET "geneticsData" = jsonb_build_object(
       'version', 1,
       'entries', jsonb_build_array(
         jsonb_build_object(
           'id', 'legacy-summary',
           'label', 'Genotype summary',
           'value', genetics,
           'source', 'legacy'
         )
       )
     ),
     "updatedAt" = NOW()
     WHERE genetics IS NOT NULL
       AND btrim(genetics) <> ''
       AND "geneticsData" IS NULL
     RETURNING slug, name`,
  );
  console.log(`Puppies backfilled: ${puppies.rowCount}`);
  for (const r of puppies.rows) console.log(`  - ${r.name} (${r.slug})`);
} finally {
  await client.end();
}
