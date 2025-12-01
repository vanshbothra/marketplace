import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, ArrowLeft, Plus, Package, CheckCircle, XCircle, Clock } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { notFound } from "next/navigation";

export default async function BusinessManagePage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Fetch business and verify user is a member
    const businessMember = await prisma.businessMember.findFirst({
        where: {
            businessId: params.id,
            userId: session.user.id,
        },
        include: {
            business: {
                include: {
                    listings: {
                        include: {
                            reviews: true,
                        },
                        orderBy: {
                            createdAt: "desc",
                        },
                    },
                    members: {
                        include: {
                            user: true,
                        },
                    },
                },
            },
        },
    });

    if (!businessMember) {
        notFound();
    }

    const { business } = businessMember;
    const canAddListings = business.status === "APPROVED";

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
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>

                {/* Business Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">{business.name}</h2>
                            <p className="text-muted-foreground">{business.description}</p>
                        </div>
                        <Badge
                            variant={
                                business.status === "APPROVED"
                                    ? "default"
                                    : business.status === "PENDING"
                                        ? "secondary"
                                        : "destructive"
                            }
                            className="text-lg px-4 py-2"
                        >
                            {business.status === "APPROVED" && <CheckCircle className="mr-2 h-4 w-4" />}
                            {business.status === "PENDING" && <Clock className="mr-2 h-4 w-4" />}
                            {business.status === "REJECTED" && <XCircle className="mr-2 h-4 w-4" />}
                            {business.status}
                        </Badge>
                    </div>

                    {business.status === "PENDING" && (
                        <Card className="bg-yellow-50 border-yellow-200">
                            <CardContent className="pt-6">
                                <p className="text-sm">
                                    Your business is pending admin approval. You'll be able to add listings once approved.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {business.status === "REJECTED" && (
                        <Card className="bg-red-50 border-red-200">
                            <CardContent className="pt-6">
                                <p className="text-sm">
                                    Your business application was rejected. Please contact an admin for more information.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Team Members */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>{business.members.length} members</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {business.members.map((member) => (
                                <div key={member.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="font-medium">{member.user.name}</p>
                                            <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{member.role}</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Listings Section */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Listings</h3>
                    {canAddListings && (
                        <Button asChild>
                            <Link href={`/dashboard/businesses/${business.id}/listings/new`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Listing
                            </Link>
                        </Button>
                    )}
                </div>

                {business.listings.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                            <p className="text-muted-foreground mb-4">
                                {canAddListings
                                    ? "Create your first listing to start selling"
                                    : "You'll be able to add listings once your business is approved"}
                            </p>
                            {canAddListings && (
                                <Button asChild>
                                    <Link href={`/dashboard/businesses/${business.id}/listings/new`}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Listing
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {business.listings.map((listing) => {
                            const avgRating =
                                listing.reviews.length > 0
                                    ? listing.reviews.reduce((sum, r) => sum + r.rating, 0) / listing.reviews.length
                                    : 0;

                            return (
                                <Card key={listing.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="line-clamp-1">{listing.title}</CardTitle>
                                            <Badge>{listing.type}</Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2">
                                            {listing.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            {listing.price !== null && (
                                                <p className="text-2xl font-bold">₹{listing.price}</p>
                                            )}
                                            {listing.stock !== null && (
                                                <p className="text-sm text-muted-foreground">
                                                    Stock: {listing.stock}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Badge variant={listing.isAvailable ? "default" : "secondary"}>
                                                    {listing.isAvailable ? "Available" : "Unavailable"}
                                                </Badge>
                                                {avgRating > 0 && (
                                                    <span className="text-sm text-muted-foreground">
                                                        ⭐ {avgRating.toFixed(1)} ({listing.reviews.length})
                                                    </span>
                                                )}
                                            </div>
                                            <Button asChild className="w-full" variant="outline">
                                                <Link href={`/marketplace/${listing.id}`}>View</Link>
                                            </Button>
                                        </div>
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
