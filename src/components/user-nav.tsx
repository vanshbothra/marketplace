"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { WishlistSheet } from "@/components/wishlist-sheet";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

interface User {
    id: string;
    name?: string;
    email?: string;
    imageUrl?: string;
}

export function UserNav() {
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Don't render on public auth routes
    const publicRoutes = ['/auth/signin', '/auth/error'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    useEffect(() => {
        if (isPublicRoute) {
            setLoading(false);
            return;
        }

        async function fetchUser() {
            try {
                const response = await fetch(`${BACKEND_URL}/auth/browser/me`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('UserNav - fetched user data:', data);

                    if (data.success && data.data && data.data.user) {
                        // Backend returns data.data.user
                        setUser(data.data.user);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user in UserNav:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();

        // Refresh user data every 5 minutes
        const interval = setInterval(fetchUser, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [isPublicRoute]);

    if (isPublicRoute) {
        return (
            <div className="flex items-center gap-2">
                <ThemeToggle />
            </div>
        );
    }

    const handleSignOut = async () => {
        // Clear cookies and redirect to backend logout
        document.cookie = 'user-id=; Max-Age=0; path=/';
        document.cookie = 'user-name=; Max-Age=0; path=/';
        document.cookie = 'user-email=; Max-Age=0; path=/';
        document.cookie = 'user-image=; Max-Age=0; path=/';

        // Redirect to backend logout endpoint
        window.location.href = `${BACKEND_URL}/auth/browser/logout`;
    };

    if (loading || !user) {
        return (
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <WishlistSheet />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarImage src={user.imageUrl || ""} alt={user.name || ""} />
                            <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email || ""}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                        Sign out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
