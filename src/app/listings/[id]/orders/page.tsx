"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { OrdersTable } from "./orders-table";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface Order {
    id: string;
    quantity: number;
    totalPrice: string;
    status: OrderStatus;
    transactionId?: string | null;
    notes?: string | null;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        name: string;
        email: string;
        phone?: string | null;
        address?: string | null;
    };
    listing: {
        id: string;
        name: string;
        price: string;
        images?: string[];
    };
}

function ListingOrdersContent() {
    const params = useParams();
    const id = params.id as string;

    const [listing, setListing] = useState<any>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch listing and orders in parallel
                const [listingResponse, ordersResponse] = await Promise.all([
                    fetch(`${BACKEND_URL}/listings/${id}`, {
                        credentials: 'include',
                    }),
                    fetch(`${BACKEND_URL}/listings/${id}/orders`, {
                        credentials: 'include',
                    })
                ]);

                if (!listingResponse.ok) {
                    setError('Listing not found');
                    setLoading(false);
                    return;
                }

                const listingData = await listingResponse.json();
                setListing(listingData.data);

                if (ordersResponse.ok) {
                    const ordersData = await ordersResponse.json();
                    setOrders(ordersData.data || []);
                } else {
                    setOrders([]);
                }

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load data');
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

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

    if (error || !listing) {
        return (
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-2xl font-light mb-2 text-foreground">{error || 'Listing not found'}</h3>
                    <Button asChild className="rounded-2xl mt-4">
                        <Link href="/marketplace">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Marketplace
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const pendingOrders = orders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED");
    const deliveredOrders = orders.filter(o => o.status === "DELIVERED");

    return (
        <div className="min-h-screen bg-gradient-soft">
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
                                <p className="text-2xl font-light text-foreground">{deliveredOrders.length}</p>
                                <p className="text-xs text-muted-foreground">Delivered</p>
                            </div>
                        </div>
                    </div>
                </div>

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
                    <OrdersTable orders={orders} listingId={id} />
                )}
            </main>
        </div>
    );
}

export default function ListingOrdersPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <ListingOrdersContent />
        </Suspense>
    );
}
