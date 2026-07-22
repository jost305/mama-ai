import { Suspense } from "react";

import {
  AIRecommendation,
  LiveMarketMap,
  MamasDailyUpdate,
  MarketPulse,
  PriceAlerts,
  QuickActions,
  RecentPriceReports,
  TopMovers,
} from "@/components/dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-green-50 to-background">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Good morning, Amina! 👋
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Here&apos;s what&apos;s happening in the markets today.
              </p>
            </div>
            <div className="hidden md:block text-sm text-muted-foreground">
              📍 Kano, Nigeria
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Mama's Daily Update Banner */}
        <MamasDailyUpdate />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Pulse */}
            <Suspense fallback={<div className="h-64 bg-card rounded-lg animate-pulse" />}>
              <MarketPulse />
            </Suspense>

            {/* Popular Searches */}
            <div className="bg-card rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Popular Searches</h2>
                <a href="#" className="text-primary text-sm hover:underline">
                  View all
                </a>
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { icon: "🔍", text: "Rice price today" },
                  { icon: "🍅", text: "Tomatoes in Mile 12" },
                  { icon: "🥚", text: "Price of eggs" },
                  { icon: "🐟", text: "Fresh fish near me" },
                  { icon: "🥛", text: "Peak milk original?" },
                ].map((search) => (
                  <button
                    key={search.text}
                    className="px-3 py-2 rounded-full bg-muted text-sm hover:bg-muted/80 transition-colors"
                  >
                    {search.icon} {search.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Is This Price Fair? */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  title: "Is This Price Fair?",
                  description: "Find out if the price you're being offered is fair.",
                  action: "Check Now",
                  icon: "⚖️",
                },
                {
                  title: "Product Check",
                  description: "Check if a product is original or fake.",
                  action: "Check Product",
                  icon: "✅",
                },
                {
                  title: "Vendor Check",
                  description: "Check if a vendor is trusted and reliable.",
                  action: "Check Vendor",
                  icon: "🏪",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-card rounded-lg border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl mb-2">{card.icon}</div>
                  <h3 className="font-semibold mb-2">{card.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {card.description}
                  </p>
                  <button className="text-primary text-sm font-medium hover:underline">
                    {card.action} →
                  </button>
                </div>
              ))}
            </div>

            {/* What Can I Cook & Cheapest Near Me */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-background rounded-lg border p-6">
                <h3 className="font-semibold mb-2">What Can I Cook?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Tell me what you have. I&apos;ll suggest recipes.
                </p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  Find Recipes
                </button>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-background rounded-lg border p-6">
                <h3 className="font-semibold mb-2">Cheapest Near Me</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  See the cheapest places to buy items near you.
                </p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
                  Find Now
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Live Market Map Widget */}
            <Suspense fallback={<div className="h-80 bg-card rounded-lg animate-pulse" />}>
              <LiveMarketMap />
            </Suspense>

            {/* AI Recommendation */}
            <Suspense fallback={<div className="h-48 bg-card rounded-lg animate-pulse" />}>
              <AIRecommendation />
            </Suspense>

            {/* Price Alerts */}
            <Suspense fallback={<div className="h-48 bg-card rounded-lg animate-pulse" />}>
              <PriceAlerts />
            </Suspense>

            {/* Top Movers */}
            <Suspense fallback={<div className="h-48 bg-card rounded-lg animate-pulse" />}>
              <TopMovers />
            </Suspense>
          </div>
        </div>

        {/* Recent Price Reports */}
        <div className="mt-8">
          <Suspense fallback={<div className="h-96 bg-card rounded-lg animate-pulse" />}>
            <RecentPriceReports />
          </Suspense>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-8">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
