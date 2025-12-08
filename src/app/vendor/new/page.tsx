"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Store, ArrowLeft } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { useRouter } from "next/navigation";
import { useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function NewVendorPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const categories = (formData.get('categories') as string)
            .split(',')
            .map(c => c.trim())
            .filter(c => c.length > 0);

        const vendorData = {
            name: formData.get('name'),
            description: formData.get('description'),
            contactEmail: formData.get('contactEmail'),
            contactPhone: formData.get('contactPhone'),
            upiId: formData.get('upiId'),
            paymentInformation: formData.get('paymentInformation'),
            logo: formData.get('logo') || undefined,
            categories: categories.length > 0 ? categories : ['PRODUCT'],
        };

        try {
            const response = await fetch(`${BACKEND_URL}/vendors/me`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(vendorData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create vendor');
            }

            // Redirect to the new vendor page
            router.push(`/vendor/${data.data.id}`);
        } catch (err: any) {
            console.error('Error creating vendor:', err);

            // Provide helpful error messages
            if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
                setError(`Cannot connect to backend server at ${BACKEND_URL}. Please ensure the backend is running.`);
            } else {
                setError(err.message || 'Failed to create vendor');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-soft">

            {/* Main Content */}
            <main className="container mx-auto px-6 py-12 max-w-3xl">
                <Button asChild variant="ghost" className="mb-8 rounded-2xl">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go back
                    </Link>
                </Button>

                <div className="glass-card rounded-3xl p-10 shadow-soft border-0">
                    <div className="mb-8">
                        <h2 className="text-3xl font-light mb-2 text-foreground">Create New Vendor</h2>
                        <p className="text-muted-foreground">
                            Set up your business on Ashoka Marketplace
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
                            <Label htmlFor="name" className="text-sm font-medium text-foreground">
                                Vendor Name *
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g., Tech Store"
                                required
                                maxLength={100}
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Choose a unique name for your business
                            </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-medium text-foreground">
                                Description *
                            </Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Describe your business..."
                                rows={4}
                                required
                                maxLength={500}
                                className="rounded-xl border-border focus:border-ring resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Tell customers what makes your business special
                            </p>
                        </div>

                        {/* Contact Email */}
                        <div className="space-y-2">
                            <Label htmlFor="contactEmail" className="text-sm font-medium text-foreground">
                                Contact Email *
                            </Label>
                            <Input
                                id="contactEmail"
                                name="contactEmail"
                                type="email"
                                placeholder="contact@ashoka.edu.in"
                                required
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email address for customer inquiries
                            </p>
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="contactPhone" className="text-sm font-medium text-foreground">
                                Contact Phone *
                            </Label>
                            <Input
                                id="contactPhone"
                                name="contactPhone"
                                type="tel"
                                placeholder="+1234567890"
                                required
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Phone number for customer support
                            </p>
                        </div>

                        {/* UPI ID */}
                        <div className="space-y-2">
                            <Label htmlFor="upiId" className="text-sm font-medium text-foreground">
                                UPI ID *
                            </Label>
                            <Input
                                id="upiId"
                                name="upiId"
                                type="text"
                                placeholder="UPI ID"
                                required
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                UPI ID for payment processing
                            </p>
                        </div>

                        {/* Payment Information */}
                        <div className="space-y-2">
                            <Label htmlFor="paymentInformation" className="text-sm font-medium text-foreground">
                                Payment Information *
                            </Label>
                            <Textarea
                                id="paymentInformation"
                                name="paymentInformation"
                                placeholder="Payment information..."
                                rows={4}
                                required
                                maxLength={500}
                                className="rounded-xl border-border focus:border-ring resize-none"
                            />
                            <p className="text-xs text-muted-foreground">
                                Payment information for processing payments
                            </p>
                        </div>

                        {/* Logo URL */}
                        <div className="space-y-2">
                            <Label htmlFor="logo" className="text-sm font-medium text-foreground">
                                Logo URL
                            </Label>
                            <Input
                                id="logo"
                                name="logo"
                                type="url"
                                placeholder="https://example.com/logo.png"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional: Provide a URL to your vendor logo
                            </p>
                        </div>

                        {/* Categories */}
                        <div className="space-y-2">
                            <Label htmlFor="categories" className="text-sm font-medium text-foreground">
                                Categories
                            </Label>
                            <Input
                                id="categories"
                                name="categories"
                                defaultValue="PRODUCT"
                                placeholder="e.g., PRODUCT, SERVICE"
                                className="rounded-xl border-border focus:border-ring"
                            />
                            <p className="text-xs text-muted-foreground">
                                Comma-separated values (PRODUCT, SERVICE, etc.)
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                asChild
                                className="flex-1 rounded-2xl glass-light"
                            >
                                <Link href="/dashboard">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 rounded-2xl bg-black hover:bg-gray-900 text-white"
                            >
                                {submitting ? 'Creating...' : 'Create Vendor'}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
