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
import { useState, useEffect } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function NewListingPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.id as string;

    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [variantInput, setVariantInput] = useState("");
    const [variants, setVariants] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => {
        async function fetchVendor() {
            try {
                const response = await fetch(`${BACKEND_URL}/vendors/me/${vendorId}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    router.push('/dashboard');
                    return;
                }

                const data = await response.json();
                if (data.success && data.data) {
                    setVendor(data.data);
                } else {
                    router.push('/dashboard');
                }
            } catch (err) {
                console.error('Error fetching vendor:', err);
                setError('Failed to load vendor');
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        }

        fetchVendor();
    }, [vendorId, router]);

    const addVariant = () => {
        if (variantInput.trim() && !variants.includes(variantInput.trim())) {
            setVariants([...variants, variantInput.trim()]);
            setVariantInput("");
        }
    };

    const removeVariant = (variant: string) => {
        setVariants(variants.filter(v => v !== variant));
    };

    const addImage = () => {
        if (imageInput.trim() && !images.includes(imageInput.trim())) {
            setImages([...images, imageInput.trim()]);
            setImageInput("");
        }
    };

    const removeImage = (image: string) => {
        setImages(images.filter(i => i !== image));
    };

    const addTag = () => {
        if (tagInput.trim() && !tags.includes(tagInput.trim())) {
            setTags([...tags, tagInput.trim()]);
            setTagInput("");
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const listingData = {
            name: formData.get('name'),
            description: formData.get('description'),
            type: formData.get('type'),
            inventoryType: formData.get('inventoryType'),
            price: formData.get('price') ? parseFloat(formData.get('price') as string) : null,
            availableQty: formData.get('availableQty') ? parseInt(formData.get('availableQty') as string) : null,
            isAvailable: formData.get('isAvailable') === 'on',
            managed: formData.get('managed') === 'on',
            images,
            variants,
            tags,
        };

        try {
            const response = await fetch(`${BACKEND_URL}/vendors/${vendorId}/listings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(listingData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create listing');
            }

            router.push(`/marketplace/${data.data.id}`);
        } catch (err: any) {
            console.error('Error creating listing:', err);

            if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
                setError(`Cannot connect to backend server at ${BACKEND_URL}. Please ensure the backend is running.`);
            } else {
                setError(err.message || 'Failed to create listing');
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

    if (!vendor) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-soft">

            <main className="container mx-auto px-6 py-12 max-w-4xl">
                <Button asChild variant="ghost" className="mb-8 rounded-2xl">
                    <Link href={`/vendor/${vendorId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Vendor
                    </Link>
                </Button>

                <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-light mb-2 text-foreground">Create New Listing</h2>
                        <p className="text-muted-foreground">
                            Add a new product or service for {vendor.name}
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
                                <Select name="type" required>
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
                                <Select name="inventoryType" required>
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
                                    placeholder="0"
                                    className="rounded-xl"
                                />
                                <p className="text-xs text-muted-foreground">For stock-based items</p>
                            </div>
                        </div>

                        {/* Is Available */}
                        <div className="flex items-center space-x-2">
                            <Checkbox id="isAvailable" name="isAvailable" defaultChecked />
                            <Label htmlFor="isAvailable" className="cursor-pointer">
                                Available for purchase
                            </Label>
                        </div>

                        {/* Managed */}
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="managed" name="managed" />
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
                            <Label>Images</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={imageInput}
                                    onChange={(e) => setImageInput(e.target.value)}
                                    placeholder="Image URL"
                                    className="rounded-xl"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                                />
                                <Button type="button" onClick={addImage} className="rounded-xl">
                                    Add
                                </Button>
                            </div>
                            {images.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {images.map((image, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                                            <span className="text-sm truncate max-w-[200px]">{image}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeImage(image)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Variants */}
                        <div className="space-y-2">
                            <Label>Variants</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={variantInput}
                                    onChange={(e) => setVariantInput(e.target.value)}
                                    placeholder="e.g., Small, Medium, Large"
                                    className="rounded-xl"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                                />
                                <Button type="button" onClick={addVariant} className="rounded-xl">
                                    Add
                                </Button>
                            </div>
                            {variants.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {variants.map((variant, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                                            <span className="text-sm">{variant}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeVariant(variant)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    placeholder="e.g., electronics, new"
                                    className="rounded-xl"
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                                />
                                <Button type="button" onClick={addTag} className="rounded-xl">
                                    Add
                                </Button>
                            </div>
                            {tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map((tag, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                                            <span className="text-sm">{tag}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                className="flex-1 rounded-2xl glass-light"
                            >
                                <Link href={`/vendor/${vendorId}`}>Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 rounded-2xl bg-black hover:bg-gray-900 text-white"
                            >
                                {submitting ? 'Creating...' : 'Create Listing'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
