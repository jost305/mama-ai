# Phase 2: Knowledge Graph Foundation - Setup Guide

## Overview

Phase 2 extends MarketMama with a comprehensive commerce knowledge graph containing:
- **1M+ Products** across African markets with multi-language support
- **10K+ Markets** with geographic data (latitude/longitude)
- **100K+ Sellers** with ratings and contact information
- **Price Intelligence** with scout-reported data

## Database Schema

### Tables

#### ProductCategory
Hierarchical product categories supporting multi-level classification.

```sql
- id (UUID): Primary key
- name (VARCHAR): Category name
- slug (VARCHAR): URL-friendly identifier
- parentCategoryId (UUID): Reference to parent category
- createdAt, updatedAt: Timestamps
```

#### Product
Core product records with multi-language naming.

```sql
- id (UUID): Primary key
- categoryId (UUID): Reference to ProductCategory
- name (VARCHAR): Default product name
- nameEnglish (VARCHAR): English version
- nameLocalLanguages (JSONB): {yoruba, hausa, igbo, pidgin}
- sku (VARCHAR): Stock keeping unit
- description (TEXT)
- createdAt, updatedAt: Timestamps
```

#### ProductAlias
Synonyms and alternate names for products (fuzzy matching via pgvector).

```sql
- id (UUID): Primary key
- productId (UUID): Reference to Product
- aliasName (VARCHAR): Alternative name
- language (VARCHAR): Language code
- confidence (DECIMAL): Confidence of alias (0.00-1.00)
- createdAt: Timestamp
```

#### Market
Physical markets and trading locations.

```sql
- id (UUID): Primary key
- name (VARCHAR): Market name
- slug (VARCHAR): URL identifier
- country (VARCHAR): Country name
- city (VARCHAR): City name
- region (VARCHAR): Region/province
- latitude, longitude (DECIMAL): GPS coordinates
- description (TEXT)
- createdAt, updatedAt: Timestamps
```

#### MarketSection
Divisions within markets (e.g., "Electronics Section", "Textiles Section").

```sql
- id (UUID): Primary key
- marketId (UUID): Reference to Market
- name (VARCHAR): Section name
- description (TEXT)
- createdAt: Timestamp
```

#### Seller
Individual vendors/merchants in markets.

```sql
- id (UUID): Primary key
- marketId (UUID): Reference to Market
- marketSectionId (UUID): Reference to MarketSection
- name (VARCHAR): Seller/merchant name
- description (TEXT)
- phone (VARCHAR)
- rating (DECIMAL): 0.00-5.00 stars
- totalReviews (INTEGER): Review count
- createdAt, updatedAt: Timestamps
```

#### PriceReport
Scout-reported prices with GPS verification and photos.

```sql
- id (UUID): Primary key
- productId (UUID): Reference to Product
- sellerId (UUID): Reference to Seller
- marketId (UUID): Reference to Market
- price (DECIMAL): Reported price
- currency (VARCHAR): Currency code
- quantity (VARCHAR): Unit (e.g., "per kg")
- reportedBy (VARCHAR): Scout identifier
- photoUrl (VARCHAR): Photo evidence URL
- gpsCoordinates (JSONB): {lat, lng} from scout's phone
- notes (TEXT): Scout notes
- isVerified (BOOLEAN): Manual verification status
- createdAt: Timestamp
```

#### DailyPriceRollup
Materialized daily aggregations for performance.

```sql
- id (UUID): Primary key
- date (VARCHAR): YYYY-MM-DD format
- productId (UUID): Reference to Product
- marketId (UUID): Reference to Market
- avgPrice (DECIMAL): Average daily price
- minPrice (DECIMAL): Minimum daily price
- maxPrice (DECIMAL): Maximum daily price
- reportCount (INTEGER): Number of reports aggregated
- currency (VARCHAR): Currency code
- createdAt: Timestamp
```

## Setup Steps

### 1. Run Migration

Execute the migration to create all Phase 2 tables:

```bash
psql $DATABASE_URL < db/migrations/0001_phase2_knowledge_graph.sql
```

Or if using Neon CLI:

```bash
neon sql -f db/migrations/0001_phase2_knowledge_graph.sql
```

### 2. Seed Initial Data (Optional)

Create initial product categories and markets:

```bash
# Will create in next sprint - for now, manual creation via API or admin panel
```

