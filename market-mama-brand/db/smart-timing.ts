import "server-only";

import { eq } from "drizzle-orm";
import { smartTimingProfile, analyticsEvent, SmartTimingProfile } from "./schema";
import { getDb } from "./queries";

/**
 * Smart Timing: Learns when users are ready to engage
 * Tracks activity patterns and sends notifications at optimal times
 * - Heatmap of user activity by hour/day
 * - Preferred time windows (morning/afternoon/evening/night)
 * - Device type preferences
 * - Fatigue detection (don't overwhelm)
 */

interface TimeHeatmap {
  [dayHour: string]: number; // "0_08" = Monday 8am, "6_20" = Sunday 8pm
}

interface ActivityPattern {
  heatmap: TimeHeatmap;
  engagementRate: Record<string, number>;
}

export async function recordEngagementTime(
  userId: string,
  eventType: string,
  deviceType: string
) {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(smartTimingProfile)
    .where(eq(smartTimingProfile.userId, userId));

  const now = new Date();
  const dayOfWeek = now.getDay();
  const hour = now.getHours();
  const dayHourKey = `${dayOfWeek}_${hour}`;

  if (!profile) {
    // Create initial profile
    const heatmap: TimeHeatmap = { [dayHourKey]: 1 };

    await db.insert(smartTimingProfile).values({
      userId,
      readyTimeWindow: {
        dayOfWeek,
        startHour: Math.max(0, hour - 2),
        endHour: Math.min(23, hour + 2),
        score: 50,
      },
      activityPattern: {
        heatmap,
        engagementRate: { [eventType]: 1 },
      },
      deviceType,
      preferredTime: getTimeOfDay(hour),
    });
    return;
  }

  // Update activity heatmap
  const activityPattern = profile.activityPattern as ActivityPattern;
  const heatmap = activityPattern.heatmap || {};

  heatmap[dayHourKey] = (heatmap[dayHourKey] || 0) + 1;

  // Update engagement rate
  const engagementRate = activityPattern.engagementRate || {};
  engagementRate[eventType] = (engagementRate[eventType] || 0) + 1;

  // Calculate most active time window
  const topTimeWindow = findTopTimeWindow(heatmap);

  await db
    .update(smartTimingProfile)
    .set({
      readyTimeWindow: topTimeWindow,
      activityPattern: { heatmap, engagementRate },
      deviceType,
      preferredTime: getTimeOfDay(topTimeWindow.startHour),
      lastUpdated: new Date(),
    })
    .where(eq(smartTimingProfile.userId, userId));
}

function getTimeOfDay(hour: number): string {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

function findTopTimeWindow(
  heatmap: TimeHeatmap
): { dayOfWeek: number; startHour: number; endHour: number; score: number } {
  let maxScore = 0;
  let bestWindow = {
    dayOfWeek: 0,
    startHour: 9,
    endHour: 17,
    score: 50,
  };

  // Find 2-hour window with highest engagement
  for (const [key, count] of Object.entries(heatmap)) {
    const [dayStr, hourStr] = key.split("_");
    const day = parseInt(dayStr);
    const hour = parseInt(hourStr);
    const score = count as number;

    if (score > maxScore) {
      maxScore = score;
      bestWindow = {
        dayOfWeek: day,
        startHour: Math.max(0, hour - 1),
        endHour: Math.min(23, hour + 1),
        score: Math.min(Math.round(score * 5), 100), // Convert to 0-100
      };
    }
  }

  return bestWindow;
}

export async function getOptimalSendTime(
  userId: string
): Promise<{
  window: { start: number; end: number };
  score: number;
  nextWindow: Date;
}> {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(smartTimingProfile)
    .where(eq(smartTimingProfile.userId, userId));

  if (!profile) {
    // Default morning window
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    return {
      window: { start: 9, end: 12 },
      score: 50,
      nextWindow: tomorrow,
    };
  }

  const readyTimeWindow = profile.readyTimeWindow as any;
  const now = new Date();

  // Calculate next optimal time
  let nextWindow = new Date(now);
  nextWindow.setHours(readyTimeWindow.startHour, 0, 0, 0);

  // If we're past today's window, move to tomorrow
  if (nextWindow <= now) {
    nextWindow.setDate(nextWindow.getDate() + 1);
  }

  return {
    window: {
      start: readyTimeWindow.startHour,
      end: readyTimeWindow.endHour,
    },
    score: readyTimeWindow.score || 50,
    nextWindow,
  };
}

export async function getSmartTimingScore(userId: string): Promise<number> {
  const db = getDb();

  const [profile] = await db
    .select()
    .from(smartTimingProfile)
    .where(eq(smartTimingProfile.userId, userId));

  if (!profile) return 0;

  const readyTimeWindow = profile.readyTimeWindow as any;
  return readyTimeWindow?.score || 0;
}

export async function isOptimalTimeWindow(userId: string): Promise<boolean> {
  const now = new Date();
  const hour = now.getHours();

  const db = getDb();

  const [profile] = await db
    .select()
    .from(smartTimingProfile)
    .where(eq(smartTimingProfile.userId, userId));

  if (!profile) return true; // Send if no preference

  const readyTimeWindow = profile.readyTimeWindow as any;

  // Check if current hour is within optimal window
  return (
    hour >= readyTimeWindow.startHour && hour <= readyTimeWindow.endHour
  );
}
