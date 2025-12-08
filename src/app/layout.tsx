import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { UserNav } from "@/components/user-nav";
import { Store } from "lucide-react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ashoka Marketplace",
  description: "Buy, sell, and trade with fellow Ashokans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased overflow-x-hidden pt-18`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {/* Global Header */}
          <header className="border-b bg-white dark:bg-black border-black/20 dark:border-white/20 w-screen fixed top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3">
                  <div className="p-2 rounded-2xl bg-black dark:bg-white">
                    <Store className="h-5 w-5 text-white dark:text-black" />
                  </div>
                  <h1 className="text-xl font-light tracking-wide text-foreground">
                    Ashoka Marketplace
                  </h1>
                </Link>
              </div>
              <UserNav />
            </div>
          </header>

          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
