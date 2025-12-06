import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { notFound } from "next/navigation";

export default async function EditVendorPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const session = await auth();
    const { id } = await params;

    // TODO: Fetch vendor from backend API and check if user is owner
    // Dummy data for now
    const vendor = {
        id: id,
        name: "Sample Vendor",
        logo: "/placeholder-logo.png",
        description: "This is a sample vendor. Replace with backend API call.",
        contactEmail: "vendor@ashoka.edu.in",
        contactPhone: "+1234567890",
        categories: ["PRODUCT", "SERVICE"],
    };

    if (!vendor) {
        notFound();
    }

    // TODO: Implement actual update vendor server action
    async function updateVendor(formData: FormData) {
        "use server";
        console.log("Update vendor:", Object.fromEntries(formData));
        // Redirect back to vendor page
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
                    <Link href={`/vendor/${id}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-light mb-2 text-foreground">Edit Vendor</h2>
                        <p className="text-muted-foreground">
                            Update your vendor information
                        </p>
                    </div>

                    <form action={updateVendor} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-foreground">Vendor Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={vendor.name}
                                placeholder="e.g., Tech Store"
                                required
                                maxLength={100}
                                className="rounded-xl border-border focus:border-ring"
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-foreground">Description *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                defaultValue={vendor.description}
                                placeholder="Describe your business..."
                                rows={4}
                                required
                                maxLength={500}
                                className="rounded-xl border-border focus:border-ring resize-none"
                            />
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground">Contact Email *</Label>
                            <Input
                                id="contactEmail"
                                name="contactEmail"
                                type="email"
                                defaultValue={vendor.contactEmail}
                                placeholder="contact@ashoka.edu.in"
                                required
                                className="rounded-xl border-border focus:border-ring"
                            />
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">Contact Phone *</Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                type="tel"
                                defaultValue={vendor.contactPhone}
                                placeholder="+1234567890"
                                required
                                className="rounded-xl border-border focus:border-ring"
                            />
                        </div>

                        {/* Logo URL */}
                        <div className="space-y-2">
                            <Label htmlFor="logo" className="text-sm font-medium text-foreground">Logo URL</Label>
                            <Input
                                id="logo"
                                name="logo"
                                type="url"
                                defaultValue={vendor.logo}
                                placeholder="https://example.com/logo.png"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">Optional: Provide a URL to your vendor logo</p>
                        </div>

                        {/* Categories */}
                        <div className="space-y-2">
                            <Label htmlFor="categories" className="text-sm font-medium text-foreground">Categories</Label>
                            <Input
                                id="categories"
                                name="categories"
                                defaultValue={vendor.categories.join(", ")}
                                placeholder="e.g., PRODUCT, SERVICE"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">Comma-separated values (PRODUCT, SERVICE, etc.)</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="ghost" asChild className="flex-1 rounded-2xl glass-light">
                                <Link href={`/vendor/${id}`}>Cancel</Link>
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
