import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import {
  desc,
  eq,
  and,
  like,
  ilike,
  or,
  gte,
  lte,
  inArray,
} from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import {
  user,
  chat,
  User,
  reservation,
  product,
  productCategory,
  productAlias,
  market,
  marketSection,
  seller,
  priceReport,
  dailyPriceRollup,
  watchlist,
  notificationRule,
  notification,
  notificationEvent,
  userPreferences,
  Product,
  ProductCategory,
  Market,
  Seller,
  PriceReport,
  DailyPriceRollup,
  Watchlist,
  NotificationRule,
  Notification,
  NotificationEvent,
  UserPreferences,
} from "./schema";

// Lazy initialize database client to avoid startup errors when POSTGRES_URL is not set
let client: any = null;
let db: any = null;

export function getDb() {
  if (!db) {
    if (!process.env.POSTGRES_URL) {
      throw new Error(
        "POSTGRES_URL environment variable is not set. Database operations will fail."
      );
    }
    client = postgres(`${process.env.POSTGRES_URL}?sslmode=require`);
    db = drizzle(client);
  }
  return db;
}

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await getDb().select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await getDb().insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await getDb()
      .select()
      .from(chat)
      .where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await getDb()
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await getDb().insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await getDb().delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await getDb()
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await getDb()
      .select()
      .from(chat)
      .where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await getDb().insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await getDb()
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  return await getDb()
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
}

// ============ PHASE 2: KNOWLEDGE GRAPH QUERIES ============

// Search products by name with alias matching
export async function searchProducts(query: string) {
  try {
    const results = await getDb()
      .select({
        product: product,
        category: productCategory,
      })
      .from(product)
      .leftJoin(productCategory, eq(product.categoryId, productCategory.id))
      .where(
        or(
          ilike(product.name, `%${query}%`),
          ilike(product.nameEnglish, `%${query}%`)
        )
      )
      .limit(20);

    return results;
  } catch (error) {
    console.error("Failed to search products:", error);
    throw error;
  }
}

// Search products by category
export async function getProductsByCategory(categoryId: string) {
  try {
    return await getDb()
      .select()
      .from(product)
      .where(eq(product.categoryId, categoryId))
      .limit(50);
  } catch (error) {
    console.error("Failed to get products by category:", error);
    throw error;
  }
}

// Find markets by country and city
export async function findMarkets(country: string, city?: string) {
  try {
    const query = getDb().select().from(market);

    let conditions = [eq(market.country, country)];
    if (city) {
      conditions.push(eq(market.city, city));
    }

    return await query.where(and(...conditions)).limit(20);
  } catch (error) {
    console.error("Failed to find markets:", error);
    throw error;
  }
}

// Get market sections
export async function getMarketSections(marketId: string) {
  try {
    return await getDb()
      .select()
      .from(marketSection)
      .where(eq(marketSection.marketId, marketId));
  } catch (error) {
    console.error("Failed to get market sections:", error);
    throw error;
  }
}

// Find sellers in a market
export async function getSellersInMarket(marketId: string) {
  try {
    return await getDb()
      .select()
      .from(seller)
      .where(eq(seller.marketId, marketId))
      .orderBy(desc(seller.rating));
  } catch (error) {
    console.error("Failed to get sellers in market:", error);
    throw error;
  }
}

// Get seller details with rating
export async function getSellerDetails(sellerId: string) {
  try {
    const [sellerData] = await getDb()
      .select()
      .from(seller)
      .where(eq(seller.id, sellerId));
    return sellerData;
  } catch (error) {
    console.error("Failed to get seller details:", error);
    throw error;
  }
}

