import { MapPin, CheckCircle, Clock } from "lucide-react";

export function RecentPriceReports() {
  const reports = [
    {
      emoji: "🍅",
      product: "Tomatoes",
      unit: "1 Basket",
      price: "₦1,900",
      market: "Kano, Dawanau Market",
      reporter: "Abubakar M.",
      time: "2 mins ago",
      verified: true,
      change: -4,
    },
    {
      emoji: "🧅",
      product: "Onions",
      unit: "1 Bag (100kg)",
      price: "₦1,500",
      market: "Kaduna, Sabon Gari Market",
      reporter: "Fatima A.",
      time: "5 mins ago",
      verified: true,
      change: 3,
    },
    {
      emoji: "🌶️",
      product: "Pepper",
      unit: "1 Bag (100kg)",
      price: "₦15,000",
      market: "Maiduguri, Monday Market",
      reporter: "Bashir M.",
      time: "7 mins ago",
      verified: true,
      change: 6,
    },
    {
      emoji: "🍚",
      product: "Tomatoes",
      unit: "1 Crate",
      price: "₦28,000",
      market: "Jos, Terminus Market",
      reporter: "Peter J.",
      time: "9 mins ago",
      verified: false,
      change: 2,
    },
  ];

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Recent Price Reports</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Latest verified prices from market reporters
            </p>
          </div>
          <a href="#" className="text-primary text-sm hover:underline">
            View all reports
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-6">
        {["Nearby", "Following", "All Markets"].map((tab) => (
          <button
            key={tab}
            className={`py-3 px-4 text-sm font-medium border-b-2 ${
              tab === "Nearby"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="divide-y">
        {reports.map((report, idx) => (
          <div
            key={idx}
            className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <div className="flex gap-4">
              {/* Product emoji */}
              <div className="text-3xl flex-shrink-0">{report.emoji}</div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {report.product} • {report.unit}
                      </h3>
                      {report.verified && (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {report.market}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg">{report.price}</p>
                    <p
                      className={`text-xs font-medium ${
                        report.change > 0 ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {report.change > 0 ? "↑" : "↓"} {Math.abs(report.change)}%
                    </p>
                  </div>
                </div>

                {/* Reporter info */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                  <span>By {report.reporter}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {report.time}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
