import { Message } from "ai";
import { InferSelectModel } from "drizzle-orm";
import {
  pgTable,
  varchar,
  timestamp,
  json,
  uuid,
  boolean,
  integer,
  decimal,
  text,
  index,
  foreignKey,
  unique,
} from "drizzle-orm/pg-core";

// ============ EXISTING TABLES ============
export const user = pgTable("User", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  email: varchar("email", { length: 64 }).notNull().unique(),
  password: varchar("password", { length: 255 }),
});

export type User = InferSelectModel<typeof user>;

export const chat = pgTable("Chat", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  messages: json("messages").notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Chat = Omit<InferSelectModel<typeof chat>, "messages"> & {
  messages: Array<Message>;
};

export const reservation = pgTable("Reservation", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt").notNull(),
  details: json("details").notNull(),
  hasCompletedPayment: boolean("hasCompletedPayment").notNull().default(false),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id),
});

export type Reservation = InferSelectModel<typeof reservation>;

// ============ PHASE 2: KNOWLEDGE GRAPH TABLES ============

// Product categories with hierarchy support
export const productCategory = pgTable(
  "ProductCategory",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    description: text("description"),
    parentCategoryId: uuid("parentCategoryId").references(
      (): any => productCategory.id
    ),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    parentIdx: index("category_parent_idx").on(table.parentCategoryId),
    slugIdx: index("category_slug_idx").on(table.slug),
  })
);

export type ProductCategory = InferSelectModel<typeof productCategory>;

// Products with multi-language support
export const product = pgTable(
  "Product",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    categoryId: uuid("categoryId")
      .notNull()
      .references(() => productCategory.id),
    name: varchar("name", { length: 255 }).notNull(),
    nameEnglish: varchar("nameEnglish", { length: 255 }).notNull(),
    nameLocalLanguages: json("nameLocalLanguages").notNull(), // {yoruba: "", hausa: "", igbo: "", pidgin: ""}
    description: text("description"),
    sku: varchar("sku", { length: 128 }).unique(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("product_category_idx").on(table.categoryId),
    nameIdx: index("product_name_idx").on(table.name),
    skuIdx: index("product_sku_idx").on(table.sku),
  })
);

export type Product = InferSelectModel<typeof product>;

// Product variants and aliases (same product, different names)
export const productAlias = pgTable(
  "ProductAlias",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    productId: uuid("productId")
      .notNull()
      .references(() => product.id),
    aliasName: varchar("aliasName", { length: 255 }).notNull(),
    language: varchar("language", { length: 10 }).notNull(), // en, yo, ha, ig, pcn
    confidence: decimal("confidence", { precision: 3, scale: 2 }).default("1.00"), // 0.00-1.00
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("alias_product_idx").on(table.productId),
    aliasNameIdx: index("alias_name_idx").on(table.aliasName),
  })
);

export type ProductAlias = InferSelectModel<typeof productAlias>;

// African markets/locations
export const market = pgTable(
  "Market",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    country: varchar("country", { length: 100 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    region: varchar("region", { length: 100 }),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    description: text("description"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    countryIdx: index("market_country_idx").on(table.country),
    cityIdx: index("market_city_idx").on(table.city),
    slugIdx: index("market_slug_idx").on(table.slug),
    countryCity: index("market_country_city_idx").on(table.country, table.city),
  })
);

export type Market = InferSelectModel<typeof market>;

// Market sections/divisions
export const marketSection = pgTable(
  "MarketSection",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    marketId: uuid("marketId")
      .notNull()
      .references(() => market.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    marketIdx: index("section_market_idx").on(table.marketId),
  })
);

export type MarketSection = InferSelectModel<typeof marketSection>;

// Sellers/vendors
export const seller = pgTable(
  "Seller",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    marketId: uuid("marketId")
      .notNull()
      .references(() => market.id),
    marketSectionId: uuid("marketSectionId").references(() => marketSection.id),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    phone: varchar("phone", { length: 20 }),
    rating: decimal("rating", { precision: 3, scale: 2 }), // 0.00-5.00
    totalReviews: integer("totalReviews").default(0),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    marketIdx: index("seller_market_idx").on(table.marketId),
    sectionIdx: index("seller_section_idx").on(table.marketSectionId),
    nameIdx: index("seller_name_idx").on(table.name),
  })
);

