# Phase 3: Live Price Intelligence System

## Overview

Phase 3 implements a sophisticated price validation and analysis system for MarketMama, including:

- **5-Step Price Validation Pipeline** - Ensures data quality through duplicate, GPS, photo, outlier, and trend checks
- **MarketMama Price Index (MMPI)** - Daily market-level price indicator
- **Fair Price Calculator** - Resistant to outliers using median pricing
- **Price Alerts** - Warns users when prices exceed fair market values

## Architecture

### Component 1: Price Validation Pipeline

The validation system performs 5 sequential checks on every price report:

#### Step 1: Duplicate Detection
Prevents the same scout from reporting the same price multiple times within 24 hours.

```typescript
const noDuplicate = await checkDuplicates(
  sellerId,
  productId,
  reportedBy,
  24 // hours
);
```

**Confidence Impact**: -25% if duplicate detected

#### Step 2: GPS Verification  
Verifies scout's GPS coordinates are within market boundary (1km tolerance default).

```typescript
const gpsValid = verifyGpsCoordinates(
  marketLatitude,
  marketLongitude,
  scoutLatitude,
  scoutLongitude,
  1 // km tolerance
);
```

Uses Haversine formula for distance calculation. **Confidence Impact**: -20% if mismatch

#### Step 3: Photo Validation
Ensures photo evidence URL is valid and accessible.

```typescript
const photoValid = validatePhoto(photoUrl);
```

**Confidence Impact**: -15% if missing

#### Step 4: Outlier Detection
Statistical test (3σ rule) prevents extreme price reports.

```typescript
const notOutlier = await detectOutliers(
  productId,
  marketId,
  newPrice,
  30 // days of history
);
```

**Confidence Impact**: -25% if outlier detected

#### Step 5: Trend Corroboration
Cross-validates with other scouts' reports. At least 50% agreement required.

```typescript
const { valid, agreementScore } = await checkTrendCorroboration(
  productId,
  marketId,
  newPrice,
  10 // tolerance %
);
```

**Confidence Impact**: Agreement score heavily weighted

### Validation Result

```typescript
interface PriceValidationResult {
  isValid: boolean;           // 3 of 5 checks must pass
  confidence: number;         // 0.0-1.0
  validationSteps: {
    duplicateCheck: boolean;
    gpsVerification: boolean;
    photoValidation: boolean;
    outlierDetection: boolean;
    trendCorroboration: boolean;
  };
  reasons: string[];          // Failure explanations
}
```

## Component 2: MarketMama Price Index (MMPI)

### Calculation

MMPI measures market-wide price movement against a baseline:

```
MMPI = (Current Day Average / Baseline Average) × 100
```

Where:
- **Current Day Average** = Mean of all product averages for the day
- **Baseline Average** = Mean of 30 days prior (customizable)
- **Result** = Indexed to 100 (100 = baseline, 110 = 10% increase, 90 = 10% decrease)

### Usage

```typescript
const mmpi = await calculateMMPI(
  marketId,
  "2024-01-15",
  "2024-12-15" // optional baseline
);

// Returns:
{
  mmpi: 105.3,              // 5.3% above baseline
  changePercent: 5.3,
  productsTracked: 47,
  marketName: "Lagos Central Market",
  currency: "NGN"
}
```

### Interpretation

- **100**: Prices at baseline
- **110+**: Significant inflation (>10% above baseline)
- **90-**: Significant deflation (>10% below baseline)
- **95-105**: Stable prices (±5% variance)

## Component 3: Fair Price Calculator

### Method

Fair price uses **median** of recent verified prices, resistant to outliers:

```
fairPrice = median(prices from last 7 days)
```

### Why Median?

- Unaffected by extreme high/low prices
- Better represents "typical" consumer experience
- More resistant to data quality issues than mean

### Usage

```typescript
const fairPrice = await calculateFairPrice(
  productId,
  marketId,
  7 // days of history
);

// Returns:
{
  fairPrice: "450.00",       // Recommended fair price
  minPrice: "380.00",        // Lowest reported
  maxPrice: "520.00",        // Highest reported
  avgPrice: "465.00",        // Mean (for reference)
  confidence: 0.95,
  basis: "Median of 28 daily reports over 7 days",
  currency: "NGN"
}
```

### Confidence Scoring

```
confidence = (recencyScore + volumeScore) / 2

Where:
- recencyScore = 0.9 if price reported in last 3 days, else 0.7
- volumeScore = min(reportCount / 7, 1.0)  // 7+ reports = 100%
```

Result: 0.6 = OK, 0.8+ = High Confidence

## Component 4: Price Alerts

### Alert Threshold

Warn users when current price > 1.2× fair price (20% premium):

```typescript
const alert = await checkPriceAlert(
  productId,
  marketId,
  currentPrice,
  1.2 // 20% threshold
);

// Returns:
{
  isAlert: true,
  fairPrice: "100.00",
  currentPrice: "125.00",
  percentAbove: 25,
  message: "Price is 25% above fair price of 100.00"
}
```

