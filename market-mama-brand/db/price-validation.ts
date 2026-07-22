import "server-only";

import { eq, and, desc, gte } from "drizzle-orm";
import { priceReport, dailyPriceRollup } from "./schema";
import { getDb } from "./queries";

/**
 * Phase 3: Live Price Intelligence
 * 5-step price validation pipeline with confidence scoring
 */

interface PriceValidationResult {
  isValid: boolean;
  confidence: number;
  validationSteps: {
    duplicateCheck: boolean;
    gpsVerification: boolean;
    photoValidation: boolean;
    outlierDetection: boolean;
    trendCorroboration: boolean;
  };
  reasons: string[];
}

/**
 * Step 1: Duplicate Detection
 * Check if same scout/seller reported same price recently
 */
async function checkDuplicates(
  sellerId: string,
  productId: string,
  reportedBy: string,
  hoursBack: number = 24
): Promise<boolean> {
  try {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const duplicates = await getDb()
      .select()
      .from(priceReport)
      .where(
        and(
          eq(priceReport.sellerId, sellerId),
          eq(priceReport.productId, productId),
          eq(priceReport.reportedBy, reportedBy),
          gte(priceReport.createdAt, cutoffTime)
        )
      );

    return duplicates.length === 0; // Return true if NO duplicates (valid)
  } catch (error) {
    console.error("[v0] Duplicate check failed:", error);
    return false;
  }
}

/**
 * Step 2: GPS Verification
 * Verify scout's GPS location matches market location
 */
