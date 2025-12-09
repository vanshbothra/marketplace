"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

interface WishlistButtonProps {
    listingId: string;
    className?: string;
    size?: "default" | "sm" | "lg" | "icon";
    variant?: "default" | "ghost" | "outline";
}

export function WishlistButton({ listingId, className = "", size = "icon", variant = "ghost" }: WishlistButtonProps) {
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkWishlistStatus = useCallback(async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/wishlist/me`, {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    // Handle both response formats
                    const items = data.data.data || data.data;
                    if (Array.isArray(items)) {
                        const inWishlist = items.some((item: any) => item.id === listingId);
                        setIsInWishlist(inWishlist);
                    }
                }
            }
        } catch (error) {
            console.error('Error checking wishlist status:', error);
        }
    }, [listingId]);

    useEffect(() => {
        // Check if item is in wishlist
        checkWishlistStatus();

        // Listen for wishlist updates from other components
        const handleWishlistUpdate = () => {
            checkWishlistStatus();
        };

        window.addEventListener('wishlistUpdated', handleWishlistUpdate);
        return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    }, [checkWishlistStatus]);

    const toggleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setLoading(true);

        try {
            if (isInWishlist) {
                // Remove from wishlist
                const response = await fetch(`${BACKEND_URL}/wishlist/${listingId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                });

                if (response.ok) {
                    setIsInWishlist(false);
                    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
                } else {
                    console.error('Failed to remove from wishlist:', response.status);
                }
            } else {
                // Add to wishlist
                const response = await fetch(`${BACKEND_URL}/wishlist/${listingId}`, {
                    method: 'POST',
                    credentials: 'include',
                });

                if (response.ok) {
                    setIsInWishlist(true);
                    window.dispatchEvent(new CustomEvent('wishlistUpdated'));
                } else {
                    console.error('Failed to add to wishlist:', response.status);
                }
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            onClick={toggleWishlist}
            disabled={loading}
            className={`rounded-full transition-all ${className}`}
            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={`h-5 w-5 transition-all ${isInWishlist
                    ? 'fill-red-500 text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                    }`}
            />
        </Button>
    );
}
