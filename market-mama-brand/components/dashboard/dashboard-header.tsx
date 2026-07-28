"use client";

import { usePrivyAuth, getUserDetails } from "@/components/custom/privy-provider";

export function DashboardHeader() {
  const { authenticated, user } = usePrivyAuth();
  const { displayName } = getUserDetails(user);

  const greetingName = authenticated && displayName ? displayName : "Trader";

  return (
    <div className="border-b bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Good day, {greetingName}! 👋
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Here&apos;s what&apos;s happening in the markets today.
            </p>
          </div>
          <div className="hidden md:block text-sm text-muted-foreground">
            📍 Kano, Nigeria
          </div>
        </div>
      </div>
    </div>
  );
}
