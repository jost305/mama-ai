"use client";

import { createContext, ReactNode, useContext, useMemo } from "react";
import { PrivyProvider, useLogin, useLogout, usePrivy } from "@privy-io/react-auth";

type PrivyAuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  user: any;
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

function PrivyAuthInner({ children }: { children: ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();

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
    <PrivyProvider appId={appId}>
      <PrivyAuthInner>{children}</PrivyAuthInner>
    </PrivyProvider>
  );
}

export function usePrivyAuth() {
  return useContext(PrivyAuthContext);
}