export type Seller = InferSelectModel<typeof seller>;

// Agent reports from human contributors (Commerce Intelligence)
export const agentReport = pgTable(
  "AgentReport",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    productId: uuid("productId")
      .notNull()
      .references(() => product.id),
    sellerId: uuid("sellerId")
      .notNull()
      .references(() => seller.id),
    marketId: uuid("marketId")
      .notNull()
      .references(() => market.id),
    price: decimal("price", { precision: 12, scale: 2 }), // optional now
    currency: varchar("currency", { length: 3 }).notNull(), // USD, NGN, GHS, etc.
    quantity: varchar("quantity", { length: 100 }), // e.g., "per kg", "per dozen"
    agentId: varchar("agentId", { length: 255 }), // renamed from reportedBy
    reportType: varchar("reportType", { length: 50 }).notNull().default("PRICE"),
    inStock: boolean("inStock"),
    stockLevel: varchar("stockLevel", { length: 20 }), // NONE, LOW, MEDIUM, HIGH
    qualityRating: decimal("qualityRating", { precision: 3, scale: 2 }),
    counterfeitRisk: varchar("counterfeitRisk", { length: 20 }).default("NONE"),
    transportNotes: text("transportNotes"),
    vendorSection: varchar("vendorSection", { length: 255 }),
    reportTags: json("reportTags").default([]),
    photoUrl: varchar("photoUrl", { length: 500 }),
    gpsCoordinates: json("gpsCoordinates"), // {lat, lng}
    notes: text("notes"),
    isVerified: boolean("isVerified").default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("agent_product_idx").on(table.productId),
    sellerIdx: index("agent_seller_idx").on(table.sellerId),
    marketIdx: index("agent_market_idx").on(table.marketId),
    createdIdx: index("agent_created_idx").on(table.createdAt),
    typeIdx: index("agent_report_type_idx").on(table.reportType),
    agentIdx: index("agent_report_agent_idx").on(table.agentId),
    productMarketIdx: index("agent_product_market_idx").on(
      table.productId,
      table.marketId
    ),
  })
);

export type AgentReport = InferSelectModel<typeof agentReport>;

// Human Commerce Contributor Profiles
export const agentProfile = pgTable(
  "AgentProfile",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId").references(() => user.id),
    agentName: varchar("agentName", { length: 255 }).notNull(),
    trustTier: integer("trustTier").default(1),
    reputationScore: integer("reputationScore").default(100),
    completedMissions: integer("completedMissions").default(0),
    verifiedReports: integer("verifiedReports").default(0),
    rejectedReports: integer("rejectedReports").default(0),
    alphaPoints: integer("alphaPoints").default(0),
    level: varchar("level", { length: 50 }).default("Bronze"),
    domainExpertise: json("domainExpertise").default([]),
    state: varchar("state", { length: 100 }),
    lga: varchar("lga", { length: 100 }),
    whatsappNumber: varchar("whatsappNumber", { length: 20 }),
    wallet: json("wallet").default({ ngn: 0, alphapoints: 0 }),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("agent_profile_user_idx").on(table.userId),
    stateIdx: index("agent_profile_state_idx").on(table.state),
    trustIdx: index("agent_profile_trust_idx").on(table.trustTier),
  })
);

export type AgentProfile = InferSelectModel<typeof agentProfile>;

// Market Disruptions & Commerce Events
export const marketEvent = pgTable(
  "MarketEvent",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    marketId: uuid("marketId").references(() => market.id),
    agentId: uuid("agentId").references(() => agentProfile.id),
    eventType: varchar("eventType", { length: 50 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    severity: varchar("severity", { length: 20 }).default("INFO"),
    affectedProducts: json("affectedProducts").default([]),
    startDate: timestamp("startDate").notNull(),
    endDate: timestamp("endDate"),
    isVerified: boolean("isVerified").default(false),
    confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.80"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    marketIdx: index("market_event_market_idx").on(table.marketId),
    typeIdx: index("market_event_type_idx").on(table.eventType),
    severityIdx: index("market_event_severity_idx").on(table.severity),
    dateIdx: index("market_event_date_idx").on(table.startDate),
  })
);

export type MarketEvent = InferSelectModel<typeof marketEvent>;

