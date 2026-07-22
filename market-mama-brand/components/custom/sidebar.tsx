"use client";

import {
  Home,
  Map,
  FileText,
  Heart,
  TrendingUp,
  Settings,
  LogOut,
  AlertCircle,
  ShoppingBag,
  BookOpen,
  Gift,
  HelpCircle,
  Search,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const mainMenuItems = [
  { icon: Home, label: "Chat", href: "/" },
  { icon: TrendingUp, label: "Explore", href: "/explore" },
  { icon: Map, label: "Live Map", href: "/map" },
  { icon: AlertCircle, label: "Alerts", href: "/alerts" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Heart, label: "Watchlist", href: "/watchlist" },
];

const exploreMenuItems = [
  { icon: BookOpen, label: "Docs", href: "/docs" },
  { icon: Users, label: "About", href: "/about" },
  { icon: ShoppingBag, label: "Marketplace", href: "/marketplace" },
  { icon: Gift, label: "Rewards", href: "/rewards" },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden md:flex w-64 flex-col h-full bg-white border-r border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 h-[64px] border-b border-gray-100 flex-shrink-0">
        <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-lg leading-none">🌾</span>
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-gray-900 leading-tight">Market Mama</p>
          <p className="text-[11px] text-gray-400">Know prices</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 h-9 px-3 bg-gray-50 rounded-lg border border-gray-100">
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-400">Search anything...</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 overflow-y-auto space-y-0.5">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-2 pb-1">
          Main
        </p>
        {mainMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 h-10 rounded-lg transition-colors group",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", active ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700")} />
              <span className={cn("text-sm font-medium flex-1 truncate", active && "text-emerald-700")}>{item.label}</span>
              {active && <span className="w-1.5 h-5 bg-emerald-500 rounded-full flex-shrink-0" />}
            </Link>
          );
        })}

        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-4 pb-1">
          Explore
        </p>
        {exploreMenuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-2 h-10 rounded-lg transition-colors group",
                active
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className={cn("w-[18px] h-[18px] flex-shrink-0", active ? "text-emerald-600" : "text-gray-500 group-hover:text-gray-700")} />
              <span className={cn("text-sm font-medium flex-1 truncate", active && "text-emerald-700")}>{item.label}</span>
              {active && <span className="w-1.5 h-5 bg-emerald-500 rounded-full flex-shrink-0" />}
            </Link>
          );
        })}

        {/* Upgrade card */}
        <div className="mt-4 mb-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="19" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="19" fill="none"
                  stroke="#10b981" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 19}`}
                  strokeDashoffset={`${2 * Math.PI * 19 * 0.4}`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">60%</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-tight">Used capacity</p>
              <p className="text-[11px] text-gray-500 leading-snug mt-0.5">You are already using 60% of your capacity.</p>
            </div>
          </div>
          <button className="w-full h-8 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors">
            Upgrade plan
          </button>
        </div>
      </nav>

      {/* Bottom actions */}
      <div className="px-3 pb-2 flex-shrink-0 space-y-0.5">
        <Link href="/settings" className="flex items-center gap-3 px-2 h-10 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
          <Settings className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
          <span className="text-sm font-medium">Settings</span>
        </Link>
        <Link href="/help" className="flex items-center gap-3 px-2 h-10 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors group">
          <HelpCircle className="w-[18px] h-[18px] text-gray-500 group-hover:text-gray-700 flex-shrink-0" />
          <span className="text-sm font-medium">Help</span>
        </Link>
      </div>

      {/* User profile */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3 px-2 h-12">
          <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-sm flex-shrink-0">👩</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate leading-tight">Amina Yusuf</p>
            <p className="text-[11px] text-gray-400 truncate">amina@marketmama.ai</p>
          </div>
          <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0" title="Logout">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </aside>
  );
}
