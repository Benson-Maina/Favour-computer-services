import fs from "fs";
import pg from "pg";

const { Client } = pg;

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    })
);

const sql = fs.readFileSync("supabase/grants_fix.sql", "utf8");

async function main() {
  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  await client.query(sql);
  await client.end();
  console.log("Database grants applied successfully.");
}

main().catch((error) => {
  console.error("Failed to apply grants:", error.message);
  process.exit(1);
});
