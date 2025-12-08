"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface OrderModalProps {
    listing: {
        id: string;
        name: string;
        price: number;
        availableQty?: number;
        vendor: {
            id: string;
            name: string;
            upiId?: string;
        };
    };
    children: React.ReactNode;
}

export function OrderModal({ listing, children }: OrderModalProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [transactionId, setTransactionId] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const totalPrice = listing.price * quantity;
    const maxQty = listing.availableQty || 999;

    // Generate UPI payment link
    const generateUPILink = () => {
        if (!listing.vendor.upiId) return "#";

        const upiId = listing.vendor.upiId;
        const vendorName = encodeURIComponent(listing.vendor.name);
        const amount = totalPrice.toFixed(2);
        const note = encodeURIComponent(`Order: ${listing.name}`);

        return `upi://pay?pa=${upiId}&pn=${vendorName}&am=${amount}&cu=INR&tn=${note}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${BACKEND_URL}/orders/me`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    listingId: listing.id,
                    quantity,
                    totalPrice,
                    transactionId: transactionId || undefined,
                    notes: notes || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to place order');
            }

            // Success - redirect to orders page
            setOpen(false);
            router.push('/orders');
        } catch (err: any) {
            console.error('Error placing order:', err);
            setError(err.message || 'Failed to place order');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-gradient-soft">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-light">Place Order</DialogTitle>
                    <DialogDescription>
                        Complete your order for {listing.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                    {/* Quantity */}
                    <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="1"
                            max={maxQty}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1)))}
                            className="rounded-xl"
                            required
                        />
                        {listing.availableQty && (
                            <p className="text-xs text-muted-foreground">
                                Maximum available: {listing.availableQty}
                            </p>
                        )}
                    </div>

                    {/* Price Calculation */}
                    <div className="glass-card rounded-2xl p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price per unit:</span>
                            <span className="font-medium">₹{listing.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="font-medium">{quantity}</span>
                        </div>
                        <div className="border-t border-white/10 pt-2 flex justify-between">
                            <span className="font-semibold">Total Amount:</span>
                            <span className="text-xl font-light">₹{totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* UPI Payment */}
                    {listing.vendor.upiId && (
                        <div className="space-y-2">
                            <Label>Payment via UPI</Label>
                            <div className="glass-card rounded-2xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium">UPI ID:</p>
                                        <p className="text-sm text-muted-foreground font-mono">{listing.vendor.upiId}</p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full rounded-xl"
                                    onClick={() => window.location.href = generateUPILink()}
                                >
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Pay via UPI App
                                </Button>
                                <p className="text-xs text-muted-foreground">
                                    Click to open your UPI app and complete the payment
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Transaction ID */}
                    <div className="space-y-2">
                        <Label htmlFor="transactionId">
                            Transaction ID {listing.vendor.upiId && "(Optional)"}
                        </Label>
                        <Input
                            id="transactionId"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter UPI transaction ID"
                            className="rounded-xl"
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter the transaction ID after completing payment
                        </p>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions or requirements..."
                            rows={3}
                            className="rounded-xl resize-none"
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="flex-1 rounded-2xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 rounded-2xl bg-black hover:bg-gray-900 text-white"
                        >
                            {submitting ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
