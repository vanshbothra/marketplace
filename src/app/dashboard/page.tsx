import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, Plus, Package, Clock } from "lucide-react";
import { UserNav } from "@/components/user-nav";

export default async function DashboardPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Fetch user's businesses
    const businesses = await prisma.businessMember.findMany({
        where: { userId: session.user.id },
        include: {
            business: {
                include: {
                    listings: true,
                    _count: {
                        select: { listings: true, reviews: true },
                    },
                },
            },
        },
    });

    const businessCount = businesses.length;
    const canCreateBusiness = businessCount < 5;

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
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold mb-2">My Dashboard</h2>
                        <p className="text-muted-foreground">Manage your businesses and listings</p>
                    </div>
                    {canCreateBusiness && (
                        <Button asChild>
                            <Link href="/dashboard/businesses/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Business
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Business Count Info */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle>Business Accounts</CardTitle>
                        <CardDescription>
                            You have {businessCount} of 5 business accounts
                            {!canCreateBusiness && " (maximum reached)"}
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Businesses Grid */}
                {businesses.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Store className="h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No businesses yet</h3>
                            <p className="text-muted-foreground mb-4">Create your first business to start selling</p>
                            <Button asChild>
                                <Link href="/dashboard/businesses/new">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Business
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {businesses.map(({ business }) => (
                            <Card key={business.id} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="mb-2">{business.name}</CardTitle>
                                            <Badge
                                                variant={
                                                    business.status === "APPROVED"
                                                        ? "default"
                                                        : business.status === "PENDING"
                                                            ? "secondary"
                                                            : "destructive"
                                                }
                                            >
                                                {business.status}
                                            </Badge>
                                        </div>
                                    </div>
                                    <CardDescription className="line-clamp-2">
                                        {business.description || "No description"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                        <div className="flex items-center gap-1">
                                            <Package className="h-4 w-4" />
                                            <span>{business._count.listings} listings</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            <span>{business._count.reviews} reviews</span>
                                        </div>
                                    </div>
                                    <Button asChild className="w-full" variant="outline">
                                        <Link href={`/dashboard/businesses/${business.id}`}>Manage</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
