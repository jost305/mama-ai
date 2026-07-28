"use client";

import { ThemeToggle } from "./theme-toggle";
import { usePrivyAuth, getUserDetails } from "./privy-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivyAuth();

  const { displayName, initial } = getUserDetails(user);

  return (
    <div className="bg-background border-b border-border w-full py-2 px-3 justify-between flex flex-row items-center z-10">
      <div className="flex flex-row gap-3 items-center" />

      {authenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="py-1.5 px-3 h-9 font-medium flex items-center gap-2" variant="secondary">
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                {initial}
              </div>
              <span className="max-w-[140px] truncate">{displayName}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>
              <ThemeToggle />
            </DropdownMenuItem>
            <DropdownMenuItem className="p-1 z-50">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full text-left px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          className="py-1.5 px-4 h-9 font-medium text-white bg-emerald-600 hover:bg-emerald-700"
          onClick={() => login()}
          disabled={!ready}
        >
          {ready ? "Login / Sign Up" : "Loading..."}
        </Button>
      )}
    </div>
  );
}

