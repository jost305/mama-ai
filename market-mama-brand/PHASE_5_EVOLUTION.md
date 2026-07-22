# Phase 5 Evolution: Commerce Intelligence + Mama Voice

## Overview

Phase 5 Evolution transforms MarketMama from a simple notification system into an **AI-driven Commerce Intelligence Platform with authentic African personality**. The system scores events on a 0-100 scale and intelligently routes them to the right channel at the right time.

---

## Architecture Layers

### Layer 1: Commerce Event Bus
**File**: `db/commerce-decision-engine.ts`

Receives raw market events and scores them for each user:

```
CommerceEvent → EventDecisionScore (0-100) → Routing Decision
```

**Scoring Rubric (100 points total)**:
- **Price Impact** (0-20): How much money user saves (1% = 1pt)
- **User Interest** (0-20): How interested user is in product (5-star rating)
- **Urgency** (0-15): How time-sensitive (new products=15, trends=10)
- **Relevance** (0-20): How relevant to user's markets/patterns
- **Confidence** (0-15): Data quality score
- **Popularity** (0-10): How many users affected

**Routing Decisions**:
- **80-100**: SEND_NOW (high value, time-sensitive)
- **50-79**: BATCH (valuable but not urgent - batch with others)
- **20-49**: DIGEST (informational - include in daily digest)
- **0-19**: IGNORE (low value)

### Layer 2: Mama Voice Engine
**File**: `ai/mama-voice-engine.ts`

500+ curated message templates with authentic African personality across 5 languages:
- English
- Nigerian Pidgin
- Yoruba
- Hausa
- Igbo

**Template Categories**:
- Price alerts (urgent, friendly, celebratory)
- Deals & opportunities
- Market tips & wisdom
- Encouragement
- Logistics & delivery
- Seasonal alerts
- Expiring deals
- Price comparisons

Uses templates instead of LLM for **speed, consistency, and cost**.

### Layer 3: User Interest Graph
**File**: `db/user-interest-graph.ts`

Learns user preferences from behavior:
- **Product interests**: 1-5 rating per product (learned from opens, clicks, purchases)
- **Category interests**: Aggregated preferences
- **Market interests**: Geographic & location preferences
- **Price ranges**: Min/max per category

Updated on every user action (opened, clicked, purchased).

### Layer 4: Smart Timing
**File**: `db/smart-timing.ts`

Learns when users are ready to engage:
- **Activity heatmap**: Hour-by-hour engagement patterns
- **Time windows**: Optimal send times (morning/afternoon/evening/night)
- **Device preferences**: Mobile, web, WhatsApp
- **Fatigue detection**: Don't overwhelm users

Sends notifications at times when users are most likely to engage.

### Layer 5: Geofencing
**File**: `db/schema.ts` (UserGeofence table)

Triggers location-based alerts:
- Set radius around markets (default 2km)
- Notify when user enters/near/exits market zone
- Reduces irrelevant notifications

### Layer 6: Analytics & Dashboard
**File**: `db/analytics-tracker.ts`

Measures notification performance:
- **Open rate**: % of sent notifications opened (target: 45-50%)
- **Click rate**: % of opened notifications clicked (target: 15-20%)
- **Purchase rate**: % of clicks leading to purchases
- **Engagement by hour/day**: Optimal send times
- **Retention**: % users active after 30 days
- **Money saved**: Aggregated savings from price alerts

---

## Integration Points

### 1. Creating Commerce Events

```typescript
// When a price spike is detected
const event = await db.insert(commerceEvent).values({
  eventType: 'price_spike',
  productId: 'prod-123',
  marketId: 'market-456',
  data: {
    oldPrice: 1000,
    newPrice: 800,
    percentChange: -20,
    confidence: 0.92,
    reportCount: 5,
    verified: true
  },
  severity: 75
});
```

### 2. Scoring Events for Users

```typescript
import { scoreEventForUser } from 'db/commerce-decision-engine';

const score = await scoreEventForUser(event, userId);
// Returns: EventDecisionScore with decision = "send_now" | "batch" | "digest" | "ignore"
```

### 3. Generating Mama Voice Messages

```typescript
import { generateMessage } from 'ai/mama-voice-engine';

const message = generateMessage(
  'price_alert',           // category
  'pcn',                    // language (Pidgin)
  {
    productName: 'Rice',
    market: 'Bodija Market',
    price: 8000,
    discount: 20
  },
  'urgent'                  // tone
);
// Returns: "Alert! Alert! Rice for 8000 na d best. Bodija Market get am fresh. Run go buy!"
```

