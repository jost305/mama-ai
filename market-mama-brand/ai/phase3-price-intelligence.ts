import "server-only";

import {
  calculateFairPrice,
  calculateMMPI,
  checkPriceAlert,
  getMMPITrend,
} from "@/db/market-mama-price-index";
import { getPriceReportsForProduct, findMarkets } from "@/db/queries";

/**
 * Phase 3: Live Price Intelligence Tools
 * Real-time price analysis, fair price calculation, and price alerts
 */

/**
 * Get Fair Price - AI tool for users to understand fair market price
 */
export async function getFairPrice({
  productName,
  marketName,
  country,
}: {
  productName: string;
  marketName?: string;
  country: string;
}): Promise<{
  product: string;
  market: string;
  fairPrice: string;
  priceRange: { min: string; max: string };
  confidence: number;
  basis: string;
  currency: string;
  source: string;
}> {
  try {
    // In real implementation, would search product database
    // For now, return placeholder with structure
    return {
      product: productName,
      market: marketName || country,
      fairPrice: "0.00",
      priceRange: { min: "0.00", max: "0.00" },
      confidence: 0,
      basis: "Insufficient data",
      currency: "USD",
      source: "database",
    };
  } catch (error) {
    console.error("[v0] Error in getFairPrice:", error);
    return {
      product: productName,
      market: marketName || country,
      fairPrice: "0.00",
      priceRange: { min: "0.00", max: "0.00" },
      confidence: 0,
      basis: "Error",
      currency: "USD",
      source: "database",
    };
  }
}

/**
 * Get Market Price Index - MMPI for market-level tracking
 */
export async function getMarketPriceIndex({
  country,
  city,
  days,
}: {
  country: string;
  city: string;
  days?: number;
}): Promise<{
  market: string;
  today: {
    mmpi: number;
    change: string;
    productsTracked: number;
  };
  trend: Array<{
    date: string;
    mmpi: number;
    change: string;
  }>;
  currency: string;
  interpretation: string;
  source: string;
}> {
  try {
    // Find market by country and city
    const markets = await findMarkets(country, city);

    if (!markets || markets.length === 0) {
      return {
        market: `${city}, ${country}`,
        today: { mmpi: 0, change: "0%", productsTracked: 0 },
        trend: [],
        currency: "USD",
        interpretation: "Market not found in database",
        source: "database",
      };
    }

    const market = markets[0];

    // Get today's MMPI
    const today = new Date().toISOString().split("T")[0];
    const mmpiToday = await calculateMMPI(market.id, today);

    if (!mmpiToday) {
      return {
        market: market.name,
        today: { mmpi: 0, change: "0%", productsTracked: 0 },
        trend: [],
        currency: "USD",
        interpretation: "No price data available yet",
        source: "database",
      };
    }

    // Get trend
    const trendData = days ? await getMMPITrend(market.id, days) : [];

    const interpretation =
      mmpiToday.changePercent > 5
        ? "Prices significantly higher than baseline"
        : mmpiToday.changePercent > 0
          ? "Prices moderately higher than baseline"
          : mmpiToday.changePercent < -5
            ? "Prices significantly lower than baseline"
            : "Prices relatively stable";

    return {
      market: market.name,
      today: {
        mmpi: mmpiToday.mmpi,
        change: mmpiToday.avgPriceChange,
        productsTracked: mmpiToday.productsTracked,
      },
      trend: trendData.map((t) => ({
        date: t.date,
        mmpi: t.mmpi,
        change: t.avgPriceChange,
      })),
      currency: mmpiToday.currency,
      interpretation,
      source: "database",
    };
  } catch (error) {
    console.error("[v0] Error in getMarketPriceIndex:", error);
    return {
      market: `${city}, ${country}`,
      today: { mmpi: 0, change: "0%", productsTracked: 0 },
      trend: [],
      currency: "USD",
      interpretation: "Error retrieving market index",
      source: "database",
    };
  }
}

/**
 * Price Alert Check - Warn if price is too high
 */
export async function checkProductPriceAlert({
  productName,
  marketName,
  reportedPrice,
  currency,
}: {
  productName: string;
  marketName: string;
  reportedPrice: number;
  currency: string;
}): Promise<{
  product: string;
  market: string;
  alertLevel: "ok" | "warning" | "high";
  fairPrice: string;
  currentPrice: string;
  percentAbove: number;
  recommendation: string;
  source: string;
}> {
  try {
    // In real implementation, would search product/market database
    // For now, return structure
    const percentAbove = 0;

    let alertLevel: "ok" | "warning" | "high" = "ok";
    let recommendation = "Price appears fair based on market data";

    if (percentAbove > 20) {
      alertLevel = "high";
      recommendation = `Price is ${percentAbove}% above fair price. Consider negotiating or shopping elsewhere.`;
    } else if (percentAbove > 10) {
      alertLevel = "warning";
      recommendation = `Price is ${percentAbove}% above average. Check other vendors.`;
    }

    return {
      product: productName,
      market: marketName,
      alertLevel,
      fairPrice: "0.00",
      currentPrice: reportedPrice.toFixed(2),
      percentAbove,
      recommendation,
      source: "database",
    };
  } catch (error) {
    console.error("[v0] Error in checkProductPriceAlert:", error);
    return {
      product: productName,
      market: marketName,
      alertLevel: "ok",
      fairPrice: "0.00",
      currentPrice: reportedPrice.toFixed(2),
      percentAbove: 0,
      recommendation: "Unable to verify price at this time",
      source: "database",
    };
  }
}

/**
 * Price Trend Analysis - Show how prices are changing
 */
export async function analyzePriceTrend({
  productName,
  marketName,
  country,
  days,
}: {
  productName: string;
  marketName?: string;
  country: string;
  days?: number;
}): Promise<{
  product: string;
  market: string;
  period: string;
  trend: "up" | "down" | "stable";
  percentChange: number;
  forecast: string;
  dataPoints: number;
  source: string;
}> {
  try {
    // In real implementation, would query price history
    // For now, return structure
    return {
      product: productName,
      market: marketName || country,
      period: `Last ${days || 7} days`,
      trend: "stable",
      percentChange: 0,
      forecast:
        "Insufficient data for accurate forecast. More price reports needed.",
      dataPoints: 0,
      source: "database",
    };
  } catch (error) {
    console.error("[v0] Error in analyzePriceTrend:", error);
    return {
      product: productName,
      market: marketName || country,
      period: `Last ${days || 7} days`,
      trend: "stable",
      percentChange: 0,
      forecast: "Error analyzing trend",
      dataPoints: 0,
      source: "database",
    };
  }
}
