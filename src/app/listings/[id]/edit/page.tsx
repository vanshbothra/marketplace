"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

function EditListingContent() {
    const params = useParams();
    const router = useRouter();
    const listingId = params.id as string;

    const [listing, setListing] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchListing() {
            try {
                const response = await fetch(`${BACKEND_URL}/listings/${listingId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    router.push('/marketplace');
                    return;
                }

                const data = await response.json();
                if (data.success && data.data) {
                    setListing(data.data);
                } else {
                    router.push('/marketplace');
                }
            } catch (err) {
                console.error('Error fetching listing:', err);
                setError('Failed to load listing');
            } finally {
                setLoading(false);
            }
        }

        fetchListing();
    }, [listingId, router]);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const variants = (formData.get('variants') as string)
            .split(',')
            .map(v => v.trim())
            .filter(v => v.length > 0);

        const tags = (formData.get('tags') as string)
            .split(',')
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const images = (formData.get('images') as string)
            .split(',')
            .map(i => i.trim())
            .filter(i => i.length > 0);

        const updateData = {
            name: formData.get('name'),
            description: formData.get('description'),
            type: formData.get('type'),
            inventoryType: formData.get('inventoryType'),
            price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
            availableQty: formData.get('availableQty') ? parseInt(formData.get('availableQty') as string) : null,
            isAvailable: formData.get('isAvailable') === 'on',
            managed: formData.get('managed') === 'on',
            images: images.length > 0 ? images : listing.images,
            variants: variants.length > 0 ? variants : [],
            tags: tags.length > 0 ? tags : [],
        };

        try {
            const response = await fetch(`${BACKEND_URL}/vendors/${listing.vendorId}/listings/${listingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(updateData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update listing');
            }

            router.push(`/marketplace/${listingId}`);
        } catch (err: any) {
            console.error('Error updating listing:', err);

            if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
                setError(`Cannot connect to backend server at ${BACKEND_URL}. Please ensure the backend is running.`);
            } else {
                setError(err.message || 'Failed to update listing');
            }
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!listing) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-soft">

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <Button asChild variant="ghost" className="mb-8 rounded-2xl">
                    <Link href={`/marketplace/${listingId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Listing
                    </Link>
                </Button>

                <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-light mb-2 text-foreground">Edit Listing</h2>
                        <p className="text-muted-foreground">
                            Update listing details for {listing.vendor?.name}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Listing Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={listing.name}
                                placeholder="e.g., Vintage T-Shirt"
                                required
                                maxLength={100}
                                className="rounded-xl"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={listing.description}
                                placeholder="Describe your listing..."
                                rows={4}
                                required
                                maxLength={1000}
                                className="rounded-xl resize-none"
                            />
                        </div>

                        {/* Type and Inventory Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="type">Type *</Label>
                                <Select name="type" defaultValue={listing.type}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRODUCT">Product</SelectItem>
                                        <SelectItem value="SERVICE">Service</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="inventoryType">Inventory Type *</Label>
                                <Select name="inventoryType" defaultValue={listing.inventoryType}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue placeholder="Select inventory type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="STOCK">In Stock</SelectItem>
                                        <SelectItem value="ON_DEMAND">On Demand</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Price and Available Quantity */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    defaultValue={listing.price?.toString() || ''}
                                    placeholder="0.00"
                                    className="rounded-xl"
                                />
                                <p className="text-xs text-muted-foreground">Leave empty if price varies</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="availableQty">Available Quantity</Label>
                                <Input
                                    id="availableQty"
                                    name="availableQty"
                                    type="number"
                                    min="0"
                                    defaultValue={listing.availableQty?.toString() || ''}
                                    placeholder="0"
                                    className="rounded-xl"
                                />
                                <p className="text-xs text-muted-foreground">For stock-based items</p>
                            </div>
                        </div>

                        {/* Is Available */}
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="isAvailable"
                                name="isAvailable"
                                defaultChecked={listing.isAvailable !== false}
                            />
                            <Label htmlFor="isAvailable" className="cursor-pointer">
                                Available for purchase
                            </Label>
                        </div>

                        {/* Managed */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="managed"
                                    name="managed"
                                    defaultChecked={listing.managed === true}
                                />
                                <Label htmlFor="managed" className="cursor-pointer">
                                    Enable order management
                                </Label>
                            </div>
                            <p className="text-xs text-muted-foreground ml-6">
                                Allow users to place orders directly through the marketplace. Requires vendor UPI ID for payments.
                                If disabled, users will only see contact information.
                            </p>
                        </div>

                        {/* Images */}
                        <div className="space-y-2">
                            <Label htmlFor="images">Images (comma-separated URLs)</Label>
                            <Textarea
                                id="images"
                                name="images"
                                defaultValue={listing.images?.join(', ') || ''}
                                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                                rows={2}
                                className="rounded-xl resize-none"
                            />
                        </div>

                        {/* Variants */}
                        <div className="space-y-2">
                            <Label htmlFor="variants">Variants</Label>
                            <Input
                                id="variants"
                                name="variants"
                                defaultValue={listing.variants?.join(', ') || ''}
                                placeholder="e.g., S, M, L, XL"
                                className="rounded-xl"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated values</p>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                name="tags"
                                defaultValue={listing.tags?.map((t: any) => t.name).join(', ') || ''}
                                placeholder="e.g., electronics, new, trending"
                                className="rounded-xl"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated tags</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                className="flex-1 rounded-2xl glass-light"
                            >
                                <Link href={`/marketplace/${listingId}`}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 rounded-2xl bg-black hover:bg-gray-900 text-white"
                            >
                                {submitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default function EditListingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <EditListingContent />
        </Suspense>
    );
}
