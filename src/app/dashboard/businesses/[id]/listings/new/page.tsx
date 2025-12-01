import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

    const businessId = formData.get("businessId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const type = formData.get("type") as "PRODUCT" | "SERVICE" | "FOOD";
    const priceStr = formData.get("price") as string;
    const stockStr = formData.get("stock") as string;

    const price = priceStr ? parseFloat(priceStr) : null;
    const stock = stockStr ? parseInt(stockStr) : null;

    // Verify user is a member of the business
    const businessMember = await prisma.businessMember.findFirst({
        where: {
            businessId,
            userId: session.user.id,
        },
        include: {
            business: true,
        },
    });

    if (!businessMember || businessMember.business.status !== "APPROVED") {
        throw new Error("Unauthorized or business not approved");
    }

    await prisma.listing.create({
        data: {
            businessId,
            title,
            description,
            type,
            price,
            stock,
            images: [],
            isAvailable: true,
        },
    });

    redirect(`/dashboard/businesses/${businessId}`);
}

export default async function NewListingPage({
    params,
}: {
    params: { id: string };
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Verify user is a member and business is approved
    const businessMember = await prisma.businessMember.findFirst({
        where: {
            businessId: params.id,
            userId: session.user.id,
        },
        include: {
            business: true,
        },
    });

    if (!businessMember) {
        notFound();
    }

    if (businessMember.business.status !== "APPROVED") {
        redirect(`/dashboard/businesses/${params.id}`);
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2">
                            <Store className="h-6 w-6 text-purple-600" />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Ashoka Marketplace
                            </h1>
                        </Link>
                    </div>
                    <UserNav user={session.user} />
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <Button asChild variant="ghost" className="mb-4">
                    <Link href={`/dashboard/businesses/${params.id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Business
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Listing</CardTitle>
                        <CardDescription>
                            Add a new product, service, or food item for {businessMember.business.name}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createListing} className="space-y-6">
                            <input type="hidden" name="businessId" value={params.id} />

                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    name="title"
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
                                <Label htmlFor="type">Type *</Label>
                                <Select name="type" required>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select listing type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PRODUCT">Product</SelectItem>
                                        <SelectItem value="SERVICE">Service</SelectItem>
                                        <SelectItem value="FOOD">Food</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    <Label htmlFor="stock">Stock</Label>
                                    <Input
                                        id="stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        placeholder="Leave empty if not applicable"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Optional - for limited quantity items
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-2">Note</h4>
                                <p className="text-sm text-muted-foreground">
                                    Image upload functionality will be added in a future update. For now, listings will use a default placeholder.
                                </p>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" className="flex-1">Create Listing</Button>
                                <Button type="button" variant="outline" asChild className="flex-1">
                                    <Link href={`/dashboard/businesses/${params.id}`}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
