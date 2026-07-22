import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { SidebarDrawer } from "@/components/custom/sidebar-drawer";
import { ThemeProvider } from "@/components/custom/theme-provider";
import { PrivyAuthProvider } from "@/components/custom/privy-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://marketmama.vercel.app"),
  title: "MarketMama - Know Prices. Shop Smart.",
  description: "Get real-time market prices, smart shopping recommendations, and vendor intelligence. Chat with MarketMama to make better buying decisions.",
  keywords: "market prices, agriculture, commodities, Nigeria, Africa, price alerts, farmers, traders, shopping",
  openGraph: {
    title: "MarketMama",
    description: "Know prices. Shop smart. AI-powered market intelligence for African traders.",
    url: "https://marketmama.vercel.app",
    type: "website",
    images: [
      {
        url: "https://marketmama.vercel.app/images/marketmama-logo.png",
        width: 1200,
        height: 630,
        alt: "MarketMama",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon-marketmama.png" />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PrivyAuthProvider>
            <Toaster position="top-center" />
            <div className="flex h-screen overflow-hidden">
              <SidebarDrawer />
              <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          </PrivyAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
