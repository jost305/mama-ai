import {
  Heart,
  Search,
  TrendingUp,
  Users,
  ShieldCheck,
  Bell,
  Bookmark,
  BarChart3,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      icon: Search,
      title: "Check Prices",
      description: "See live prices",
    },
    {
      icon: Bell,
      title: "Report Price",
      description: "Help others",
    },
    {
      icon: Users,
      title: "Find Suppliers",
      description: "Find what you need",
    },
    {
      icon: ShieldCheck,
      title: "Verify Seller",
      description: "Check reliability",
    },
    {
      icon: TrendingUp,
      title: "Report Price",
      description: "Help others",
    },
    {
      icon: Heart,
      title: "My Watchlist",
      description: "Track items",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {actions.map((action, idx) => {
        const IconComponent = action.icon;
        return (
          <button
            key={idx}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border bg-card hover:shadow-md hover:border-primary/50 transition-all group"
          >
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm font-medium text-center">{action.title}</p>
            <p className="text-xs text-muted-foreground text-center">
              {action.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