### 4. Tracking User Engagement

```typescript
import { recordUserAction } from 'db/user-interest-graph';

await recordUserAction(userId, 'clicked', {
  productId: 'prod-123',
  categoryId: 'cat-456',
  marketId: 'market-789',
  price: 8000
});
// User interest in this product increases from 3/5 → 3.5/5
```

### 5. Recording Notification Opens

```typescript
import { trackNotificationOpen, trackNotificationClick } from 'db/analytics-tracker';

await trackNotificationOpen(notificationId);
// Marks as read, logs open event
```

### 6. Dispatching Notifications

```typescript
import { processCommerceEvent, dispatchNotifications } from 'db/enhanced-dispatcher';

const dispatches = await processCommerceEvent(event, userIds);
const result = await dispatchNotifications(dispatches);
// Returns: { sent_now: 5, batched: 12, digested: 3, ignored: 8 }
```

---

## Database Schema Extensions

### New Tables (Phase 5)

1. **CommerceEvent**: Raw market events
2. **EventDecisionScore**: Scored events with routing decisions
3. **UserInterestProfile**: Learned user preferences
4. **SmartTimingProfile**: Optimal send times per user
5. **UserGeofence**: Location-based alert zones
6. **AnalyticsEvent**: User engagement tracking

---

## Expected Performance

### Notification Metrics
- **Open rate**: 45-50% (vs 20% industry average)
- **Click rate**: 15-20% (vs 3-5% industry average)
- **Purchase rate**: 8-12% (vs 1-2% industry average)

### User Experience
- **30-day retention**: >60%
- **Monthly active users growing**: 25-30% month-over-month
- **User satisfaction**: 4.5+/5 stars (authentic personality)
- **Money saved per user**: 15,000-25,000 (local currency)

---

## Testing Checklist

### Unit Tests
- [ ] Decision engine scoring logic (all 6 components)
- [ ] Mama Voice template rendering (all 5 languages)
- [ ] Interest graph learning (rating increases/decreases)
- [ ] Smart timing window calculation
- [ ] Analytics calculations (rates, averages)

### Integration Tests
- [ ] End-to-end event flow: Event → Score → Message → Dispatch
- [ ] User behavior tracking: Action → Interest update → Score change
- [ ] Message generation: All category/language/tone combinations
- [ ] Notification batching: Collect 6 hours, dispatch once

### Performance Tests
- [ ] Scoring 1000 events per user: <500ms
- [ ] Message generation: <50ms
- [ ] Analytics queries: <200ms

### A/B Testing
- [ ] Template effectiveness: Which tones convert best?
- [ ] Send times: Compare optimal vs random times
- [ ] Frequency: How many notifications/day is optimal?
- [ ] Languages: Engagement by language

---

## Deployment Steps

1. **Database Migration**: Create new Phase 5 tables
   ```bash
   tsx db/migrate.ts
   ```

2. **Verify Schema**: Confirm all tables created
   ```bash
   SELECT * FROM information_schema.tables WHERE table_schema = 'public';
   ```

3. **Seed Test Data**: Load sample events and users
   ```bash
   tsx db/seed.ts
   ```

4. **Test Scoring**: Verify decision engine works
   ```bash
   import { scoreEventForUser } from 'db/commerce-decision-engine';
   ```

5. **Deploy to Production**: Use Vercel deployment

6. **Monitor**: Watch analytics dashboard for:
   - Event scoring distribution
   - Open/click rates
   - User retention
   - Revenue impact

---

## Future Enhancements

### Phase 6
- Predictive models for when users will shop
- Inventory management integration
- Competitor price tracking
- Seasonal demand forecasting

### Phase 7
- SMS delivery channel
- Push notifications
- Voice notifications
- Video commerce

### Phase 8
- ML-powered message optimization
- Personalized discount offers
- Subscription recommendations
- Community features (share deals)

---

## Support & Maintenance

### Monitoring
- Track decision score distribution (should be normal distribution)
- Monitor notification fatigue (opt-outs per 1000 sent)
- Watch for template performance degradation
- Alert on high "ignore" percentage (>80%)

### Optimization
- Review poorly-performing templates monthly
- A/B test new template variations
- Update scoring weights based on actual behavior
- Adjust time windows seasonally

### Documentation
- Keep template library updated
- Document new languages added
- Log scoring rule changes
- Maintain user behavior baselines
