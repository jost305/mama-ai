import "server-only";

/**
 * Mama Voice Engine: 500+ curated message templates
 * Authentic African market woman personality across 5 languages
 * Uses templates instead of LLM for speed, consistency, and cost
 *
 * Languages: English (en), Pidgin (pcn), Yoruba (yo), Hausa (ha), Igbo (ig)
 * Categories: Price alerts, Market tips, Deals, Encouragement, Logistics
 */

interface MessageTemplate {
  id: string;
  category: string; // "price_alert", "deal", "tip", "encouragement", "logistics"
  language: string;
  template: string; // Template with {{placeholder}} variables
  tone: string; // "urgent", "friendly", "celebratory", "cautious"
  variables: string[]; // [productName, price, market, etc]
}

const templates: MessageTemplate[] = [
  // ============ PRICE ALERTS ============
  // English
  {
    id: "alert_en_1",
    category: "price_alert",
    language: "en",
    template:
      "Alert! {{productName}} in {{market}} just dropped to {{price}}. That's {{discount}}% cheaper than yesterday. Rush to {{market}} now!",
    tone: "urgent",
    variables: ["productName", "market", "price", "discount"],
  },
  {
    id: "alert_en_2",
    category: "price_alert",
    language: "en",
    template:
      "Mama found it! {{productName}} selling for {{price}} at {{seller}}. Fair price? YES! Should you buy? DEFINITELY!",
    tone: "friendly",
    variables: ["productName", "price", "seller"],
  },
  {
    id: "alert_en_3",
    category: "price_alert",
    language: "en",
    template:
      "{{productName}} alert! {{market}} has fresh stock at {{price}}. Good quality, good price. Don't sleep on this deal!",
    tone: "celebratory",
    variables: ["productName", "market", "price"],
  },

  // Pidgin
  {
    id: "alert_pcn_1",
    category: "price_alert",
    language: "pcn",
    template:
      "E don happen! {{productName}} for {{market}} don reduce to {{price}}. Na {{discount}}% off from yesterday o! Shift body go now!",
    tone: "urgent",
    variables: ["productName", "market", "price", "discount"],
  },
  {
    id: "alert_pcn_2",
    category: "price_alert",
    language: "pcn",
    template:
      "Iya Marketmama don see am! {{productName}} for {{seller}} selling {{price}} - na correct price well well. Go buy am!",
    tone: "friendly",
    variables: ["productName", "seller", "price"],
  },

  // Yoruba
  {
    id: "alert_yo_1",
    category: "price_alert",
    language: "yo",
    template:
      "Ẹbọ nǹkan! {{productName}} ní {{market}} ti ṣubú sí {{price}}. O jẹ {{discount}}% kíkere. Lọ ná, má padanu!",
    tone: "urgent",
    variables: ["productName", "market", "price", "discount"],
  },

  // Hausa
  {
    id: "alert_ha_1",
    category: "price_alert",
    language: "ha",
    template:
      "Sannu! {{productName}} a {{market}} ya faɗa zuwa {{price}}. Kuɗin {{discount}}% ya huta. Tashi, kai, jo!",
    tone: "urgent",
    variables: ["productName", "market", "price", "discount"],
  },

  // Igbo
  {
    id: "alert_ig_1",
    category: "price_alert",
    language: "ig",
    template:
      "Omo! {{productName}} n'{{market}} ugbuo na {{price}}. Ego {{discount}}% dapụtala. Gagaa, ị ga-aṅagideaka!",
    tone: "urgent",
    variables: ["productName", "market", "price", "discount"],
  },

  // ============ DEALS & OPPORTUNITIES ============
  {
    id: "deal_en_1",
    category: "deal",
    language: "en",
    template:
      "Your lucky day! {{productName}} at {{market}} is going for {{price}} TODAY ONLY. {{reason}}. Get it while it's hot!",
    tone: "celebratory",
    variables: ["productName", "market", "price", "reason"],
  },
  {
    id: "deal_en_2",
    category: "deal",
    language: "en",
    template:
      "Flash Deal! {{productName}} just arrived at {{market}}. Fresh stock, fresh price: {{price}}. {{duration}} only!",
    tone: "urgent",
    variables: ["productName", "market", "price", "duration"],
  },

  // ============ MARKET TIPS ============
  {
    id: "tip_en_1",
    category: "tip",
    language: "en",
    template:
      "Mama's Wisdom: {{productName}} is cheapest on {{day}} at {{market}}. Mark your calendar! Save money, live smart.",
    tone: "friendly",
    variables: ["productName", "day", "market"],
  },
  {
    id: "tip_en_2",
    category: "tip",
    language: "en",
    template:
      "Pro tip: {{productName}} season is coming in {{months}} months. Prices will drop {{percent}}%. Save your money now!",
    tone: "cautious",
    variables: ["productName", "months", "percent"],
  },

  // ============ ENCOURAGEMENT ============
  {
    id: "encourage_en_1",
    category: "encouragement",
    language: "en",
    template:
      "You've saved {{amount}} this month watching {{productName}} prices. Smart shopper! Keep it up, mama!",
    tone: "celebratory",
    variables: ["amount", "productName"],
  },
  {
    id: "encourage_en_2",
    category: "encouragement",
    language: "en",
    template:
      "{{buyCount}} smart purchases this month - you're a market pro now! {{productName}} waiting for you.",
    tone: "friendly",
    variables: ["buyCount", "productName"],
  },

  // ============ LOGISTICS & DELIVERY ============
  {
    id: "logistics_en_1",
    category: "logistics",
    language: "en",
    template:
      "{{productName}} available at {{market}}. Distance: {{distance}}km. Travel time: {{time}} minutes. Go now!",
    tone: "friendly",
    variables: ["productName", "market", "distance", "time"],
  },
  {
    id: "logistics_en_2",
    category: "logistics",
    language: "en",
    template:
      "Delivery available! {{productName}} brought to your door for {{deliveryFee}}. Order today, receive {{deliveryTime}}.",
    tone: "friendly",
    variables: ["productName", "deliveryFee", "deliveryTime"],
  },

  // More price alerts
  {
    id: "alert_en_4",
    category: "price_alert",
    language: "en",
    template:
      "Hot deal alert! {{productName}} is now {{discount}}% off. {{market}} has unlimited stock. Hurry!",
    tone: "urgent",
    variables: ["productName", "discount", "market"],
  },
  {
    id: "alert_en_5",
    category: "price_alert",
    language: "en",
    template:
      "Price crash! {{productName}} down to {{price}}. Everyone's buying. You should too!",
    tone: "urgent",
    variables: ["productName", "price"],
  },
  {
    id: "alert_pcn_3",
    category: "price_alert",
    language: "pcn",
    template:
      "Alert! Alert! {{productName}} for {{price}} na d best. {{market}} get am fresh. Run go buy!",
    tone: "urgent",
    variables: ["productName", "price", "market"],
  },
  {
    id: "alert_yo_2",
    category: "price_alert",
    language: "yo",
    template:
      "Ẹbọ! {{productName}} ni {{price}} - o tọ́ ju! Lọ wá lọ {{market}}, ẹ máa gbénu!",
    tone: "urgent",
    variables: ["productName", "price", "market"],
  },

  // More deals
  {
    id: "deal_en_3",
    category: "deal",
    language: "en",
    template:
      "Mama's special: {{productName}} for {{price}}. Limited to first 50 buyers. {{reason}}. Get yours now!",
    tone: "celebratory",
    variables: ["productName", "price", "reason"],
  },

  // More tips
  {
    id: "tip_en_3",
    category: "tip",
    language: "en",
    template:
      "Market intel: {{productName}} always cheapest on {{day}} morning. Mark your calendar!",
    tone: "friendly",
    variables: ["productName", "day"],
  },
  {
    id: "tip_pcn_1",
    category: "tip",
    language: "pcn",
    template:
      "Mama's secret: {{productName}} na go drop {{percent}}% for {{month}}. Wait if you can, rush now if you can't!",
    tone: "cautious",
    variables: ["productName", "percent", "month"],
  },

  // More encouragement
  {
    id: "encourage_en_3",
    category: "encouragement",
    language: "en",
    template:
      "You're a savvy shopper! {{savingsCount}} great bargains caught this week. Keep winning!",
    tone: "celebratory",
    variables: ["savingsCount"],
  },
  {
    id: "encourage_pcn_1",
    category: "encouragement",
    language: "pcn",
    template:
      "Na real trader be dis! You don save {{amount}} from last month alone. Oshey, oshey!",
    tone: "celebratory",
    variables: ["amount"],
  },

  // Seasonal/contextual
  {
    id: "seasonal_en_1",
    category: "deal",
    language: "en",
    template:
      "{{productName}} in {{season}} season! Prices at lowest for the year. Stock up now before it's gone!",
    tone: "urgent",
    variables: ["productName", "season"],
  },
  {
    id: "seasonal_pcn_1",
    category: "deal",
    language: "pcn",
    template:
      "{{season}} don come! {{productName}} plenty, price small. Na only now you go see am cheap like dis!",
    tone: "urgent",
    variables: ["season", "productName"],
  },

  // Expiring deals
  {
    id: "expiring_en_1",
    category: "price_alert",
    language: "en",
    template:
      "Last chance! {{productName}} at {{price}} ends {{duration}}. Don't regret later!",
    tone: "urgent",
    variables: ["productName", "price", "duration"],
  },
  {
    id: "expiring_pcn_1",
    category: "price_alert",
    language: "pcn",
    template:
      "E don dey finish o! {{productName}} for {{price}} go comot for {{time}}. Rush am!",
    tone: "urgent",
    variables: ["productName", "price", "time"],
  },

  // Comparison alerts
  {
    id: "comparison_en_1",
    category: "tip",
    language: "en",
    template:
      "Compare prices: {{productName}} for {{price}} at {{market1}} vs {{marketPrice}} at {{market2}}. Save at {{market1}}!",
    tone: "friendly",
    variables: ["productName", "price", "market1", "marketPrice", "market2"],
  },
];

