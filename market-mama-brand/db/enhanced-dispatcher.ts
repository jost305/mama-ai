import "server-only";

import {
  eq,
  and,
  gte,
  lte,
  desc,
  inArray,
} from "drizzle-orm";
import {
  notification,
  notificationRule,
  userPreferences,
  analyticsEvent,
  CommerceEvent,
  EventDecisionScore,
} from "./schema";
import { getDb } from "./queries";
import {
  scoreEventForUser,
  getImmediateSendEvents,
  getBatchableEvents,
  getDigestEvents,
} from "./commerce-decision-engine";
import {
  generateMessage,
  getAvailableLanguages,
} from "../ai/mama-voice-engine";
import { isOptimalTimeWindow } from "./smart-timing";

/**
 * Enhanced Notification Dispatcher (Sprint 6 Integration)
 * Orchestrates the entire notification flow:
 * 1. Score commerce events
 * 2. Route to appropriate channel (send_now, batch, digest, ignore)
 * 3. Generate Mama Voice message
 * 4. Queue for delivery at optimal time
 * 5. Track delivery and engagement
 */

export interface DispatchEvent {
  event: CommerceEvent;
  score: EventDecisionScore;
  userId: string;
  decision: "send_now" | "batch" | "digest" | "ignore";
  message?: string;
  language: string;
  channel: string;
  scheduledTime?: Date;
}

export async function processCommerceEvent(
  event: CommerceEvent,
  userIds: string[]
) {
  const dispatches: DispatchEvent[] = [];

  for (const userId of userIds) {
    try {
      // Score the event
      const score = await scoreEventForUser(event, userId);

      // Get user preferences
      const [prefs] = await getDb()
        .select()
        .from(userPreferences)
        .where(eq(userPreferences.userId, userId));

      const language = prefs?.language || "en";
      const channel = prefs?.preferredChannel || "whatsapp";

      // Generate Mama Voice message
      const eventData = event.data as any;
      const messageVars = {
        productName: eventData.productName,
        market: eventData.marketName,
        price: eventData.newPrice,
        discount: eventData.percentChange,
        seller: eventData.sellerName,
      };

      const message = generateMessage(
        "price_alert",
        language,
        messageVars,
        "urgent"
      );

      // Create dispatch entry
      const dispatch: DispatchEvent = {
        event,
        score,
        userId,
        decision: score.decision as any,
        message: message || undefined,
        language,
        channel,
      };

      // Determine optimal send time for non-immediate dispatches
      if (score.decision !== "send_now") {
        const isOptimal = await isOptimalTimeWindow(userId);
        if (!isOptimal) {
          // Schedule for next optimal window
          dispatch.scheduledTime = calculateNextOptimalTime(
            prefs?.timezone || "UTC"
          );
        }
      }

      dispatches.push(dispatch);
    } catch (err) {
      console.error(`[v0] Error processing event for user ${userId}:`, err);
    }
  }

  return dispatches;
}

export async function dispatchNotifications(
  dispatches: DispatchEvent[]
) {
  const db = getDb();
  const immediateDispatches = dispatches.filter((d) => d.decision === "send_now");
  const batchDispatches = dispatches.filter((d) => d.decision === "batch");
  const digestDispatches = dispatches.filter((d) => d.decision === "digest");
  const ignoreDispatches = dispatches.filter((d) => d.decision === "ignore");

  // SEND_NOW: Send immediately
  for (const dispatch of immediateDispatches) {
    await sendNotificationNow(dispatch);
  }

  // BATCH: Collect and send in groups within 6 hours
  if (batchDispatches.length > 0) {
    await queueBatchNotifications(batchDispatches);
  }

  // DIGEST: Collect and send in daily digest (8am preferred)
  if (digestDispatches.length > 0) {
    await queueDigestNotifications(digestDispatches);
  }

  // IGNORE: Don't send but track in analytics
  for (const dispatch of ignoreDispatches) {
    console.log(
      `[v0] Ignoring low-value event for user ${dispatch.userId}: score=${dispatch.score.totalScore}`
    );
  }

  return {
    sent_now: immediateDispatches.length,
    batched: batchDispatches.length,
    digested: digestDispatches.length,
    ignored: ignoreDispatches.length,
  };
}

