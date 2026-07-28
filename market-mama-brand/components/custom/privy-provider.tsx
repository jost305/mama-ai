"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";

export type PrivyUser = any;

type PrivyAuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  user: PrivyUser;
  login: (options?: any) => void;
  logout: () => void;
};

const PrivyAuthContext = createContext<PrivyAuthContextValue>({
  ready: true,
  authenticated: false,
  user: null,
  login: () => undefined,
  logout: () => undefined,
});

export function getUserDetails(user: PrivyUser): { displayName: string; email: string; initial: string } {
  if (!user) {
    return { displayName: "Guest", email: "", initial: "G" };
  }
  const email =
    user.email?.address ||
    user.google?.email ||
    user.apple?.email ||
    user.github?.email ||
    "";
  const name =
    user.google?.name ||
    user.github?.name ||
    (email ? email.split("@")[0] : null) ||
    (user.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : "Account");

  const initial = (name.charAt(0) || "U").toUpperCase();
  return { displayName: name, email, initial };
}

function PrivyAuthInner({ children }: { children: ReactNode }) {
  const { ready, authenticated, user, login, logout } = usePrivy();

  const value = useMemo(
    () => ({ ready, authenticated, user, login, logout }),
    [ready, authenticated, user, login, logout],
  );

  return (
    <PrivyAuthContext.Provider value={value}>{children}</PrivyAuthContext.Provider>
  );
}

export function PrivyAuthProvider({ children }: { children: ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID;

  if (!appId) {
    return (
      <PrivyAuthContext.Provider
        value={{ ready: true, authenticated: false, user: null, login: () => undefined, logout: () => undefined }}
      >
        {children}
      </PrivyAuthContext.Provider>
    );
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          accentColor: "#059669",
          theme: "light",
          showWalletLoginFirst: false,
          walletChainType: "ethereum-and-solana",
          walletList: [
            "detected_ethereum_wallets",
            "detected_solana_wallets",
            "metamask",
            "phantom",
            "coinbase_wallet",
            "base_account",
            "rainbow",
            "solflare",
            "backpack",
            "okx_wallet",
            "wallet_connect",
          ],
        },
        loginMethods: [
          "email",
          "wallet",
          "google",
          "apple",
          "github",
          "discord",
        ],
        embeddedWallets: {
          showWalletUIs: true,
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      <PrivyAuthInner>{children}</PrivyAuthInner>
    </PrivyProvider>
  );
}

export function usePrivyAuth() {
  return useContext(PrivyAuthContext);
}

