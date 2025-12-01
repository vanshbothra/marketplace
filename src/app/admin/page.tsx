import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, CheckCircle, XCircle } from "lucide-react";
import { UserNav } from "@/components/user-nav";

async function approveBusiness(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const businessId = formData.get("businessId") as string;

    await prisma.business.update({
        where: { id: businessId },
        data: { status: "APPROVED" },
    });
}

async function rejectBusiness(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const businessId = formData.get("businessId") as string;

    await prisma.business.update({
        where: { id: businessId },
        data: { status: "REJECTED" },
    });
}

export default async function AdminPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/");
    }

    // Fetch pending businesses
    const pendingBusinesses = await prisma.business.findMany({
        where: { status: "PENDING" },
        include: {
            members: {
                include: {
                    user: true,
                },
            },
            _count: {
                select: { listings: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    // Fetch all businesses for overview
    const allBusinesses = await prisma.business.findMany({
        include: {
            _count: {
                select: { listings: true, members: true },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 50,
    });

    const stats = {
        total: allBusinesses.length,
        approved: allBusinesses.filter((b: typeof allBusinesses[0]) => b.status === "APPROVED").length,
        pending: allBusinesses.filter((b: typeof allBusinesses[0]) => b.status === "PENDING").length,
        rejected: allBusinesses.filter((b: typeof allBusinesses[0]) => b.status === "REJECTED").length,
    };

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
                <h2 className="text-3xl font-bold mb-8">Admin Panel</h2>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl">{stats.total}</CardTitle>
                            <CardDescription>Total Businesses</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl text-green-600">{stats.approved}</CardTitle>
                            <CardDescription>Approved</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl text-yellow-600">{stats.pending}</CardTitle>
                            <CardDescription>Pending</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl text-red-600">{stats.rejected}</CardTitle>
                            <CardDescription>Rejected</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Pending Approvals */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4">Pending Approvals</h3>
                    {pendingBusinesses.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                                <p className="text-muted-foreground">No pending business approvals</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {pendingBusinesses.map((business: typeof pendingBusinesses[0]) => (
                                <Card key={business.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle>{business.name}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    {business.description || "No description provided"}
                                                </CardDescription>
                                                <div className="mt-4 space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Owner:</strong> {business.members.find((m: typeof business.members[0]) => m.role === "OWNER")?.user.name}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Email:</strong> {business.members.find((m: typeof business.members[0]) => m.role === "OWNER")?.user.email}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Created:</strong> {new Date(business.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">PENDING</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <form action={approveBusiness} className="flex-1">
                                                <input type="hidden" name="businessId" value={business.id} />
                                                <Button type="submit" className="w-full" variant="default">
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </form>
                                            <form action={rejectBusiness} className="flex-1">
                                                <input type="hidden" name="businessId" value={business.id} />
                                                <Button type="submit" className="w-full" variant="destructive">
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    Reject
                                                </Button>
                                            </form>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* All Businesses */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">All Businesses</h3>
                    <div className="space-y-2">
                        {allBusinesses.map((business: typeof allBusinesses[0]) => (
                            <Card key={business.id}>
                                <CardContent className="flex items-center justify-between py-4">
                                    <div className="flex-1">
                                        <p className="font-semibold">{business.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {business._count.listings} listings • {business._count.members} members
                                        </p>
                                    </div>
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
