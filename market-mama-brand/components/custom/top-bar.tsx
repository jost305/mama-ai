"use client";

import { Search, Bell, MessageSquare, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";

export function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="bg-white border-b sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 gap-4">
        {/* Left - Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search product, market or location..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-muted hover:bg-muted/80 focus:bg-background focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language */}
          <button className="hidden sm:flex items-center gap-1 px-2 py-1 hover:bg-muted rounded-lg text-sm">
            🇬🇧 EN
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Messages */}
          <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
            <MessageSquare className="w-5 h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5 text-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-4 space-y-3">
                <h3 className="font-semibold mb-3">Notifications</h3>
                {[
                  "Tomato prices dropped 8%",
                  "New onion stock in Lagos",
                  "Price alert: Pepper trending up",
                ].map((notif, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-2 rounded hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">{notif}</p>
                      <p className="text-xs text-muted-foreground">2 mins ago</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <button className="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors">
            <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
              👩
            </div>
            <span className="hidden sm:block text-sm font-medium">Amina</span>
            <ChevronDown className="w-4 h-4 hidden sm:block" />
          </button>

          {/* Mobile Menu */}
          <button className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
