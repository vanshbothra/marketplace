import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { notFound } from "next/navigation";

async function createListing(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const vendorId = formData.get("vendorId") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const tags = formData.get("tags") as string;
    const type = formData.get("type") as "PRODUCT" | "SERVICE";
    const inventoryType = formData.get("inventoryType") as "STOCK" | "ON_DEMAND";
    const priceStr = formData.get("price") as string;
    const availableQtyStr = formData.get("availableQty") as string;

    const price = priceStr ? parseFloat(priceStr) : null;
    const availableQty = availableQtyStr ? parseInt(availableQtyStr) : undefined;
    const tagsArray = tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : [];

    // TODO: Call backend API to create listing
    console.log("Creating listing:", { vendorId, name, description, tags: tagsArray, type, inventoryType, price, availableQty });

    redirect(`/dashboard/vendors/${vendorId}`);
}

export default async function NewListingPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();
    // Proxy middleware guarantees authentication, so session is never null

    // TODO: Fetch vendor details from backend API
    // Dummy data for now
    const vendor = {
        id: params.id,
        name: "Sample Vendor",
        isVerified: true,
    };

    if (!vendor) {
        notFound();
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
            <main className="container mx-auto px-6 py-12 max-w-2xl">
                <Button asChild variant="ghost" className="mb-8 rounded-2xl">
                    <Link href={`/dashboard/vendors/${params.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-light mb-2 text-foreground">Create New Listing</h2>
                        <p className="text-muted-foreground">
                            Add a new product or service for {vendor.name}
                        </p>
                    </div>

                    <form action={createListing} className="space-y-6">
                        <input type="hidden" name="vendorId" value={params.id} />

                        <div className="space-y-2">
                            <Label htmlFor="name">Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., Ashoka T-Shirt"
                                required
                                maxLength={200}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe your listing..."
                                rows={5}
                                required
                                maxLength={2000}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                name="tags"
                                placeholder="e.g., electronics, new, trending (comma-separated)"
                                maxLength={200}
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional - helps users find your listing
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select name="type" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select listing type" />
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
                                <SelectTrigger>
                                    <SelectValue placeholder="Select inventory type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STOCK">Stock (Limited Quantity)</SelectItem>
                                    <SelectItem value="ON_DEMAND">On Demand (Unlimited)</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                Choose STOCK for limited quantity items, ON_DEMAND for services or unlimited items
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    placeholder="Leave empty if negotiable"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional - leave blank for "Contact for price"
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="availableQty">Available Quantity</Label>
                                <Input
                                    id="availableQty"
                                    name="availableQty"
                                    type="number"
                                    min="0"
                                    placeholder="For STOCK type only"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Only for STOCK inventory type
                                </p>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                            <h4 className="font-semibold text-sm mb-2 text-gray-900">Note</h4>
                            <p className="text-sm text-gray-600">
                                Image upload functionality will be added in a future update. For now, listings will use a default placeholder.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="ghost" asChild className="flex-1 rounded-2xl">
                                <Link href={`/dashboard/vendors/${params.id}`}>Cancel</Link>
                            </Button>
                            <Button type="submit" className="flex-1 rounded-2xl bg-black hover:bg-gray-800 text-white">Create Listing</Button>
                        </div>
                    </form>
                </div>
            </main>
        </div >
    );
}
