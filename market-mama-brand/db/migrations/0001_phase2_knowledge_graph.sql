-- Phase 2: Knowledge Graph Tables Migration
-- Creates tables for products, markets, sellers, and price data

-- Product Categories
CREATE TABLE IF NOT EXISTS "ProductCategory" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  "parentCategoryId" UUID REFERENCES "ProductCategory"(id),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS category_parent_idx ON "ProductCategory"("parentCategoryId");
CREATE INDEX IF NOT EXISTS category_slug_idx ON "ProductCategory"(slug);

-- Products with multi-language support
CREATE TABLE IF NOT EXISTS "Product" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "categoryId" UUID NOT NULL REFERENCES "ProductCategory"(id),
  name VARCHAR(255) NOT NULL,
  "nameEnglish" VARCHAR(255) NOT NULL,
  "nameLocalLanguages" JSONB NOT NULL DEFAULT '{"yoruba": "", "hausa": "", "igbo": "", "pidgin": ""}',
  description TEXT,
  sku VARCHAR(128) UNIQUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS product_category_idx ON "Product"("categoryId");
CREATE INDEX IF NOT EXISTS product_name_idx ON "Product"(name);
CREATE INDEX IF NOT EXISTS product_sku_idx ON "Product"(sku);

-- Product Aliases (synonyms across languages)
CREATE TABLE IF NOT EXISTS "ProductAlias" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id),
  "aliasName" VARCHAR(255) NOT NULL,
  language VARCHAR(10) NOT NULL,
  confidence DECIMAL(3, 2) DEFAULT '1.00',
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alias_product_idx ON "ProductAlias"("productId");
CREATE INDEX IF NOT EXISTS alias_name_idx ON "ProductAlias"("aliasName");

-- Markets/Locations
CREATE TABLE IF NOT EXISTS "Market" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS market_country_idx ON "Market"(country);
CREATE INDEX IF NOT EXISTS market_city_idx ON "Market"(city);
CREATE INDEX IF NOT EXISTS market_slug_idx ON "Market"(slug);
CREATE INDEX IF NOT EXISTS market_country_city_idx ON "Market"(country, city);

-- Market Sections
CREATE TABLE IF NOT EXISTS "MarketSection" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "marketId" UUID NOT NULL REFERENCES "Market"(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS section_market_idx ON "MarketSection"("marketId");

-- Sellers
CREATE TABLE IF NOT EXISTS "Seller" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "marketId" UUID NOT NULL REFERENCES "Market"(id),
  "marketSectionId" UUID REFERENCES "MarketSection"(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phone VARCHAR(20),
  rating DECIMAL(3, 2),
  "totalReviews" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS seller_market_idx ON "Seller"("marketId");
CREATE INDEX IF NOT EXISTS seller_section_idx ON "Seller"("marketSectionId");
CREATE INDEX IF NOT EXISTS seller_name_idx ON "Seller"(name);

-- Price Reports from Scouts
CREATE TABLE IF NOT EXISTS "PriceReport" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "productId" UUID NOT NULL REFERENCES "Product"(id),
  "sellerId" UUID NOT NULL REFERENCES "Seller"(id),
  "marketId" UUID NOT NULL REFERENCES "Market"(id),
  price DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  quantity VARCHAR(100),
  "reportedBy" VARCHAR(255),
  "photoUrl" VARCHAR(500),
  "gpsCoordinates" JSONB,
  notes TEXT,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS price_product_idx ON "PriceReport"("productId");
CREATE INDEX IF NOT EXISTS price_seller_idx ON "PriceReport"("sellerId");
CREATE INDEX IF NOT EXISTS price_market_idx ON "PriceReport"("marketId");
CREATE INDEX IF NOT EXISTS price_created_idx ON "PriceReport"("createdAt");
CREATE INDEX IF NOT EXISTS price_product_market_idx ON "PriceReport"("productId", "marketId");

-- Daily Price Rollups (materialized view for performance)
CREATE TABLE IF NOT EXISTS "DailyPriceRollup" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date VARCHAR(10) NOT NULL,
  "productId" UUID NOT NULL REFERENCES "Product"(id),
  "marketId" UUID NOT NULL REFERENCES "Market"(id),
  "avgPrice" DECIMAL(12, 2),
  "minPrice" DECIMAL(12, 2),
  "maxPrice" DECIMAL(12, 2),
  "reportCount" INTEGER DEFAULT 0,
  currency VARCHAR(3) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS rollup_date_idx ON "DailyPriceRollup"(date);
CREATE INDEX IF NOT EXISTS rollup_product_idx ON "DailyPriceRollup"("productId");
CREATE INDEX IF NOT EXISTS rollup_market_idx ON "DailyPriceRollup"("marketId");
CREATE INDEX IF NOT EXISTS rollup_date_product_market_idx ON "DailyPriceRollup"(date, "productId", "marketId");
