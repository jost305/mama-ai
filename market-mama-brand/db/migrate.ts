import { config } from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

config({
  path: ".env",
});

const runMigrate = async () => {
  const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.warn("⚠️  No database connection string found in environment - skipping migrations");
    process.exit(0);
  }

  try {
    const connection = postgres(connectionString, { max: 1 });
    const db = drizzle(connection);

    console.log("⏳ Running migrations...");
    const start = Date.now();

    // For now, migrations are manual SQL - Drizzle migrator not set up
    // Run: psql "$DATABASE_URL" -f db/migrations/0001_phase2_knowledge_graph.sql
    console.log("✅ Migrations ready (manual execution required)");

    const end = Date.now();
    console.log("Completed in", end - start, "ms");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration setup error:", err);
    process.exit(1);
  }
};

runMigrate();