// RAG Knowledge Snippets
export const commerceKnowledgeCard = pgTable(
  "CommerceKnowledgeCard",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    topic: varchar("topic", { length: 255 }).notNull(),
    category: varchar("category", { length: 100 }).notNull(),
    summary: text("summary").notNull(),
    content: text("content").notNull(),
    keywords: json("keywords").default([]),
    marketIds: json("marketIds").default([]),
    productIds: json("productIds").default([]),
    language: varchar("language", { length: 10 }).default("en"),
    embedding: json("embedding"),
    viewCount: integer("viewCount").default(0),
    helpfulCount: integer("helpfulCount").default(0),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    categoryIdx: index("knowledge_card_category_idx").on(table.category),
    topicIdx: index("knowledge_card_topic_idx").on(table.topic),
  })
);

export type CommerceKnowledgeCard = InferSelectModel<typeof commerceKnowledgeCard>;

// Fake/Substandard Product Reports
export const counterfeitAlert = pgTable(
  "CounterfeitAlert",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    productId: uuid("productId").references(() => product.id),
    marketId: uuid("marketId").references(() => market.id),
    agentId: uuid("agentId").references(() => agentProfile.id),
    brandSuspected: varchar("brandSuspected", { length: 255 }),
    riskLevel: varchar("riskLevel", { length: 20 }).notNull().default("MEDIUM"),
    description: text("description"),
    evidenceUrls: json("evidenceUrls").default([]),
    peerReviewCount: integer("peerReviewCount").default(0),
    isConfirmed: boolean("isConfirmed").default(false),
    confidence: decimal("confidence", { precision: 3, scale: 2 }).default("0.80"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("counterfeit_product_idx").on(table.productId),
    marketIdx: index("counterfeit_market_idx").on(table.marketId),
    riskIdx: index("counterfeit_risk_idx").on(table.riskLevel),
  })
);

export type CounterfeitAlert = InferSelectModel<typeof counterfeitAlert>;

// For Continuous Learning
export const commerceConversationLog = pgTable(
  "CommerceConversationLog",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    sessionId: varchar("sessionId", { length: 255 }),
    queryText: text("queryText").notNull(),
    responseText: text("responseText").notNull(),
    detectedIntents: json("detectedIntents").default([]),
    evidenceUsed: json("evidenceUsed").default({}),
    feedbackScore: integer("feedbackScore"),
    wasHelpful: boolean("wasHelpful"),
    language: varchar("language", { length: 10 }).default("en"),
    convertedToTraining: boolean("convertedToTraining").default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    sessionIdx: index("conv_log_session_idx").on(table.sessionId),
    trainingIdx: index("conv_log_training_idx").on(table.convertedToTraining),
  })
);

export type CommerceConversationLog = InferSelectModel<typeof commerceConversationLog>;

// Daily price rollups (materialized view performance optimization)
export const dailyPriceRollup = pgTable(
  "DailyPriceRollup",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
    productId: uuid("productId")
      .notNull()
      .references(() => product.id),
    marketId: uuid("marketId")
      .notNull()
      .references(() => market.id),
    avgPrice: decimal("avgPrice", { precision: 12, scale: 2 }),
    minPrice: decimal("minPrice", { precision: 12, scale: 2 }),
    maxPrice: decimal("maxPrice", { precision: 12, scale: 2 }),
    reportCount: integer("reportCount").default(0),
    currency: varchar("currency", { length: 3 }).notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    dateIdx: index("rollup_date_idx").on(table.date),
    productIdx: index("rollup_product_idx").on(table.productId),
    marketIdx: index("rollup_market_idx").on(table.marketId),
    dateProductMarket: index("rollup_date_product_market_idx").on(
      table.date,
      table.productId,
      table.marketId
    ),
  })
);

export type DailyPriceRollup = InferSelectModel<typeof dailyPriceRollup>;

// ============ PHASE 5: NOTIFICATION SYSTEM TABLES ============

// User watchlists (products/markets user is tracking)
export const watchlist = pgTable(
  "Watchlist",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    productId: uuid("productId")
      .notNull()
      .references(() => product.id),
    marketId: uuid("marketId")
      .notNull()
      .references(() => market.id),
    priceAlertThreshold: decimal("priceAlertThreshold", { precision: 3, scale: 2 }), // 1.20 = 20% above fair price
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("watchlist_user_idx").on(table.userId),
    productIdx: index("watchlist_product_idx").on(table.productId),
    marketIdx: index("watchlist_market_idx").on(table.marketId),
    userProductMarket: unique("watchlist_user_product_market").on(
      table.userId,
      table.productId,
      table.marketId
    ),
  })
);

