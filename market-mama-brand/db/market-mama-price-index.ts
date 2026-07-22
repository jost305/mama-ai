import "server-only";

import { eq, and, gte, desc } from "drizzle-orm";
import { dailyPriceRollup, market, product } from "./schema";
import { getDb } from "./queries";

/**
 * MarketMama Price Index (MMPI)
 * Market-level daily price indicator for tracking inflation and trends
 */

export interface MMPIReading {
  date: string;
  marketId: string;
  marketName: string;
  mmpi: number; // Indexed to 100 on baseline date
  changePercent: number;
  productsTracked: number;
  avgPriceChange: string;
  currency: string;
}

export interface FairPriceResult {
  productName: string;
  marketName: string;
  fairPrice: string;
  minPrice: string;
  maxPrice: string;
  avgPrice: string;
  confidence: number;
  basis: string;
  currency: string;
}

/**
 * Calculate MMPI for a market on a specific date
 * MMPI = (Current Day Avg / Baseline Avg) * 100
 */
export async function calculateMMPI(
  marketId: string,
  date: string,
  baselineDate?: string
): Promise<MMPIReading | null> {
  try {
    // Get market data
    const [marketData] = await getDb()
      .select()
      .from(market)
      .where(eq(market.id, marketId))
      .limit(1);

    if (!marketData) {
      return null;
    }

    // Get all price rollups for this market on the date
    const todayRollups = await getDb()
      .select()
      .from(dailyPriceRollup)
      .where(and(eq(dailyPriceRollup.marketId, marketId), eq(dailyPriceRollup.date, date)))
      .limit(100);

    if (todayRollups.length === 0) {
      return null;
    }

    // Calculate average price for today
    const todayAvgPrices = todayRollups.map((r: any) =>
      parseFloat((r?.avgPrice as string) || "0")
    );
    const todayAverage =
      todayAvgPrices.reduce((a: number, b: number) => a + b, 0) / todayAvgPrices.length;

    // Determine baseline date (default to 30 days ago)
    const baselineD = baselineDate
      ? new Date(baselineDate)
      : new Date();
    if (!baselineDate) {
      baselineD.setDate(baselineD.getDate() - 30);
    }
    const baseline = baselineD.toISOString().split("T")[0];

    // Get baseline rollups
    const baselineRollups = await getDb()
      .select()
      .from(dailyPriceRollup)
      .where(
        and(eq(dailyPriceRollup.marketId, marketId), eq(dailyPriceRollup.date, baseline))
      )
      .limit(100);

    let baselineAverage = 100; // Default if no baseline data
    if (baselineRollups.length > 0) {
      const baselineAvgPrices = baselineRollups.map((r: any) =>
        parseFloat((r?.avgPrice as string) || "0")
      );
      baselineAverage = baselineAvgPrices.reduce((a: number, b: number) => a + b, 0) / baselineAvgPrices.length;
    }

    // Calculate MMPI
    const mmpi = (todayAverage / baselineAverage) * 100;
    const changePercent = ((mmpi - 100) / 100) * 100;

    // Get currency from first rollup
    const currency = todayRollups[0].currency;

    return {
      date,
      marketId,
      marketName: marketData.name,
      mmpi: Math.round(mmpi * 100) / 100, // 2 decimal places
      changePercent: Math.round(changePercent * 100) / 100,
      productsTracked: todayRollups.length,
      avgPriceChange: `${Math.round(changePercent * 100) / 100}%`,
      currency,
    };
  } catch (error) {
    console.error("[v0] MMPI calculation error:", error);
    return null;
  }
}

/**
 * Calculate Fair Price for a product in a market
 * Fair price = median of recent verified prices (resistant to outliers)
 */
