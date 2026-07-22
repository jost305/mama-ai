import "server-only";

import { eq, and, gte, lte } from "drizzle-orm";
import {
  notification,
  notificationRule,
  userPreferences,
  watchlist,
} from "./schema";
import {
  getDb,
  getNotificationRules,
  getUserPreferences,
  sendNotification,
  getNotifications,
} from "./queries";

/**
 * Phase 5: Notification Engine
 * Rule-based (not LLM) notification processing with fatigue control
 */

export interface NotificationContext {
  userId: string;
  ruleId: string;
  watchlistId: string;
  eventType: string;
  eventData: Record<string, any>;
  productName?: string;
  marketName?: string;
}

/**
 * Check if user is in quiet hours
 */
function isInQuietHours(
  quietHoursStart: number,
  quietHoursEnd: number,
  timezone: string
): boolean {
  try {
    const now = new Date();

    // Simple UTC-based quiet hours (would use timezone library in production)
    const hour = now.getUTCHours();

    if (quietHoursStart < quietHoursEnd) {
      // Normal range (e.g., 8am-10pm)
      return hour >= quietHoursStart && hour < quietHoursEnd;
    } else {
      // Wrapping range (e.g., 10pm-8am)
      return hour >= quietHoursStart || hour < quietHoursEnd;
    }
  } catch (error) {
    console.error("[v0] Quiet hours check error:", error);
    return false;
  }
}

/**
 * Check notification fatigue - has user hit daily limit?
 */
async function checkNotificationFatigue(
  userId: string,
  maxPerDay: number
): Promise<boolean> {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayNotifications = await getDb()
      .select()
      .from(notification)
      .where(and(eq(notification.userId, userId), gte(notification.sentAt, today)));

    return todayNotifications.length < maxPerDay;
  } catch (error) {
    console.error("[v0] Fatigue check error:", error);
    return true; // Allow on error
  }
}

/**
 * Check if event window has already sent notification
 * Prevents duplicate notifications for same event within timeframe
 */
async function checkEventWindow(
  ruleId: string,
  watchlistId: string,
  eventType: string,
  windowMinutes: number = 60
): Promise<boolean> {
  try {
    const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

    const recentNotif = await getDb()
      .select()
      .from(notification)
      .where(
        and(
          eq(notification.ruleId, ruleId),
          eq(notification.watchlistId, watchlistId),
          eq(notification.type, eventType),
          gte(notification.sentAt, cutoff)
        )
      )
      .limit(1);

    return recentNotif.length === 0; // Can send if no recent notification
  } catch (error) {
    console.error("[v0] Event window check error:", error);
    return true; // Allow on error
  }
}

/**
 * Evaluate rule condition against event data
 */
function evaluateCondition(
  condition: Record<string, any>,
  eventData: Record<string, any>
): boolean {
  try {
    const { field, operator, value } = condition;

    if (!field || !operator) {
      return false;
    }

    const eventValue = eventData[field];

    switch (operator) {
      case "equals":
        return eventValue === value;
      case "greater_than":
        return Number(eventValue) > Number(value);
      case "less_than":
        return Number(eventValue) < Number(value);
      case "greater_equal":
        return Number(eventValue) >= Number(value);
      case "less_equal":
        return Number(eventValue) <= Number(value);
      case "contains":
        return String(eventValue).includes(String(value));
      case "in":
        return Array.isArray(value) && value.includes(eventValue);
      default:
        return false;
    }
  } catch (error) {
    console.error("[v0] Condition evaluation error:", error);
    return false;
  }
}

/**
 * Main notification processing function
 */
