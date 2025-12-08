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
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { OrdersTable } from "./orders-table";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

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

async function fetchListingOrders(listingId: string): Promise<Order[]> {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        const response = await fetch(`${BACKEND_URL}/listings/${listingId}/orders`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Failed to fetch listing orders: ${response.status} ${response.statusText}`, errorData);
            return [];
        }

        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('Error fetching listing orders:', error);
        return [];
    }
}

async function fetchListing(listingId: string) {
    try {
        const cookieStore = await cookies();
        const cookieHeader = cookieStore.toString();

        const response = await fetch(`${BACKEND_URL}/listings/${listingId}`, {
            cache: 'no-store',
            headers: {
                'Cookie': cookieHeader,
            },
        });

        if (!response.ok) {
            return null;
        }

        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Error fetching listing:', error);
        return null;
    }
}

export default async function ListingOrdersPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Fetch listing and orders
    const [listing, orders] = await Promise.all([
        fetchListing(id),
        fetchListingOrders(id)
    ]);

    if (!listing) {
        notFound();
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
