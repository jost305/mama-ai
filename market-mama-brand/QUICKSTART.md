# MarketMama AI - Quick Start Guide

## 5-Minute Setup

### 1. Get Required API Keys

**OpenRouter API Key** (Free model)
1. Go to https://openrouter.ai
2. Sign up and create account
3. Copy your API key

**Auth Secret**
```bash
openssl rand -base64 32
```

### 2. Set Up Environment Variables

Create `.env.local`:
```env
OPENROUTER_API_KEY=your_key_from_step_1
AUTH_SECRET=your_secret_from_step_2
```

Optional (for database persistence):
```env
POSTGRES_URL=postgresql://user:password@host/db
```

### 3. Install & Run

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open http://localhost:3000
```

## 2-Minute Feature Tour

### Try These Queries

**Market Discovery:**
```
Find markets selling textiles in Lagos Nigeria
```

**Price Comparison:**
```
Compare prices for rice in Accra markets
```

**Vendor Lookup:**
```
Tell me about Kano market traders
```

**Currency Conversion:**
```
What's the NGN to USD exchange rate?
```

**Shipping & Delivery:**
```
How much to ship 100kg from Johannesburg to Cape Town?
```

**Market Trends:**
```
What products are trending in Kenya right now?
```

**Find Suppliers:**
```
Find textile wholesalers in Ghana
```

## Project Structure

```
MarketMama AI/
├── ai/
│   ├── index.ts                 # AI model config (OpenRouter)
│   ├── actions.ts               # AI generation helpers
│   └── commerce-tools.ts        # Commerce intelligence tools
├── app/
│   ├── (chat)/
│   │   ├── api/chat/route.ts   # Chat API with tools
│   │   └── page.tsx             # Chat interface
│   ├── (auth)/                  # Login/register pages
│   └── layout.tsx               # Root layout
├── components/
│   ├── commerce/                # Commerce UI components
│   ├── custom/                  # Custom components
│   └── flights/                 # Flight booking components
├── db/
│   ├── schema.ts                # Database schema
│   ├── queries.ts               # Database queries
│   └── migrate.ts               # Migration script
└── public/                      # Static assets
```

## Documentation

- **`UPGRADE_COMPLETE.md`** - Full upgrade details (what changed)
- **`AFRICA_COMMERCE_FEATURES.md`** - Commerce features guide
- **`DATABASE_SETUP.md`** - Database configuration options
- **`QUICKSTART.md`** - This file

## Common Tasks

### Add a New Commerce Tool

1. Create tool in `ai/commerce-tools.ts`
2. Add to `app/(chat)/api/chat/route.ts` tools object
3. Create component in `components/commerce/`
4. Use in chat!

### Deploy to Vercel

```bash
# Push to GitHub
git add .
git commit -m "MarketMama AI upgrade complete"
git push

# Then:
# 1. Go to vercel.com
# 2. Import project from GitHub
# 3. Add environment variables
# 4. Deploy
```

### Connect a Real Database

Follow `DATABASE_SETUP.md` for options:
- Neon (recommended)
- Supabase
- Vercel Postgres
- Local PostgreSQL

### Change AI Model

Edit `ai/index.ts`:
```typescript
// Use a different OpenRouter model
model: openai.chat("mistral-7b", {
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
})
```

Available free models on OpenRouter:
- `meta-llama/llama-3.1-8b-instruct` (current)
- `mistral-7b`
- `neural-chat-7b`
- And many more...

## Troubleshooting

**Module not found errors**
```bash
pnpm install
rm -rf node_modules
pnpm install
```

**Build fails**
```bash
pnpm build
# Check for TypeScript errors
```

**Chat not responding**
- Check that `OPENROUTER_API_KEY` is set
- Verify API key is valid at openrouter.ai
- Check browser console for errors

**Database errors**
- Set `POSTGRES_URL` to use database features
- Commerce tools work without database
- Chat history requires database

## API Reference

### Available Tools

All tools are called automatically by the AI:

- `searchAfricanMarkets(query, country)` - Find markets
- `compareProductPrices(productName, markets)` - Compare prices
- `getVendorInfo(vendorName, country)` - Vendor profiles
- `checkCurrencyRate(fromCurrency, toCurrency)` - Exchange rates
- `estimateDelivery(origin, destination, weight)` - Shipping
- `getTrendingProducts(country, category)` - Market trends
- `findSuppliers(category, country)` - Wholesale suppliers

### Chat API

```
POST /api/chat
{
  "id": "chat-uuid",
  "messages": [
    { "role": "user", "content": "Find markets in Lagos" }
  ]
}
```

## Performance

- Chat responses: 2-5 seconds
- Commerce tools: 1-3 seconds each
- Component rendering: <100ms
- Database queries: <500ms (with POSTGRES_URL)

## Security

- Passwords hashed with bcrypt
- Session tokens via JWT
- Environment variables protected
- No sensitive data in logs
- SQL injection prevented with Drizzle

## Support

- Check documentation files
- Review component source code
- Check console for error messages
- Verify environment variables are set

## What's Next?

1. **Personalize It** - Add your company branding
2. **Extend It** - Build more commerce tools
3. **Scale It** - Deploy to production
4. **Monetize It** - Add subscription features

## Resources

- Next.js: https://nextjs.org
- Drizzle ORM: https://orm.drizzle.team
- OpenRouter: https://openrouter.ai
- NextAuth: https://authjs.dev
- Tailwind: https://tailwindcss.com

---

**Ready to launch MarketMama AI?** 🚀

Next step: `pnpm dev` and start chatting!
