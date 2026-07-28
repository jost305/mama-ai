"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivyAuth } from "@/components/custom/privy-provider";

export default function Page() {
  const router = useRouter();
  const { ready, authenticated, login } = usePrivyAuth();

  useEffect(() => {
    if (authenticated) {
      router.push("/");
    } else if (ready) {
      login();
    }
  }, [ready, authenticated, login, router]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-6 p-8 border bg-card text-card-foreground shadow-lg text-center">
        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto text-2xl">
          🌾
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Sign Up for Market Mama</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Use Privy secure auth widget to create your account.
          </p>
        </div>
        <button
          onClick={() => login()}
          disabled={!ready}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-2"
        >
          {ready ? "Open Privy Auth Widget" : "Initializing Privy..."}
        </button>
      </div>
    </div>
  );
}

