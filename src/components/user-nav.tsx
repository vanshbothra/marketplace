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
import { useEffect, useState } from "react";

interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
}

export function UserNav() {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Read user data from cookies
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) {
                const cookieValue = parts.pop()?.split(';').shift();
                return cookieValue ? decodeURIComponent(cookieValue) : undefined;
            }
            return undefined;
        };

        const userId = getCookie('user-id');
        const userName = getCookie('user-name');
        const userEmail = getCookie('user-email');
        const userImage = getCookie('user-image');

        if (userId) {
            setUser({
                id: userId,
                name: userName,
                email: userEmail,
                image: userImage,
            });
        }
    }, []);

    const handleSignOut = async () => {
        // Clear cookies and redirect to backend logout
        document.cookie = 'user-id=; Max-Age=0; path=/';
        document.cookie = 'user-name=; Max-Age=0; path=/';
        document.cookie = 'user-email=; Max-Age=0; path=/';
        document.cookie = 'user-image=; Max-Age=0; path=/';

        // Redirect to backend logout endpoint
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';
        window.location.href = `${backendUrl}/auth/browser/logout`;
    };

    if (!user) {
        return null; // or a loading skeleton
    }

    return (
        <div className="flex items-center gap-2">
            <ThemeToggle />
            <WishlistSheet />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar>
                            <AvatarImage src={user.image || ""} alt={user.name || ""} />
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
