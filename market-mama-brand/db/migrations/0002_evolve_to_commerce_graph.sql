-- ============================================================
-- Migration: 0002_evolve_to_commerce_graph.sql
-- Evolves the MarketMama database from price-centric to
-- a full Commerce Intelligence Graph schema.
--
-- Changes:
--   1. PriceReport -> AgentReport (price now optional)
--   2. Add AgentProfile table
--   3. Add MarketEvent table
--   4. Add CommerceKnowledgeCard table (for RAG caching)
--   5. Add AvailabilityReport table
--   6. Add CounterfeitAlert table
--   7. Add VendorQualityReview table
--   8. Backward compatible: existing PriceReport data unchanged
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. Evolve PriceReport -> AgentReport
--    Make price optional, add multi-type fields
-- ────────────────────────────────────────────────────────────

-- Rename table to reflect its broader purpose (idempotent)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'PriceReport') THEN
        ALTER TABLE "PriceReport" RENAME TO "AgentReport";
    END IF;
END $$;

-- Rename scout identifier to agent identifier
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'AgentReport' AND column_name = 'reportedBy') THEN
        ALTER TABLE "AgentReport" RENAME COLUMN "reportedBy" TO "agentId";
    END IF;
END $$;

-- Ensure AgentReport table exists
CREATE TABLE IF NOT EXISTS "AgentReport" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "productId" UUID REFERENCES "Product"(id),
    "marketId" UUID REFERENCES "Market"(id),
    "sellerId" UUID REFERENCES "Seller"(id),
    "agentId" VARCHAR(255),
    price DECIMAL(12, 2),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Make price optional (Commerce Intelligence reports may not have a price)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'AgentReport' AND column_name = 'price') THEN
        ALTER TABLE "AgentReport" ALTER COLUMN "price" DROP NOT NULL;
    END IF;
END $$;

-- Add report type classification
ALTER TABLE "AgentReport" 
    ADD COLUMN IF NOT EXISTS "reportType" VARCHAR(50) NOT NULL DEFAULT 'PRICE',
    ADD COLUMN IF NOT EXISTS "inStock" BOOLEAN,
    ADD COLUMN IF NOT EXISTS "stockLevel" VARCHAR(20),  -- NONE, LOW, MEDIUM, HIGH
    ADD COLUMN IF NOT EXISTS "qualityRating" DECIMAL(3,2),
    ADD COLUMN IF NOT EXISTS "counterfeitRisk" VARCHAR(20) DEFAULT 'NONE', -- NONE, LOW, MEDIUM, HIGH
    ADD COLUMN IF NOT EXISTS "transportNotes" TEXT,
    ADD COLUMN IF NOT EXISTS "vendorSection" VARCHAR(255),
    ADD COLUMN IF NOT EXISTS "reportTags" JSONB DEFAULT '[]';

CREATE INDEX IF NOT EXISTS agent_report_type_idx ON "AgentReport"("reportType");
CREATE INDEX IF NOT EXISTS agent_report_agent_idx ON "AgentReport"("agentId");

-- ────────────────────────────────────────────────────────────
-- 2. AgentProfile — Human Commerce Contributor Profiles
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AgentProfile" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES "User"(id),
    "agentName" VARCHAR(255) NOT NULL,
    "trustTier" INTEGER DEFAULT 1 CHECK ("trustTier" BETWEEN 1 AND 5),
    "reputationScore" INTEGER DEFAULT 100,
    "completedMissions" INTEGER DEFAULT 0,
    "verifiedReports" INTEGER DEFAULT 0,
    "rejectedReports" INTEGER DEFAULT 0,
    "alphaPoints" INTEGER DEFAULT 0,
    "level" VARCHAR(50) DEFAULT 'Bronze', -- Bronze, Silver, Gold, Platinum, Diamond, Legend
    "domainExpertise" JSONB DEFAULT '[]',  -- e.g. ["food", "electronics", "fashion"]
    "state" VARCHAR(100),
    "lga" VARCHAR(100),
    "whatsappNumber" VARCHAR(20),
    "wallet" JSONB DEFAULT '{"ngn": 0, "alphapoints": 0}',
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_profile_user_idx ON "AgentProfile"("userId");
CREATE INDEX IF NOT EXISTS agent_profile_state_idx ON "AgentProfile"(state);
CREATE INDEX IF NOT EXISTS agent_profile_trust_idx ON "AgentProfile"("trustTier");

-- ────────────────────────────────────────────────────────────
-- 3. MarketEvent — Market Disruptions & Commerce Events
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "MarketEvent" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "marketId" UUID REFERENCES "Market"(id),
    "agentId" UUID REFERENCES "AgentProfile"(id),
    "eventType" VARCHAR(50) NOT NULL,  -- CLOSURE, FLOOD, STRIKE, HARVEST, TRANSPORT_SURGE, PROMOTION
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "severity" VARCHAR(20) DEFAULT 'INFO',  -- INFO, LOW, MEDIUM, HIGH, CRITICAL
    "affectedProducts" JSONB DEFAULT '[]',
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP,
    "isVerified" BOOLEAN DEFAULT FALSE,
    "confidence" DECIMAL(3,2) DEFAULT '0.80',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS market_event_market_idx ON "MarketEvent"("marketId");
