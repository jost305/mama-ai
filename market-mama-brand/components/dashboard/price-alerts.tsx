import { Bell, TrendingDown } from "lucide-react";

export function PriceAlerts() {
  const alerts = [
    {
      emoji: "🍅",
      title: "Tomato prices dropped",
      location: "Across 5 major markets",
      change: -8,
      time: "8 mins ago",
    },
    {
      emoji: "🥬",
      title: "Spinach is available in Kano",
      location: "Supply increased",
      change: 3,
      time: "10 mins ago",
    },
    {
      emoji: "🌧️",
      title: "Rain expected in Kaduna",
      location: "Pepper supply may reduce",
      change: 6,
      time: "30 mins ago",
    },
  ];

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Price Alerts</h3>
        </div>
        <a href="#" className="text-xs text-primary hover:underline">
          View all
        </a>
      </div>

      <div className="space-y-3">
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className="flex gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
          >
            <span className="text-xl flex-shrink-0">{alert.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{alert.title}</p>
              <p className="text-xs text-muted-foreground">{alert.location}</p>
              <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
            </div>
            <div className={`text-sm font-semibold flex-shrink-0 ${alert.change < 0 ? "text-green-600" : "text-red-600"}`}>
              {alert.change > 0 ? "+" : ""}{alert.change}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
