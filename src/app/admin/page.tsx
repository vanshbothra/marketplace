import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, CheckCircle, XCircle } from "lucide-react";
import { UserNav } from "@/components/user-nav";

async function approveVendor(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const vendorId = formData.get("vendorId") as string;

    // TODO: Call backend API to approve vendor
    console.log("Approving vendor:", vendorId);
}

async function rejectVendor(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
    }

    const vendorId = formData.get("vendorId") as string;

    // TODO: Call backend API to reject vendor
    console.log("Rejecting vendor:", vendorId);
}

export default async function AdminPage() {
    const session = await auth();

    if (session!.user.role !== "ADMIN") {
        redirect("/");
    }

    // TODO: Fetch pending vendors from backend API
    // Dummy data for now
    const pendingVendors: any[] = [];

    // TODO: Fetch all vendors from backend API
    // Dummy data for now
    const allVendors = [
        {
            id: "1",
            name: "Sample Vendor",
            isVerified: true,
            isActive: true,
            createdAt: new Date(),
            _count: { listings: 0 },
        },
    ];

    const stats = {
        total: allVendors.length,
        verified: allVendors.filter((v) => v.isVerified).length,
        pending: allVendors.filter((v) => !v.isVerified && v.isActive).length,
        inactive: allVendors.filter((v) => !v.isActive).length,
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
                    <UserNav user={session!.user} />
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
                            <CardDescription>Total Vendors</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-2xl text-green-600">{stats.verified}</CardTitle>
                            <CardDescription>Verified</CardDescription>
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
                            <CardTitle className="text-2xl text-red-600">{stats.inactive}</CardTitle>
                            <CardDescription>Inactive</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Pending Approvals */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4">Pending Approvals</h3>
                    {pendingVendors.length === 0 ? (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-12">
                                <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                                <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                                <p className="text-muted-foreground">No pending vendor approvals</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {pendingVendors.map((vendor: any) => (
                                <Card key={vendor.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle>{vendor.name}</CardTitle>
                                                <CardDescription className="mt-2">
                                                    {vendor.description || "No description provided"}
                                                </CardDescription>
                                                <div className="mt-4 space-y-1">
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Contact:</strong> {vendor.contactEmail}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Categories:</strong> {vendor.categories.join(", ")}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        <strong>Created:</strong> {new Date(vendor.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant="secondary">PENDING</Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex gap-2">
                                            <form action={approveVendor} className="flex-1">
                                                <input type="hidden" name="vendorId" value={vendor.id} />
                                                <Button type="submit" className="w-full" variant="default">
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Approve
                                                </Button>
                                            </form>
                                            <form action={rejectVendor} className="flex-1">
                                                <input type="hidden" name="vendorId" value={vendor.id} />
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

                {/* All Vendors */}
                <div>
                    <h3 className="text-2xl font-bold mb-4">All Vendors</h3>
                    <div className="space-y-2">
                        {allVendors.map((vendor: any) => (
                            <Card key={vendor.id}>
                                <CardContent className="flex items-center justify-between py-4">
                                    <div className="flex-1">
                                        <p className="font-semibold">{vendor.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {vendor._count.listings} listings
                                        </p>
                                    </div>
                                    <Badge
                                        variant={vendor.isVerified ? "default" : "secondary"}
                                    >
                                        {vendor.isVerified ? "VERIFIED" : "PENDING"}
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
