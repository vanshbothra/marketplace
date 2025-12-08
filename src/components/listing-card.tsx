"use client";

import { Badge } from "@/components/ui/badge";
import { WishlistButton } from "@/components/wishlist-button";
import Link from "next/link";
import { Star } from "lucide-react";
import Image from "next/image";

interface ListingCardProps {
    listing: {
        id: string;
        name: string;
        description: string;
        price: number | null;
        images: string[];
        vendor: {
            name: string;
        };
        reviews: { rating: number }[];
    };
}

export function ListingCard({ listing }: ListingCardProps) {
    const avgRating =
        listing.reviews && listing.reviews.length > 0
            ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
            : 0;

    return (
        <div className="group relative">
            <Link href={`/marketplace/${listing.id}`}>
                <div className="glass-card rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border-0">
                    <div className="aspect-4/3 bg-linear-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                        {listing.images[0] ? (
                            <Image
                                src={listing.images[0]}
                                alt={listing.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Image
                                src="/2.jpg"
                                alt="Placeholder"
                                fill
                                className="object-cover"
                            />
                        )}

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20" />

                        {/* Overlay Content */}
                        <div className="absolute inset-0 p-6 flex flex-col justify-between">
                            {/* Top Section - Badge and Heart */}
                            <div className="flex items-start justify-between">
                                {avgRating > 0 && (
                                    <div className="glass rounded-full px-3 py-1 flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-medium text-black dark:text-white">{avgRating.toFixed(1)}</span>
                                    </div>
                                )}
                                <div className="ml-auto" onClick={(e) => e.preventDefault()}>
                                    <WishlistButton
                                        listingId={listing.id}
                                        className="glass hover:bg-white/30"
                                    />
                                </div>
                            </div>

                            {/* Bottom Section - Title, Price, and Button */}
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-light text-white line-clamp-1">{listing.name}</h3>
                                    <p className="text-sm text-white/80 line-clamp-2">{listing.description}</p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        {listing.price !== null ? (
                                            <p className="text-3xl font-light text-white">₹{listing.price}</p>
                                        ) : (
                                            <p className="text-lg font-medium text-white/90">Contact for price</p>
                                        )}
                                        <p className="text-xs text-white/70 mt-1">by {listing.vendor.name}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
