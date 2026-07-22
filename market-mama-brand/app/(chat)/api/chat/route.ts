import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import {
  generateReservationPrice,
  generateSampleFlightSearchResults,
  generateSampleFlightStatus,
  generateSampleSeatSelection,
} from "@/ai/actions";
import {
  checkCurrencyRate,
  compareProductPrices,
  estimateDelivery,
  findSuppliers,
  getTrendingProducts,
  getVendorInfo,
  searchAfricanMarkets,
} from "@/ai/phase2-commerce-tools";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    system: `\n
        You are MarketMama AI - an intelligent commerce assistant helping users navigate African markets and commerce.
        You can help with:
        - Finding and comparing product prices across markets
        - Searching for suppliers and wholesalers
        - Getting vendor information and ratings
        - Currency conversion and exchange rates
        - Delivery estimation and logistics
        - Discovering trending products
        - Finding specific markets and trading information
        
        Keep responses concise and conversational.
        Today's date is ${new Date().toLocaleDateString()}.
        When users ask about products, markets, or vendors, use the appropriate commerce tools.
        When users ask about flights or travel, you can still help with those too.
        Always ask clarifying questions about location (country/city) when needed.
      `,
    messages: coreMessages,
    tools: {
      getWeather: {
        description: "Get the current weather at a location",
        parameters: z.object({
          latitude: z.number().describe("Latitude coordinate"),
          longitude: z.number().describe("Longitude coordinate"),
        }),
        execute: async ({ latitude, longitude }) => {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&hourly=temperature_2m&daily=sunrise,sunset&timezone=auto`,
          );

          const weatherData = await response.json();
          return weatherData;
        },
      },
      displayFlightStatus: {
        description: "Display the status of a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
          date: z.string().describe("Date of the flight"),
        }),
        execute: async ({ flightNumber, date }) => {
          const flightStatus = await generateSampleFlightStatus({
            flightNumber,
            date,
          });

          return flightStatus;
        },
      },
      searchFlights: {
        description: "Search for flights based on the given parameters",
        parameters: z.object({
          origin: z.string().describe("Origin airport or city"),
          destination: z.string().describe("Destination airport or city"),
        }),
        execute: async ({ origin, destination }) => {
          const results = await generateSampleFlightSearchResults({
            origin,
            destination,
          });

          return results;
        },
      },
      selectSeats: {
        description: "Select seats for a flight",
        parameters: z.object({
          flightNumber: z.string().describe("Flight number"),
        }),
        execute: async ({ flightNumber }) => {
          const seats = await generateSampleSeatSelection({ flightNumber });
          return seats;
        },
      },
      createReservation: {
        description: "Display pending reservation details",
        parameters: z.object({
          seats: z.string().array().describe("Array of selected seat numbers"),
          flightNumber: z.string().describe("Flight number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            gate: z.string().describe("Departure gate"),
            terminal: z.string().describe("Departure terminal"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            gate: z.string().describe("Arrival gate"),
            terminal: z.string().describe("Arrival terminal"),
          }),
          passengerName: z.string().describe("Name of the passenger"),
        }),
        execute: async (props) => {
          const { totalPriceInUSD } = await generateReservationPrice(props);
          const session = await auth();

          const id = generateUUID();

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props, totalPriceInUSD },
            });

            return { id, ...props, totalPriceInUSD };
          } else {
            return {
              error: "User is not signed in to perform this action!",
            };
          }
        },
      },
      authorizePayment: {
        description:
          "User will enter credentials to authorize payment, wait for user to repond when they are done",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          return { reservationId };
        },
      },
      verifyPayment: {
        description: "Verify payment status",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
        }),
        execute: async ({ reservationId }) => {
          const reservation = await getReservationById({ id: reservationId });

          if (reservation.hasCompletedPayment) {
            return { hasCompletedPayment: true };
          } else {
            return { hasCompletedPayment: false };
          }
        },
      },
      searchAfricanMarkets: {
        description:
          "Search for markets in African countries that sell specific products",
        parameters: z.object({
          query: z
            .string()
            .describe("Product type to search for, e.g., textiles, electronics"),
          country: z.string().describe("African country to search in"),
        }),
        execute: async ({ query, country }) => {
          return await searchAfricanMarkets({ query, country });
        },
      },
      compareProductPrices: {
        description: "Compare prices for a product across multiple markets",
        parameters: z.object({
          productName: z.string().describe("Product name to compare"),
          markets: z
            .array(z.string())
            .describe("List of market names to compare prices in"),
        }),
        execute: async ({ productName, markets }) => {
          return await compareProductPrices({ productName, markets });
        },
      },
      getVendorInfo: {
        description: "Get detailed information about a vendor or merchant",
        parameters: z.object({
          vendorName: z.string().describe("Name of the vendor"),
          country: z.string().describe("Country where vendor operates"),
        }),
        execute: async ({ vendorName, country }) => {
          return await getVendorInfo({ vendorName, country });
        },
      },
      checkCurrencyRate: {
        description: "Check currency exchange rates for African currencies",
        parameters: z.object({
          fromCurrency: z
            .string()
            .describe(
              "Source currency code, e.g., NGN, GHS, KES, ZAR, UGX, etc.",
            ),
          toCurrency: z
            .string()
            .describe("Target currency code, e.g., USD, EUR, GBP"),
        }),
        execute: async ({ fromCurrency, toCurrency }) => {
          return await checkCurrencyRate({ fromCurrency, toCurrency });
        },
      },
      estimateDelivery: {
        description:
          "Estimate delivery time and cost from one location to another",
        parameters: z.object({
          origin: z.string().describe("Origin city/market"),
          destination: z.string().describe("Destination city"),
          productWeight: z
            .number()
            .describe("Product weight in kilograms"),
        }),
        execute: async ({ origin, destination, productWeight }) => {
          return await estimateDelivery({ origin, destination, productWeight });
        },
      },
      getTrendingProducts: {
        description: "Discover trending and popular products in a country",
        parameters: z.object({
          country: z.string().describe("African country"),
          category: z
            .string()
            .optional()
            .describe("Optional product category filter"),
        }),
        execute: async ({ country, category }) => {
          return await getTrendingProducts({ country, category });
        },
      },
      findSuppliers: {
        description: "Find wholesalers and suppliers for a product category",
        parameters: z.object({
          productCategory: z.string().describe("Product category to source"),
          country: z.string().describe("Country to search in"),
        }),
        execute: async ({ productCategory, country }) => {
          return await findSuppliers({ productCategory, country });
        },
      },
      displayBoardingPass: {
        description: "Display a boarding pass",
        parameters: z.object({
          reservationId: z
            .string()
            .describe("Unique identifier for the reservation"),
          passengerName: z
            .string()
            .describe("Name of the passenger, in title case"),
          flightNumber: z.string().describe("Flight number"),
          seat: z.string().describe("Seat number"),
          departure: z.object({
            cityName: z.string().describe("Name of the departure city"),
            airportCode: z.string().describe("Code of the departure airport"),
            airportName: z.string().describe("Name of the departure airport"),
            timestamp: z.string().describe("ISO 8601 date of departure"),
            terminal: z.string().describe("Departure terminal"),
            gate: z.string().describe("Departure gate"),
          }),
          arrival: z.object({
            cityName: z.string().describe("Name of the arrival city"),
            airportCode: z.string().describe("Code of the arrival airport"),
            airportName: z.string().describe("Name of the arrival airport"),
            timestamp: z.string().describe("ISO 8601 date of arrival"),
            terminal: z.string().describe("Arrival terminal"),
            gate: z.string().describe("Arrival gate"),
          }),
        }),
        execute: async (boardingPass) => {
          return boardingPass;
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          await saveChat({
            id,
            messages: [...coreMessages, ...responseMessages],
            userId: session.user.id,
          });
        } catch (error) {
          console.error("Failed to save chat");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
