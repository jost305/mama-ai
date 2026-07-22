-- Enable required Postgres Extensions for RAG V2 & Commerce Intelligence
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create knowledge_cards table
CREATE TABLE IF NOT EXISTS knowledge_cards (
  id              SERIAL PRIMARY KEY,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT NOT NULL,
  card_type       TEXT NOT NULL,
  title           TEXT,
  content         TEXT NOT NULL,
  content_pidgin  TEXT,
  author_type     TEXT,
  author_id       TEXT,
  verified        BOOLEAN DEFAULT FALSE,
  last_reviewed   TIMESTAMP,
  embedding       vector(1536),
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Create GIN index for fast trigram fuzzy matching on product aliases
CREATE INDEX IF NOT EXISTS idx_product_aliases_trgm ON "ProductAlias" USING gin ("aliasName" gin_trgm_ops);

-- Create cosine vector similarity index for Knowledge Cards RAG search
CREATE INDEX IF NOT EXISTS idx_knowledge_cards_embedding ON knowledge_cards USING ivfflat (embedding vector_cosine_ops);

-- Create spatial index for Markets geographic queries
CREATE INDEX IF NOT EXISTS idx_markets_location ON "Market" USING gist (ST_SetSRID(ST_MakePoint(CAST(longitude AS float8), CAST(latitude AS float8)), 4326));
