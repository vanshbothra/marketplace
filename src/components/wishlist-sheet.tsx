"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Star, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface WishlistItem {
    id: string;
    name: string;
    price: number | null;
    images: string[];
    vendor: {
        name: string;
    };
    reviews?: { rating: number }[];
}

export function WishlistSheet() {
    const [wishlist, setWishlist] = React.useState<WishlistItem[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isOpen, setIsOpen] = React.useState(false);

    const fetchWishlist = React.useCallback(async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/wishlist/me`, {
                credentials: 'include',
            });

            if (!response.ok) {
                console.error('Failed to fetch wishlist');
                setWishlist([]);
                return;
            }

            const data = await response.json();
            if (data.success && data.data && data.data.data) {
                // Backend returns: { success, data: { data: [...items], meta: {...} } }
                setWishlist(data.data.data || []);
            } else {
                setWishlist([]);
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (isOpen) {
            fetchWishlist();
        }
    }, [isOpen, fetchWishlist]);

    const removeFromWishlist = async (id: string) => {
        try {
            const response = await fetch(`${BACKEND_URL}/wishlist/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setWishlist(wishlist.filter(item => item.id !== id));
                // Dispatch custom event to notify other components
                window.dispatchEvent(new CustomEvent('wishlistUpdated'));
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
        }
    };

    const avgRating = (reviews?: { rating: number }[]) => {
        if (!reviews || reviews.length === 0) return 0;
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="rounded-2xl glass-light relative">
                    <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    {wishlist.length > 0 && (
                        <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 rounded-full text-xs">
                            {wishlist.length}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg bg-gradient-soft border-l border-white/20 overflow-y-auto">
                <SheetHeader className="mb-6">
                    <SheetTitle className="text-2xl font-light text-foreground">My Wishlist</SheetTitle>
                    <SheetDescription className="text-muted-foreground">
                        {loading ? 'Loading...' : `${wishlist.length} ${wishlist.length === 1 ? "item" : "items"} saved`}
                    </SheetDescription>
                </SheetHeader>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading wishlist...</p>
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="glass-card rounded-full p-6 mb-4">
                            <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-light mb-2 text-foreground">Your wishlist is empty</h3>
                        <p className="text-muted-foreground mb-6">Start adding items you love!</p>
                        <Button asChild className="rounded-2xl bg-black hover:bg-gray-900 text-white" onClick={() => setIsOpen(false)}>
                            <Link href="/marketplace">Browse Marketplace</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {wishlist.map((item) => (
                            <div key={item.id} className="glass-card rounded-2xl p-4 shadow-soft ml-4 mr-4 border-0 group">
                                <div className="flex gap-4">
                                    {/* Image */}
                                    <Link href={`/marketplace/${item.id}`} className="shrink-0" onClick={() => setIsOpen(false)}>
                                        <div className="w-20 h-20 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                                            {item.images && item.images[0] ? (
                                                <Image
                                                    src={item.images[0]}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/marketplace/${item.id}`} onClick={() => setIsOpen(false)}>
                                            <h4 className="font-medium text-foreground line-clamp-1 mb-1 group-hover:underline">
                                                {item.name}
                                            </h4>
                                        </Link>
                                        <p className="text-sm text-muted-foreground mb-2">
                                            by {item.vendor.name}
                                        </p>
                                        <div className="flex items-center gap-3">
                                            {item.price !== null ? (
                                                <p className="text-lg font-light text-foreground">₹{item.price}</p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Contact for price</p>
                                            )}
                                            {avgRating(item.reviews) > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-xs text-foreground">{avgRating(item.reviews).toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeFromWishlist(item.id)}
                                        className="shrink-0 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
