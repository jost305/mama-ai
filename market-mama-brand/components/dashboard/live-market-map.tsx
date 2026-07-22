"use client";

import { MapPin, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

export function LiveMarketMap() {
  const [zoom, setZoom] = useState(12);

  const markets = [
    { name: "Kano, Dawanau", lat: 51.5, lng: 12.2, price: "₦13,800", change: -3, status: "high" },
    { name: "Kaduna, Sabon Gari", lat: 51.6, lng: 12.3, price: "₦13,700", change: 4, status: "medium" },
    { name: "Lagos (Oyingbo)", lat: 51.4, lng: 12.1, price: "₦14,500", change: 3, status: "high" },
    { name: "Abuja", lat: 51.55, lng: 12.25, price: "₦13,400", change: 1, status: "medium" },
  ];

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Live Market Map</h3>
        <div className="text-xs text-muted-foreground">
          Real-time prices from 1,248 markets
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="relative w-full h-64 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg overflow-hidden mb-4 border">
        <svg viewBox="0 0 600 400" className="w-full h-full">
          {/* Simple Nigeria map outline */}
          <path
            d="M100 100 L150 80 L200 100 L220 150 L200 200 L150 220 L100 200 Z"
            fill="rgba(34, 197, 94, 0.1)"
            stroke="rgba(34, 197, 94, 0.3)"
            strokeWidth="2"
          />

          {/* Market points */}
          {markets.map((market, idx) => (
            <g key={idx}>
              <circle
                cx={market.lat * 3}
                cy={market.lng * 3}
                r="8"
                fill={
                  market.status === "high"
                    ? "#16a34a"
                    : market.status === "medium"
                      ? "#f59e0b"
                      : "#ef4444"
                }
                opacity="0.8"
              />
              <circle
                cx={market.lat * 3}
                cy={market.lng * 3}
                r="8"
                fill="none"
                stroke={
                  market.status === "high"
                    ? "#16a34a"
                    : market.status === "medium"
                      ? "#f59e0b"
                      : "#ef4444"
                }
                strokeWidth="2"
                opacity="0.3"
              >
                <animate attributeName="r" from="8" to="16" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>

        {/* Zoom Controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-white rounded-lg shadow-md">
          <button
            onClick={() => setZoom(Math.min(zoom + 2, 20))}
            className="p-2 hover:bg-muted rounded-t"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 2, 8))}
            className="p-2 hover:bg-muted rounded-b"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Market List */}
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {markets.map((market) => (
          <div
            key={market.name}
            className="flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors text-sm"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  market.status === "high"
                    ? "bg-green-500"
                    : market.status === "medium"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <span className="truncate text-muted-foreground">{market.name}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="font-semibold">{market.price}</span>
              <span className={market.change > 0 ? "text-red-600" : "text-green-600"}>
                {market.change > 0 ? "↑" : "↓"} {Math.abs(market.change)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* View Full Map Button */}
      <button className="w-full mt-4 py-2 px-3 border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
        View full map →
      </button>
    </div>
  );
}
