-- Enable required Postgres Extensions for RAG V2 & Commerce Intelligence
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for fast trigram fuzzy matching on product aliases
CREATE INDEX IF NOT EXISTS idx_product_aliases_trgm ON product_aliases USING gin (alias gin_trgm_ops);

-- Create cosine vector similarity index for Knowledge Cards RAG search
CREATE INDEX IF NOT EXISTS idx_knowledge_cards_embedding ON knowledge_cards USING ivfflat (embedding vector_cosine_ops);

-- Create spatial index for Markets geographic queries
CREATE INDEX IF NOT EXISTS idx_markets_location ON markets USING gist (ST_SetSRID(ST_MakePoint(CAST(longitude AS float8), CAST(latitude AS float8)), 4326));
