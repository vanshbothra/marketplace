import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Store, CheckCircle, XCircle } from "lucide-react";

export default function AdminPage() {
    // TODO: Implement admin functionality with backend API
    // This page requires admin role verification

    const stats = {
        total: 0,
        verified: 0,
        pending: 0,
        inactive: 0,
    };

    return (
        <div className="min-h-screen bg-gradient-soft">
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
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Admin Panel</h3>
                            <p className="text-muted-foreground">
                                This page is under development. Admin functionality will be added soon.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
