import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env" });

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

async function check() {
  const sql = postgres(connectionString, { ssl: "require" });
  try {
    const cards = await sql`SELECT COUNT(*) FROM knowledge_cards;`;
    const markets = await sql`SELECT COUNT(*) FROM "Market";`;
    const products = await sql`SELECT COUNT(*) FROM "Product";`;
    const users = await sql`SELECT COUNT(*) FROM "User";`;
    const extensions = await sql`SELECT extname FROM pg_extension WHERE extname IN ('vector', 'postgis', 'pg_trgm');`;

    console.log("==========================================");
    console.log(" SUPABASE DATABASE VERIFICATION REPORT");
    console.log("==========================================");
    console.log(` Active Extensions : ${extensions.map(e => e.extname).join(", ")}`);
    console.log(` Knowledge Cards   : ${cards[0].count} records`);
    console.log(` Markets           : ${markets[0].count} records`);
    console.log(` Products          : ${products[0].count} records`);
    console.log(` Users             : ${users[0].count} records`);
    console.log("==========================================");
  } catch (err) {
    console.error("Check error:", err);
  } finally {
    await sql.end();
  }
}

check();
