import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function AIRecommendation() {
  return (
    <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-lg p-6 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full" />

      <h3 className="font-semibold mb-2 relative z-10">AI Recommendation</h3>
      <p className="text-sm font-medium mb-3 relative z-10">Best Buy Today</p>

      {/* Product Card */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-4 relative z-10">
        <div className="flex gap-3">
          <div className="w-16 h-16 bg-white/30 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
            🍅
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Tomatoes</p>
            <p className="text-xs text-white/80 mb-1">
              Prices have dropped 8% across 5 major markets
            </p>
            <button className="text-xs font-medium bg-white/30 hover:bg-white/40 px-2 py-1 rounded transition-colors">
              View Details →
            </button>
          </div>
        </div>
      </div>

      <button className="w-full py-2 px-3 bg-white text-primary hover:bg-white/90 rounded-lg font-medium text-sm transition-colors relative z-10">
        View All →
      </button>
    </div>
  );
}
