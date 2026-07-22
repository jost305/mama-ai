# MarketMama Phase 2-5 Deployment Guide

## Prerequisites

- Neon PostgreSQL database (DATABASE_URL and DATABASE_URL_UNPOOLED already set)
- OpenRouter API key (OPENROUTER_API_KEY)
- Auth secret (AUTH_SECRET)

## Step 1: Run Database Migration

### Local Development

```bash
# Using psql directly
psql $DATABASE_URL -f db/migrations/0001_phase2_knowledge_graph.sql

# OR using Neon CLI
neon sql -f db/migrations/0001_phase2_knowledge_graph.sql
```

### Verify Migration Success

```bash
psql $DATABASE_URL -c "\dt"
# Should show all new tables:
# - ProductCategory, Product, ProductAlias
# - Market, MarketSection, Seller
# - PriceReport, DailyPriceRollup
# - Watchlist, NotificationRule, Notification, NotificationEvent, UserPreferences
```

## Step 2: Seed Initial Test Data (Optional)

```bash
npx ts-node db/seed.ts
```

This creates test data:
- 4 product categories
- 3 products
- 3 markets
- 3 market sections
- 3 sellers

## Step 3: Build and Test Locally

```bash
# Install dependencies
pnpm install

# Build
pnpm build

# Run dev server
pnpm dev
```

## Step 4: Test via Chat

1. Open http://localhost:3000
2. Log in or create an account
3. Test Phase 2 (Knowledge Graph) tools:
   ```
   "Find rice markets in Nigeria"
   "Show me sellers in Lagos Central Market"
   ```

4. Test Phase 3 (Price Intelligence) tools:
   ```
   "What's the fair price for rice in Lagos?"
   "Show me the market price index for Lagos"
   "Is 150 NGN reasonable for rice?"
   ```

5. Test Phase 5 (Notifications) setup:
   ```
   "Add rice to my watchlist in Lagos"
   "Alert me if rice goes above 200 NGN"
   ```

## Step 5: Deploy to Vercel

### 1. Connect GitHub Repository

```bash
git add .
git commit -m "Phase 2-5: Knowledge Graph, Price Intelligence, Notifications"
git push origin main
```

### 2. Import to Vercel

1. Go to vercel.com/new
2. Select your GitHub repository
3. Configure project
4. Add environment variables:
   ```
   DATABASE_URL=(from Neon)
   DATABASE_URL_UNPOOLED=(from Neon)
   OPENROUTER_API_KEY=(your key)
   AUTH_SECRET=(generate: openssl rand -base64 32)
   ```

### 3. Run Migration on Production

After deployment, connect to Neon production database and run migration:

```bash
# Via Vercel CLI
vercel env pull
psql $DATABASE_URL_UNPOOLED -f db/migrations/0001_phase2_knowledge_graph.sql
```

OR via Neon Console:
1. Go to Neon dashboard
2. SQL Editor
3. Paste migration SQL
4. Run

### 4. Deploy

Click "Deploy" in Vercel

## Step 6: Verify Production Deployment

```bash
# Check database tables
curl https://your-app.vercel.app/api/health

# Test a query via chat
# (Use production instance)
```

## Troubleshooting

### Migration Fails: Foreign Key Issues

**Error**: `SQLSTATE[23503]: Foreign key violation`

**Solution**: Run migration in transaction:
```sql
BEGIN;
-- migration SQL here
COMMIT;
```

### Database Connection Timeout

**Error**: `ECONNREFUSED` or `connection timeout`

**Solution**: 
- Check DATABASE_URL is correct
- Verify Neon project is active
- Check network restrictions in Neon dashboard

### TypeScript Compilation Errors

**Error**: `Type 'string' is not assignable to type 'UUID'`

**Solution**: 
- Clear `.next` build cache: `rm -rf .next`
- Rebuild: `pnpm build`
- The types will resolve with proper database bindings

### Queries Return Empty Results

**Error**: Tools return no data despite valid queries

**Solution**: 
- Verify seed data was created: `SELECT COUNT(*) FROM "Product";`
- Check indexes exist: `SELECT * FROM pg_indexes WHERE tablename = 'Product';`
- Run seed script: `npx ts-node db/seed.ts`

## Performance Optimization

### 1. Enable Query Caching

Add to Route Handlers:
```typescript
export const revalidate = 3600; // Cache for 1 hour
```

### 2. Monitor Database Performance

