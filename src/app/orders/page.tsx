"use client";

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { useEffect, useState, Suspense } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface Order {
    id: string;
    listing: {
        id: string;
        name: string;
        vendor: {
            id: string;
            name: string;
            logo: string;
        };
    };
    quantity: number;
    totalPrice: string;
    status: OrderStatus;
    transactionId?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
}

function OrdersContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserOrders() {
            try {
                const response = await fetch(`${BACKEND_URL}/orders/me`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    setError('Failed to fetch orders');
                    setOrders([]);
                    return;
                }

                const data = await response.json();
                setOrders(data.data || []);
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('Error loading orders');
                setOrders([]);
            } finally {
                setLoading(false);
            }
        }

        fetchUserOrders();
    }, []);

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case "DELIVERED":
                return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
            case "CONFIRMED":
                return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
            case "PENDING":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
            case "CANCELLED":
                return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-soft">

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12">
                <Button asChild variant="ghost" className="mb-8 rounded-2xl">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                <div className="mb-8">
                    <h2 className="text-4xl font-light mb-2 text-foreground">My Orders</h2>
                    <p className="text-muted-foreground">
                        {orders.length} {orders.length === 1 ? "order" : "orders"} total
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <Select defaultValue="all">
                        <SelectTrigger className="w-48 rounded-2xl glass-light border-0">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                            <SelectItem value="DELIVERED">Delivered</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select defaultValue="newest">
                        <SelectTrigger className="w-48 rounded-2xl glass-light border-0">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Orders Table */}
                {orders.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center shadow-soft border-0">
                        <div className="glass-card rounded-full p-6 w-fit mx-auto mb-4">
                            <svg className="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-light mb-2 text-foreground">No orders yet</h3>
                        <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
                        <Button asChild className="rounded-2xl bg-black hover:bg-gray-900 text-white">
                            <Link href="/marketplace">Browse Marketplace</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="glass-card rounded-xl shadow-soft border-0 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-b border-white/10 hover:bg-transparent">
                                    <TableHead className="text-foreground font-semibold">Order ID</TableHead>
                                    <TableHead className="text-foreground font-semibold">Listing</TableHead>
                                    <TableHead className="text-foreground font-semibold">Vendor</TableHead>
                                    <TableHead className="text-foreground font-semibold">Quantity</TableHead>
                                    <TableHead className="text-foreground font-semibold">Total</TableHead>
                                    <TableHead className="text-foreground font-semibold">Status</TableHead>
                                    <TableHead className="text-foreground font-semibold">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id} className="border-b border-white/10 hover:bg-white/5">
                                        <TableCell className="font-medium text-foreground">#{order.id.slice(0, 8)}</TableCell>
                                        <TableCell>
                                            <Link href={`/marketplace/${order.listing.id}`} className="text-foreground hover:underline">
                                                {order.listing.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <Link href={`/vendor/${order.listing.vendor.id}`} className="text-muted-foreground hover:underline">
                                                {order.listing.vendor.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-foreground">{order.quantity}</TableCell>
                                        <TableCell className="text-foreground font-medium">₹{parseFloat(order.totalPrice).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Badge className={`rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(order.createdAt).toLocaleDateString()}
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

export default function OrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <OrdersContent />
        </Suspense>
    );
}
