import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Store, Search, ShoppingBag, GraduationCap, Star, X } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import Image from "next/image";

export default async function MarketplacePage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; type?: string; sort?: string; tags?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;

    // TODO: Fetch approved listings from backend API
    // Dummy data for now - added more listings with different tags and prices
    const allListings = [
        {
            id: "1",
            name: "Sample Product",
            tags: [
                { id: "1", name: "electronics" },
                { id: "2", name: "new" },
            ],
            description: "This is a sample product. Replace with backend API call.",
            type: "PRODUCT" as const,
            inventoryType: "STOCK" as const,
            availableQty: 10,
            price: 100,
            variants: ["S", "M", "L"],
            images: [],
            isAvailable: true,
            vendor: {
                id: "1",
                name: "Sample Vendor",
                logo: "/placeholder-logo.png",
            },
            reviews: [
                { rating: 5, comments: ["Great product!"] },
                { rating: 4, comments: ["Good quality"] },
            ],
            createdAt: new Date(Date.now() - 86400000),
        },
        {
            id: "2",
            name: "Sample Service",
            tags: [
                { id: "3", name: "tutoring" },
                { id: "4", name: "academic" },
            ],
            description: "This is a sample service. Replace with backend API call.",
            type: "SERVICE" as const,
            inventoryType: "ON_DEMAND" as const,
            price: 50,
            variants: [],
            images: [],
            isAvailable: true,
            vendor: {
                id: "2",
                name: "Sample Vendor 2",
                logo: "/placeholder-logo.png",
            },
            reviews: [{ rating: 5, comments: ["Excellent!"] }],
            createdAt: new Date(Date.now() - 172800000),
        },
        {
            id: "3",
            name: "Premium Laptop",
            tags: [
                { id: "1", name: "electronics" },
                { id: "5", name: "premium" },
            ],
            description: "High-end laptop for students.",
            type: "PRODUCT" as const,
            inventoryType: "STOCK" as const,
            availableQty: 5,
            price: 500,
            variants: [],
            images: [],
            isAvailable: true,
            vendor: {
                id: "1",
                name: "Sample Vendor",
                logo: "/placeholder-logo.png",
            },
            reviews: [
                { rating: 5, comments: ["Amazing!"] },
                { rating: 5, comments: ["Best purchase!"] },
                { rating: 4, comments: ["Good"] },
            ],
            createdAt: new Date(Date.now() - 259200000),
        },
    ];

    // Get all unique tags
    const allTags = Array.from(
        new Set(allListings.flatMap(l => l.tags.map(t => JSON.stringify(t))))
    ).map(t => JSON.parse(t));

    // Parse selected tags from URL
    const selectedTags = params.tags ? params.tags.split(",") : [];

    // Filter listings
    let listings = allListings.filter((listing) => {
        // Search filter
        if (params.search && !listing.name.toLowerCase().includes(params.search.toLowerCase())) {
            return false;
        }
        // Type filter
        if (params.type && listing.type !== params.type) {
            return false;
        }
        // Tag filter
        if (selectedTags.length > 0) {
            const listingTagNames = listing.tags.map(t => t.name);
            if (!selectedTags.some(tag => listingTagNames.includes(tag))) {
                return false;
            }
        }
        return true;
    });

    // Sort listings
    const sortBy = params.sort || "latest";
    listings = [...listings].sort((a, b) => {
        switch (sortBy) {
            case "price-low":
                return (a.price || 0) - (b.price || 0);
            case "price-high":
                return (b.price || 0) - (a.price || 0);
            case "rating":
                const avgA = a.reviews.length > 0 ? a.reviews.reduce((sum, r) => sum + r.rating, 0) / a.reviews.length : 0;
                const avgB = b.reviews.length > 0 ? b.reviews.reduce((sum, r) => sum + r.rating, 0) / b.reviews.length : 0;
                return avgB - avgA;
            case "latest":
            default:
                return b.createdAt.getTime() - a.createdAt.getTime();
        }
    });

    return (
        <div className="min-h-screen bg-gradient-soft">
            {/* Header */}
            <header className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-black">
                                <Store className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-xl font-light tracking-wide text-foreground dark:text-foreground">
                                Ashoka Marketplace
                            </h1>
                        </Link>
                    </div>
                    <UserNav />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="mb-12">
                    <h2 className="text-4xl font-light mb-8 text-foreground dark:text-foreground">Discover</h2>

                    {/* Search and Filters */}
                    <div className="flex flex-col gap-6 mb-8">
                        <form action="/marketplace" method="get" className="glass-card rounded-3xl p-2 shadow-soft">
                            <div className="flex items-center gap-3 px-4">
                                <Search className="h-5 w-5 text-muted-foreground/60" />
                                <Input
                                    name="search"
                                    placeholder="Search listings..."
                                    className="border-0 bg-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                                    defaultValue={params.search}
                                />
                            </div>
                        </form>

                        {/* Sort and Tag Filters Row */}
                        <div className="flex flex-wrap items-center gap-4">
                            {/* Sort Dropdown */}
                            <form action="/marketplace" method="get">
                                {params.search && <input type="hidden" name="search" value={params.search} />}
                                {params.type && <input type="hidden" name="type" value={params.type} />}
                                {params.tags && <input type="hidden" name="tags" value={params.tags} />}
                                <Select name="sort" defaultValue={sortBy}>
                                    <SelectTrigger className="w-56 rounded-2xl glass-light border-0">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="latest">Latest First</SelectItem>
                                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                                        <SelectItem value="rating">Rating: High to Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </form>

                            {/* Tag Filter Chips */}
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm text-muted-foreground">Tags:</span>
                                {allTags.map((tag) => {
                                    const isSelected = selectedTags.includes(tag.name);
                                    const newTags = isSelected
                                        ? selectedTags.filter(t => t !== tag.name)
                                        : [...selectedTags, tag.name];
                                    const newParams = { ...params } as Record<string, string>;
                                    if (newTags.length > 0) {
                                        newParams.tags = newTags.join(",");
                                    } else {
                                        delete newParams.tags;
                                    }
                                    return (
                                        <Link key={tag.id} href={`/marketplace?${new URLSearchParams(newParams).toString()}`}>
                                            <Badge
                                                variant={isSelected ? "default" : "outline"}
                                                className="rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                                            >
                                                {tag.name}
                                                {isSelected && <X className="ml-1 h-3 w-3" />}
                                            </Badge>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Category Filters */}
                        <div className="flex gap-3 flex-wrap">
                            <Button asChild variant={!params.type ? "default" : "ghost"} size="lg" className={`rounded-2xl ${!params.type ? "" : "glass-light"}`}>
                                <Link href="/marketplace">All</Link>
                            </Button>
                            <Button asChild variant={params.type === "PRODUCT" ? "default" : "ghost"} size="lg" className={`rounded-2xl ${params.type === "PRODUCT" ? "" : "glass-light"}`}>
                                <Link href="/marketplace?type=PRODUCT">
                                    <ShoppingBag className="mr-2 h-4 w-4" />
                                    Products
                                </Link>
                            </Button>
                            <Button asChild variant={params.type === "SERVICE" ? "default" : "ghost"} size="lg" className={`rounded-2xl ${params.type === "SERVICE" ? "" : "glass-light"}`}>
                                <Link href="/marketplace?type=SERVICE">
                                    <GraduationCap className="mr-2 h-4 w-4" />
                                    Services
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Listings Grid */}
                {listings.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center shadow-soft">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4 mx-auto" />
                        <h3 className="text-2xl font-light mb-2 text-foreground dark:text-foreground">No listings found</h3>
                        <p className="text-muted-foreground/80">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                        {listings.map((listing) => {
                            const avgRating =
                                listing.reviews.length > 0
                                    ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
                                    : 0;

                            return (
                                <Link href={`/marketplace/${listing.id}`} key={listing.id} className="group">
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
                                                    <button className="ml-auto p-2 rounded-full glass hover:bg-white/30 transition-colors">
                                                        <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
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

                                                        <button className="p-4 rounded-full bg-white text-black hover:bg-white/90 group-hover:scale-110 transition-transform duration-300">
                                                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
