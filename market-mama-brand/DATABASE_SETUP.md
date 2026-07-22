# MarketMama AI - Database Setup Guide

## Overview

MarketMama AI uses PostgreSQL with Drizzle ORM for data persistence. This guide walks you through setting up the database for development and production.

## Database Schema

The application uses three main tables:

### 1. User Table
- `id` (UUID): Primary key
- `email` (VARCHAR): User email address
- `password` (VARCHAR): Bcrypt-hashed password

### 2. Chat Table
- `id` (UUID): Primary key
- `createdAt` (TIMESTAMP): When the chat was created
- `messages` (JSON): Full conversation history
- `userId` (UUID): Foreign key to User table

### 3. Reservation Table
- `id` (UUID): Primary key
- `createdAt` (TIMESTAMP): When the reservation was created
- `details` (JSON): Full reservation details
- `hasCompletedPayment` (BOOLEAN): Payment status flag
- `userId` (UUID): Foreign key to User table

## Setup Options

### Option 1: Neon (Recommended)

Neon provides a free PostgreSQL database perfect for development and small production deployments.

1. Go to [Neon](https://neon.tech)
2. Sign up and create a new project
3. Copy the connection string (PostgreSQL URL)
4. Add to your `.env.local`:
   ```
   POSTGRES_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

### Option 2: Supabase

Supabase offers a hosted PostgreSQL instance with additional features.

1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Navigate to Settings > Database > Connection String
4. Copy the PostgreSQL connection string
5. Add to your `.env.local`:
   ```
   POSTGRES_URL=postgresql://[user]:[password]@[host]:[port]/[database]
   ```

### Option 3: Vercel Postgres

If deploying on Vercel, use Vercel's native Postgres integration.

1. Go to your Vercel project dashboard
2. Add "Postgres" integration
3. The `POSTGRES_URL` will be automatically added to your environment

### Option 4: Local PostgreSQL (Development Only)

For local development:

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   psql -U postgres -c "CREATE DATABASE marketmama_ai;"
   ```
3. Add to `.env.local`:
   ```
   POSTGRES_URL=postgresql://postgres:[password]@localhost:5432/marketmama_ai
   ```

## Running Migrations

The application automatically runs migrations when you build:

```bash
# Development
npm run dev
# Migrations run on startup via middleware

# Production Build
npm run build
# Migrations run before build completes
```

To manually run migrations:

```bash
npx tsx db/migrate.ts
```

## Environment Variables Required

Add these to your `.env.local`:

```env
# Database
POSTGRES_URL=postgresql://...

# Authentication
AUTH_SECRET=your_secret_here  # Generate with: openssl rand -base64 32

# AI & APIs
OPENROUTER_API_KEY=your_openrouter_key

# File Storage (Optional)
BLOB_READ_WRITE_TOKEN=your_blob_token
```

## Verification

After setup, verify the database connection:

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Try signing up at http://localhost:3000/register

3. Check the database to see the new user created

4. Start a conversation to test chat saving

## Troubleshooting

### Connection refused
- Ensure your database is running and the connection string is correct
- Check firewall/network rules allow connections to your database

### SSL/TLS errors
- Ensure `?sslmode=require` is in your connection string
- Some providers require certificate verification

### Migration errors
- Database user may not have create table permissions
- Ensure migrations can write to the database schema

## Production Deployment

When deploying to Vercel:

1. Add `POSTGRES_URL` to your production environment variables in Vercel dashboard
2. Ensure the database can accept connections from Vercel's IP ranges
3. Run `npm run build` to verify migrations work
4. Deploy with confidence - migrations run automatically

## Next Steps

Once the database is set up:

1. Your chat history will persist across sessions
2. User authentication will work properly
3. The application is ready for production use

For questions or issues, check the application logs or database provider documentation.