function verifyGpsCoordinates(
  marketLat: string,
  marketLng: string,
  scoutLat: number,
  scoutLng: number,
  toleranceKm: number = 1
): boolean {
  try {
    const R = 6371; // Earth radius in km
    const lat1 = parseFloat(marketLat);
    const lon1 = parseFloat(marketLng);

    const dLat = ((scoutLat - lat1) * Math.PI) / 180;
    const dLon = ((scoutLng - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((scoutLat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= toleranceKm;
  } catch (error) {
    console.error("[v0] GPS verification failed:", error);
    return false;
  }
}

/**
 * Step 3: Photo Validation
 * Check if photo URL is valid and non-empty
 */
function validatePhoto(photoUrl?: string): boolean {
  if (!photoUrl) return false;

  try {
    new URL(photoUrl);
    return true;
  } catch {
    return false;
  }
}

/**
 * Step 4: Outlier Detection
 * Check if price is within 3 standard deviations
 */
async function detectOutliers(
  productId: string,
  marketId: string,
  newPrice: number,
  daysBack: number = 30
): Promise<boolean> {
  try {
    // Get recent prices for this product in this market
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    const recentPrices = await getDb()
      .select()
      .from(priceReport)
      .where(
        and(
          eq(priceReport.productId, productId),
          eq(priceReport.marketId, marketId),
          gte(priceReport.createdAt, cutoffDate)
        )
      );

    if (recentPrices.length < 5) {
      // Need minimum sample size
      return true; // Accept if not enough history
    }

    const prices = recentPrices.map((p: any) => parseFloat(p?.price as string));

    // Calculate mean and standard deviation
    const mean = prices.reduce((a: number, b: number) => a + b) / prices.length;
    const variance =
      prices.reduce((sq: number, n: number) => sq + Math.pow(n - mean, 2), 0) /
      prices.length;
    const stdDev = Math.sqrt(variance);

    // Check if within 3 sigma
    const upperBound = mean + 3 * stdDev;
    const lowerBound = mean - 3 * stdDev;

    return newPrice >= lowerBound && newPrice <= upperBound;
  } catch (error) {
    console.error("[v0] Outlier detection failed:", error);
    return true; // Accept on error
  }
}

/**
 * Step 5: Trend Corroboration
 * Check if multiple scouts agree on similar price
 */
async function checkTrendCorroboration(
  productId: string,
  marketId: string,
  newPrice: number,
  tolerancePercent: number = 10,
  hoursBack: number = 24
): Promise<{ valid: boolean; agreementScore: number }> {
  try {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    const recentReports = await getDb()
      .select()
      .from(priceReport)
      .where(
        and(
          eq(priceReport.productId, productId),
          eq(priceReport.marketId, marketId),
          gte(priceReport.createdAt, cutoffTime)
        )
      );

    if (recentReports.length === 0) {
      return { valid: true, agreementScore: 0.5 }; // No history
    }

    const tolerance = (newPrice * tolerancePercent) / 100;
    const agreeing = recentReports.filter((r: any) => {
      const price = parseFloat(r?.price as string);
      return Math.abs(price - newPrice) <= tolerance;
    });

    const agreementScore = agreeing.length / recentReports.length;

    // Valid if at least 50% of scouts agree
    return { valid: agreementScore >= 0.5, agreementScore };
  } catch (error) {
    console.error("[v0] Trend corroboration failed:", error);
    return { valid: true, agreementScore: 0.5 };
  }
}

/**
 * Comprehensive 5-Step Price Validation Pipeline
 */
export async function validatePrice(
  priceData: {
    productId: string;
    marketId: string;
    sellerId: string;
    price: string;
    reportedBy: string;
    photoUrl?: string;
    gpsCoordinates?: { lat: number; lng: number };
  },
  marketLocation: { latitude: string; longitude: string }
): Promise<PriceValidationResult> {
  const results: PriceValidationResult = {
    isValid: true,
    confidence: 1.0,
    validationSteps: {
      duplicateCheck: false,
      gpsVerification: false,
      photoValidation: false,
      outlierDetection: false,
      trendCorroboration: false,
    },
    reasons: [],
  };

  const newPrice = parseFloat(priceData.price);

  try {
    // Step 1: Duplicate Check
    const noDuplicate = await checkDuplicates(
      priceData.sellerId,
      priceData.productId,
      priceData.reportedBy
    );

    results.validationSteps.duplicateCheck = noDuplicate;
    if (!noDuplicate) {
      results.reasons.push("Duplicate report from scout within 24 hours");
    }

    // Step 2: GPS Verification
    let gpsValid = true;
    if (priceData.gpsCoordinates) {
      gpsValid = verifyGpsCoordinates(
        marketLocation.latitude,
        marketLocation.longitude,
        priceData.gpsCoordinates.lat,
        priceData.gpsCoordinates.lng
      );
    }

    results.validationSteps.gpsVerification = gpsValid;
    if (!gpsValid && priceData.gpsCoordinates) {
      results.reasons.push(
        `GPS location mismatch: scout is not within market boundaries`
      );
    }

    // Step 3: Photo Validation
    const photoValid = validatePhoto(priceData.photoUrl);
    results.validationSteps.photoValidation = photoValid;
    if (!photoValid) {
      results.reasons.push("No valid photo evidence provided");
    }

    // Step 4: Outlier Detection
    const notOutlier = await detectOutliers(
      priceData.productId,
      priceData.marketId,
      newPrice
    );

    results.validationSteps.outlierDetection = notOutlier;
    if (!notOutlier) {
      results.reasons.push("Price is statistical outlier (>3σ from mean)");
    }

    // Step 5: Trend Corroboration
    const trendCheck = await checkTrendCorroboration(
      priceData.productId,
      priceData.marketId,
      newPrice
    );

    results.validationSteps.trendCorroboration = trendCheck.valid;
    if (!trendCheck.valid) {
      results.reasons.push(
        `Low trend agreement: only ${Math.round(trendCheck.agreementScore * 100)}% of scouts agree`
      );
    }

    // Calculate overall validity and confidence
    const steps = Object.values(results.validationSteps);
    const passedSteps = steps.filter((s) => s).length;

    // All 5 steps required for high confidence
    results.confidence = passedSteps / steps.length;

    // Conservative: require at least 3 of 5 steps
    results.isValid =
      passedSteps >= 3 &&
      results.validationSteps.duplicateCheck && // Must not be duplicate
      results.validationSteps.outlierDetection; // Must not be outlier

    return results;
  } catch (error) {
    console.error("[v0] Price validation pipeline error:", error);
    results.isValid = false;
    results.confidence = 0;
    results.reasons.push(`Validation error: ${error instanceof Error ? error.message : "Unknown error"}`);
    return results;
  }
}

/**
 * Generate Daily Price Rollup
 * Aggregates all price reports for a product in a market into daily summary
 */
export async function generateDailyRollup(
  productId: string,
  marketId: string,
  date: string
): Promise<void> {
  try {
    const [year, month, day] = date.split("-");
    const startOfDay = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day)
    );
    const endOfDay = new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day) + 1
    );

    // Get verified price reports for the day
    const reportsForDay = await getDb()
      .select()
      .from(priceReport)
      .where(
        and(
          eq(priceReport.productId, productId),
          eq(priceReport.marketId, marketId),
          gte(priceReport.createdAt, startOfDay)
        )
      );

    // Filter to those created before end of day
    const validReports = reportsForDay.filter(
      (r: any) => r?.createdAt < endOfDay && r?.isVerified
    );

    if (validReports.length === 0) {
      return; // No verified reports for this day
    }

    const prices = validReports.map((r: any) => parseFloat(r?.price as string));

    const avgPrice = (
      prices.reduce((a: number, b: number) => a + b, 0) / prices.length
    ).toFixed(2);
    const minPrice = Math.min(...prices).toFixed(2);
    const maxPrice = Math.max(...prices).toFixed(2);
    const currency = validReports[0].currency;

    // Upsert daily rollup
    await getDb()
      .insert(dailyPriceRollup)
      .values({
        date,
        productId,
        marketId,
        avgPrice,
        minPrice,
        maxPrice,
        reportCount: validReports.length,
        currency,
      })
      .onConflictDoUpdate({
        target: [
          dailyPriceRollup.date,
          dailyPriceRollup.productId,
          dailyPriceRollup.marketId,
        ],
        set: {
          avgPrice,
          minPrice,
          maxPrice,
          reportCount: validReports.length,
        },
      });

    console.log(
      `[v0] Generated daily rollup for product ${productId} in market ${marketId} on ${date}`
    );
  } catch (error) {
    console.error(
      `[v0] Failed to generate daily rollup: ${error instanceof Error ? error.message : "Unknown error"}`
    );
    throw error;
  }
}
