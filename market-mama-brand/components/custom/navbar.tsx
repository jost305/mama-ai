"use client";

import { ThemeToggle } from "./theme-toggle";
import { usePrivyAuth } from "./privy-provider";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Navbar() {
  const { ready, authenticated, user, login, logout } = usePrivyAuth();

  const displayName = user?.email ? `${user.email}` : "Account";

  return (
    <div className="bg-background border-b border-border w-full py-2 px-3 justify-between flex flex-row items-center z-10">
      <div className="flex flex-row gap-3 items-center" />

      {authenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="py-1.5 px-2 h-fit font-normal" variant="secondary">
              {displayName}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <ThemeToggle />
            </DropdownMenuItem>
            <DropdownMenuItem className="p-1 z-50">
              <button
                type="button"
                onClick={() => logout()}
                className="w-full text-left px-1 py-0.5 text-red-500"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          className="py-1.5 px-2 h-fit font-normal text-white"
          onClick={() => login({ loginMethods: ["email"] })}
          disabled={!ready}
        >
          {ready ? "Login" : "Loading..."}
        </Button>
      )}
    </div>
  );
}