export type Watchlist = InferSelectModel<typeof watchlist>;

// Notification rules (rule-based, not LLM)
export const notificationRule = pgTable(
  "NotificationRule",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    ruleType: varchar("ruleType", { length: 50 }).notNull(), // "price_alert", "market_alert", "shopping_nudge", "digest"
    watchlistId: uuid("watchlistId")
      .notNull()
      .references(() => watchlist.id),
    condition: json("condition").notNull(), // {type, operator, value}
    notificationChannel: varchar("notificationChannel", { length: 50 }).notNull(), // "whatsapp", "email", "sms", "push"
    quietHours: json("quietHours"), // {startHour: 22, endHour: 8}
    maxNotificationsPerDay: integer("maxNotificationsPerDay").default(3),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("rule_user_idx").on(table.userId),
    watchlistIdx: index("rule_watchlist_idx").on(table.watchlistId),
    ruleTypeIdx: index("rule_type_idx").on(table.ruleType),
  })
);

export type NotificationRule = InferSelectModel<typeof notificationRule>;

// Sent notifications (for fatigue control and history)
export const notification = pgTable(
  "Notification",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    ruleId: uuid("ruleId")
      .notNull()
      .references(() => notificationRule.id),
    watchlistId: uuid("watchlistId")
      .notNull()
      .references(() => watchlist.id),
    type: varchar("type", { length: 50 }).notNull(), // "price_alert", "market_alert", etc.
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    channel: varchar("channel", { length: 50 }).notNull(),
    metadata: json("metadata"), // Additional context: {productName, marketName, fairPrice, currentPrice, etc}
    isRead: boolean("isRead").default(false),
    sentAt: timestamp("sentAt").notNull().defaultNow(),
    readAt: timestamp("readAt"),
  },
  (table) => ({
    userIdx: index("notif_user_idx").on(table.userId),
    ruleIdx: index("notif_rule_idx").on(table.ruleId),
    watchlistIdx: index("notif_watchlist_idx").on(table.watchlistId),
    sentAtIdx: index("notif_sent_idx").on(table.sentAt),
    typeIdx: index("notif_type_idx").on(table.type),
  })
);

export type Notification = InferSelectModel<typeof notification>;

// Notification events (for batching and digest)
export const notificationEvent = pgTable(
  "NotificationEvent",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    eventType: varchar("eventType", { length: 50 }).notNull(), // "price_spike", "market_trend", "new_product"
    productId: uuid("productId").references(() => product.id),
    marketId: uuid("marketId").references(() => market.id),
    data: json("data").notNull(), // Raw event data
    isBatched: boolean("isBatched").default(false),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("event_user_idx").on(table.userId),
    eventTypeIdx: index("event_type_idx").on(table.eventType),
    createdIdx: index("event_created_idx").on(table.createdAt),
    unbatchedIdx: index("event_unbatched_idx").on(table.isBatched),
  })
);

export type NotificationEvent = InferSelectModel<typeof notificationEvent>;

// User preferences
export const userPreferences = pgTable(
  "UserPreferences",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id)
      .unique(),
    preferredChannel: varchar("preferredChannel", { length: 50 }).default("whatsapp"), // Primary channel: whatsapp, email, sms, push
    quietHoursStart: integer("quietHoursStart").default(22), // 22:00 UTC
    quietHoursEnd: integer("quietHoursEnd").default(8), // 08:00 UTC
    dailyDigestEnabled: boolean("dailyDigestEnabled").default(true),
    digestTime: varchar("digestTime", { length: 5 }).default("08:00"), // HH:MM format
    maxNotificationsPerDay: integer("maxNotificationsPerDay").default(10),
    language: varchar("language", { length: 10 }).default("en"), // en, yo, ha, ig, pcn
    timezone: varchar("timezone", { length: 50 }).default("UTC"),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("prefs_user_idx").on(table.userId),
  })
);

export type UserPreferences = InferSelectModel<typeof userPreferences>;

// ============ PHASE 5 EVOLUTION: COMMERCE EVENT BUS & DECISION ENGINE ============

