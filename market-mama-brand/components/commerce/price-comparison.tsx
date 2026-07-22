"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

interface PriceItem {
  market: string;
  productName: string;
  priceLocal: string;
  priceUSD: number;
  availability: string;
  vendor: string;
  quality: string;
}

interface PriceComparisonProps {
  priceComparison: PriceItem[];
}

export function PriceComparison({ priceComparison }: PriceComparisonProps) {
  if (!priceComparison || priceComparison.length === 0) {
    return <div className="text-muted-foreground">No price data available</div>;
  }

  const sortedPrices = [...priceComparison].sort(
    (a, b) => a.priceUSD - b.priceUSD,
  );
  const minPrice = sortedPrices[0]?.priceUSD || 0;
  const maxPrice = sortedPrices[sortedPrices.length - 1]?.priceUSD || 0;

  const getAvailabilityColor = (availability: string) => {
    if (availability === "In Stock") return "text-green-600";
    if (availability === "Limited") return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Price Comparison</h3>
        <div className="text-xs text-muted-foreground">
          ${minPrice.toFixed(2)} - ${maxPrice.toFixed(2)}
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {sortedPrices.map((item, idx) => {
          const percentDiff =
            maxPrice > 0 ? ((item.priceUSD - minPrice) / minPrice) * 100 : 0;
          const isCheapest = item.priceUSD === minPrice;

          return (
            <div
              key={idx}
              className={`rounded border p-3 space-y-2 ${
                isCheapest
                  ? "border-green-200 bg-green-50"
                  : "border-border/50 bg-background"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{item.market}</p>
                  <p className="text-sm text-muted-foreground">{item.vendor}</p>
                </div>
                <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded">
                  {item.quality}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Price</p>
                  <p className="font-semibold text-foreground">
                    {item.priceLocal}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    (${item.priceUSD.toFixed(2)})
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Status</p>
                  <p
                    className={`font-medium text-sm ${getAvailabilityColor(item.availability)}`}
                  >
                    {item.availability}
                  </p>
                  {percentDiff > 0 && (
                    <div className="flex items-center gap-1 text-red-600 text-xs mt-1">
                      <TrendingUp className="h-3 w-3" />
                      +{percentDiff.toFixed(0)}%
                    </div>
                  )}
                  {isCheapest && (
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-1">
                      <TrendingDown className="h-3 w-3" />
                      Best price
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
