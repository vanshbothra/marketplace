import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";

async function createVendor(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // TODO: Call backend API to create vendor
    // For now, just redirect to dashboard
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const categories = formData.get("categories") as string;

    // Placeholder - replace with actual backend API call
    console.log("Creating vendor:", { name, description, contactEmail, contactPhone, categories });

    redirect("/dashboard");
}

export default async function NewVendorPage() {
    const session = await auth();
    // Proxy middleware guarantees authentication, so session is never null

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
                            <h1 className="text-xl font-light tracking-wide text-foreground dark:text-foreground">
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
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-light mb-2 text-foreground dark:text-foreground">Create New Vendor</h2>
                        <p className="text-muted-foreground">
                            Submit your vendor for admin approval. You can create up to 5 vendors.
                        </p>
                    </div>

                    <form action={createVendor} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">Vendor Name *</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., Ashoka Tees"
                                required
                                maxLength={100}
                                className="rounded-xl border-gray-200 focus:border-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Tell us about your vendor..."
                                rows={5}
                                maxLength={1000}
                                className="rounded-xl border-gray-200 focus:border-gray-400"
                            />
                            <p className="text-xs text-muted-foreground/80">
                                Optional, but helps admin understand your vendor better
                            </p>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 dark:bg-black dark:border-black rounded-2xl p-6">
                            <h4 className="font-semibold text-sm mb-2 text-foreground dark:text-foreground">What happens next?</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Your vendor will be submitted for admin review</li>
                                <li>• Approval usually takes 1-2 business days</li>
                                <li>• You'll be able to add listings once approved</li>
                            </ul>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="ghost" asChild className="flex-1 rounded-2xl glass-light">
                                <Link href="/dashboard">Cancel</Link>
                            </Button>
                            <Button type="submit" className="flex-1 rounded-2xl bg-black hover:bg-gray-900 text-white">Create Vendor</Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
