"use client";

import { Building2, Truck, Phone, Briefcase } from "lucide-react";

interface Supplier {
  supplierName: string;
  location: string;
  productRange: string[];
  minimumOrder: string;
  pricePerUnit: string;
  leadTime: string;
  contact: string;
}

interface SuppliersDirectoryProps {
  suppliers: Supplier[];
}

export function SuppliersDirectory({ suppliers }: SuppliersDirectoryProps) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">Wholesale Suppliers</h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {suppliers.map((supplier, idx) => (
          <div
            key={idx}
            className="rounded border border-border/50 bg-background p-3 space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-foreground">
                  {supplier.supplierName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {supplier.location}
                </p>
              </div>
            </div>

            {/* Products */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Product Range
              </p>
              <div className="flex flex-wrap gap-1">
                {supplier.productRange.map((product, pidx) => (
                  <span
                    key={pidx}
                    className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded bg-background/50 p-2">
                <p className="text-xs text-muted-foreground">Min. Order</p>
                <p className="font-medium text-foreground text-sm">
                  {supplier.minimumOrder}
                </p>
              </div>
              <div className="rounded bg-background/50 p-2">
                <p className="text-xs text-muted-foreground">Price/Unit</p>
                <p className="font-medium text-foreground text-sm">
                  {supplier.pricePerUnit}
                </p>
              </div>
            </div>

            {/* Lead Time and Contact */}
            <div className="space-y-1 border-t border-border pt-2">
              <div className="flex items-center gap-2 text-xs">
                <Truck className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">
                  <strong>Lead Time:</strong> {supplier.leadTime}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground font-mono">
                  {supplier.contact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded bg-blue-50 border border-blue-200 p-3 flex items-center gap-2 text-sm">
        <Briefcase className="h-4 w-4 text-blue-600" />
        <p className="text-blue-800">
          Connect directly with suppliers for wholesale pricing
        </p>
      </div>
    </div>
  );
}
