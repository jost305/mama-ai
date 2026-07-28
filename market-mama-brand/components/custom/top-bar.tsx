"use client";

import { Search, Bell, MessageSquare, ChevronDown, Menu, LogOut } from "lucide-react";
import { useState } from "react";
import { usePrivyAuth, getUserDetails } from "./privy-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const { ready, authenticated, user, login, logout } = usePrivyAuth();
  const { displayName, initial } = getUserDetails(user);

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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-4 space-y-3 z-50">
                <h3 className="font-semibold mb-3 text-foreground">Notifications</h3>
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
                      <p className="text-sm text-foreground">{notif}</p>
                      <p className="text-xs text-muted-foreground">2 mins ago</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile / Auth Button */}
          {authenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg transition-colors border">
                  <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-xs font-bold text-white">
                    {initial}
                  </div>
                  <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown className="w-4 h-4 hidden sm:block text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50">
                <DropdownMenuItem className="p-2 cursor-pointer" onClick={() => logout()}>
                  <LogOut className="w-4 h-4 mr-2 text-red-500" />
                  <span className="text-red-600 text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <button
              onClick={() => login()}
              disabled={!ready}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {ready ? "Sign In / Register" : "Loading..."}
            </button>
          )}

          {/* Mobile Menu */}
          <button className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