// Get latest price reports for a product in a market
export async function getPriceReportsForProduct(
  productId: string,
  marketId: string,
  limit: number = 10
) {
  try {
    return await getDb()
      .select({
        report: priceReport,
        seller: seller,
      })
      .from(priceReport)
      .leftJoin(seller, eq(priceReport.sellerId, seller.id))
      .where(
        and(
          eq(priceReport.productId, productId),
          eq(priceReport.marketId, marketId)
        )
      )
      .orderBy(desc(priceReport.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("Failed to get price reports:", error);
    throw error;
  }
}

// Create a price report
export async function createPriceReport({
  productId,
  sellerId,
  marketId,
  price,
  currency,
  quantity,
  reportedBy,
  photoUrl,
  gpsCoordinates,
  notes,
}: {
  productId: string;
  sellerId: string;
  marketId: string;
  price: string;
  currency: string;
  quantity?: string;
  reportedBy?: string;
  photoUrl?: string;
  gpsCoordinates?: { lat: number; lng: number };
  notes?: string;
}) {
  try {
    return await getDb().insert(priceReport).values({
      id: undefined,
      productId,
      sellerId,
      marketId,
      price,
      currency,
      quantity,
      reportedBy,
      photoUrl,
      gpsCoordinates,
      notes,
      isVerified: false,
    });
  } catch (error) {
    console.error("Failed to create price report:", error);
    throw error;
  }
}

// Get daily price rollup for a product in a market
export async function getDailyPriceRollup(
  productId: string,
  marketId: string,
  date: string
) {
  try {
    const [rollup] = await getDb()
      .select()
      .from(dailyPriceRollup)
      .where(
        and(
          eq(dailyPriceRollup.productId, productId),
          eq(dailyPriceRollup.marketId, marketId),
          eq(dailyPriceRollup.date, date)
        )
      );
    return rollup;
  } catch (error) {
    console.error("Failed to get daily price rollup:", error);
    throw error;
  }
}

// Get product aliases for fuzzy matching
export async function getProductAliases(productId: string) {
  try {
    return await getDb()
      .select()
      .from(productAlias)
      .where(eq(productAlias.productId, productId));
  } catch (error) {
    console.error("Failed to get product aliases:", error);
    throw error;
  }
}

// Create or update a product
export async function upsertProduct({
  id,
  categoryId,
  name,
  nameEnglish,
  nameLocalLanguages,
  description,
  sku,
}: {
  id?: string;
  categoryId: string;
  name: string;
  nameEnglish: string;
  nameLocalLanguages: Record<string, string>;
  description?: string;
  sku?: string;
}) {
  try {
    if (id) {
      return await getDb()
        .update(product)
        .set({
          name,
          nameEnglish,
          nameLocalLanguages,
          description,
          updatedAt: new Date(),
        })
        .where(eq(product.id, id));
    } else {
      return await getDb().insert(product).values({
        categoryId,
        name,
        nameEnglish,
        nameLocalLanguages,
        description,
        sku,
      });
    }
  } catch (error) {
    console.error("Failed to upsert product:", error);
    throw error;
  }
}

// Create or update a market
export async function upsertMarket({
  id,
  name,
  slug,
  country,
  city,
  region,
  latitude,
  longitude,
  description,
}: {
  id?: string;
  name: string;
  slug: string;
  country: string;
  city: string;
  region?: string;
  latitude?: string;
  longitude?: string;
  description?: string;
}) {
  try {
    if (id) {
      return await getDb()
        .update(market)
        .set({
          name,
          country,
          city,
          region,
          latitude,
          longitude,
          description,
          updatedAt: new Date(),
        })
        .where(eq(market.id, id));
    } else {
      return await getDb().insert(market).values({
        name,
        slug,
        country,
        city,
        region,
        latitude,
        longitude,
        description,
      });
    }
  } catch (error) {
    console.error("Failed to upsert market:", error);
    throw error;
  }
}

// Create or update a seller
export async function upsertSeller({
  id,
  marketId,
  marketSectionId,
  name,
  description,
  phone,
}: {
  id?: string;
  marketId: string;
  marketSectionId?: string;
  name: string;
  description?: string;
  phone?: string;
}) {
  try {
    if (id) {
      return await getDb()
        .update(seller)
        .set({
          name,
          description,
          phone,
          updatedAt: new Date(),
        })
        .where(eq(seller.id, id));
    } else {
      return await getDb().insert(seller).values({
        marketId,
        marketSectionId,
        name,
        description,
        phone,
        rating: "0.00",
        totalReviews: 0,
      });
    }
  } catch (error) {
    console.error("Failed to upsert seller:", error);
    throw error;
  }
}

// ============ PHASE 5: NOTIFICATION QUERIES ============

// Create a watchlist item
export async function addToWatchlist({
  userId,
  productId,
  marketId,
  priceAlertThreshold,
}: {
  userId: string;
  productId: string;
  marketId: string;
  priceAlertThreshold?: string;
}) {
  try {
    return await getDb().insert(watchlist).values({
      userId,
      productId,
      marketId,
      priceAlertThreshold: priceAlertThreshold || "1.20",
    });
  } catch (error) {
    console.error("Failed to add to watchlist:", error);
    throw error;
  }
}

// Get user's watchlist
export async function getWatchlist(userId: string) {
  try {
    return await getDb()
      .select({
        watchlistItem: watchlist,
        productData: product,
        marketData: market,
      })
      .from(watchlist)
      .leftJoin(product, eq(watchlist.productId, product.id))
      .leftJoin(market, eq(watchlist.marketId, market.id))
      .where(and(eq(watchlist.userId, userId), eq(watchlist.isActive, true)));
  } catch (error) {
    console.error("Failed to get watchlist:", error);
    throw error;
  }
}

// Remove from watchlist
export async function removeFromWatchlist(watchlistId: string) {
  try {
    return await getDb()
      .update(watchlist)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(watchlist.id, watchlistId));
  } catch (error) {
    console.error("Failed to remove from watchlist:", error);
    throw error;
  }
}

// Create notification rule
export async function createNotificationRule({
  userId,
  ruleType,
  watchlistId,
  condition,
  notificationChannel,
  quietHours,
  maxNotificationsPerDay,
}: {
  userId: string;
  ruleType: string;
  watchlistId: string;
  condition: Record<string, any>;
  notificationChannel: string;
  quietHours?: Record<string, number>;
  maxNotificationsPerDay?: number;
}) {
  try {
    return await getDb().insert(notificationRule).values({
      userId,
      ruleType,
      watchlistId,
      condition,
      notificationChannel,
      quietHours,
      maxNotificationsPerDay: maxNotificationsPerDay || 3,
    });
  } catch (error) {
    console.error("Failed to create notification rule:", error);
    throw error;
  }
}

// Get user's notification rules
export async function getNotificationRules(userId: string) {
  try {
    return await getDb()
      .select()
      .from(notificationRule)
      .where(and(eq(notificationRule.userId, userId), eq(notificationRule.isActive, true)));
  } catch (error) {
    console.error("Failed to get notification rules:", error);
    throw error;
  }
}

// Send notification
export async function sendNotification({
  userId,
  ruleId,
  watchlistId,
  type,
  title,
  message,
  channel,
  metadata,
}: {
  userId: string;
  ruleId: string;
  watchlistId: string;
  type: string;
  title: string;
  message: string;
  channel: string;
  metadata?: Record<string, any>;
}) {
  try {
    return await getDb().insert(notification).values({
      userId,
      ruleId,
      watchlistId,
      type,
      title,
      message,
      channel,
      metadata,
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
    throw error;
  }
}

// Get user's notifications
export async function getNotifications(userId: string, limit: number = 20) {
  try {
    return await getDb()
      .select()
      .from(notification)
      .where(eq(notification.userId, userId))
      .orderBy(desc(notification.sentAt))
      .limit(limit);
  } catch (error) {
    console.error("Failed to get notifications:", error);
    throw error;
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  try {
    return await getDb()
      .update(notification)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(notification.id, notificationId));
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
    throw error;
  }
}

// Create notification event (for batching)
export async function createNotificationEvent({
  userId,
  eventType,
  productId,
  marketId,
  data,
}: {
  userId: string;
  eventType: string;
  productId?: string;
  marketId?: string;
  data: Record<string, any>;
}) {
  try {
    return await getDb().insert(notificationEvent).values({
      userId,
      eventType,
      productId,
      marketId,
      data,
      isBatched: false,
    });
  } catch (error) {
    console.error("Failed to create notification event:", error);
    throw error;
  }
}

// Get unbatched events for user
export async function getUnbatchedEvents(userId: string, hours: number = 24) {
  try {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return await getDb()
      .select()
      .from(notificationEvent)
      .where(
        and(
          eq(notificationEvent.userId, userId),
          eq(notificationEvent.isBatched, false),
          gte(notificationEvent.createdAt, cutoffTime)
        )
      )
      .orderBy(desc(notificationEvent.createdAt));
  } catch (error) {
    console.error("Failed to get unbatched events:", error);
    throw error;
  }
}

// Mark events as batched
export async function markEventsBatched(eventIds: string[]) {
  try {
    return await getDb()
      .update(notificationEvent)
      .set({ isBatched: true })
      .where(inArray(notificationEvent.id, eventIds));
  } catch (error) {
    console.error("Failed to mark events as batched:", error);
    throw error;
  }
}

// Get/create user preferences
export async function getUserPreferences(userId: string) {
  try {
    const [prefs] = await getDb()
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId));

    if (prefs) {
      return prefs;
    }

    // Create default preferences
    await getDb().insert(userPreferences).values({
      userId,
      preferredChannel: "whatsapp",
      quietHoursStart: 22,
      quietHoursEnd: 8,
      dailyDigestEnabled: true,
      digestTime: "08:00",
      maxNotificationsPerDay: 10,
      language: "en",
      timezone: "UTC",
    });

    return getUserPreferences(userId);
  } catch (error) {
    console.error("Failed to get user preferences:", error);
    throw error;
  }
}

// Update user preferences
export async function updateUserPreferences(
  userId: string,
  updates: Partial<{
    preferredChannel: string;
    quietHoursStart: number;
    quietHoursEnd: number;
    dailyDigestEnabled: boolean;
    digestTime: string;
    maxNotificationsPerDay: number;
    language: string;
    timezone: string;
  }>
) {
  try {
    return await getDb()
      .update(userPreferences)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId));
  } catch (error) {
    console.error("Failed to update user preferences:", error);
    throw error;
  }
}
