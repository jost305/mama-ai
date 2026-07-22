import { TrendingDown, TrendingUp } from "lucide-react";

export function MarketPulse() {
  const commodities = [
    {
      name: "Tomatoes (Basket)",
      emoji: "🍅",
      price: "₦1,900",
      change: -8,
      status: "▼",
      color: "text-red-600",
    },
    {
      name: "Onions (Bag)",
      emoji: "🧅",
      price: "₦2,000",
      change: 2,
      status: "▲",
      color: "text-green-600",
    },
    {
      name: "Pepper (Basket)",
      emoji: "🌶️",
      price: "₦14,000",
      change: 5,
      status: "▲",
      color: "text-red-600",
    },
    {
      name: "Cows (Large)",
      emoji: "🐄",
      price: "₦1,300,000",
      change: 2,
      status: "▲",
      color: "text-green-600",
    },
  ];

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold">Market Pulse</h2>
          <p className="text-sm text-muted-foreground">
            Live updates from 1,248 markets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-green-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {commodities.map((commodity) => (
          <div
            key={commodity.name}
            className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{commodity.emoji}</span>
              <span className={`text-xs font-medium ${commodity.color}`}>
                {commodity.status}
              </span>
            </div>
            <p className="text-sm font-medium line-clamp-2 mb-2">
              {commodity.name}
            </p>
            <p className="text-lg font-bold text-foreground">
              {commodity.price}
            </p>
            <p className={`text-xs font-medium ${commodity.color}`}>
              {commodity.change > 0 ? "+" : ""}{commodity.change}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg. Price</p>

            {/* Mini chart simulation */}
            <div className="flex items-end gap-1 mt-3 h-8">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 bg-primary/20 rounded-t"
                  style={{
                    height: `${20 + Math.random() * 60}%`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2 text-xs text-muted-foreground">
        <span>🟢 High</span>
        <span>🟡 Medium</span>
        <span>🔴 Low</span>
        <span>🔵 New Report</span>
      </div>
    </div>
  );
}
