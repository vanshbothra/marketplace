import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Store, ArrowLeft, Star, Calendar, Mail, Phone } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ListingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    // TODO: Fetch listing details from backend API
    // Dummy data for now
    const listing = {
        id: id,
        name: "Sample Product",
        tags: [
            { id: "1", name: "electronics" },
            { id: "2", name: "new" },
            { id: "3", name: "trending" },
        ],
        description: "This is a sample product description. Replace with backend API call. This product is in excellent condition and perfect for students.",
        type: "PRODUCT" as const,
        inventoryType: "STOCK" as const,
        availableQty: 10,
        price: 100,
        variants: ["S", "M", "L", "XL"],
        images: [],
        isAvailable: true,
        vendor: {
            id: "1",
            name: "Sample Vendor",
            logo: "/3.png",
            contactEmail: "vendor@ashoka.edu.in",
            contactPhone: "+1234567890",
            owners: [
                { id: "1", name: "Sample Owner", email: "owner@ashoka.edu.in" },
            ],
            members: [
                { id: "2", name: "Sample Member", email: "member@ashoka.edu.in" },
            ],
        },
        reviews: [
            {
                id: "1",
                rating: 5,
                comments: ["Great product!", "Highly recommend"],
                createdAt: new Date(),
                user: { id: "u1", name: "John Doe", email: "john@ashoka.edu.in", imageUrl: "https://via.placeholder.com/150" },
            },
            {
                id: "2",
                rating: 4,
                comments: ["Good quality"],
                createdAt: new Date(Date.now() - 86400000),
                user: { id: "u2", name: "Jane Smith", email: "jane@ashoka.edu.in", imageUrl: "https://via.placeholder.com/150" },
            },
        ],
    };

    if (!listing) {
        notFound();
    }

    const avgRating =
        listing.reviews.length > 0
            ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
            : 0;

    return (
        <div className="min-h-screen bg-gradient-soft">
            {/* Header */}
            <header className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-black">
                                <Store className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-xl font-light tracking-wide text-foreground">
                                Ashoka Marketplace
                            </h1>
                        </Link>
                    </div>
                    <UserNav user={session!.user} />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-x-hidden">
                <Button asChild variant="ghost" className="mb-6 sm:mb-8 rounded-2xl">
                    <Link href="/marketplace">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                    {/* Main Content - Order 1 on mobile, 1 on desktop */}
                    <div className="lg:col-span-2 space-y-6 sm:space-y-8 order-1">
                        {/* Listing Details */}
                        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft border-0">
                            <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
                                <div className="flex-1 w-full">
                                    <div className="flex items-center gap-4 mb-2 flex-wrap">
                                        <h2 className="text-3xl sm:text-4xl font-light text-foreground">{listing.name}</h2>
                                        {/* Edit Icon - Only show for owners/members */}
                                        {/* TODO: Replace hardcoded check with actual JWT user check */}
                                        {(listing.vendor.owners.some(o => o.id === "1") || listing.vendor.members.some(m => m.id === "1")) && (
                                            <Link href={`/listings/${listing.id}/edit`}>
                                                <Button variant="ghost" size="icon" className="rounded-full">
                                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {listing.tags.map((tag) => (
                                            <Badge key={tag.id} variant="secondary" className="rounded-full">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                {listing.price !== null && (
                                    <div className="text-left sm:text-right">
                                        <p className="text-4xl font-light text-foreground">₹{listing.price}</p>
                                        <p className="text-sm text-muted-foreground mb-2">per unit</p>
                                        {/* Average Rating - Clickable */}
                                        {avgRating > 0 && (
                                            <a href="#reviews" className="flex items-center gap-2 justify-start sm:justify-end hover:opacity-80 transition-opacity cursor-pointer">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-md font-light text-foreground">{avgRating.toFixed(1)}</span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">
                                                    ({listing.reviews.length} {listing.reviews.length === 1 ? "review" : "reviews"})
                                                </span>
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="aspect-video bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl mb-6 flex items-center justify-center overflow-hidden relative">
                                {listing.images[0] ? (
                                    <Image
                                        src={listing.images[0]}
                                        alt={listing.name}
                                        fill
                                        className="object-cover rounded-2xl"
                                    />
                                ) : (
                                    <p className="text-muted-foreground">No image available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Order 2 on mobile, 2 on desktop */}
                    <div className="lg:col-span-1 space-y-6 sm:space-y-8 order-2">
                        {/* Description */}
                        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft border-0">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Description</h3>
                            <p className="text-muted-foreground leading-relaxed wrap-break-word">{listing.description}</p>
                        </div>

                        {/* Variants Section */}
                        {listing.variants && listing.variants.length > 0 && (
                            <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft border-0">
                                <h3 className="text-xl font-semibold mb-4 text-foreground">Available Variants</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {listing.variants.map((variant, idx) => (
                                        <Badge key={idx} variant="outline" className="rounded-full px-4 py-2">
                                            {variant}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Availability */}
                        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft border-0">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Availability</h3>
                            {listing.isAvailable ? (
                                <p className="font-medium text-green-600">
                                    {listing.availableQty > 0
                                        ? `${listing.availableQty} in stock`
                                        : "Out of stock"}
                                </p>
                            ) : (
                                <p className="font-medium text-red-600">Not available</p>
                            )}
                        </div>

                        {/* Seller Information */}
                        <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft border-0">
                            <h3 className="text-xl font-semibold mb-4 text-foreground">Seller Information</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <Avatar className="h-12 w-12 shrink-0">
                                    <AvatarImage src={listing.vendor.logo || ""} />
                                    <AvatarFallback>{listing.vendor.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <Link href={`/vendor/${listing.vendor.id}`} className="font-semibold text-foreground hover:underline block truncate">
                                        {listing.vendor.name}
                                    </Link>
                                    <p className="text-sm text-muted-foreground">
                                        {listing.vendor.members.length} {listing.vendor.members.length === 1 ? "member" : "members"}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <Mail className="h-4 w-4 shrink-0 mt-0.5" />
                                    <span className="break-all">{listing.vendor.contactEmail}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 shrink-0" />
                                    <span className="break-all">{listing.vendor.contactPhone}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Reviews Section - Order 3 on mobile (last), spans full width on desktop */}
                    {listing.reviews.length > 0 && (
                        <div id="reviews" className="lg:col-span-3 order-3">
                            <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft border-0 scroll-mt-24">
                                <h2 className="text-2xl font-semibold mb-6 text-foreground">Reviews</h2>
                                <div className="space-y-6">
                                    {listing.reviews.map((review) => (
                                        <div key={review.id} className="flex items-start gap-4 border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                                            <Avatar className="shrink-0">
                                                <AvatarImage src={review.user.imageUrl || ""} />
                                                <AvatarFallback>{review.user.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                                                    <div>
                                                        <p className="font-semibold text-foreground">{review.user.name}</p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {Array.from({ length: 5 }).map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`h-4 w-4 ${i < review.rating
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                {review.comments[0] && <p className="text-sm text-muted-foreground wrap-break-word">{review.comments[0]}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