// Commerce events (raw market events)
export const commerceEvent = pgTable(
  "CommerceEvent",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    eventType: varchar("eventType", { length: 50 }).notNull(), // "price_spike", "market_available", "new_product", "supply_surge"
    productId: uuid("productId")
      .notNull()
      .references(() => product.id),
    marketId: uuid("marketId")
      .notNull()
      .references(() => market.id),
    data: json("data").notNull(), // {oldPrice, newPrice, change%, trend, confidence, etc}
    severity: integer("severity").default(50), // 0-100 scale
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    typeIdx: index("event_type_idx").on(table.eventType),
    productIdx: index("event_product_idx").on(table.productId),
    marketIdx: index("event_market_idx").on(table.marketId),
    createdIdx: index("event_created_idx").on(table.createdAt),
  })
);

export type CommerceEvent = InferSelectModel<typeof commerceEvent>;

// Decision scores for events (determines notification routing)
export const eventDecisionScore = pgTable(
  "EventDecisionScore",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    eventId: uuid("eventId")
      .notNull()
      .references(() => commerceEvent.id),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    priceImpactScore: integer("priceImpactScore").default(0), // 0-20
    userInterestScore: integer("userInterestScore").default(0), // 0-20
    urgencyScore: integer("urgencyScore").default(0), // 0-15
    relevanceScore: integer("relevanceScore").default(0), // 0-20
    confidenceScore: integer("confidenceScore").default(0), // 0-15
    popularityScore: integer("popularityScore").default(0), // 0-10
    totalScore: integer("totalScore").default(0), // Sum of all (0-100)
    decision: varchar("decision", { length: 20 }).default("ignore"), // "send_now", "batch", "digest", "ignore"
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    eventIdx: index("score_event_idx").on(table.eventId),
    userIdx: index("score_user_idx").on(table.userId),
    decisionIdx: index("score_decision_idx").on(table.decision),
    totalScoreIdx: index("score_total_idx").on(table.totalScore),
  })
);

export type EventDecisionScore = InferSelectModel<typeof eventDecisionScore>;

// User interest profile (learned from behavior)
export const userInterestProfile = pgTable(
  "UserInterestProfile",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id)
      .unique(),
    productInterests: json("productInterests").notNull(), // {productId: rating (1-5), ...}
    categoryInterests: json("categoryInterests").notNull(), // {categoryId: rating, ...}
    marketInterests: json("marketInterests").notNull(), // {marketId: rating, ...}
    priceRanges: json("priceRanges").notNull(), // {categoryId: {min, max}, ...}
    lastUpdated: timestamp("lastUpdated").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("interest_user_idx").on(table.userId),
  })
);

export type UserInterestProfile = InferSelectModel<typeof userInterestProfile>;

// Smart timing preferences (when user is ready to engage)
export const smartTimingProfile = pgTable(
  "SmartTimingProfile",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id)
      .unique(),
    readyTimeWindow: json("readyTimeWindow").notNull(), // {dayOfWeek: 0-6, startHour: 0-23, endHour: 0-23, score: 0-100}
    activityPattern: json("activityPattern").notNull(), // Heatmap of when user engages
    deviceType: varchar("deviceType", { length: 50 }), // "mobile", "web", "whatsapp"
    preferredTime: varchar("preferredTime", { length: 20 }), // "morning", "afternoon", "evening", "night"
    lastUpdated: timestamp("lastUpdated").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("timing_user_idx").on(table.userId),
  })
);

export type SmartTimingProfile = InferSelectModel<typeof smartTimingProfile>;

// Geofence preferences
export const userGeofence = pgTable(
  "UserGeofence",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    marketId: uuid("marketId")
      .notNull()
      .references(() => market.id),
    radiusKm: decimal("radiusKm", { precision: 5, scale: 2 }).default("2.0"),
    isActive: boolean("isActive").default(true),
    notifyWhen: varchar("notifyWhen", { length: 50 }).default("entering"), // "entering", "near", "exiting"
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("geofence_user_idx").on(table.userId),
    marketIdx: index("geofence_market_idx").on(table.marketId),
    activeIdx: index("geofence_active_idx").on(table.isActive),
  })
);

export type UserGeofence = InferSelectModel<typeof userGeofence>;

