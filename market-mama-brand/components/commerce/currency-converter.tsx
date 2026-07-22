"use client";

import { ArrowRight } from "lucide-react";

interface CurrencyConverterProps {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: string;
  note: string;
}

export function CurrencyConverter({
  fromCurrency,
  toCurrency,
  rate,
  lastUpdated,
  note,
}: CurrencyConverterProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">Exchange Rate</h3>

      <div className="flex items-center justify-between rounded bg-background p-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">From</p>
          <p className="text-2xl font-bold text-foreground">1</p>
          <p className="text-sm font-medium text-muted-foreground">
            {fromCurrency}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Rate</p>
        </div>

        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">To</p>
          <p className="text-2xl font-bold text-foreground">
            {rate.toFixed(4)}
          </p>
          <p className="text-sm font-medium text-muted-foreground">
            {toCurrency}
          </p>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground">
          <strong>Last Updated:</strong> {lastUpdated}
        </p>
        {note && (
          <p className="text-xs text-muted-foreground italic">
            <strong>Note:</strong> {note}
          </p>
        )}
      </div>

      {/* Example calculation */}
      <div className="rounded bg-secondary/20 p-3 text-sm space-y-1">
        <p className="text-muted-foreground">Example Conversion:</p>
        <p className="font-medium text-foreground">
          100 {fromCurrency} = {(100 * rate).toFixed(2)} {toCurrency}
        </p>
      </div>
    </div>
  );
}
