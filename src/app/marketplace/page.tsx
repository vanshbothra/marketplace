import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Store, Search, ShoppingBag, Utensils, GraduationCap, Star } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import Image from "next/image";

export default async function MarketplacePage({
    searchParams,
}: {
    searchParams: { search?: string; type?: string };
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Fetch approved listings
    const listings = await prisma.listing.findMany({
        where: {
            isAvailable: true,
            business: {
                status: "APPROVED",
            },
            ...(searchParams.search && {
                OR: [
                    { title: { contains: searchParams.search, mode: "insensitive" } },
                    { description: { contains: searchParams.search, mode: "insensitive" } },
                ],
            }),
            ...(searchParams.type && {
                type: searchParams.type as any,
            }),
        },
        include: {
            business: {
                select: {
                    name: true,
                    logo: true,
                },
            },
            reviews: {
                select: {
                    rating: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Store className="h-6 w-6 text-purple-600" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Ashoka Marketplace
                            </h1>
                        </Link>
                    </div>
                    <UserNav user={session.user} />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-4">Browse Marketplace</h2>

                    {/* Search and Filters */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <form action="/marketplace" method="get">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        name="search"
                                        placeholder="Search listings..."
                                        className="pl-10"
                                        defaultValue={searchParams.search}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Category Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <Button asChild variant={!searchParams.type ? "default" : "outline"} size="sm">
                            <Link href="/marketplace">All</Link>
                        </Button>
                        <Button asChild variant={searchParams.type === "PRODUCT" ? "default" : "outline"} size="sm">
                            <Link href="/marketplace?type=PRODUCT">
                                <ShoppingBag className="mr-2 h-4 w-4" />
                                Products
                            </Link>
                        </Button>
                        <Button asChild variant={searchParams.type === "SERVICE" ? "default" : "outline"} size="sm">
                            <Link href="/marketplace?type=SERVICE">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Services
                            </Link>
                        </Button>
                        <Button asChild variant={searchParams.type === "FOOD" ? "default" : "outline"} size="sm">
                            <Link href="/marketplace?type=FOOD">
                                <Utensils className="mr-2 h-4 w-4" />
                                Food
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Listings Grid */}
                {listings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No listings found</h3>
                            <p className="text-muted-foreground">Try adjusting your search or filters</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {listings.map((listing) => {
                            const avgRating =
                                listing.reviews.length > 0
                                    ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
                                    : 0;

                            return (
                                <Card key={listing.id} className="hover:shadow-lg transition-shadow overflow-hidden">
                                    <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 relative">
                                        {listing.images[0] ? (
                                            <Image
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full">
                                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                        <Badge className="absolute top-2 right-2">
                                            {listing.type}
                                        </Badge>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                                        <CardDescription className="line-clamp-2">
                                            {listing.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between mb-4">
                                            {listing.price !== null ? (
                                                <p className="text-2xl font-bold">₹{listing.price}</p>
                                            ) : (
                                                <p className="text-lg font-semibold text-muted-foreground">Contact for price</p>
                                            )}
                                            {avgRating > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-4">by {listing.business.name}</p>
                                        <Button asChild className="w-full">
                                            <Link href={`/marketplace/${listing.id}`}>View Details</Link>
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
