import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShoppingBag, GraduationCap, X, ChevronLeft, ChevronRight } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { MarketplaceFilters } from "@/components/marketplace-filters";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function MarketplacePage({
    searchParams,
}: {
    searchParams: Promise<{
        search?: string;
        type?: string;
        sort?: string;
        tags?: string;
        page?: string;
        limit?: string;
    }>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '12');

    // Get cookies for authentication
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    // Fetch listings from backend
    let listings: any[] = [];
    let meta = { total: 0, page: 1, limit: 12, totalPages: 0 };
    let error = null;

    try {
        const queryParams = new URLSearchParams();
        queryParams.set('page', page.toString());
        queryParams.set('limit', limit.toString());

        if (params.search) queryParams.set('search', params.search);
        if (params.type) queryParams.set('type', params.type);
        if (params.tags) queryParams.set('tags', params.tags);
        if (params.sort) queryParams.set('sort', params.sort);

        const response = await fetch(`${BACKEND_URL}/listings?${queryParams.toString()}`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.success && data.data && data.data.data) {
                // Backend returns: { success, data: { data: [...items], meta: {...} } }
                listings = data.data.data || [];
                meta = data.data.meta || meta;
            }
        } else {
            error = 'Failed to fetch listings';
        }
    } catch (err) {
        console.error('Error fetching listings:', err);
        error = 'Backend connection error';
    }

    // Get unique tags from listings for filter
    const allTags = Array.from(
        new Set(
            listings.flatMap((listing: any) =>
                listing.tags?.map((tag: any) => tag.name) || []
            )
        )
    );

    const selectedTags = params.tags ? params.tags.split(',') : [];

    return (
        <div className="min-h-screen bg-gradient-soft">
            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Page Header */}
                <div className="mb-8 sm:mb-12">
                    <h2 className="text-4xl sm:text-5xl font-light mb-4 text-foreground">
                        Discover
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Browse products and services from the Ashoka community
                    </p>
                </div>

                {/* Filters */}
                <MarketplaceFilters
                    currentParams={params}
                    allTags={allTags}
                />

                {/* Active Filters Display */}
                {(params.search || params.type || selectedTags.length > 0) && (
                    <div className="mb-6 flex flex-wrap items-center gap-2">
                        <span className="text-sm text-muted-foreground">Active filters:</span>
                        {params.search && (
                            <Badge variant="secondary" className="rounded-full">
                                Search: {params.search}
                                <Link href="/marketplace" className="ml-1">
                                    <X className="h-3 w-3" />
                                </Link>
                            </Badge>
                        )}
                        {params.type && (
                            <Badge variant="secondary" className="rounded-full">
                                {params.type}
                                <Link
                                    href={`/marketplace?${new URLSearchParams({
                                        ...params,
                                        type: ''
                                    }).toString()}`}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </Link>
                            </Badge>
                        )}
                        {selectedTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="rounded-full">
                                {tag}
                                <Link
                                    href={`/marketplace?${new URLSearchParams({
                                        ...params,
                                        tags: selectedTags.filter(t => t !== tag).join(',')
                                    }).toString()}`}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </Link>
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Results Count */}
                <div className="mb-6 text-sm text-muted-foreground">
                    Showing {listings.length} of {meta.total} results
                </div>

                {/* Error State */}
                {error && (
                    <div className="glass-card rounded-3xl p-8 text-center shadow-soft mb-8">
                        <p className="text-red-500 mb-2">⚠️ {error}</p>
                        <p className="text-muted-foreground text-sm">
                            Please check if the backend server is running at {BACKEND_URL}
                        </p>
                    </div>
                )}

                {/* Listings Grid */}
                {listings.length === 0 && !error ? (
                    <div className="glass-card rounded-3xl p-12 text-center shadow-soft">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mb-4 mx-auto" />
                        <h3 className="text-2xl font-light mb-2 text-foreground">No listings found</h3>
                        <p className="text-muted-foreground/80">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                            {listings.map((listing) => (
                                <ListingCard key={listing.id} listing={listing} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta.totalPages > 1 && (
                            <div className="mt-12 flex items-center justify-center gap-2">
                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-2xl"
                                    disabled={page <= 1}
                                >
                                    <Link
                                        href={`/marketplace?${new URLSearchParams({
                                            ...params,
                                            page: (page - 1).toString()
                                        }).toString()}`}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Previous
                                    </Link>
                                </Button>

                                <div className="flex items-center gap-2">
                                    {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((pageNum) => {
                                        // Show first page, last page, current page, and pages around current
                                        if (
                                            pageNum === 1 ||
                                            pageNum === meta.totalPages ||
                                            (pageNum >= page - 1 && pageNum <= page + 1)
                                        ) {
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    asChild
                                                    variant={pageNum === page ? "default" : "outline"}
                                                    className="rounded-2xl w-10 h-10"
                                                >
                                                    <Link
                                                        href={`/marketplace?${new URLSearchParams({
                                                            ...params,
                                                            page: pageNum.toString()
                                                        }).toString()}`}
                                                    >
                                                        {pageNum}
                                                    </Link>
                                                </Button>
                                            );
                                        } else if (
                                            pageNum === page - 2 ||
                                            pageNum === page + 2
                                        ) {
                                            return <span key={pageNum} className="text-muted-foreground">...</span>;
                                        }
                                        return null;
                                    })}
                                </div>

                                <Button
                                    asChild
                                    variant="outline"
                                    className="rounded-2xl"
                                    disabled={page >= meta.totalPages}
                                >
                                    <Link
                                        href={`/marketplace?${new URLSearchParams({
                                            ...params,
                                            page: (page + 1).toString()
                                        }).toString()}`}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
