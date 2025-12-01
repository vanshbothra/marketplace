import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";

async function createBusiness(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Check business count
    const businessCount = await prisma.businessMember.count({
        where: { userId: session.user.id },
    });

    if (businessCount >= 5) {
        throw new Error("Maximum business limit reached");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    const business = await prisma.business.create({
        data: {
            name,
            description,
            status: "PENDING",
            members: {
                create: {
                    userId: session.user.id,
                    role: "OWNER",
                },
            },
        },
    });

    redirect(`/dashboard/businesses/${business.id}`);
}

export default async function NewBusinessPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin");
    }

    // Check if user can create more businesses
    const businessCount = await prisma.businessMember.count({
        where: { userId: session.user.id },
    });

    if (businessCount >= 5) {
        redirect("/dashboard");
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
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>

                <Card>
                    <CardHeader>
                        <CardTitle>Create New Business</CardTitle>
                        <CardDescription>
                            Submit your business for admin approval. You can create up to 5 businesses.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={createBusiness} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Business Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., Ashoka Tees"
                                    required
                                    maxLength={100}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Tell us about your business..."
                                    rows={5}
                                    maxLength={1000}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional, but helps admin understand your business better
                                </p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-sm mb-2">What happens next?</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Your business will be submitted for admin review</li>
                                    <li>• Approval usually takes 1-2 business days</li>
                                    <li>• You'll be able to add listings once approved</li>
                                </ul>
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" className="flex-1">Create Business</Button>
                                <Button type="button" variant="outline" asChild className="flex-1">
                                    <Link href="/dashboard">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
