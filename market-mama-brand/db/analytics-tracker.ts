import "server-only";

import { eq, and, gte, lte } from "drizzle-orm";
import { analyticsEvent, notification, AnalyticsEvent } from "./schema";
import { getDb } from "./queries";

/**
 * Analytics Tracker: Measures notification performance
 * Key metrics:
 * - Open rate: % of sent notifications opened
 * - Click rate: % of opened notifications clicked  
 * - Purchase rate: % of clicks leading to purchases
 * - Money saved: Aggregated savings from price alerts
 * - Retention: % users active after 30 days
 * - Engagement by hour/day: Optimal send times
 */

export interface NotificationMetrics {
  sent: number;
  opened: number;
  clicked: number;
  purchased: number;
  openRate: number;
  clickRate: number;
  purchaseRate: number;
  averageSavings: number;
  totalSavings: number;
}

export interface DailyMetrics {
  date: string;
  sent: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
}

export async function trackNotificationOpen(notificationId: string) {
  const db = getDb();

  const [notif] = await db
    .select()
    .from(notification)
    .where(eq(notification.id, notificationId));

  if (notif) {
    await db.insert(analyticsEvent).values({
      userId: notif.userId,
      notificationId,
      eventType: "opened",
      eventData: { timestamp: new Date().toISOString() },
    });

    // Mark notification as read
    await db
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notification.id, notificationId));
  }
}

export async function trackNotificationClick(
  notificationId: string,
  clickData?: Record<string, any>
) {
  const db = getDb();

  const [notif] = await db
    .select()
    .from(notification)
    .where(eq(notification.id, notificationId));

  if (notif) {
    await db.insert(analyticsEvent).values({
      userId: notif.userId,
      notificationId,
      eventType: "clicked",
      eventData: {
        timestamp: new Date().toISOString(),
        ...clickData,
      },
    });
  }
}

export async function trackPurchase(
  userId: string,
  notificationId: string,
  purchaseData: {
    productId: string;
    amount: number;
    savingsAmount: number;
  }
) {
  const db = getDb();

  await db.insert(analyticsEvent).values({
    userId,
    notificationId,
    eventType: "purchased",
    eventData: {
      timestamp: new Date().toISOString(),
      ...purchaseData,
    },
  });
}

export async function getNotificationMetrics(
  userId: string,
  days: number = 30
): Promise<NotificationMetrics> {
  const db = getDb();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const sent = await db
    .select()
    .from(notification)
    .where(and(eq(notification.userId, userId), gte(notification.sentAt, cutoffDate)));

  const events = await db
    .select()
    .from(analyticsEvent)
    .where(
      and(
        eq(analyticsEvent.userId, userId),
        gte(analyticsEvent.createdAt, cutoffDate)
      )
    );

  const opened = events.filter((e: any) => e.eventType === "opened").length;
  const clicked = events.filter((e: any) => e.eventType === "clicked").length;
  const purchased = events.filter((e: any) => e.eventType === "purchased");

  let totalSavings = 0;
  for (const event of purchased) {
    const eventData = event.eventData as any;
    if (eventData?.savingsAmount) {
      totalSavings += eventData.savingsAmount;
    }
  }

  return {
    sent: sent.length,
    opened,
    clicked,
    purchased: purchased.length,
    openRate: sent.length > 0 ? (opened / sent.length) * 100 : 0,
    clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
    purchaseRate: clicked > 0 ? (purchased.length / clicked) * 100 : 0,
    averageSavings: purchased.length > 0 ? totalSavings / purchased.length : 0,
    totalSavings,
  };
}

export async function getDailyMetrics(
  userId: string,
  dateStr: string
): Promise<DailyMetrics> {
  const db = getDb();

  const dayStart = new Date(dateStr + "T00:00:00Z");
  const dayEnd = new Date(dateStr + "T23:59:59Z");

  const sentToday = await db
    .select()
    .from(notification)
    .where(
      and(
        eq(notification.userId, userId),
        gte(notification.sentAt, dayStart),
        lte(notification.sentAt, dayEnd)
      )
    );

  const eventsToday = await db
    .select()
    .from(analyticsEvent)
    .where(
      and(
        eq(analyticsEvent.userId, userId),
        gte(analyticsEvent.createdAt, dayStart),
        lte(analyticsEvent.createdAt, dayEnd)
      )
    );

  const opened = eventsToday.filter((e: any) => e.eventType === "opened").length;
  const clicked = eventsToday.filter((e: any) => e.eventType === "clicked").length;

  return {
    date: dateStr,
    sent: sentToday.length,
    opened,
    clicked,
    openRate: sentToday.length > 0 ? (opened / sentToday.length) * 100 : 0,
    clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
  };
}

export async function getEngagementByHour(userId: string, days: number = 30) {
  const db = getDb();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const events = await db
    .select()
    .from(analyticsEvent)
    .where(
      and(
        eq(analyticsEvent.userId, userId),
        gte(analyticsEvent.createdAt, cutoffDate)
      )
    );

  const hourlyMetrics: Record<
    number,
    { opens: number; clicks: number; purchases: number }
  > = {};

  for (let i = 0; i < 24; i++) {
    hourlyMetrics[i] = { opens: 0, clicks: 0, purchases: 0 };
  }

  for (const event of events) {
    const hour = new Date(event.createdAt as any).getHours();

    if (event.eventType === "opened") hourlyMetrics[hour].opens += 1;
    else if (event.eventType === "clicked") hourlyMetrics[hour].clicks += 1;
    else if (event.eventType === "purchased")
      hourlyMetrics[hour].purchases += 1;
  }

  return hourlyMetrics;
}

export async function getEngagementByDay(userId: string, weeks: number = 4) {
  const db = getDb();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - weeks * 7);

  const events = await db
    .select()
    .from(analyticsEvent)
    .where(
      and(
        eq(analyticsEvent.userId, userId),
        gte(analyticsEvent.createdAt, cutoffDate)
      )
    );

  const dailyMetrics: Record<
    number,
    { opens: number; clicks: number; purchases: number }
  > = {};

  for (let i = 0; i < 7; i++) {
    dailyMetrics[i] = { opens: 0, clicks: 0, purchases: 0 };
  }

  for (const event of events) {
    const dayOfWeek = new Date(event.createdAt as any).getDay();

    if (event.eventType === "opened") dailyMetrics[dayOfWeek].opens += 1;
    else if (event.eventType === "clicked") dailyMetrics[dayOfWeek].clicks += 1;
    else if (event.eventType === "purchased")
      dailyMetrics[dayOfWeek].purchases += 1;
  }

  return dailyMetrics;
}

export async function getUserRetention(
  userId: string,
  days: number = 30
): Promise<boolean> {
  const db = getDb();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const recentActivity = await db
    .select()
    .from(analyticsEvent)
    .where(
      and(
        eq(analyticsEvent.userId, userId),
        gte(analyticsEvent.createdAt, cutoffDate)
      )
    );

  // User is retained if they have activity within the period
  return recentActivity.length > 0;
}