export async function processNotification(
  context: NotificationContext
): Promise<{
  sent: boolean;
  reason: string;
}> {
  try {
    const { userId, ruleId, watchlistId, eventType, eventData } = context;

    // Step 1: Get rule
    const [rule] = await getDb()
      .select()
      .from(notificationRule)
      .where(eq(notificationRule.id, ruleId))
      .limit(1);

    if (!rule || !rule.isActive) {
      return { sent: false, reason: "Rule not found or inactive" };
    }

    // Step 2: Get user preferences
    const prefs = await getUserPreferences(userId);

    // Step 3: Check quiet hours
    const inQuiet = isInQuietHours(
      prefs.quietHoursStart || 22,
      prefs.quietHoursEnd || 8,
      prefs.timezone || "UTC"
    );

    if (inQuiet && !rule.quietHours?.override) {
      return { sent: false, reason: "User in quiet hours" };
    }

    // Step 4: Check notification fatigue
    const underLimit = await checkNotificationFatigue(
      userId,
      prefs.maxNotificationsPerDay || 10
    );

    if (!underLimit) {
      return { sent: false, reason: "Daily notification limit exceeded" };
    }

    // Step 5: Check event window (prevent duplicates)
    const windowClear = await checkEventWindow(ruleId, watchlistId, eventType, 60);

    if (!windowClear) {
      return { sent: false, reason: "Notification sent within event window" };
    }

    // Step 6: Evaluate rule condition
    const conditionMet = evaluateCondition(
      rule.condition as Record<string, any>,
      eventData
    );

    if (!conditionMet) {
      return { sent: false, reason: "Condition not met" };
    }

    // Step 7: Build and send notification
    const title = buildNotificationTitle(rule.ruleType, context);
    const message = buildNotificationMessage(rule.ruleType, context);

    await sendNotification({
      userId,
      ruleId,
      watchlistId,
      type: rule.ruleType,
      title,
      message,
      channel: rule.notificationChannel as string,
      metadata: {
        ...eventData,
        productName: context.productName,
        marketName: context.marketName,
      },
    });

    return { sent: true, reason: "Notification sent successfully" };
  } catch (error) {
    console.error("[v0] Notification processing error:", error);
    return {
      sent: false,
      reason: `Processing error: ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}

/**
 * Build notification title based on rule type
 */
function buildNotificationTitle(
  ruleType: string,
  context: NotificationContext
): string {
  switch (ruleType) {
    case "price_alert":
      return `Price Alert: ${context.productName}`;
    case "market_alert":
      return `Market Alert: ${context.marketName}`;
    case "shopping_nudge":
      return "Shopping Opportunity!";
    case "digest":
      return "Daily Market Summary";
    default:
      return "Market Update";
  }
}

/**
 * Build notification message
 */
function buildNotificationMessage(
  ruleType: string,
  context: NotificationContext
): string {
  const { eventData, productName, marketName } = context;

  switch (ruleType) {
    case "price_alert": {
      const fairPrice = eventData.fairPrice || "N/A";
      const currentPrice = eventData.currentPrice || "N/A";
      const percentAbove = eventData.percentAbove || 0;
      return `${productName} at ${marketName}: ${currentPrice} (Fair price: ${fairPrice}, +${percentAbove}%)`;
    }
    case "market_alert": {
      const mmpi = eventData.mmpi || 0;
      const change = eventData.change || "0%";
      return `${marketName} Market Index: ${mmpi} (${change} from baseline)`;
    }
    case "shopping_nudge": {
      return `${productName} prices are down in ${marketName}. Great time to buy!`;
    }
    case "digest": {
      const items = eventData.items || 0;
      return `${items} price updates from your watchlist today`;
    }
    default:
      return "You have a new market update";
  }
}

/**
 * Generate daily digest
 */
export async function generateDailyDigest(userId: string): Promise<{
  generated: boolean;
  notificationCount: number;
  message: string;
}> {
  try {
    // Get user preferences
    const prefs = await getUserPreferences(userId);

    if (!prefs.dailyDigestEnabled) {
      return { generated: false, notificationCount: 0, message: "Digest disabled" };
    }

    // Get today's notifications
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const todayNotifications = await getDb()
      .select()
      .from(notification)
      .where(
        and(eq(notification.userId, userId), gte(notification.sentAt, today))
      );

    if (todayNotifications.length === 0) {
      return {
        generated: false,
        notificationCount: 0,
        message: "No notifications to digest",
      };
    }

    // Get active watchlist items count
    const [watchlistCount] = await getDb()
      .select({ count: require("drizzle-orm").count().as("count") })
      .from(watchlist)
      .where(and(eq(watchlist.userId, userId), eq(watchlist.isActive, true)));

    // Send digest notification
    await sendNotification({
      userId,
      ruleId: "digest-" + userId,
      watchlistId: "digest-" + userId,
      type: "digest",
      title: "Daily Market Summary",
      message: `${todayNotifications.length} market updates from your ${watchlistCount?.count || 0} watched items`,
      channel: prefs.preferredChannel || "whatsapp",
      metadata: {
        items: todayNotifications.length,
        watchlist: watchlistCount?.count || 0,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      generated: true,
      notificationCount: todayNotifications.length,
      message: "Digest generated successfully",
    };
  } catch (error) {
    console.error("[v0] Digest generation error:", error);
    return {
      generated: false,
      notificationCount: 0,
      message: `Error: ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}