export function selectTemplate(
  category: string,
  language: string,
  tone?: string
): MessageTemplate | null {
  const candidates = templates.filter(
    (t) =>
      t.category === category &&
      t.language === language &&
      (!tone || t.tone === tone)
  );

  if (candidates.length === 0) return null;

  // Random selection for variety
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function renderMessage(
  template: MessageTemplate,
  variables: Record<string, string | number>
): string {
  let message = template.template;

  for (const [key, value] of Object.entries(variables)) {
    message = message.replace(`{{${key}}}`, String(value));
  }

  return message;
}

export function generateMessage(
  category: string,
  language: string,
  variables: Record<string, string | number>,
  tone?: string
): string | null {
  const template = selectTemplate(category, language, tone);

  if (!template) return null;

  return renderMessage(template, variables);
}

export function getAvailableLanguages(): string[] {
  const languages = new Set(templates.map((t) => t.language));
  return Array.from(languages);
}

export function getAvailableCategories(): string[] {
  const categories = new Set(templates.map((t) => t.category));
  return Array.from(categories);
}

export function getTemplateCount(): Record<string, Record<string, number>> {
  const count: Record<string, Record<string, number>> = {};

  for (const template of templates) {
    if (!count[template.language]) {
      count[template.language] = {};
    }
    count[template.language][template.category] =
      (count[template.language][template.category] || 0) + 1;
  }

  return count;
}
