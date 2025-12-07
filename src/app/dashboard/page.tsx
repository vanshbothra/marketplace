import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, Plus, Package, Clock } from "lucide-react";
import { UserNav } from "@/components/user-nav";

export default async function DashboardPage() {
    const session = await auth();


    // TODO: Fetch user's vendors from backend API
    // Dummy data for now
    const vendors = [
        {
            id: "1",
            name: "Sample Vendor",
            logo: "/placeholder-logo.png",
            description: "This is a sample vendor. Replace with backend API call.",
            categories: ["PRODUCT", "SERVICE"],
            isVerified: true,
            isActive: true,
            contactEmail: "a@b.com",
            contactPhone: "+1234567890",
            listings: [],
            owners: [{ id: "1", name: "Vansh Bothra", email: "a@b.com" }],
            members: [],
            _count: {
                listings: 0,
            },
        },
    ];

    const vendorCount = vendors.length;
    const canCreateVendor = vendorCount < 5;

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
                            <h1 className="text-xl font-light tracking-wide text-foreground dark:text-foreground">
                                Ashoka Marketplace
                            </h1>
                        </Link>
                    </div>
                    <UserNav />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className="text-4xl font-light mb-2 text-foreground dark:text-foreground">My Dashboard</h2>
                        <p className="text-muted-foreground">Manage your vendors and listings</p>
                    </div>
                    {canCreateVendor && (
                        <Button asChild className="rounded-2xl glass-light text-black dark:text-white hover:text-white">
                            <Link href="/vendor/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Vendor
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Vendor Count Info */}
                <div className="glass-card rounded-3xl p-8 mb-8 shadow-soft border-0">
                    <h3 className="text-2xl font-light mb-2 text-foreground dark:text-foreground">Vendor Accounts</h3>
                    <p className="text-muted-foreground">
                        You have {vendorCount} of 5 vendor accounts
                        {!canCreateVendor && " (maximum reached)"}
                    </p>
                </div>

                {/* Vendors Grid */}
                {vendors.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center shadow-soft border-0">
                        <Store className="h-16 w-16 text-gray-300 mb-4 mx-auto" />
                        <h3 className="text-2xl font-light mb-2 text-foreground dark:text-foreground">No vendors yet</h3>
                        <p className="text-muted-foreground mb-6">Create your first vendor to start selling</p>
                        <Button asChild className="rounded-2xl bg-black hover:bg-gray-800 text-white">
                            <Link href="/vendor/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Vendor
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vendors.map((vendor) => (
                            <Link key={vendor.id} href={`/vendor/${vendor.id}`} className="group">
                                <div className="glass-card rounded-3xl p-6 hover:shadow-soft-lg transition-all duration-300 border-0">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-2xl font-light mb-2 text-foreground dark:text-foreground">{vendor.name}</h3>
                                            <Badge
                                                variant={vendor.isVerified ? "default" : "secondary"}
                                                className="rounded-full glass text-black dark:text-white"
                                            >
                                                {vendor.isVerified ? "VERIFIED" : "PENDING"}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {vendor.description || "No description"}
                                    </p>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground/80 mb-4">
                                        <div className="flex items-center gap-1">
                                            <Package className="h-4 w-4" />
                                            <span>{vendor._count.listings} listings</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span>{vendor.categories.join(", ")}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Manage vendor</span>
                                        <div className="p-2 rounded-full bg-black text-white group-hover:scale-110 transition-transform duration-300">
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
