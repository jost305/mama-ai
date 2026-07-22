import { TrendingUp, TrendingDown } from "lucide-react";

export function TopMovers() {
  const movers = [
    {
      emoji: "🍅",
      name: "Tomatoes (Basket)",
      price: "₦1,900",
      change: 6,
      direction: "up",
    },
    {
      emoji: "🌾",
      name: "Rice (50kg)",
      price: "₦79,000",
      change: 5,
      direction: "up",
    },
    {
      emoji: "🧅",
      name: "Yam (Large)",
      price: "₦1,800",
      change: 3,
      direction: "down",
    },
    {
      emoji: "🌶️",
      name: "Pepper (Bag)",
      price: "₦120,000",
      change: 2,
      direction: "down",
    },
    {
      emoji: "🧈",
      name: "Palm Oil (25L)",
      price: "₦28,000",
      change: 1,
      direction: "down",
    },
  ];

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Top Movers (24h)</h3>
        <a href="#" className="text-xs text-primary hover:underline">
          View all
        </a>
      </div>

      <div className="space-y-2">
        {movers.map((mover, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-lg flex-shrink-0">{mover.emoji}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{mover.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 ml-2">
              <span className="text-xs font-semibold">{mover.price}</span>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                  mover.direction === "up"
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {mover.direction === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {mover.change}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