export async function calculateFairPrice(
  productId: string,
  marketId: string,
  daysBack: number = 7
): Promise<FairPriceResult | null> {
  try {
    // Get product and market data
    const [productData] = await getDb()
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);

    const [marketData] = await getDb()
      .select()
      .from(market)
      .where(eq(market.id, marketId))
      .limit(1);

    if (!productData || !marketData) {
      return null;
    }

    // Get daily rollups for the period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);
    const cutoffDateStr = cutoffDate.toISOString().split("T")[0];

    const rollups = await getDb()
      .select()
      .from(dailyPriceRollup)
      .where(
        and(
          eq(dailyPriceRollup.productId, productId),
          eq(dailyPriceRollup.marketId, marketId),
          gte(dailyPriceRollup.date, cutoffDateStr)
        )
      )
      .orderBy(desc(dailyPriceRollup.date));

    if (rollups.length === 0) {
      return null;
    }

    // Extract prices
    const avgPrices = rollups.map((r: any) =>
      parseFloat((r?.avgPrice as string) || "0")
    );
    const minPrices = rollups.map((r: any) =>
      parseFloat((r?.minPrice as string) || "0")
    );
    const maxPrices = rollups.map((r: any) =>
      parseFloat((r?.maxPrice as string) || "0")
    );

    // Calculate median (fair price)
    const sorted = [...avgPrices].sort((a: number, b: number) => a - b);
    const fairPrice =
      sorted.length % 2 === 0
        ? ((sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2).toFixed(2)
        : sorted[Math.floor(sorted.length / 2)].toFixed(2);

    // Calculate min/max across all reports
    const overallMin = Math.min(...minPrices).toFixed(2);
    const overallMax = Math.max(...maxPrices).toFixed(2);
    const overallAvg = (avgPrices.reduce((a: number, b: number) => a + b, 0) / avgPrices.length).toFixed(2);

    // Confidence based on data recency and count
    const recencyScore = rollups.filter(
      (r: any) => {
        const reportDate = new Date((r?.date || "") + "T00:00:00Z");
        const daysOld = (Date.now() - reportDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysOld <= 3; // Recent within 3 days
      }
    ).length > 0 ? 0.9 : 0.7;

    const volumeScore = Math.min(rollups.length / 7, 1.0); // 7+ rollups = high confidence
    const confidence = (recencyScore + volumeScore) / 2;

    return {
      productName: productData.nameEnglish,
      marketName: marketData.name,
      fairPrice: fairPrice,
      minPrice: overallMin,
      maxPrice: overallMax,
      avgPrice: overallAvg,
      confidence: Math.round(confidence * 100) / 100,
      basis: `Median of ${rollups.length} daily reports over ${daysBack} days`,
      currency: rollups[0].currency,
    };
  } catch (error) {
    console.error("[v0] Fair price calculation error:", error);
    return null;
  }
}

/**
 * Get MMPI trend over time
 */
export async function getMMPITrend(
  marketId: string,
  days: number = 30
): Promise<MMPIReading[]> {
  try {
    const results: MMPIReading[] = [];

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      const mmpiReading = await calculateMMPI(marketId, dateStr);

      if (mmpiReading) {
        results.push(mmpiReading);
      }
    }

    return results;
  } catch (error) {
    console.error("[v0] MMPI trend error:", error);
    return [];
  }
}

/**
 * Price Alert: Check if product exceeded fair price
 */
export async function checkPriceAlert(
  productId: string,
  marketId: string,
  currentPrice: number,
  threshold: number = 1.2 // 20% above fair price
): Promise<{
  isAlert: boolean;
  fairPrice: string;
  currentPrice: string;
  percentAbove: number;
  message: string;
}> {
  try {
    const fairPriceData = await calculateFairPrice(productId, marketId);

    if (!fairPriceData) {
      return {
        isAlert: false,
        fairPrice: "0",
        currentPrice: currentPrice.toString(),
        percentAbove: 0,
        message: "No fair price data available",
      };
    }

    const fairPrice = parseFloat(fairPriceData.fairPrice);
    const percentAbove = currentPrice / fairPrice;

    const isAlert = percentAbove > threshold;

    return {
      isAlert,
      fairPrice: fairPriceData.fairPrice,
      currentPrice: currentPrice.toFixed(2),
      percentAbove: Math.round((percentAbove - 1) * 100),
      message: isAlert
        ? `Price is ${Math.round((percentAbove - 1) * 100)}% above fair price of ${fairPriceData.fairPrice}`
        : `Price is within normal range`,
    };
  } catch (error) {
    console.error("[v0] Price alert check error:", error);
    return {
      isAlert: false,
      fairPrice: "0",
      currentPrice: currentPrice.toString(),
      percentAbove: 0,
      message: "Error checking price alert",
    };
  }
}
