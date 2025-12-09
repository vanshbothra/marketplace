"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { User, Package, Calendar, CreditCard, MapPin, Mail, Phone, Receipt } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type OrderStatus = "PENDING" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

interface OrderDetailModalProps {
    order: {
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
    };
    listingId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function OrderDetailModal({ order, listingId, open, onOpenChange }: OrderDetailModalProps) {
    const [status, setStatus] = useState<OrderStatus>(order.status);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === order.status) {
            return; // No change needed
        }

        setIsUpdating(true);
        setError("");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';
            const response = await fetch(`${apiUrl}/listings/${listingId}/orders/${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update order status');
            }

            // Refresh the page to show updated data
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Failed to update order status');
            // Reset status on error
            setStatus(order.status);
        } finally {
            setIsUpdating(false);
        }
    };

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

    const canUpdateStatus = order.status !== "DELIVERED" && order.status !== "CANCELLED";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border-0">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-light">Order Details</DialogTitle>
                    <DialogDescription>
                        Order #{order.id.slice(0, 8)}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Listing Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Listing Information
                        </h3>
                        <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                            {order.listing.images && order.listing.images.length > 0 && (
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0">
                                    <Image
                                        src={order.listing.images[0]}
                                        alt={order.listing.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="font-medium text-foreground">{order.listing.name}</p>
                                <p className="text-sm text-muted-foreground">₹{parseFloat(order.listing.price).toFixed(2)} per unit</p>
                                <p className="text-sm text-muted-foreground">Quantity: {order.quantity}</p>
                                <p className="text-sm font-medium text-foreground mt-1">Total: ₹{parseFloat(order.totalPrice).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Customer Information
                        </h3>
                        <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10">
                            <div className="flex items-center gap-2">
                                <p className="font-medium text-foreground">{order.user.name}</p>
                            </div>
                            {order.user.email && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <a href={`mailto:${order.user.email}`} className="hover:text-foreground">
                                        {order.user.email}
                                    </a>
                                </div>
                            )}
                            {order.user.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3" />
                                    <a href={`tel:${order.user.phone}`} className="hover:text-foreground">
                                        {order.user.phone}
                                    </a>
                                </div>
                            )}
                            {order.user.address && (
                                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <MapPin className="h-3 w-3 mt-0.5" />
                                    <p>{order.user.address}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Status */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            Order Status
                        </h3>
                        <div className="flex items-center justify-between gap-4">
                            <Label htmlFor="status" className="text-sm font-medium">Current Status</Label>
                            {canUpdateStatus ? (
                                <Select
                                    value={status}
                                    onValueChange={(value) => {
                                        setStatus(value as OrderStatus);
                                        // Auto-update when changed
                                        handleStatusChange(value as OrderStatus);
                                    }}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger id="status" className="rounded-xl w-[180px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge className={`rounded-full ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </Badge>
                            )}
                        </div>
                        {isUpdating && (
                            <p className="text-xs text-muted-foreground">Updating status...</p>
                        )}
                        {!canUpdateStatus && (
                            <p className="text-xs text-muted-foreground">Final status - cannot be changed</p>
                        )}
                    </div>

                    {/* Additional Info */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Additional Information
                        </h3>
                        <div className="space-y-2 p-4 rounded-xl bg-white/5 border border-white/10 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Order Date:</span>
                                <span className="text-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Last Updated:</span>
                                <span className="text-foreground">{new Date(order.updatedAt).toLocaleString()}</span>
                            </div>
                            {order.transactionId && (
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        Transaction ID:
                                    </span>
                                    <span className="text-foreground font-mono text-xs">{order.transactionId}</span>
                                </div>
                            )}
                            {order.notes && (
                                <div className="pt-2 border-t border-white/10">
                                    <span className="text-muted-foreground">Notes:</span>
                                    <p className="text-foreground mt-1">{order.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
