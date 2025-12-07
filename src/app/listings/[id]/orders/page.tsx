import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Store, ArrowLeft, Package, User, Calendar } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { notFound } from "next/navigation";

export default async function ListingOrdersPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    // TODO: Fetch listing and orders from backend API
    // Dummy data for now
    const listing = {
        id: id,
        name: "Sample Product",
        vendor: {
            id: "1",
            name: "Sample Vendor",
            owners: [
                { id: "1", name: "Sample Owner", email: "owner@ashoka.edu.in" },
            ],
            members: [
                { id: "2", name: "Sample Member", email: "member@ashoka.edu.in" },
            ],
        },
    };

    // TODO: Replace hardcoded check with actual JWT user check
    const isAuthorized = listing.vendor.owners.some(o => o.id === "1") || listing.vendor.members.some(m => m.id === "1");

    if (!isAuthorized) {
        notFound();
    }

    // Dummy orders data
    const orders = [
        {
            id: "ORD-001",
            quantity: 2,
            totalPrice: 200,
            status: "PENDING" as const,
            createdAt: new Date("2024-01-15"),
            user: {
                id: "u1",
                name: "John Doe",
                email: "john@ashoka.edu.in",
            },
        },
        {
            id: "ORD-002",
            quantity: 1,
            totalPrice: 100,
            status: "CONFIRMED" as const,
            createdAt: new Date("2024-01-14"),
            user: {
                id: "u2",
                name: "Jane Smith",
                email: "jane@ashoka.edu.in",
            },
        },
        {
            id: "ORD-003",
            quantity: 3,
            totalPrice: 300,
            status: "COMPLETED" as const,
            createdAt: new Date("2024-01-10"),
            user: {
                id: "u3",
                name: "Bob Johnson",
                email: "bob@ashoka.edu.in",
            },
        },
        {
            id: "ORD-004",
            quantity: 1,
            totalPrice: 100,
            status: "CANCELLED" as const,
            createdAt: new Date("2024-01-08"),
            user: {
                id: "u4",
                name: "Alice Williams",
                email: "alice@ashoka.edu.in",
            },
        },
    ];

    const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED");
    const completedOrders = orders.filter(o => o.status === "COMPLETED");
    const cancelledOrders = orders.filter(o => o.status === "CANCELLED");

    const getStatusBadge = (status: string) => {
        const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className: string }> = {
            PENDING: { variant: "secondary", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
            CONFIRMED: { variant: "default", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
            COMPLETED: { variant: "default", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
            CANCELLED: { variant: "destructive", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
        };

        const config = variants[status] || variants.PENDING;
        return (
            <Badge variant={config.variant} className={`${config.className} rounded-full`}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-soft">
            {/* Header */}
            <header className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-black">
                                <Store className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="text-xl font-light tracking-wide text-foreground">
                                Ashoka Marketplace
                            </h1>
                        </Link>
                    </div>
                    <UserNav />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <Button asChild variant="ghost" className="mb-6 sm:mb-8 rounded-2xl">
                    <Link href={`/marketplace/${listing.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Listing
                    </Link>
                </Button>

                {/* Page Header */}
                <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-soft border-0 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl sm:text-4xl font-light mb-2 text-foreground">Orders for {listing.name}</h2>
                            <p className="text-sm sm:text-base text-muted-foreground">
                                Manage all orders for this listing
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-2xl font-light text-foreground">{orders.length}</p>
                                <p className="text-xs text-muted-foreground">Total Orders</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-light text-foreground">{pendingOrders.length}</p>
                                <p className="text-xs text-muted-foreground">Pending</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-light text-foreground">{completedOrders.length}</p>
                                <p className="text-xs text-muted-foreground">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                {orders.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center shadow-soft border-0">
                        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-2xl font-light mb-2 text-foreground">No orders yet</h3>
                        <p className="text-muted-foreground">
                            Orders for this listing will appear here
                        </p>
                    </div>
                ) : (
                    <div className="glass-card rounded-xl shadow-soft border-0 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-white/10 hover:bg-transparent">
                                    <TableHead className="text-foreground font-semibold">Order ID</TableHead>
                                    <TableHead className="text-foreground font-semibold">Customer</TableHead>
                                    <TableHead className="text-foreground font-semibold">Quantity</TableHead>
                                    <TableHead className="text-foreground font-semibold">Total Price</TableHead>
                                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                                    <TableHead className="text-foreground font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow
                                        key={order.id}
                                        className="border-b border-white/10 hover:bg-white/5 transition-colors"
                                    >
                                        <TableCell className="font-medium text-foreground">
                                            {order.id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{order.user.name}</p>
                                                    <p className="text-xs text-muted-foreground">{order.user.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-foreground">
                                            {order.quantity}
                                        </TableCell>
                                        <TableCell className="text-foreground font-medium">
                                            ₹{order.totalPrice}
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(order.status)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span className="text-sm">
                                                    {order.createdAt.toLocaleDateString()}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </main>
        </div>
    );
}