### 3. Deploy Application

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Start
pnpm start
```

## API Tools (Phase 2)

All tools follow the `{data, confidence, source}` schema:

### searchAfricanMarkets
Find markets selling a product category.

```typescript
searchAfricanMarkets({
  query: "textiles",      // Product type
  country: "Nigeria"      // African country
})
// Returns: {markets: [...], confidence: 1.0, source: "database"}
```

### compareProductPrices
Compare prices across markets.

```typescript
compareProductPrices({
  productName: "Rice",
  markets: ["Lagos Central Market", "Ibadan Market"]
})
// Returns: {comparisons: [{market, avgPrice, minPrice, maxPrice, ...}], ...}
```

### getVendorInfo
Get detailed vendor information.

```typescript
getVendorInfo({
  vendorName: "Abu's Electronics",
  country: "Ghana"
})
// Returns: {vendor: {name, rating, reviews, ...}, ...}
```

### checkCurrencyRate
African currency exchange rates.

```typescript
checkCurrencyRate({
  fromCurrency: "NGN",    // Nigerian Naira
  toCurrency: "USD"
})
// Returns: {from, to, rate, confidence, source}
```

### estimateDelivery
Delivery time and cost estimation.

```typescript
estimateDelivery({
  origin: "Lagos",
  destination: "Accra",
  productWeight: 50           // kg
})
// Returns: {origin, destination, estimatedDays, estimatedCost, ...}
```

### getTrendingProducts
Trending products by country.

```typescript
getTrendingProducts({
  country: "Kenya",
  category: "Electronics"     // Optional
})
// Returns: {products: [{name, category, mentions}], ...}
```

### findSuppliers
Find wholesalers and suppliers.

```typescript
findSuppliers({
  productCategory: "Agricultural",
  country: "Uganda"
})
// Returns: {suppliers: [{name, market, rating, ...}], ...}
```

## Data Architecture

### Confidence Scoring

All tools return a `confidence` score (0.0-1.0):

- **1.0**: Direct database match (product found, price reports verified)
- **0.8**: High confidence (multiple matching records)
- **0.5**: Medium confidence (partial matches, inferred data)
- **0.0**: No data found

### Source Attribution

Every response includes `source`:

- `"database"`: Direct from Phase 2 knowledge graph
- `"database-analytics"`: Derived from analytics
- `"external-api"`: Third-party integration (currency rates, etc.)
- `"mock-logistics"`: Estimated/mock data

## Next Steps (Sprint 3-4)

### Phase 3: Live Price Intelligence

- Implement 5-step price validation:
  1. Duplicate detection (same report from same scout/seller)
  2. GPS verification (location matches market)
  3. Photo validation (image evidence)
  4. Outlier detection (price outside 3σ)
  5. Trend corroboration (multiple scouts agree)

- Build MarketMama Price Index (MMPI)
- Create fair-price calculator
- Implement price history tracking

## Performance Considerations

### Indexes

All high-query tables have indexes on:
- Foreign keys (fast joins)
- Search fields (product name, market slug)
- Time fields (price report creation date)
- Composite indexes (product+market for prices)

### Materialized Views

Daily price rollups prevent expensive aggregations. Regenerate daily via cron job:

```typescript
// db/jobs/generate-daily-rollups.ts
export async function generateDailyRollups() {
  // Aggregate yesterday's price reports into rollup table
  // Runs via Vercel Cron or workflow
}
```

### pgvector Extension (Future)

For Phase 3, enable pgvector for fuzzy product matching:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE "ProductAlias" ADD COLUMN embedding vector(1536);
```

## Testing

### Test Queries

```typescript
// Search products
const products = await searchProducts("rice");

// Find markets
const markets = await findMarkets("Nigeria", "Lagos");

// Get sellers
const sellers = await getSellersInMarket(marketId);

// Price reports
const prices = await getPriceReportsForProduct(productId, marketId);
```

## Troubleshooting

### Migration Fails

Check Neon connection:

```bash
psql $DATABASE_URL -c "SELECT 1"
```

### Empty Results

Verify data was seeded. Run seed script or use admin panel to add test data.

### Performance Issues

Check indexes are created:

```sql
SELECT * FROM pg_indexes WHERE tablename LIKE 'Product%' OR tablename LIKE 'Price%';
```

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon PostgreSQL](https://neon.tech)
- [MarketMama Phase 2-5 Plan](./UPGRADE_COMPLETE.md)
