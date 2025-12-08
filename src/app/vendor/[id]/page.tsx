import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, ArrowLeft, Plus } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { notFound } from "next/navigation";
import Image from "next/image";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function VendorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Get cookies to pass to backend
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Fetch vendor from backend API (public endpoint)
    let vendor;
    try {
        const response = await fetch(`${BACKEND_URL}/vendors/${id}`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (!response.ok) {
            console.error(`Failed to fetch vendor: ${response.status} ${response.statusText}`);
            notFound();
        }

        const data = await response.json();
        if (!data.success || !data.data) {
            console.error('Invalid response from backend:', data);
            notFound();
        }

        vendor = data.data;
    } catch (error) {
        console.error('Error fetching vendor:', error);
        // If backend is not reachable, show a more helpful error
        if (error instanceof TypeError && error.message.includes('fetch')) {
            console.error('Backend server may not be running at:', BACKEND_URL);
        }
        notFound();
    }

    // Check if current user is an owner by calling the /me endpoint
    // If the backend returns success, user is an owner
    let isOwner = false;
    try {
        const meResponse = await fetch(`${BACKEND_URL}/vendors/me/${id}`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (meResponse.ok) {
            const meData = await meResponse.json();
            isOwner = meData.success && meData.data;
        }
    } catch (error) {
        // User is not an owner, that's fine
        isOwner = false;
    }

    return (
        <div className="min-h-screen bg-gradient-soft">

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <Button asChild variant="ghost" className="mb-6 sm:mb-8 rounded-2xl">
                    <Link href="/marketplace">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                {/* Vendor Header */}
                <div className="glass-card rounded-3xl p-4 sm:p-8 shadow-soft border-0 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4 mb-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1 min-w-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden relative flex items-center justify-center shrink-0">
                                {vendor.logo ? (
                                    <Image src={vendor.logo} alt={vendor.name} fill className="object-cover" />
                                ) : (
                                    <Store className="h-12 w-12 text-muted-foreground" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="text-2xl sm:text-4xl font-light mb-2 text-foreground wrap-break-word">{vendor.name}</h2>
                                <p className="text-sm sm:text-base text-muted-foreground mb-2 wrap-break-word">{vendor.description}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {vendor.isVerified && (
                                        <Badge variant="default" className="rounded-full">
                                            Verified
                                        </Badge>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        {(vendor.owners?.length || 0) + (vendor.members?.length || 0)} members
                                    </span>
                                </div>
                            </div>
                        </div>
                        {isOwner && (
                            <Button asChild className="rounded-2xl glass-light text-foreground hover:text-white">
                                <Link href={`/vendor/${vendor.id}/edit`}>
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Vendor
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Listings Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-semibold text-foreground">Listings</h3>
                            <p className="text-muted-foreground">{vendor.listings?.length || 0} {vendor.listings?.length === 1 ? "listing" : "listings"}</p>
                        </div>
                        {isOwner && (
                            <Button asChild className="rounded-2xl bg-black hover:bg-gray-800 text-white">
                                <Link href={`/vendor/${vendor.id}/listings/new`}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Listing
                                </Link>
                            </Button>
                        )}
                    </div>

                    {!vendor.listings || vendor.listings.length === 0 ? (
                        <div className="glass-card rounded-3xl p-12 text-center shadow-soft border-0">
                            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-2xl font-light mb-2 text-foreground">No listings yet</h3>
                            <p className="text-muted-foreground">
                                {isOwner ? "Get started by creating your first listing" : "Check back later for new listings"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vendor.listings.map((listing: any) => (
                                <Link
                                    key={listing.id}
                                    href={`/marketplace/${listing.id}`}
                                    className="glass-card rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border-0 group"
                                >
                                    <div className="aspect-4/3 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative flex items-center justify-center">
                                        {listing.images && listing.images[0] ? (
                                            <Image src={listing.images[0]} alt={listing.name} fill className="object-cover" />
                                        ) : (
                                            <Store className="h-16 w-16 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <h4 className="text-xl font-light text-foreground line-clamp-1 mb-2">{listing.name}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{listing.description}</p>
                                        <div className="flex items-center justify-between">
                                            {listing.price !== null && listing.price !== undefined ? (
                                                <p className="text-2xl font-light text-foreground">₹{listing.price}</p>
                                            ) : (
                                                <p className="text-sm text-muted-foreground">Contact for price</p>
                                            )}
                                            {!listing.isAvailable && (
                                                <Badge variant="secondary" className="rounded-full">Unavailable</Badge>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