## Daily Price Rollup

### Purpose

Pre-aggregated daily summaries prevent expensive queries on raw price data.

### Generation

Runs daily (midnight UTC) via cron job:

```typescript
// For each product-market-day combination
await generateDailyRollup(
  productId,
  marketId,
  "2024-01-15"
);
```

### Aggregates

```sql
INSERT INTO DailyPriceRollup (
  date,
  productId,
  marketId,
  avgPrice,
  minPrice,
  maxPrice,
  reportCount,
  currency
) VALUES (...)
ON CONFLICT (date, productId, marketId) DO UPDATE SET ...
```

Performance: Queries run in <100ms instead of seconds.

## Data Quality Assurance

### Confidence Thresholds

| Confidence | Use Case | Risk |
|-----------|----------|------|
| 0.9-1.0 | User-facing, critical decisions | Low |
| 0.7-0.9 | Recommendations, alerts | Medium |
| 0.5-0.7 | Reference only | High |
| <0.5 | Don't use | Critical |

### Manual Review

Scout reports below 0.7 confidence flagged for manual verification:

```sql
SELECT * FROM PriceReport 
WHERE isVerified = FALSE 
  AND createdAt > NOW() - INTERVAL '24 hours'
ORDER BY confidence ASC
LIMIT 20;
```

### Outlier Handling

Conservative approach: Reject prices outside 3σ rather than adjusting:

```
3σ rule example:
- Mean: 100
- StdDev: 10
- Bounds: [70, 130]  ← Only accept prices in this range
- Price 200: Rejected as outlier
```

## API Tools (Phase 3)

### 1. getFairPrice

```typescript
getFairPrice({
  productName: "Rice",
  marketName: "Lagos Market",
  country: "Nigeria"
})
```

**Returns**: Fair price, range, confidence, basis

### 2. getMarketPriceIndex

```typescript
getMarketPriceIndex({
  country: "Nigeria",
  city: "Lagos",
  days: 30
})
```

**Returns**: Today's MMPI, trend over time, interpretation

### 3. checkProductPriceAlert

```typescript
checkProductPriceAlert({
  productName: "Rice",
  marketName: "Lagos Market",
  reportedPrice: 150,
  currency: "NGN"
})
```

**Returns**: Alert level (ok/warning/high), recommendation

### 4. analyzePriceTrend

```typescript
analyzePriceTrend({
  productName: "Rice",
  marketName: "Lagos Market",
  days: 7
})
```

**Returns**: Trend direction, percent change, forecast

## Integration with Phase 2

Phase 3 builds on Phase 2's knowledge graph:

```
Phase 2 (Knowledge Graph)
    ↓
  Products, Markets, Sellers, Price Reports
    ↓
Phase 3 (Price Intelligence)
    ↓
  Validation → Daily Rollups → MMPI/Fair Price → Alerts
```

## Performance Considerations

### Query Performance

| Operation | Typical Time |
|-----------|-------------|
| Fair price calculation | 50ms |
| MMPI calculation | 100ms |
| Validation pipeline | 200ms |
| Daily rollup generation | 500ms |

### Indexing Strategy

```sql
-- Key indexes for Phase 3
CREATE INDEX price_product_market_date 
  ON PriceReport(productId, marketId, createdAt DESC);

CREATE INDEX rollup_date_product_market 
  ON DailyPriceRollup(date, productId, marketId);
```

## Cron Jobs Required

### Daily Rollup Generation

```bash
# Runs 00:05 UTC daily
CRON_MINUTE=5 CRON_HOUR=0 npx ts-node scripts/generate-daily-rollups.ts
```

### MMPI Archive

```bash
# Runs 00:10 UTC daily
CRON_MINUTE=10 CRON_HOUR=0 npx ts-node scripts/archive-mmpi.ts
```

## Testing

### Test Cases

```typescript
// Test duplicate detection
await testDuplicateCheck(); // Should reject 2nd report within 24h

// Test GPS verification  
await testGpsVerification(); // Should reject location >1km away

// Test outlier detection
await testOutlierDetection(); // Should reject 3σ+ prices

// Test trend corroboration
await testTrendCorroboration(); // Should validate when >50% agree

// Test MMPI calculation
await testMMPICalculation(); // Should match formula
```

## Next Phase (Phase 5)

Phase 4 (Checkout & Payments) and Phase 5 (Notifications) build on these foundations:

- **Phase 5**: Fair price alerts trigger notifications
- **Phase 4**: Checkout compares prices using MMPI/fair price

## References

- [5-Step Validation Pipeline](./db/price-validation.ts)
- [MMPI Calculator](./db/market-mama-price-index.ts)
- [Phase 3 Tools](./ai/phase3-price-intelligence.ts)
- [Phase 2 Setup](./PHASE2_SETUP.md)
