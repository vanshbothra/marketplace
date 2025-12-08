import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Store, ArrowLeft, Star, Mail, Phone, Edit, Info } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { WishlistButton } from "@/components/wishlist-button";
import { OrderModal } from "@/components/order-modal";
import { ReviewModal } from "@/components/review-modal";
import Image from "next/image";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default async function ListingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Get cookies to pass to backend
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Get user ID from cookie set by proxy
    const userId = cookieStore.get('user-id')?.value;

    // Fetch listing from backend API
    let listing;
    try {
        const response = await fetch(`${BACKEND_URL}/listings/${id}`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch listing: ${response.status} ${response.statusText}`);
            notFound();
        }

        const data = await response.json();
        if (!data.success || !data.data) {
            console.error('Invalid response from backend:', data);
            notFound();
        }

        listing = data.data;
    } catch (error) {
        console.error('Error fetching listing:', error);
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('Backend server may not be running at:', BACKEND_URL);
        }
        notFound();
    }

    // Check if current user is owner/member by trying to access the vendor
    let isOwnerOrMember = false;
    try {
        const vendorResponse = await fetch(`${BACKEND_URL}/vendors/me/${listing.vendorId}`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (vendorResponse.ok) {
            const vendorData = await vendorResponse.json();
            isOwnerOrMember = vendorData.success && vendorData.data;
        }
    } catch (error) {
        // User is not owner/member, that's fine
        isOwnerOrMember = false;
    }

    // Check if current user has already reviewed this listing using cookie user-id
    const userHasReviewed = userId && listing.reviews?.some(
        (review: any) => review.userId === userId
    );

    const avgRating =
        listing.reviews && listing.reviews.length > 0
            ? listing.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / listing.reviews.length
            : 0;

    return (
        <div className="min-h-screen bg-gradient-soft">

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <Button asChild variant="ghost" className="mb-6 sm:mb-8 rounded-2xl">
                    <Link href="/marketplace">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Marketplace
                    </Link>
                </Button>

                {/* Listing Details */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Images */}
                        {listing.images && listing.images.length > 0 && (
                            <div className="glass-card rounded-3xl overflow-hidden shadow-soft border-0">
                                <div className="aspect-video relative bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                                    <Image
                                        src={listing.images[0]}
                                        alt={listing.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Listing Info */}
                        <div className="glass-card rounded-3xl p-8 shadow-soft border-0">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h2 className="text-4xl font-light mb-4 text-foreground">{listing.name}</h2>
                                    <div className="flex flex-wrap items-center gap-2 mb-4">
                                        <Badge variant="outline" className="rounded-full">
                                            {listing.type}
                                        </Badge>
                                        <Badge variant="outline" className="rounded-full">
                                            {listing.inventoryType}
                                        </Badge>
                                        {listing.tags && listing.tags.map((tag: any) => (
                                            <Badge key={tag.id} variant="secondary" className="rounded-full">
                                                {tag.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <WishlistButton listingId={listing.id} />
                                    {isOwnerOrMember && (
                                        <Button asChild variant="outline" className="rounded-2xl">
                                            <Link href={`/listings/${listing.id}/edit`}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Edit
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {listing.price !== null && listing.price !== undefined && (
                                <p className="text-4xl font-light text-foreground mb-6">₹{listing.price}</p>
                            )}

                            <p className="text-muted-foreground mb-6">{listing.description}</p>

                            {listing.variants && listing.variants.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-semibold mb-2 text-foreground">Variants</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {listing.variants.map((variant: string, idx: number) => (
                                            <Badge key={idx} variant="outline" className="rounded-full">
                                                {variant}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {listing.availableQty !== null && listing.availableQty !== undefined && (
                                <p className="text-sm text-muted-foreground">
                                    {listing.availableQty > 0 ? `${listing.availableQty} available` : 'Out of stock'}
                                </p>
                            )}

                            {/* Conditional Action Buttons based on managed field */}
                            {listing.managed ? (
                                // Managed listing - show order button
                                listing.price !== null && listing.price !== undefined ? (
                                    <OrderModal listing={{
                                        id: listing.id,
                                        name: listing.name,
                                        price: parseFloat(listing.price.toString()),
                                        availableQty: listing.availableQty || undefined,
                                        vendor: {
                                            id: listing.vendor.id,
                                            name: listing.vendor.name,
                                            upiId: listing.vendor.upiId || undefined,
                                        }
                                    }}>
                                        <Button className="w-full mt-6 rounded-2xl bg-black hover:bg-gray-900 text-white">
                                            Place Order
                                        </Button>
                                    </OrderModal>
                                ) : (
                                    <div className="mt-6 space-y-2">
                                        <p className="text-sm text-muted-foreground">Contact vendor for pricing</p>
                                        <Button variant="outline" className="w-full rounded-2xl">
                                            Contact Vendor
                                        </Button>
                                    </div>
                                )
                            ) : (
                                // Non-managed listing - show contact button
                                <div className="mt-6 space-y-3">
                                    <p className="text-sm text-muted-foreground">
                                        Contact the vendor directly to purchase this item
                                    </p>
                                    <Button variant="outline" className="w-full rounded-2xl">
                                        Contact Vendor
                                    </Button>
                                </div>
                            )}
                        </div>


                        {/* Reviews */}
                        <div className="glass-card rounded-3xl p-4 sm:p-8 shadow-soft border-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                    <h3 className="text-2xl font-light text-foreground">Reviews</h3>
                                    {listing.reviews && listing.reviews.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                            <span className="text-lg font-medium text-foreground">
                                                {avgRating.toFixed(1)}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                ({listing.reviews.length} {listing.reviews.length === 1 ? 'review' : 'reviews'})
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {!userHasReviewed && (
                                    <ReviewModal listingId={listing.id} listingName={listing.name}>
                                        <Button variant="outline" className="rounded-2xl w-full sm:w-auto">
                                            <Star className="mr-2 h-4 w-4" />
                                            Write a Review
                                        </Button>
                                    </ReviewModal>
                                )}
                            </div>

                            {listing.reviews && listing.reviews.length > 0 ? (
                                <div className="space-y-6">
                                    {listing.reviews.map((review: any) => (
                                        <div key={review.id} className="border-b border-white/10 last:border-0 pb-6 last:pb-0">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarImage src={review.user?.imageUrl} />
                                                    <AvatarFallback>{review.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="font-medium text-foreground">{review.user?.name || 'Anonymous'}</p>
                                                        <div className="flex items-center gap-1">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-4 w-4 ${i < review.rating
                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                        : 'text-gray-300 dark:text-gray-600'
                                                                        }`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {review.comments && review.comments.length > 0 && (
                                                        <p className="text-sm text-muted-foreground">
                                                            {review.comments}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Star className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                                    <p className="text-muted-foreground">No reviews yet</p>
                                    <p className="text-sm text-muted-foreground mt-1">Be the first to review this listing!</p>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Sidebar - Vendor Info */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-3xl p-6 shadow-soft border-0 sticky top-24">
                            <h3 className="text-xl font-light mb-4 text-foreground">Vendor Information</h3>

                            <Link href={`/vendor/${listing.vendor?.id}`} className="block mb-6 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                                        {listing.vendor?.logo ? (
                                            <Image src={listing.vendor.logo} alt={listing.vendor.name} fill className="object-cover" />
                                        ) : (
                                            <Store className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                                            {listing.vendor?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">View vendor profile</p>
                                    </div>
                                </div>
                            </Link>

                            <div className="space-y-3">
                                {listing.vendor?.contactEmail && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`mailto:${listing.vendor.contactEmail}`}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {listing.vendor.contactEmail}
                                        </a>
                                    </div>
                                )}

                                {listing.vendor?.contactPhone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <a
                                            href={`tel:${listing.vendor.contactPhone}`}
                                            className="text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {listing.vendor.contactPhone}
                                        </a>
                                    </div>
                                )}

                                {(listing.vendor?.upiId || listing.vendor?.paymentInformation) && (
                                    <div className="mt-4 pt-4 border-t border-white/10">
                                        <div className="flex items-start gap-2">
                                            <Info className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <p className="text-sm font-medium text-foreground">Payment Information</p>
                                                {listing.vendor?.upiId && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground">UPI ID:</p>
                                                        <p className="text-sm text-foreground font-mono bg-white/5 px-2 py-1 rounded">
                                                            {listing.vendor.upiId}
                                                        </p>
                                                    </div>
                                                )}
                                                {listing.vendor?.paymentInformation && (
                                                    <div className="space-y-1">
                                                        <p className="text-xs text-muted-foreground">Details:</p>
                                                        <p className="text-xs text-foreground whitespace-pre-wrap">
                                                            {listing.vendor.paymentInformation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isOwnerOrMember && (
                                <div className="mt-6 pt-6 border-t border-white/10">
                                    <Button asChild variant="outline" className="w-full rounded-2xl">
                                        <Link href={`/listings/${listing.id}/orders`}>
                                            View Orders
                                        </Link>
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
