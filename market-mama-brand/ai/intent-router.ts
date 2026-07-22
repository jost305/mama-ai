import { generateObject } from "ai";
import { z } from "zod";
import { geminiFlashModel } from ".";

export type CommerceIntent =
  | "price_inquiry"
  | "market_discovery"
  | "availability_check"
  | "vendor_search"
  | "counterfeit_check"
  | "market_events"
  | "general_commerce";

export async function detectQueryIntent(query: string): Promise<{
  intent: CommerceIntent;
  confidence: number;
  extractedEntities: {
    productName?: string;
    marketName?: string;
    location?: string;
    vendorName?: string;
  };
}> {
  const { object } = await generateObject({
    model: geminiFlashModel,
    prompt: `Analyze the following user query about African commerce and determine the primary intent. 
    Query: "${query}"
    
    Possible intents:
    - price_inquiry: Asking about the cost, price, or value of a product.
    - market_discovery: Looking for markets that sell certain items or general market information.
    - availability_check: Checking if a product is in stock or available.
    - vendor_search: Looking for specific sellers, vendors, or merchants.
    - counterfeit_check: Asking about fake, substandard, or counterfeit goods.
    - market_events: Asking about market closures, strikes, transport disruptions, etc.
    - general_commerce: Any other commerce-related inquiry.
    `,
    schema: z.object({
      intent: z.enum([
        "price_inquiry",
        "market_discovery",
        "availability_check",
        "vendor_search",
        "counterfeit_check",
        "market_events",
        "general_commerce",
      ]),
      confidence: z.number().min(0).max(1).describe("Confidence score (0.0 to 1.0)"),
      extractedEntities: z.object({
        productName: z.string().optional().describe("Any product mentioned"),
        marketName: z.string().optional().describe("Any specific market mentioned"),
        location: z.string().optional().describe("City, state, or country mentioned"),
        vendorName: z.string().optional().describe("Any specific vendor mentioned"),
      }),
    }),
  });

  return object;
}
