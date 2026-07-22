import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  productCategory,
  product,
  market,
  marketSection,
  seller,
} from "./schema";

const client = postgres(process.env.DATABASE_URL || process.env.POSTGRES_URL || "");
const db = drizzle(client);

/**
 * Seed script to populate Phase 2 knowledge graph with test data
 * Run: npx ts-node db/seed.ts
 */

async function seed() {
  try {
    console.log("Starting database seed...");

    // Clear existing data
    // await db.delete(seller);
    // await db.delete(marketSection);
    // await db.delete(market);
    // await db.delete(product);
    // await db.delete(productCategory);

    // 1. Create product categories
    const categories = await db
      .insert(productCategory)
      .values([
        {
          name: "Electronics",
          slug: "electronics",
          description: "Electronics and gadgets",
        },
        {
          name: "Textiles",
          slug: "textiles",
          description: "Fabrics and clothing",
        },
        {
          name: "Agricultural",
          slug: "agricultural",
          description: "Farm products and crops",
        },
        {
          name: "Beverages",
          slug: "beverages",
          description: "Drinks and beverages",
        },
      ])
      .returning();

    console.log(`Created ${categories.length} product categories`);

    // 2. Create products
    const products = await db
      .insert(product)
      .values([
        {
          categoryId: categories[0].id,
          name: "Mobile Phone",
          nameEnglish: "Mobile Phone",
          nameLocalLanguages: {
            yoruba: "Eti Simu",
            hausa: "Waya na Wayar Sauti",
            igbo: "Ekwentị Ekpere",
            pidgin: "Fone",
          },
          sku: "MOBILE-001",
          description: "Smartphone device",
        },
        {
          categoryId: categories[2].id,
          name: "Rice",
          nameEnglish: "Rice",
          nameLocalLanguages: {
            yoruba: "Iresi",
            hausa: "Shinkafa",
            igbo: "Osikapa",
            pidgin: "Rai",
          },
          sku: "RICE-001",
          description: "White rice 50kg bag",
        },
        {
          categoryId: categories[1].id,
          name: "Cotton Fabric",
          nameEnglish: "Cotton Fabric",
          nameLocalLanguages: {
            yoruba: "Aro Konnu",
            hausa: "Kadi Auduga",
            igbo: "Akwa Konnu",
            pidgin: "Cloth",
          },
          sku: "FABRIC-001",
          description: "High quality cotton textile",
        },
      ])
      .returning();

    console.log(`Created ${products.length} products`);

    // 3. Create markets
    const markets = await db
      .insert(market)
      .values([
        {
          name: "Lagos Central Market",
          slug: "lagos-central",
          country: "Nigeria",
          city: "Lagos",
          region: "Lagos State",
          latitude: "6.5244",
          longitude: "3.3792",
          description: "Main commercial market in Lagos",
        },
        {
          name: "Accra Market",
          slug: "accra-market",
          country: "Ghana",
          city: "Accra",
          region: "Greater Accra",
          latitude: "5.5564",
          longitude: "-0.2084",
          description: "Central market in Accra",
        },
        {
          name: "Nairobi Market",
          slug: "nairobi-market",
          country: "Kenya",
          city: "Nairobi",
          region: "Nairobi County",
          latitude: "-1.2921",
          longitude: "36.8219",
          description: "Largest market in Nairobi",
        },
      ])
      .returning();

    console.log(`Created ${markets.length} markets`);

    // 4. Create market sections
    const sections = await db
      .insert(marketSection)
      .values([
        {
          marketId: markets[0].id,
          name: "Electronics Section",
          description: "Electronic devices and gadgets",
        },
        {
          marketId: markets[0].id,
          name: "Agricultural Section",
          description: "Farm produce and crops",
        },
        {
          marketId: markets[1].id,
          name: "Textiles Section",
          description: "Fabrics and clothing",
        },
      ])
      .returning();

    console.log(`Created ${sections.length} market sections`);

    // 5. Create sellers
    const sellers = await db
      .insert(seller)
      .values([
        {
          marketId: markets[0].id,
          marketSectionId: sections[0].id,
          name: "Abu Electronics",
          description: "Sells quality electronics",
          phone: "+234 8123456789",
          rating: "4.50",
          totalReviews: 127,
        },
        {
          marketId: markets[0].id,
          marketSectionId: sections[1].id,
          name: "Farmer's Cooperative",
          description: "Direct farm produce",
          phone: "+234 8198765432",
          rating: "4.80",
          totalReviews: 89,
        },
        {
          marketId: markets[1].id,
          marketSectionId: sections[2].id,
          name: "Kente Textiles",
          description: "Traditional and modern fabrics",
          phone: "+233 501234567",
          rating: "4.30",
          totalReviews: 156,
        },
      ])
      .returning();

    console.log(`Created ${sellers.length} sellers`);

    console.log("\nSeed completed successfully!");
    console.log(`Summary:
      - Categories: ${categories.length}
      - Products: ${products.length}
      - Markets: ${markets.length}
      - Market Sections: ${sections.length}
      - Sellers: ${sellers.length}
    `);
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  } finally {
    await client.end();
  }
}

seed();
