"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Calendar } from "lucide-react";
import { OrderDetailModal } from "@/components/order-detail-modal";

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

interface OrdersTableProps {
    orders: Order[];
    listingId: string;
}

export function OrdersTable({ orders, listingId }: OrdersTableProps) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const getStatusBadge = (status: OrderStatus) => {
        const variants: Record<OrderStatus, string> = {
            PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
            CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
            DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
            CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
        };

        return (
            <Badge className={`${variants[status]} rounded-full`}>
                {status}
            </Badge>
        );
    };

    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    return (
        <>
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
                                onClick={() => handleRowClick(order)}
                                className="border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                            >
                                <TableCell className="font-medium text-foreground">
                                    #{order.id.slice(0, 8)}
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
                                    ₹{parseFloat(order.totalPrice).toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(order.status)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span className="text-sm">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    listingId={listingId}
                    open={modalOpen}
                    onOpenChange={setModalOpen}
                />
            )}
        </>
    );
}
