import "server-only";

import { eq, and, gte, lte, desc } from "drizzle-orm";
import {
  commerceEvent,
  eventDecisionScore,
  userInterestProfile,
  smartTimingProfile,
  watchlist,
  CommerceEvent,
  EventDecisionScore,
} from "./schema";
import { getDb } from "./queries";
import { getUserInterestRating } from "./user-interest-graph";
import { getSmartTimingScore } from "./smart-timing";

/**
 * Commerce Decision Engine: Scores events and routes to appropriate channel
 * Scoring rubric:
 * - Price Impact (0-20): How much money user saves (1% = 1pt, 20%+ = 20pt)
 * - User Interest (0-20): How interested user is in product (5-star rating)
 * - Urgency (0-15): How time-sensitive (new products=15, trends=10, alerts=5)
 * - Relevance (0-20): How relevant to user's markets/patterns
 * - Confidence (0-15): Data quality score
 * - Popularity (0-10): How many users affected
 * Total: 0-100
 *
 * Routing decisions:
 * 80-100: SEND_NOW (high value, time-sensitive)
 * 50-79: BATCH (valuable but not urgent - batch with others)
 * 20-49: DIGEST (informational - include in daily digest)
 * 0-19: IGNORE (low value)
 */

interface ScoringContext {
  event: CommerceEvent;
  userId: string;
  watchlistItem?: any;
  interests?: any;
  timing?: any;
}

export async function scoreEventForUser(
  event: CommerceEvent,
  userId: string
): Promise<EventDecisionScore> {
  const db = getDb();

  // Gather context
  const [interests] = await db
    .select()
    .from(userInterestProfile)
    .where(eq(userInterestProfile.userId, userId));

  const [timing] = await db
    .select()
    .from(smartTimingProfile)
    .where(eq(smartTimingProfile.userId, userId));

  const [watchlistItem] = await db
    .select()
    .from(watchlist)
    .where(
      and(
        eq(watchlist.userId, userId),
        eq(watchlist.productId, event.productId),
        eq(watchlist.marketId, event.marketId)
      )
    );

  const context: ScoringContext = {
    event,
    userId,
    watchlistItem,
    interests,
    timing,
  };

  // Calculate individual scores
  const priceImpactScore = calculatePriceImpact(context);
  const userInterestScore = calculateUserInterest(context);
  const urgencyScore = calculateUrgency(context);
  const relevanceScore = calculateRelevance(context);
  const confidenceScore = calculateConfidence(context);
  const popularityScore = calculatePopularity(context);

  const totalScore =
    priceImpactScore +
    userInterestScore +
    urgencyScore +
    relevanceScore +
    confidenceScore +
    popularityScore;

  const decision = routeDecision(totalScore);

  // Save decision score
  return await db.insert(eventDecisionScore).values({
    eventId: event.id,
    userId,
    priceImpactScore,
    userInterestScore,
    urgencyScore,
    relevanceScore,
    confidenceScore,
    popularityScore,
    totalScore,
    decision,
  });
}

function calculatePriceImpact(context: ScoringContext): number {
  const { event } = context;
  const eventData = event.data as any;

  if (!eventData.change) return 0;

  const percentChange = Math.abs(parseFloat(eventData.change));
  // 1% = 1 point, capped at 20
  return Math.min(Math.round(percentChange), 20);
}

function calculateUserInterest(context: ScoringContext): number {
  const { event, interests, watchlistItem } = context;

  if (!interests) return 5; // Default interest if no profile

  // Check if user is watching this product
  if (watchlistItem) return 20;

  // Check product interest rating
  const productInterests = interests.productInterests as Record<
    string,
    number
  >;
  const productRating = productInterests[event.productId] || 2;
  // Rating 1-5 maps to 0-20 points (5 * 4 = 20)
  return Math.min(productRating * 4, 20);
}

function calculateUrgency(context: ScoringContext): number {
  const { event } = context;
  const eventData = event.data as any;

  switch (event.eventType) {
    case "price_spike":
      return 15; // Time-critical
    case "market_available":
      return 10; // Limited window
    case "new_product":
      return 8; // Moderately urgent
    case "supply_surge":
      return 5; // Informational
    default:
      return 0;
  }
}

function calculateRelevance(context: ScoringContext): number {
  const { event, interests } = context;

  if (!interests) return 10;

  // Check market interest
  const marketInterests = interests.marketInterests as Record<string, number>;
  const marketRating = marketInterests[event.marketId] || 1;
  const marketScore = marketRating * 4; // Max 20

  // Proximity bonus (will be refined with geofencing in Phase 4)
  return Math.min(marketScore + 3, 20);
}

function calculateConfidence(context: ScoringContext): number {
  const { event } = context;
  const eventData = event.data as any;

  // Data quality factors
  let confidence = 10; // Base score

  if (eventData.confidence && parseFloat(eventData.confidence) > 0.8)
    confidence += 3; // High confidence in data
  if (eventData.verified) confidence += 2; // Verified data source
  if (eventData.reportCount && eventData.reportCount > 5) confidence += 5; // Multiple corroborating reports
  if (eventData.photoUrl) confidence += 2; // Photo evidence

  return Math.min(confidence, 15);
}

function calculatePopularity(context: ScoringContext): number {
  const { event } = context;
  const eventData = event.data as any;

  // How many users are affected by this event
  const affectedUsers = eventData.affectedUsers || 0;
  // 0 users = 0pts, 100+ users = 10pts
  return Math.min(Math.floor(affectedUsers / 10), 10);
}

function routeDecision(totalScore: number): string {
  if (totalScore >= 80) return "send_now";
  if (totalScore >= 50) return "batch";
  if (totalScore >= 20) return "digest";
  return "ignore";
}

/**
 * Get all events needing immediate send (score >= 80)
 */
export async function getImmediateSendEvents(userId: string) {
  const db = getDb();

  return await db
    .select({
      score: eventDecisionScore,
      event: commerceEvent,
    })
    .from(eventDecisionScore)
    .leftJoin(
      commerceEvent,
      eq(eventDecisionScore.eventId, commerceEvent.id)
    )
    .where(
      and(
        eq(eventDecisionScore.userId, userId),
        eq(eventDecisionScore.decision, "send_now")
      )
    )
    .orderBy(desc(eventDecisionScore.totalScore));
}

/**
 * Get events to batch (score 50-79)
 */
export async function getBatchableEvents(userId: string, hours: number = 6) {
  const db = getDb();
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  return await db
    .select({
      score: eventDecisionScore,
      event: commerceEvent,
    })
    .from(eventDecisionScore)
    .leftJoin(
      commerceEvent,
      eq(eventDecisionScore.eventId, commerceEvent.id)
    )
    .where(
      and(
        eq(eventDecisionScore.userId, userId),
        eq(eventDecisionScore.decision, "batch"),
        gte(eventDecisionScore.createdAt, cutoffTime)
      )
    )
    .orderBy(desc(eventDecisionScore.totalScore));
}

/**
 * Get events for daily digest (score 20-49)
 */
export async function getDigestEvents(userId: string) {
  const db = getDb();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return await db
    .select({
      score: eventDecisionScore,
      event: commerceEvent,
    })
    .from(eventDecisionScore)
    .leftJoin(
      commerceEvent,
      eq(eventDecisionScore.eventId, commerceEvent.id)
    )
    .where(
      and(
        eq(eventDecisionScore.userId, userId),
        eq(eventDecisionScore.decision, "digest"),
        gte(eventDecisionScore.createdAt, todayStart)
      )
    )
    .orderBy(desc(eventDecisionScore.totalScore));
}
