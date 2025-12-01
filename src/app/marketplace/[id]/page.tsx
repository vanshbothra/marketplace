import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Store, ArrowLeft, Star, Calendar, User } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function ListingDetailPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    const listing = await prisma.listing.findUnique({
        where: { id: params.id },
        include: {
            business: {
                include: {
                    members: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
            reviews: {
                include: {
                    user: true,
                },
                orderBy: {
                    createdAt: "desc",
                },
            },
        },
    });

    if (!listing) {
        notFound();
    }

    const avgRating =
        listing.reviews.length > 0
            ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
            : 0;

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
                <Button asChild variant="ghost" className="mb-4">
                    <Link href="/marketplace">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Marketplace
                    </Link>
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Images */}
                    <div>
                        <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg overflow-hidden relative mb-4">
                            {listing.images[0] ? (
                                <Image
                                    src={listing.images[0]}
                                    alt={listing.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Store className="h-24 w-24 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        {listing.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {listing.images.slice(1, 5).map((img, idx) => (
                                    <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                                        <Image src={img} alt={`${listing.title} ${idx + 2}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-start justify-between mb-2">
                                <h1 className="text-3xl font-bold">{listing.title}</h1>
                                <Badge>{listing.type}</Badge>
                            </div>
                            {listing.price !== null ? (
                                <p className="text-4xl font-bold text-purple-600 mb-4">₹{listing.price}</p>
                            ) : (
                                <p className="text-2xl font-semibold text-muted-foreground mb-4">Contact for price</p>
                            )}
                            {avgRating > 0 && (
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        <span className="text-lg font-medium">{avgRating.toFixed(1)}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">
                                        ({listing.reviews.length} {listing.reviews.length === 1 ? "review" : "reviews"})
                                    </span>
                                </div>
                            )}
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="whitespace-pre-wrap">{listing.description}</p>
                            </CardContent>
                        </Card>

                        {listing.stock !== null && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Availability</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm">
                                        {listing.stock > 0 ? (
                                            <span className="text-green-600 font-medium">
                                                {listing.stock} {listing.stock === 1 ? "item" : "items"} in stock
                                            </span>
                                        ) : (
                                            <span className="text-red-600 font-medium">Out of stock</span>
                                        )}
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Seller Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={listing.business.logo || ""} />
                                        <AvatarFallback>{listing.business.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{listing.business.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {listing.business.members.length} {listing.business.members.length === 1 ? "member" : "members"}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold mb-2">How to Purchase</h4>
                            <p className="text-sm text-muted-foreground">
                                Contact the seller directly through their business profile or reach out via email.
                                Most transactions on Ashoka Marketplace are peer-to-peer.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                {listing.reviews.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold mb-6">Reviews</h2>
                        <div className="space-y-4">
                            {listing.reviews.map((review) => (
                                <Card key={review.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar>
                                                <AvatarImage src={review.user.image || ""} />
                                                <AvatarFallback>{review.user.name?.charAt(0) || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div>
                                                        <p className="font-semibold">{review.user.name}</p>
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
                                                {review.comment && <p className="text-sm">{review.comment}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
