"use client";

import { useState } from "react";
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

interface OrderDetailModalWrapperProps {
    order: Order;
    listingId: string;
    children: (onClick: () => void) => React.ReactNode;
}

export function OrderDetailModalWrapper({ order, listingId, children }: OrderDetailModalWrapperProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            {children(() => setOpen(true))}
            <OrderDetailModal
                order={order}
                listingId={listingId}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}