// Analytics events for tracking user behavior
export const analyticsEvent = pgTable(
  "AnalyticsEvent",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    notificationId: uuid("notificationId").references(() => notification.id),
    eventType: varchar("eventType", { length: 50 }).notNull(), // "opened", "clicked", "purchased", "dismissed", "archived"
    eventData: json("eventData"), // Additional context
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    userIdx: index("analytics_user_idx").on(table.userId),
    typeIdx: index("analytics_type_idx").on(table.eventType),
    createdIdx: index("analytics_created_idx").on(table.createdAt),
  })
);

export type AnalyticsEvent = InferSelectModel<typeof analyticsEvent>;

// ============ ARCHITECTURE V2.0 COMPLETENESS TABLES ============

// Administrative geography
export const stateTable = pgTable("State", {
  code: varchar("code", { length: 10 }).primaryKey().notNull(), // "LA", "KN", "AB"
  name: varchar("name", { length: 100 }).notNull(),
  region: varchar("region", { length: 50 }), // "SW", "NC", "NW", etc.
  population: integer("population"),
});
export type StateTable = InferSelectModel<typeof stateTable>;

export const lgaTable = pgTable(
  "Lga",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    stateCode: varchar("stateCode", { length: 10 })
      .notNull()
      .references(() => stateTable.code),
    name: varchar("name", { length: 100 }).notNull(),
    urbanRural: varchar("urbanRural", { length: 20 }), // "urban", "peri-urban", "rural"
  },
  (table) => ({
    stateIdx: index("lga_state_idx").on(table.stateCode),
  })
);
export type LgaTable = InferSelectModel<typeof lgaTable>;

// Product Manufacturers & Brands
export const manufacturerTable = pgTable("Manufacturer", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  nafdacStatus: varchar("nafdacStatus", { length: 50 }).default("registered"),
  regulatoryFlags: json("regulatoryFlags").default([]),
});
export type ManufacturerTable = InferSelectModel<typeof manufacturerTable>;

export const brandTable = pgTable(
  "Brand",
  {
    slug: varchar("slug", { length: 255 }).primaryKey().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    manufacturerId: uuid("manufacturerId").references(() => manufacturerTable.id),
    originCountry: varchar("originCountry", { length: 100 }),
    category: varchar("category", { length: 100 }),
    trustScore: decimal("trustScore", { precision: 3, scale: 2 }).default("0.80"),
    verified: boolean("verified").default(false),
    knownFakes: json("knownFakes").default([]),
    authenticitySignals: json("authenticitySignals").default([]),
  },
  (table) => ({
    manufacturerIdx: index("brand_manufacturer_idx").on(table.manufacturerId),
  })
);
export type BrandTable = InferSelectModel<typeof brandTable>;

// Supply & Demand Intelligence Signals
export const supplySignalTable = pgTable(
  "SupplySignal",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    productId: uuid("productId").references(() => product.id),
    marketId: uuid("marketId").references(() => market.id),
    signalType: varchar("signalType", { length: 50 }).notNull(), // "abundance", "normal", "shortage", "disruption"
    cause: varchar("cause", { length: 50 }), // "seasonal", "transport", "flood", "strike", "harvest", "policy"
    severity: varchar("severity", { length: 20 }).default("medium"),
    affectedStates: json("affectedStates").default([]),
    agentId: uuid("agentId").references(() => agentProfile.id),
    reportedAt: timestamp("reportedAt").notNull().defaultNow(),
    notes: text("notes"),
  },
  (table) => ({
    productIdx: index("supply_signal_product_idx").on(table.productId),
    marketIdx: index("supply_signal_market_idx").on(table.marketId),
    signalTypeIdx: index("supply_signal_type_idx").on(table.signalType),
  })
);
export type SupplySignalTable = InferSelectModel<typeof supplySignalTable>;

export const demandSignalTable = pgTable(
  "DemandSignal",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    productId: uuid("productId").references(() => product.id),
    area: varchar("area", { length: 100 }),
    stateCode: varchar("stateCode", { length: 10 }).references(() => stateTable.code),
    signalType: varchar("signalType", { length: 50 }).notNull(), // "query", "search", "purchase_intent", "basket"
    volume: integer("volume").default(1),
    periodStart: timestamp("periodStart").notNull().defaultNow(),
    periodEnd: timestamp("periodEnd"),
    source: varchar("source", { length: 50 }).default("mamaprice"),
  },
  (table) => ({
    productIdx: index("demand_signal_product_idx").on(table.productId),
    stateIdx: index("demand_signal_state_idx").on(table.stateCode),
  })
);
export type DemandSignalTable = InferSelectModel<typeof demandSignalTable>;

