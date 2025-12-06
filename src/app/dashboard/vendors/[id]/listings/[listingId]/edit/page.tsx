import { auth } from "@/lib/auth";
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
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { notFound } from "next/navigation";

export default async function EditListingPage({
    params,
}: {
    params: Promise<{ id: string; listingId: string }>;
}) {
    const session = await auth();
    const { id, listingId } = await params;

    // TODO: Fetch vendor and listing from backend API
    // Dummy data for now
    const vendor = {
        id: id,
        name: "Sample Vendor",
        isVerified: true,
    };

    const listing = {
        id: listingId,
        name: "Sample Product",
        description: "This is a sample product description.",
        type: "PRODUCT" as const,
        inventoryType: "STOCK" as const,
        availableQty: 10,
        price: 100,
        variants: ["S", "M", "L", "XL"],
        tags: [
            { id: "1", name: "electronics" },
            { id: "2", name: "new" },
        ],
    };

    if (!vendor || !listing) {
        notFound();
    }

    // TODO: Implement actual update listing server action
    async function updateListing(formData: FormData) {
        "use server";
        console.log("Update listing:", Object.fromEntries(formData));
        // Redirect back to listing detail page
    }

    return (
        <div className="min-h-screen bg-gradient-soft">
            {/* Header */}
            <header className="glass border-b border-white/20 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
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
                    <UserNav user={session!.user} />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <Button asChild variant="ghost" className="mb-8 rounded-2xl">
                    <Link href={`/marketplace/${listingId}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-light mb-2 text-foreground">Edit Listing</h2>
                        <p className="text-muted-foreground">
                            Update listing details for {vendor.name}
                        </p>
                    </div>

                    <form action={updateListing} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-foreground">Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={listing.name}
                                placeholder="e.g., Calculus Textbook"
                                required
                                maxLength={100}
                                className="rounded-xl border-border focus:border-ring"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-foreground">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={listing.description}
                                placeholder="Describe your listing..."
                                rows={4}
                                maxLength={500}
                                className="rounded-xl border-border focus:border-ring resize-none"
                            />
                        </div>

                        {/* Type */}
                        <div className="space-y-2">
                            <Label htmlFor="type" className="text-sm font-medium text-foreground">Type *</Label>
                            <Select name="type" defaultValue={listing.type}>
                                <SelectTrigger className="rounded-xl border-border">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PRODUCT">Product</SelectItem>
                                    <SelectItem value="SERVICE">Service</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Inventory Type */}
                        <div className="space-y-2">
                            <Label htmlFor="inventoryType" className="text-sm font-medium text-foreground">Inventory Type *</Label>
                            <Select name="inventoryType" defaultValue={listing.inventoryType}>
                                <SelectTrigger className="rounded-xl border-border">
                                    <SelectValue placeholder="Select inventory type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STOCK">Stock-based</SelectItem>
                                    <SelectItem value="ON_DEMAND">On Demand</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-sm font-medium text-foreground">Price (₹)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                defaultValue={listing.price}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">Leave empty if price varies or contact required</p>
                        </div>

                        {/* Available Quantity */}
                        <div className="space-y-2">
                            <Label htmlFor="availableQty" className="text-sm font-medium text-foreground">Available Quantity</Label>
                            <Input
                                id="availableQty"
                                name="availableQty"
                                type="number"
                                defaultValue={listing.availableQty}
                                placeholder="0"
                                min="0"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">For stock-based inventory only</p>
                        </div>

                        {/* Variants */}
                        <div className="space-y-2">
                            <Label htmlFor="variants" className="text-sm font-medium text-foreground">Variants</Label>
                            <Input
                                id="variants"
                                name="variants"
                                defaultValue={listing.variants.join(", ")}
                                placeholder="e.g., S, M, L, XL"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated values (e.g., sizes, colors)</p>
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="text-sm font-medium text-foreground">Tags</Label>
                            <Input
                                id="tags"
                                name="tags"
                                defaultValue={listing.tags.map(t => t.name).join(", ")}
                                placeholder="e.g., electronics, new, trending"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated tags to help users find your listing</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="ghost" asChild className="flex-1 rounded-2xl glass-light">
                                <Link href={`/marketplace/${listingId}`}>Cancel</Link>
                            </Button>
                            <Button type="submit" className="flex-1 rounded-2xl bg-black hover:bg-gray-900 text-white">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
