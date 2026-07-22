import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlashModel } from ".";

// Africa Commerce Tools for MarketMama AI

export async function searchAfricanMarkets({
  query,
  country,
}: {
  query: string;
  country: string;
}) {
  const { object: markets } = await generateObject({
    model: geminiFlashModel,
    prompt: `Find major markets in ${country} that sell "${query}". Return up to 5 markets with realistic names, locations, and trading hours typical of African markets.`,
    output: "array",
    schema: z.object({
      marketName: z.string().describe("Name of the market"),
      city: z.string().describe("City where the market is located"),
      country: z.string().describe(`Country (${country})`),
      specialization: z.string().describe("What the market specializes in"),
      operatingHours: z
        .string()
        .describe("Operating hours, e.g., 6AM - 6PM daily"),
      contactInfo: z.string().describe("Phone or contact details if available"),
    }),
  });

  return { markets };
}

export async function compareProductPrices({
  productName,
  markets,
}: {
  productName: string;
  markets: string[];
}) {
  const { object: priceComparison } = await generateObject({
    model: geminiFlashModel,
    prompt: `Compare prices for "${productName}" across these markets: ${markets.join(", ")}. Return realistic pricing for African markets with local currency conversions to USD.`,
    output: "array",
    schema: z.object({
      market: z.string().describe("Market name"),
      productName: z.string().describe("Product name"),
      priceLocal: z
        .string()
        .describe("Price in local currency with currency code, e.g., NGN 5,000"),
      priceUSD: z.number().describe("Approximate price in USD"),
      availability: z
        .string()
        .describe("Availability status: In Stock, Limited, Out of Stock"),
      vendor: z.string().describe("Vendor or shop name"),
      quality: z
        .string()
        .describe("Quality description: Premium, Standard, Budget"),
    }),
  });

  return { priceComparison };
}

export async function getVendorInfo({
  vendorName,
  country,
}: {
  vendorName: string;
  country: string;
}) {
  const { object: vendorInfo } = await generateObject({
    model: geminiFlashModel,
    prompt: `Get information about vendor/merchant "${vendorName}" in ${country}. Generate realistic profile for an African market vendor.`,
    schema: z.object({
      vendorName: z.string().describe("Vendor or merchant name"),
      businessType: z
        .string()
        .describe("Type of business: Wholesaler, Retailer, Artisan, etc."),
      location: z.string().describe("Market and city location"),
      yearsInBusiness: z.number().describe("Years operating"),
      specialties: z.array(z.string()).describe("Main products/specialties"),
      rating: z
        .number()
        .min(1)
        .max(5)
        .describe("Customer rating out of 5"),
      tradingDays: z.array(z.string()).describe("Days of operation"),
      paymentMethods: z
        .array(z.string())
        .describe("Accepted payment methods"),
      contact: z.string().describe("Contact phone number"),
    }),
  });

  return vendorInfo;
}

export async function checkCurrencyRate({
  fromCurrency,
  toCurrency,
}: {
  fromCurrency: string;
  toCurrency: string;
}) {
  const { object: exchange } = await generateObject({
    model: geminiFlashModel,
    prompt: `Get current exchange rate from ${fromCurrency} to ${toCurrency}. Provide realistic rate for African currencies. Include: 1 unit of source currency = ? units of target currency`,
    schema: z.object({
      fromCurrency: z.string().describe("Source currency code"),
      toCurrency: z.string().describe("Target currency code"),
      rate: z.number().describe("Exchange rate"),
      lastUpdated: z.string().describe("Approximate last update time"),
      note: z.string().describe("Any relevant notes about the rate"),
    }),
  });

  return exchange;
}

export async function estimateDelivery({
  origin,
  destination,
  productWeight,
}: {
  origin: string;
  destination: string;
  productWeight: number;
}) {
  const { object: delivery } = await generateObject({
    model: geminiFlashModel,
    prompt: `Estimate delivery time and cost from ${origin} to ${destination} for a package weighing ${productWeight}kg. Consider African logistics networks with realistic timeframes and costs.`,
    schema: z.object({
      from: z.string().describe("Origin location"),
      to: z.string().describe("Destination location"),
      estimatedDays: z.number().describe("Estimated delivery days"),
      costUSD: z.number().describe("Estimated delivery cost in USD"),
      carrier: z
        .string()
        .describe("Logistics company: Local courier, Regional, International"),
      method: z
        .string()
        .describe("Delivery method: Same-day, Next-day, Standard"),
      notes: z.string().describe("Any delivery notes or restrictions"),
    }),
  });

  return delivery;
}

export async function getTrendingProducts({
  country,
  category,
}: {
  country: string;
  category?: string;
}) {
  const { object: products } = await generateObject({
    model: geminiFlashModel,
    prompt: `List trending/popular products in ${country}${category ? ` in the ${category} category` : ""}. Return realistic products common in African markets.`,
    output: "array",
    schema: z.object({
      productName: z.string().describe("Product name"),
      category: z.string().describe("Product category"),
      trendLevel: z
        .string()
        .describe("Trend level: Viral, Trending, Stable, Emerging"),
      averagePrice: z.string().describe("Average price in local currency"),
      demandLevel: z.string().describe("Demand: Very High, High, Medium"),
      seasonality: z.string().describe("Best season for sales"),
    }),
  });

  return { trendingProducts: products };
}

export async function findSuppliers({
  productCategory,
  country,
}: {
  productCategory: string;
  country: string;
}) {
  const { object: suppliers } = await generateObject({
    model: geminiFlashModel,
    prompt: `Find wholesalers and suppliers for ${productCategory} in ${country}. Return up to 5 realistic suppliers typical of African wholesale markets.`,
    output: "array",
    schema: z.object({
      supplierName: z.string().describe("Supplier/wholesaler name"),
      location: z.string().describe("City and location"),
      productRange: z.array(z.string()).describe("Types of products supplied"),
      minimumOrder: z.string().describe("Minimum order quantity"),
      pricePerUnit: z.string().describe("Typical unit price"),
      leadTime: z.string().describe("Time to fulfill orders"),
      contact: z.string().describe("Contact information"),
    }),
  });

  return { suppliers };
}

export async function checkCounterfeitRisk({
  productName,
  marketName,
}: {
  productName: string;
  marketName: string;
}) {
  const { object: alert } = await generateObject({
    model: geminiFlashModel,
    prompt: `Assess the counterfeit risk for "${productName}" in "${marketName}". African markets sometimes have fake products. Output realistic risks for this product category.`,
    schema: z.object({
      productName: z.string(),
      marketName: z.string(),
      riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      commonFakes: z.array(z.string()).describe("List of common fake variations"),
      howToIdentify: z.array(z.string()).describe("Steps to identify authentic products"),
      recentAlerts: z.string().describe("Any recent alerts or known issues"),
    })
  });
  return alert;
}

export async function getMarketEvents({
  marketName,
}: {
  marketName: string;
}) {
  const { object: events } = await generateObject({
    model: geminiFlashModel,
    prompt: `Identify current or upcoming events, closures, or disruptions for "${marketName}". Include things like sanitation days, holidays, or strikes.`,
    output: "array",
    schema: z.object({
      eventType: z.string(),
      title: z.string(),
      description: z.string(),
      severity: z.enum(["INFO", "LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      dateRange: z.string(),
      impact: z.string().describe("Expected impact on prices or availability"),
    })
  });
  return { events };
}
