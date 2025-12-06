import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, ArrowLeft, Plus, CheckCircle, Clock, Star } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { notFound } from "next/navigation";
import Image from "next/image";

export default async function VendorManagePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    // TODO: Fetch vendor details from backend API
    // Dummy data for now
    const vendor = {
        id: id,
        name: "Sample Vendor",
        logo: "/placeholder-logo.png",
        description: "This is a sample vendor. Replace with backend API call.",
        categories: ["PRODUCT", "SERVICE"],
        isVerified: true,
        isActive: true,
        contactEmail: "vendor@ashoka.edu.in",
        contactPhone: "+1234567890",
        listings: [
            {
                id: "1",
                name: "Sample Listing",
                tags: [
                    { id: "1", name: "electronics" },
                ],
                description: "Sample listing description",
                type: "PRODUCT" as const,
                inventoryType: "STOCK" as const,
                availableQty: 10,
                price: 100,
                variants: ["S", "M", "L"],
                isAvailable: true,
                reviews: [{ rating: 5 }],
            },
        ],
        owners: [
            { id: "1", name: "Sample Owner", email: "owner@ashoka.edu.in" },
        ],
        members: [
            { id: "2", name: "Sample Member", email: "member@ashoka.edu.in" },
        ],
    };

    if (!vendor) {
        notFound();
    }

    const canAddListings = vendor.isVerified;

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
                            <h1 className="text-xl font-light tracking-wide text-foreground">
                                Ashoka Marketplace
                            </h1>
                        </Link>
                    </div>
                    <UserNav user={session!.user} />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <Button asChild variant="ghost" className="mb-8 rounded-2xl">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                {/* Vendor Header */}
                <div className="glass-card rounded-3xl p-8 shadow-soft border-0 mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-4xl font-light mb-2 text-foreground">{vendor.name}</h2>
                            <p className="text-muted-foreground">{vendor.description}</p>
                        </div>
                        <Badge
                            variant={vendor.isVerified ? "default" : "secondary"}
                            className="text-lg px-4 py-2 rounded-full glass"
                        >
                            {vendor.isVerified && <CheckCircle className="mr-2 h-4 w-4" />}
                            {!vendor.isVerified && <Clock className="mr-2 h-4 w-4" />}
                            {vendor.isVerified ? "VERIFIED" : "PENDING"}
                        </Badge>
                    </div>

                    {!vendor.isVerified && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-6 mt-4">
                            <p className="text-sm text-foreground">
                                Your vendor is pending admin approval. You'll be able to add listings once approved.
                            </p>
                        </div>
                    )}

                    {!vendor.isActive && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mt-4">
                            <p className="text-sm text-foreground">
                                Your vendor is currently inactive. Please contact an admin for more information.
                            </p>
                        </div>
                    )}
                </div>

                {/* Team Members */}
                <div className="glass-card rounded-3xl p-8 shadow-soft border-0 mb-8">
                    <h3 className="text-2xl font-semibold mb-2 text-foreground">Team Members</h3>
                    <p className="text-muted-foreground mb-6">{vendor.owners.length + vendor.members.length} members</p>
                    <div className="space-y-4">
                        {vendor.owners.map((owner) => (
                            <div key={owner.id} className="flex items-center justify-between glass-light rounded-2xl p-4">
                                <div>
                                    <p className="font-medium text-foreground">{owner.name}</p>
                                    <p className="text-sm text-muted-foreground">{owner.email}</p>
                                </div>
                                <Badge variant="outline" className="rounded-full">OWNER</Badge>
                            </div>
                        ))}
                        {vendor.members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between glass-light rounded-2xl p-4">
                                <div>
                                    <p className="font-medium text-foreground">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                                <Badge variant="outline" className="rounded-full">MEMBER</Badge>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Listings Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-semibold text-foreground">Listings</h3>
                            <p className="text-muted-foreground">{vendor.listings.length} {vendor.listings.length === 1 ? "listing" : "listings"}</p>
                        </div>
                        {canAddListings && (
                            <Button asChild className="rounded-2xl glass-light text-foreground hover:text-white">
                                <Link href={`/dashboard/vendors/${vendor.id}/listings/new`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Listing
                                </Link>
                            </Button>
                        )}
                    </div>

                    {vendor.listings.length === 0 ? (
                        <div className="glass-card rounded-3xl p-12 text-center shadow-soft border-0">
                            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-2xl font-light mb-2 text-foreground">No listings yet</h3>
                            <p className="text-muted-foreground mb-6">
                                {canAddListings
                                    ? "Get started by creating your first listing"
                                    : "You'll be able to add listings once your vendor is approved"}
                            </p>
                            {canAddListings && (
                                <Button asChild className="rounded-2xl bg-black hover:bg-gray-800 text-white">
                                    <Link href={`/dashboard/vendors/${vendor.id}/listings/new`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Listing
                                    </Link>
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vendor.listings.map((listing) => {
                                const avgRating =
                                    listing.reviews.length > 0
                                        ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
                                        : 0;

                                return (
                                    <Link
                                        key={listing.id}
                                        href={`/vendor/${vendor.id}`}
                                        className="glass-card rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border-0 group"
                                    >
                                        <div className="aspect-4/3 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center">
                                            <Store className="h-16 w-16 text-muted-foreground" />
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-xl font-light text-foreground line-clamp-1 flex-1">{listing.name}</h4>
                                                <Badge variant="secondary" className="rounded-full ml-2">{listing.type}</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{listing.description}</p>
                                            <div className="flex items-center justify-between">
                                                {listing.price !== null ? (
                                                    <p className="text-2xl font-light text-foreground">₹{listing.price}</p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Contact for price</p>
                                                )}
                                                {avgRating > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                        <span className="text-sm font-medium text-foreground">{avgRating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