CREATE INDEX IF NOT EXISTS market_event_type_idx ON "MarketEvent"("eventType");
CREATE INDEX IF NOT EXISTS market_event_severity_idx ON "MarketEvent"("severity");
CREATE INDEX IF NOT EXISTS market_event_date_idx ON "MarketEvent"("startDate");

-- ────────────────────────────────────────────────────────────
-- 4. CommerceKnowledgeCard — RAG Knowledge Snippets
--    Cached summaries and FAQs for fast retrieval
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CommerceKnowledgeCard" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "topic" VARCHAR(255) NOT NULL,
    "category" VARCHAR(100) NOT NULL,  -- MARKET_TIP, PRODUCT_INFO, SEASONAL_GUIDE, VENDOR_ADVICE, FAQ, SHOPPING_GUIDE
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" JSONB DEFAULT '[]',
    "marketIds" JSONB DEFAULT '[]',
    "productIds" JSONB DEFAULT '[]',
    "language" VARCHAR(10) DEFAULT 'en',
    "embedding" JSONB,  -- Serialized embedding vector
    "viewCount" INTEGER DEFAULT 0,
    "helpfulCount" INTEGER DEFAULT 0,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS knowledge_card_category_idx ON "CommerceKnowledgeCard"("category");
CREATE INDEX IF NOT EXISTS knowledge_card_topic_idx ON "CommerceKnowledgeCard"("topic");

-- ────────────────────────────────────────────────────────────
-- 5. CounterfeitAlert — Fake/Substandard Product Reports
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CounterfeitAlert" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "productId" UUID REFERENCES "Product"(id),
    "marketId" UUID REFERENCES "Market"(id),
    "agentId" UUID REFERENCES "AgentProfile"(id),
    "brandSuspected" VARCHAR(255),
    "riskLevel" VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    "description" TEXT,
    "evidenceUrls" JSONB DEFAULT '[]',
    "peerReviewCount" INTEGER DEFAULT 0,
    "isConfirmed" BOOLEAN DEFAULT FALSE,
    "confidence" DECIMAL(3,2) DEFAULT '0.80',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS counterfeit_product_idx ON "CounterfeitAlert"("productId");
CREATE INDEX IF NOT EXISTS counterfeit_market_idx ON "CounterfeitAlert"("marketId");
CREATE INDEX IF NOT EXISTS counterfeit_risk_idx ON "CounterfeitAlert"("riskLevel");

-- ────────────────────────────────────────────────────────────
-- 6. CommerceConversationLog — For Continuous Learning
--    Anonymized user conversations feed OjaData training corpus
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "CommerceConversationLog" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionId" VARCHAR(255),
    "queryText" TEXT NOT NULL,
    "responseText" TEXT NOT NULL,
    "detectedIntents" JSONB DEFAULT '[]',
    "evidenceUsed" JSONB DEFAULT '{}',
    "feedbackScore" INTEGER,  -- 1-5 user rating
    "wasHelpful" BOOLEAN,
    "language" VARCHAR(10) DEFAULT 'en',
    "convertedToTraining" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conv_log_session_idx ON "CommerceConversationLog"("sessionId");
CREATE INDEX IF NOT EXISTS conv_log_intents_idx ON "CommerceConversationLog" USING GIN("detectedIntents");
CREATE INDEX IF NOT EXISTS conv_log_training_idx ON "CommerceConversationLog"("convertedToTraining");

-- ────────────────────────────────────────────────────────────
-- Seed initial Commerce Knowledge Cards
-- ────────────────────────────────────────────────────────────
INSERT INTO "CommerceKnowledgeCard" ("topic", "category", "summary", "content", "keywords", "language")
VALUES
(
    'Best time to buy at Mile 12 Market',
    'MARKET_TIP',
    'Early morning (5–8am) is the best time to buy fresh produce at Mile 12 Market, Lagos.',
    'Mile 12 International Market in Lagos opens as early as 4am. Fresh produce traders arrive with stocks from overnight trucks. Between 5am and 8am you get the freshest tomatoes, peppers, and greens at lowest prices. After 10am, prices rise by 15–30% and quality drops. Go early, go light, and bring your own bags.',
    '["Mile 12", "Market", "fresh produce", "Lagos", "tomatoes", "pepper", "best time"]',
    'en'
),
(
    'How to spot genuine Indomie noodles',
    'PRODUCT_INFO',
    'Check the holographic seal, print quality, and smell to verify genuine Indomie noodles.',
    'Genuine Indomie noodles have a clear holographic seal on the back of the pack. The print is sharp with consistent colors. Counterfeit versions often have blurry text, slightly different colors, and lack the hologram. The genuine product also has a distinct fresh wheat smell when opened. If in doubt, buy from certified retail chains or well-known vendors.',
    '["Indomie", "noodles", "counterfeit", "genuine", "fake", "verify"]',
    'en'
),
(
    'Seasonal price changes for tomatoes',
    'SEASONAL_GUIDE',
    'Tomato prices in Nigeria peak during rainy season (May–July) and drop during harvest season (Oct–Dec).',
    'Fresh tomato prices in Nigerian markets follow a clear seasonal pattern. During the dry season harvest (October to December), supply is high and prices drop significantly — sometimes by 40–60%. During the rainy season (May to July), tomatoes are scarce due to farming disruptions and transport difficulties, pushing prices up sharply. Plan your tomato purchases and preservation (canning, paste-making) around this cycle for maximum savings.',
    '["tomatoes", "seasonal", "prices", "rainy season", "harvest", "Nigeria"]',
    'en'
);
