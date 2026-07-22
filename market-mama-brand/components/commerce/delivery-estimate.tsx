"use client";

import { Truck, Clock, DollarSign, AlertCircle } from "lucide-react";

interface DeliveryEstimateProps {
  from: string;
  to: string;
  estimatedDays: number;
  costUSD: number;
  carrier: string;
  method: string;
  notes: string;
}

export function DeliveryEstimate({
  from,
  to,
  estimatedDays,
  costUSD,
  carrier,
  method,
  notes,
}: DeliveryEstimateProps) {
  const getMethodBadgeColor = (method: string) => {
    if (method === "Same-day") return "bg-green-100 text-green-800";
    if (method === "Next-day") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">Delivery Estimate</h3>

      <div className="space-y-3">
        {/* Route */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Route</p>
            <p className="font-medium text-foreground">
              {from} → {to}
            </p>
          </div>
          <Truck className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Timeline and Cost Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded bg-background p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Estimated Time</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {estimatedDays}
            </p>
            <p className="text-xs text-muted-foreground">
              {estimatedDays === 1 ? "day" : "days"}
            </p>
          </div>

          <div className="rounded bg-background p-3">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Delivery Cost</p>
            </div>
            <p className="text-2xl font-bold text-foreground">
              ${costUSD.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">USD</p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm border-t border-border pt-3">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Carrier</p>
            <p className="font-medium text-foreground">{carrier}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Method</p>
            <span className={`text-xs font-medium px-2 py-1 rounded ${getMethodBadgeColor(method)}`}>
              {method}
            </span>
          </div>
        </div>

        {/* Notes */}
        {notes && (
          <div className="rounded bg-amber-50 border border-amber-200 p-3 flex gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">{notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
