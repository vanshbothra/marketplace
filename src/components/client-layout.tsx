"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { UserNav } from "@/components/user-nav";
import { Store } from "lucide-react";
import Link from "next/link";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
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
            </AuthProvider>
        </ThemeProvider>
    );
}
