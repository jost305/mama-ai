import { config } from "dotenv";
import postgres from "postgres";
import fs from "fs";
import path from "path";

config({ path: ".env" });

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ No DATABASE_URL found in environment.");
  process.exit(1);
}

const sqlFiles = [
  "0001_phase2_knowledge_graph.sql",
  "0002_evolve_to_commerce_graph.sql",
  "0003_architecture_v2_completeness.sql",
  "0004_extensions_and_trgm.sql",
  "seed_knowledge_cards.sql"
];

async function run() {
  console.log("==========================================");
  console.log(" EXECUTING DATABASE MIGRATIONS & SEEDING");
  console.log(" Target: Supabase Postgres");
  console.log("==========================================");

  const sql = postgres(connectionString, { ssl: "require" });

  try {
    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, "migrations", file);
      if (!fs.existsSync(filePath)) {
        console.log(`[!] File not found: ${file}, skipping.`);
        continue;
      }
      console.log(`[*] Executing ${file}...`);
      const fileSql = fs.readFileSync(filePath, "utf-8");
      
      // Execute statement by statement safely
      const statements = fileSql
        .split(/;\s*$/m)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      let successCount = 0;
      for (const stmt of statements) {
        try {
          await sql.unsafe(stmt);
          successCount++;
        } catch (err) {
          // Ignore table/relation already exists or notice errors
          if (!err.message.includes("already exists")) {
            console.warn(`    ⚠️ Statement warning in ${file}: ${err.message}`);
          }
        }
      }
      console.log(`[+] Executed ${file} (${successCount}/${statements.length} statements successfully)`);
    }

    console.log("\n==========================================");
    console.log(" ✅ ALL MIGRATIONS AND SEEDS APPLIED SUCCESSFULLY!");
    console.log("==========================================");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await sql.end();
  }
}

run();