// Recipes & Culinary Intelligence
export const recipeTable = pgTable("Recipe", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  cuisineType: varchar("cuisineType", { length: 100 }), // "yoruba", "igbo", "hausa", "pan-nigerian"
  mealType: varchar("mealType", { length: 50 }), // "main", "side", "snack"
  preparationTime: integer("preparationTime"), // minutes
  servings: integer("servings"),
  description: text("description"),
  steps: json("steps").default([]),
  estimatedCost: json("estimatedCost"), // {min: 8000, max: 15000}
  seasonalNotes: text("seasonalNotes"),
  regionalVariants: json("regionalVariants"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
export type RecipeTable = InferSelectModel<typeof recipeTable>;

export const recipeIngredientTable = pgTable(
  "RecipeIngredient",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    recipeId: uuid("recipeId")
      .notNull()
      .references(() => recipeTable.id),
    productId: uuid("productId").references(() => product.id),
    quantity: decimal("quantity", { precision: 10, scale: 2 }),
    unit: varchar("unit", { length: 50 }),
    optional: boolean("optional").default(false),
    substituteForProductId: uuid("substituteForProductId").references(() => product.id),
  },
  (table) => ({
    recipeIdx: index("ingredient_recipe_idx").on(table.recipeId),
    productIdx: index("ingredient_product_idx").on(table.productId),
  })
);
export type RecipeIngredientTable = InferSelectModel<typeof recipeIngredientTable>;

// Research Reports & Bulletins
export const researchReportTable = pgTable("ResearchReport", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  title: varchar("title", { length: 255 }).notNull(),
  sourceOrg: varchar("sourceOrg", { length: 100 }), // "government", "academic", "ngo", "internal"
  reportType: varchar("reportType", { length: 50 }),
  datePublished: timestamp("datePublished"),
  statesCovered: json("statesCovered").default([]),
  productsCovered: json("productsCovered").default([]),
  summary: text("summary"),
  keyFindings: json("keyFindings").default([]),
  pdfPath: varchar("pdfPath", { length: 500 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
export type ResearchReportTable = InferSelectModel<typeof researchReportTable>;

// Receipts & OCR Data
export const receiptTable = pgTable("Receipt", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  imagePath: varchar("imagePath", { length: 500 }).notNull(),
  ocrRawText: text("ocrRawText"),
  ocrConfidence: decimal("ocrConfidence", { precision: 3, scale: 2 }),
  parsedItems: json("parsedItems").default([]),
  marketIdDetected: uuid("marketIdDetected").references(() => market.id),
  receiptDate: timestamp("receiptDate"),
  totalAmount: decimal("totalAmount", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("NGN"),
  agentId: uuid("agentId").references(() => agentProfile.id),
  processingStatus: varchar("processingStatus", { length: 50 }).default("raw"), // "raw", "ocr_done", "parsed", "verified"
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});
export type ReceiptTable = InferSelectModel<typeof receiptTable>;

// Trend Memory (Price Snapshots over time)
export const priceSnapshotTable = pgTable(
  "PriceSnapshot",
  {
    id: uuid("id").primaryKey().notNull().defaultRandom(),
    productId: uuid("productId")
      .notNull()
      .references(() => product.id),
    marketId: uuid("marketId").references(() => market.id),
    stateCode: varchar("stateCode", { length: 10 }).references(() => stateTable.code),
    unit: varchar("unit", { length: 50 }).notNull(),
    avgPrice: decimal("avgPrice", { precision: 12, scale: 2 }).notNull(),
    minPrice: decimal("minPrice", { precision: 12, scale: 2 }),
    maxPrice: decimal("maxPrice", { precision: 12, scale: 2 }),
    sampleCount: integer("sampleCount").default(1),
    weekStart: timestamp("weekStart").notNull(),
    createdAt: timestamp("createdAt").notNull().defaultNow(),
  },
  (table) => ({
    productIdx: index("snapshot_product_idx").on(table.productId),
    marketIdx: index("snapshot_market_idx").on(table.marketId),
    weekIdx: index("snapshot_week_idx").on(table.weekStart),
  })
);
export type PriceSnapshotTable = InferSelectModel<typeof priceSnapshotTable>;

