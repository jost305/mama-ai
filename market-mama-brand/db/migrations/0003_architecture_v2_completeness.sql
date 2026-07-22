-- Migration: 0003_architecture_v2_completeness.sql
-- Aligns database schema with MARKETMAMA COMMERCE INTELLIGENCE ARCHITECTURE v2.0

CREATE TABLE IF NOT EXISTS "State" (
    "code" varchar(10) PRIMARY KEY NOT NULL,
    "name" varchar(100) NOT NULL,
    "region" varchar(50),
    "population" integer
);

CREATE TABLE IF NOT EXISTS "Lga" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "stateCode" varchar(10) NOT NULL REFERENCES "State"("code"),
    "name" varchar(100) NOT NULL,
    "urbanRural" varchar(20)
);
CREATE INDEX IF NOT EXISTS "lga_state_idx" ON "Lga" ("stateCode");

CREATE TABLE IF NOT EXISTS "Manufacturer" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "country" varchar(100),
    "nafdacStatus" varchar(50) DEFAULT 'registered',
    "regulatoryFlags" json DEFAULT '[]'::json
);

CREATE TABLE IF NOT EXISTS "Brand" (
    "slug" varchar(255) PRIMARY KEY NOT NULL,
    "name" varchar(255) NOT NULL,
    "manufacturerId" uuid REFERENCES "Manufacturer"("id"),
    "originCountry" varchar(100),
    "category" varchar(100),
    "trustScore" numeric(3, 2) DEFAULT '0.80',
    "verified" boolean DEFAULT false,
    "knownFakes" json DEFAULT '[]'::json,
    "authenticitySignals" json DEFAULT '[]'::json
);
CREATE INDEX IF NOT EXISTS "brand_manufacturer_idx" ON "Brand" ("manufacturerId");

CREATE TABLE IF NOT EXISTS "SupplySignal" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "productId" uuid REFERENCES "Product"("id"),
    "marketId" uuid REFERENCES "Market"("id"),
    "signalType" varchar(50) NOT NULL,
    "cause" varchar(50),
    "severity" varchar(20) DEFAULT 'medium',
    "affectedStates" json DEFAULT '[]'::json,
    "agentId" uuid REFERENCES "AgentProfile"("id"),
    "reportedAt" timestamp DEFAULT now() NOT NULL,
    "notes" text
);
CREATE INDEX IF NOT EXISTS "supply_signal_product_idx" ON "SupplySignal" ("productId");
CREATE INDEX IF NOT EXISTS "supply_signal_market_idx" ON "SupplySignal" ("marketId");
CREATE INDEX IF NOT EXISTS "supply_signal_type_idx" ON "SupplySignal" ("signalType");

CREATE TABLE IF NOT EXISTS "DemandSignal" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "productId" uuid REFERENCES "Product"("id"),
    "area" varchar(100),
    "stateCode" varchar(10) REFERENCES "State"("code"),
    "signalType" varchar(50) NOT NULL,
    "volume" integer DEFAULT 1,
    "periodStart" timestamp DEFAULT now() NOT NULL,
    "periodEnd" timestamp,
    "source" varchar(50) DEFAULT 'mamaprice'
);
CREATE INDEX IF NOT EXISTS "demand_signal_product_idx" ON "DemandSignal" ("productId");
CREATE INDEX IF NOT EXISTS "demand_signal_state_idx" ON "DemandSignal" ("stateCode");

CREATE TABLE IF NOT EXISTS "Recipe" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "name" varchar(255) NOT NULL,
    "cuisineType" varchar(100),
    "mealType" varchar(50),
    "preparationTime" integer,
    "servings" integer,
    "description" text,
    "steps" json DEFAULT '[]'::json,
    "estimatedCost" json,
    "seasonalNotes" text,
    "regionalVariants" json,
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "RecipeIngredient" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "recipeId" uuid NOT NULL REFERENCES "Recipe"("id"),
    "productId" uuid REFERENCES "Product"("id"),
    "quantity" numeric(10, 2),
    "unit" varchar(50),
    "optional" boolean DEFAULT false,
    "substituteForProductId" uuid REFERENCES "Product"("id")
);
CREATE INDEX IF NOT EXISTS "ingredient_recipe_idx" ON "RecipeIngredient" ("recipeId");
CREATE INDEX IF NOT EXISTS "ingredient_product_idx" ON "RecipeIngredient" ("productId");

CREATE TABLE IF NOT EXISTS "ResearchReport" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "title" varchar(255) NOT NULL,
    "sourceOrg" varchar(100),
    "reportType" varchar(50),
    "datePublished" timestamp,
    "statesCovered" json DEFAULT '[]'::json,
    "productsCovered" json DEFAULT '[]'::json,
    "summary" text,
    "keyFindings" json DEFAULT '[]'::json,
    "pdfPath" varchar(500),
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "Receipt" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "imagePath" varchar(500) NOT NULL,
    "ocrRawText" text,
    "ocrConfidence" numeric(3, 2),
    "parsedItems" json DEFAULT '[]'::json,
    "marketIdDetected" uuid REFERENCES "Market"("id"),
    "receiptDate" timestamp,
    "totalAmount" numeric(12, 2),
    "currency" varchar(3) DEFAULT 'NGN',
    "agentId" uuid REFERENCES "AgentProfile"("id"),
    "processingStatus" varchar(50) DEFAULT 'raw',
    "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "PriceSnapshot" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "productId" uuid NOT NULL REFERENCES "Product"("id"),
    "marketId" uuid REFERENCES "Market"("id"),
    "stateCode" varchar(10) REFERENCES "State"("code"),
    "unit" varchar(50) NOT NULL,
    "avgPrice" numeric(12, 2) NOT NULL,
    "minPrice" numeric(12, 2),
    "maxPrice" numeric(12, 2),
    "sampleCount" integer DEFAULT 1,
    "weekStart" timestamp NOT NULL,
    "createdAt" timestamp DEFAULT now() NOT NULL
);
CREATE INDEX IF NOT EXISTS "snapshot_product_idx" ON "PriceSnapshot" ("productId");
CREATE INDEX IF NOT EXISTS "snapshot_market_idx" ON "PriceSnapshot" ("marketId");
CREATE INDEX IF NOT EXISTS "snapshot_week_idx" ON "PriceSnapshot" ("weekStart");
