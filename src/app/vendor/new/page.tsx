"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Store, ArrowLeft, Upload, X } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import { useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

function NewVendorContent() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string>(''); // Base64 encoded logo
    const [logoPreview, setLogoPreview] = useState<string>(''); // For preview

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image size must be less than 5MB');
            return;
        }

        try {
            // Compress and convert to base64
            const compressedBase64 = await compressImage(file);
            setLogoImage(compressedBase64);
            setLogoPreview(URL.createObjectURL(file));
            setError(null);
        } catch (error) {
            console.error('Error processing image:', error);
            setError('Failed to process image');
        }

        // Reset input
        e.target.value = '';
    };

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new window.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Resize if image is too large (max 800px for logo)
                    const maxSize = 800;
                    if (width > height && width > maxSize) {
                        height = (height * maxSize) / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width = (width * maxSize) / height;
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new Error('Failed to get canvas context'));
                        return;
                    }

                    // Enable image smoothing for better quality
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                    ctx.drawImage(img, 0, 0, width, height);

                    // Compress to JPEG with 0.95 quality (very high quality for logo)
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.95);
                    resolve(compressedBase64);
                };
                img.onerror = () => reject(new Error('Failed to load image'));
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
        });
    };

    const removeLogo = () => {
        setLogoImage('');
        setLogoPreview('');
    };

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
            logo: logoImage || undefined, // Use uploaded image or undefined
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

                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">
                                Vendor Logo
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Upload a logo for your vendor (optional, max 5MB)
                            </p>

                            {!logoPreview ? (
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="rounded-xl"
                                        id="logo-upload"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => document.getElementById('logo-upload')?.click()}
                                        className="rounded-xl"
                                    >
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden border-2 border-border group">
                                    <Image
                                        src={logoPreview}
                                        alt="Logo preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeLogo}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
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

export default function NewVendorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <NewVendorContent />
        </Suspense>
    );
}
