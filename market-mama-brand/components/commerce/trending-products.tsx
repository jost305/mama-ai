"use client";

import { TrendingUp, ShoppingCart } from "lucide-react";

interface TrendingProduct {
  productName: string;
  category: string;
  trendLevel: string;
  averagePrice: string;
  demandLevel: string;
  seasonality: string;
}

interface TrendingProductsProps {
  trendingProducts: TrendingProduct[];
}

export function TrendingProducts({
  trendingProducts,
}: TrendingProductsProps) {
  const getTrendColor = (trendLevel: string) => {
    if (trendLevel === "Viral") return "text-red-600 bg-red-50 border-red-200";
    if (trendLevel === "Trending")
      return "text-orange-600 bg-orange-50 border-orange-200";
    if (trendLevel === "Stable")
      return "text-blue-600 bg-blue-50 border-blue-200";
    return "text-green-600 bg-green-50 border-green-200";
  };

  const getDemandColor = (demand: string) => {
    if (demand === "Very High") return "text-red-600";
    if (demand === "High") return "text-orange-600";
    return "text-blue-600";
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Trending Products</h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {trendingProducts.map((product, idx) => (
          <div
            key={idx}
            className="rounded border border-border/50 bg-background p-3 space-y-2 hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {product.productName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.category}
                </p>
              </div>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded border ${getTrendColor(product.trendLevel)}`}
              >
                {product.trendLevel}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Avg. Price</p>
                <p className="font-medium text-foreground">
                  {product.averagePrice}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Demand</p>
                <p className={`font-medium ${getDemandColor(product.demandLevel)}`}>
                  {product.demandLevel}
                </p>
              </div>
            </div>

            <div className="text-xs">
              <p className="text-muted-foreground">Peak Season</p>
              <p className="font-medium text-foreground">
                {product.seasonality}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded bg-secondary/20 p-3 flex items-center gap-2 text-sm">
        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Use these insights to identify market opportunities
        </p>
      </div>
    </div>
  );
}
