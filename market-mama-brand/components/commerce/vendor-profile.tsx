"use client";

import { MapPin, Phone, Star, Calendar, Briefcase } from "lucide-react";

interface VendorProfileProps {
  vendorName: string;
  businessType: string;
  location: string;
  yearsInBusiness: number;
  specialties: string[];
  rating: number;
  tradingDays: string[];
  paymentMethods: string[];
  contact: string;
}

export function VendorProfile(props: VendorProfileProps) {
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return "text-green-600";
    if (rating >= 3.5) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {props.vendorName}
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className={`h-4 w-4 fill-current ${getRatingColor(props.rating)}`} />
            <span className={`font-medium ${getRatingColor(props.rating)}`}>
              {props.rating.toFixed(1)}/5.0
            </span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{props.yearsInBusiness} years</span>
          </div>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            <strong>Type:</strong> {props.businessType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{props.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{props.contact}</span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Specialties</p>
        <div className="flex flex-wrap gap-2">
          {props.specialties.map((specialty, idx) => (
            <span
              key={idx}
              className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs mb-1">Operating Days</p>
          <div className="space-y-1">
            {props.tradingDays.map((day, idx) => (
              <p key={idx} className="text-foreground">
                {day}
              </p>
            ))}
          </div>
        </div>
        <div>
          <p className="text-muted-foreground text-xs mb-1">Payments Accepted</p>
          <div className="space-y-1">
            {props.paymentMethods.map((method, idx) => (
              <p key={idx} className="text-foreground text-xs">
                {method}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