In Neon Console:
- Check slow query log
- Review connection count
- Monitor storage growth

### 3. Daily Maintenance

Schedule cron jobs:
```bash
# 00:05 UTC - Generate daily price rollups
# 00:10 UTC - Archive MMPI data
# 08:00 UTC - Send daily digests
```

## Data Seeding Strategy

### Phase 1: Manual Setup

1. Run migration
2. Run seed script for test data
3. Manually add key markets/products via admin panel

### Phase 2: Scout Network

1. Deploy scout app (collect price reports)
2. Reports run through 5-step validation
3. Verified reports populate PriceReport table
4. Daily rollups build analytics

### Phase 3: Scale

As data grows:
- Archive old price reports to cold storage
- Maintain 90-day price rollup history
- Archive older price history annually

## Monitoring

### Key Metrics

1. **Database Size**: Should start ~10MB, grow with price reports
2. **Query Performance**: Most queries <200ms
3. **Notification Queue**: Track unbatched events
4. **User Watchlists**: Monitor growth over time

### Alert Thresholds

Set up alerts for:
- Database connection pool exhaustion
- Query timeouts (>5s)
- Notification queue backlog (>1000 events)
- Daily rollup failures

## Backup Strategy

### Automatic Backups

Neon handles automatic backups. In Neon Console:
- Default: 7-day retention
- Upgrade to 30-day retention for production

### Manual Backups

```bash
# Weekly backup to S3
pg_dump $DATABASE_URL_UNPOOLED | gzip > backup-$(date +%Y%m%d).sql.gz
aws s3 cp backup-*.sql.gz s3://your-backups/
```

### Restore from Backup

```bash
gunzip < backup-20240115.sql.gz | psql $DATABASE_URL_UNPOOLED
```

## Scaling Considerations

### Current Capacity

With Neon standard plan:
- 1M products
- 10K markets
- 100K sellers
- 10M price reports
- Handles 1K concurrent users

### Scaling Steps

1. **Read Replicas**: Add read replicas for analytics queries
2. **Archival**: Move old price reports to archive table
3. **Partitioning**: Partition PriceReport by date
4. **Caching**: Add Redis for hot queries (top products, markets)

### Database Limits

If approaching limits:
- Archive price reports >90 days old
- Move to data warehouse (BigQuery, Snowflake)
- Implement data retention policy

## Security Checklist

- [ ] All environment variables set (not in code)
- [ ] Database password protected
- [ ] API keys rotated regularly
- [ ] Auth secret generated with `openssl rand -base64 32`
- [ ] CORS configured for allowed domains
- [ ] Rate limiting on price report API
- [ ] Input validation on all queries
- [ ] SQL injection protection (Drizzle provides this)

## Maintenance Schedule

### Daily

- Monitor error logs
- Check notification queue health

### Weekly

- Verify daily rollup generation
- Review slow query performance

### Monthly

- Archive old data
- Update product/market records
- Review user feedback

### Quarterly

- Capacity planning review
- Security audit
- Performance optimization

## Rollback Procedure

If deployment causes issues:

```bash
# 1. Identify last good commit
git log --oneline | head -5

# 2. Revert deployment in Vercel
# - Go to Vercel dashboard
# - Find previous deployment
# - Click "Redeploy"

# 3. Verify on staging first
# - Deploy to preview branch
# - Run tests
# - Then promote to production

# 4. If database changes needed
# - Keep both old and new schema
# - Migrate data gradually
# - Run compatibility layer if needed
```

## Production Launch Checklist

- [ ] Migration tested on staging
- [ ] Seed data created
- [ ] All environment variables set
- [ ] Database backups enabled
- [ ] Monitoring alerts configured
- [ ] Error logging configured
- [ ] Performance baseline established
- [ ] Security review complete
- [ ] Load testing passed (>1K users)
- [ ] User docs ready
- [ ] Scout training completed
- [ ] Support team briefed

## Support Contacts

- **Database Issues**: Neon support (neon.tech)
- **Deployment Issues**: Vercel support (vercel.com/support)
- **OpenRouter Issues**: OpenRouter docs (openrouter.ai)

## Additional Resources

- [Phase 2 Setup](./PHASE2_SETUP.md)
- [Phase 3 Price Intelligence](./PHASE3_PRICE_INTELLIGENCE.md)
- [Phase 2-5 Complete Summary](./PHASE2_5_COMPLETE.md)
