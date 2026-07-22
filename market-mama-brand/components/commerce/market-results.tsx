"use client";

import { MapPin, Phone, Clock } from "lucide-react";

interface Market {
  marketName: string;
  city: string;
  country: string;
  specialization: string;
  operatingHours: string;
  contactInfo: string;
}

interface MarketResultsProps {
  markets: Market[];
}

export function MarketResults({ markets }: MarketResultsProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">Markets Found</h3>
      <div className="space-y-2">
        {markets.map((market, idx) => (
          <div
            key={idx}
            className="rounded border border-border/50 bg-background p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-foreground">{market.marketName}</p>
                <p className="text-sm text-muted-foreground">
                  {market.specialization}
                </p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {market.city}, {market.country}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{market.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{market.contactInfo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
