import "server-only";

import { eq } from "drizzle-orm";
import { userInterestProfile, analyticsEvent, UserInterestProfile } from "./schema";
import { getDb } from "./queries";

/**
 * User Interest Graph: Learns user preferences from behavior
 * - Tracks interest in products (1-5 rating)
 * - Tracks interest in categories
 * - Tracks interest in markets
 * - Tracks price ranges per category
 * Updates on each user action: opened notification, clicked link, made purchase
 */

export async function recordUserAction(
  userId: string,
  eventType: string,
  eventData: Record<string, any>
) {
  const db = getDb();

  // Save analytics event
  await db.insert(analyticsEvent).values({
    userId,
    eventType,
    eventData,
  });

  // Update user interest based on action type
  if (eventType === "purchased" || eventType === "clicked") {
    await updateInterestRating(userId, eventData);
  }
}

async function updateInterestRating(
  userId: string,
  eventData: Record<string, any>
) {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(userInterestProfile)
    .where(eq(userInterestProfile.userId, userId));

  if (!profile) {
    // Create initial profile
    await db.insert(userInterestProfile).values({
      userId,
      productInterests: { [eventData.productId]: 4 },
      categoryInterests: { [eventData.categoryId]: 3 },
      marketInterests: { [eventData.marketId]: 2 },
      priceRanges: {},
    });
    return;
  }

  // Increment interest ratings
  const productInterests = profile.productInterests as Record<string, number>;
  const categoryInterests = profile.categoryInterests as Record<string, number>;
  const marketInterests = profile.marketInterests as Record<string, number>;

  // Update product interest (cap at 5)
  productInterests[eventData.productId] = Math.min(
    (productInterests[eventData.productId] || 1) + 0.5,
    5
  );

  // Update category interest
  categoryInterests[eventData.categoryId] = Math.min(
    (categoryInterests[eventData.categoryId] || 1) + 0.3,
    5
  );

  // Update market interest
  marketInterests[eventData.marketId] = Math.min(
    (marketInterests[eventData.marketId] || 1) + 0.2,
    5
  );

  // Track price range
  if (eventData.price && eventData.categoryId) {
    const priceRanges = profile.priceRanges as Record<
      string,
      { min: number; max: number; count: number }
    >;
    const catKey = eventData.categoryId;

    if (!priceRanges[catKey]) {
      priceRanges[catKey] = {
        min: eventData.price,
        max: eventData.price,
        count: 1,
      };
    } else {
      priceRanges[catKey].min = Math.min(
        priceRanges[catKey].min,
        eventData.price
      );
      priceRanges[catKey].max = Math.max(
        priceRanges[catKey].max,
        eventData.price
      );
      priceRanges[catKey].count += 1;
    }
  }

  await db
    .update(userInterestProfile)
    .set({
      productInterests,
      categoryInterests,
      marketInterests,
      lastUpdated: new Date(),
    })
    .where(eq(userInterestProfile.userId, userId));
}

export async function getUserInterestRating(
  userId: string,
  productId: string
): Promise<number> {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(userInterestProfile)
    .where(eq(userInterestProfile.userId, userId));

  if (!profile) return 2; // Default neutral rating

  const productInterests = profile.productInterests as Record<string, number>;
  return productInterests[productId] || 2;
}

export async function getUserCategoryRange(
  userId: string,
  categoryId: string
): Promise<{ min: number; max: number } | null> {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(userInterestProfile)
    .where(eq(userInterestProfile.userId, userId));

  if (!profile) return null;

  const priceRanges = profile.priceRanges as Record<
    string,
    { min: number; max: number; count: number }
  >;
  const range = priceRanges[categoryId];

  return range ? { min: range.min, max: range.max } : null;
}

export async function getTopUserInterests(
  userId: string,
  limit: number = 10
) {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(userInterestProfile)
    .where(eq(userInterestProfile.userId, userId));

  if (!profile) return [];

  const productInterests = profile.productInterests as Record<string, number>;

  // Convert to array and sort by rating
  return Object.entries(productInterests)
    .map(([productId, rating]) => ({ productId, rating }))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}