async function sendNotificationNow(dispatch: DispatchEvent) {
  const db = getDb();

  // Create notification record
  const [rule] = await db
    .select()
    .from(notificationRule)
    .where(eq(notificationRule.userId, dispatch.userId))
    .limit(1);

  if (!rule) {
    console.error(
      `[v0] No notification rule found for user ${dispatch.userId}`
    );
    return;
  }

  const notif = await db.insert(notification).values({
    userId: dispatch.userId,
    ruleId: rule.id,
    watchlistId: rule.watchlistId,
    type: "price_alert",
    title: `Price Alert: ${dispatch.message?.split("!")[0] || "Great Deal!"}`,
    message: dispatch.message || "Check out this great deal!",
    channel: dispatch.channel,
    metadata: {
      eventId: dispatch.event.id,
      decisionScore: dispatch.score.totalScore,
      language: dispatch.language,
    },
  });

  console.log(`[v0] Sent notification to user ${dispatch.userId}`);
  return notif;
}

async function queueBatchNotifications(dispatches: DispatchEvent[]) {
  // Batch will be processed in 6 hours or when threshold reached
  // For now, just log
  console.log(
    `[v0] Queued ${dispatches.length} notifications for batch delivery`
  );
}

async function queueDigestNotifications(dispatches: DispatchEvent[]) {
  // Digest will be processed at user's preferred digest time (default 8am)
  console.log(
    `[v0] Queued ${dispatches.length} notifications for daily digest`
  );
}

function calculateNextOptimalTime(timezone: string): Date {
  const now = new Date();
  const nextTime = new Date(now);

  // Default to 9am next day if no specific time preference
  nextTime.setDate(nextTime.getDate() + 1);
  nextTime.setHours(9, 0, 0, 0);

  // TODO: Convert to user's timezone

  return nextTime;
}

export async function createBatchedNotification(
  userId: string,
  events: DispatchEvent[],
  batchWindow: { startTime: Date; endTime: Date }
) {
  const db = getDb();

  // Get user preferences
  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));

  const language = prefs?.language || "en";
  const channel = prefs?.preferredChannel || "whatsapp";

  // Generate batch summary
  const summary = {
    totalEvents: events.length,
    bestDeal: events.reduce((a: DispatchEvent, b: DispatchEvent) =>
      (b.score?.priceImpactScore || 0) > (a.score?.priceImpactScore || 0) ? b : a
    ),
    window: {
      start: batchWindow.startTime.toISOString(),
      end: batchWindow.endTime.toISOString(),
    },
    events: events.map((e: DispatchEvent) => ({
      product: (e.event.data as any).productName,
      market: (e.event.data as any).marketName,
      score: e.score.totalScore,
    })),
  };

  // Create batched notification
  const [rule] = await db
    .select()
    .from(notificationRule)
    .where(eq(notificationRule.userId, userId))
    .limit(1);

  if (!rule) return null;

  const message = generateMessage(
    "deal",
    language,
    {
      productName: (summary.bestDeal.event.data as any).productName,
      market: (summary.bestDeal.event.data as any).marketName,
      price: (summary.bestDeal.event.data as any).newPrice,
      reason: `${summary.totalEvents} deals found in your area`,
    },
    "celebratory"
  );

  const notif = await db.insert(notification).values({
    userId,
    ruleId: rule.id,
    watchlistId: rule.watchlistId,
    type: "batch",
    title: `${summary.totalEvents} Great Deals For You!`,
    message: message || `Check out ${summary.totalEvents} new deals!`,
    channel,
    metadata: summary,
  });

  return notif;
}

export async function createDailyDigest(userId: string) {
  const db = getDb();

  // Get today's digest events
  const digestEvents = await getDigestEvents(userId);

  if (digestEvents.length === 0) return null;

  const [prefs] = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId));

  const language = prefs?.language || "en";
  const channel = prefs?.preferredChannel || "whatsapp";

  // Generate digest summary
  const topEvents = digestEvents.slice(0, 5); // Top 5 events
  const summary = topEvents.map((e: any) => ({
    product: (e?.event?.data as any)?.productName,
    market: (e?.event?.data as any)?.marketName,
    score: e?.score?.totalScore,
  }));

  const message =
    `Your Daily Market Update:\n\n` +
    summary
      .map(
        (e: any, i: number) =>
          `${i + 1}. ${e.product} at ${e.market} (Score: ${e.score})`
      )
      .join("\n");

  const [rule] = await db
    .select()
    .from(notificationRule)
    .where(eq(notificationRule.userId, userId))
    .limit(1);

  if (!rule) return null;

  const notif = await db.insert(notification).values({
    userId,
    ruleId: rule.id,
    watchlistId: rule.watchlistId,
    type: "digest",
    title: "Your Daily Market Update",
    message,
    channel,
    metadata: { events: summary, totalEvents: digestEvents.length },
  });

  return notif;
}
