"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Store, Check, X, Mail, Phone, Users, Package } from "lucide-react";
import { UserNav } from "@/components/user-nav";
import Link from "next/link";
import Image from "next/image";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

interface Vendor {
    id: string;
    name: string;
    logo: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    paymentInformation?: string;
    upiId?: string;
    categories: string[];
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    owners: Array<{
        id: string;
        name: string;
        email: string;
    }>;
    members: Array<{
        id: string;
        name: string;
        email: string;
    }>;
    listings: Array<{
        id: string;
        name: string;
    }>;
}

export default function AdminPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPendingVendors();
    }, []);

    const fetchPendingVendors = async () => {
        try {
            const response = await fetch(`${BACKEND_URL}/admin/vendors/pending`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending vendors');
            }

            const data = await response.json();
            if (data.success && data.data) {
                setVendors(data.data);
            }
        } catch (err: any) {
            console.error('Error fetching pending vendors:', err);
            setError(err.message || 'Failed to load pending vendors');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (vendorId: string) => {
        setProcessing(true);
        try {
            const response = await fetch(`${BACKEND_URL}/admin/vendors/${vendorId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ isVerified: true }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to approve vendor');
            }

            // Remove from list and close modal
            setVendors(vendors.filter(v => v.id !== vendorId));
            setSelectedVendor(null);
        } catch (err: any) {
            console.error('Error approving vendor:', err);
            alert(err.message || 'Failed to approve vendor');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async (vendorId: string) => {
        setProcessing(true);
        try {
            const response = await fetch(`${BACKEND_URL}/admin/vendors/${vendorId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ isVerified: false }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to reject vendor');
            }

            // Remove from list and close modal
            setVendors(vendors.filter(v => v.id !== vendorId));
            setSelectedVendor(null);
        } catch (err: any) {
            console.error('Error rejecting vendor:', err);
            alert(err.message || 'Failed to reject vendor');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-soft">
                <header className="border-b bg-white dark:bg-black border-black/20 dark:border-white/20 w-screen fixed top-0 z-50">
                    <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="p-2 rounded-2xl bg-black dark:bg-white">
                                    <Store className="h-5 w-5 text-white dark:text-black" />
                                </div>
                                <h1 className="text-xl font-light tracking-wide text-foreground">
                                    Admin Panel
                                </h1>
                            </Link>
                        </div>
                        <UserNav />
                    </div>
                </header>

                <main className="container mx-auto px-4 sm:px-6 py-8 pt-24">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Loading pending vendors...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-soft">
            <header className="border-b bg-white dark:bg-black border-black/20 dark:border-white/20 w-screen fixed top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="p-2 rounded-2xl bg-black dark:bg-white">
                                <Store className="h-5 w-5 text-white dark:text-black" />
                            </div>
                            <h1 className="text-xl font-light tracking-wide text-foreground">
                                Admin Panel
                            </h1>
                        </Link>
                    </div>
                    <UserNav />
                </div>
            </header>

            <main className="container mx-auto px-4 sm:px-6 py-8 pt-24">
                <div className="mb-8">
                    <h2 className="text-3xl font-light text-foreground mb-2">Pending Vendor Approvals</h2>
                    <p className="text-muted-foreground">
                        Review and approve vendor applications
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl">
                        <p className="text-red-800 dark:text-red-200">{error}</p>
                    </div>
                )}

                {vendors.length === 0 ? (
                    <div className="glass-card rounded-3xl p-12 text-center">
                        <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-2xl font-light mb-2 text-foreground">No Pending Vendors</h3>
                        <p className="text-muted-foreground">
                            All vendor applications have been reviewed
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {vendors.map((vendor) => (
                            <div
                                key={vendor.id}
                                className="glass-card rounded-3xl p-6 shadow-soft hover:shadow-lg transition-all cursor-pointer"
                                onClick={() => setSelectedVendor(vendor)}
                            >
                                {/* Logo */}
                                <div className="w-20 h-20 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden mb-4 flex items-center justify-center">
                                    {vendor.logo ? (
                                        <Image
                                            src={vendor.logo}
                                            alt={vendor.name}
                                            width={80}
                                            height={80}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <Store className="h-10 w-10 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Vendor Info */}
                                <h3 className="text-xl font-medium text-foreground mb-2">{vendor.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {vendor.description}
                                </p>

                                {/* Categories */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {vendor.categories.slice(0, 2).map((category) => (
                                        <Badge key={category} variant="secondary" className="rounded-full">
                                            {category}
                                        </Badge>
                                    ))}
                                    {vendor.categories.length > 2 && (
                                        <Badge variant="secondary" className="rounded-full">
                                            +{vendor.categories.length - 2}
                                        </Badge>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        <span>{vendor.owners.length + vendor.members.length}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Package className="h-4 w-4" />
                                        <span>{vendor.listings.length}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2 mt-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1 rounded-2xl"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedVendor(vendor);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Vendor Detail Modal */}
            <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-gradient-soft">
                    {selectedVendor && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-light">Vendor Details</DialogTitle>
                                <DialogDescription>
                                    Review vendor information before approval
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 mt-4">
                                {/* Logo and Name */}
                                <div className="flex items-center gap-4">
                                    <div className="w-20 h-20 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
                                        {selectedVendor.logo ? (
                                            <Image
                                                src={selectedVendor.logo}
                                                alt={selectedVendor.name}
                                                width={80}
                                                height={80}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Store className="h-10 w-10 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-medium text-foreground">{selectedVendor.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Created {new Date(selectedVendor.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="font-medium text-foreground mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground">{selectedVendor.description}</p>
                                </div>

                                {/* Categories */}
                                <div>
                                    <h4 className="font-medium text-foreground mb-2">Categories</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedVendor.categories.map((category) => (
                                            <Badge key={category} variant="secondary" className="rounded-full">
                                                {category}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="glass-card rounded-2xl p-4 space-y-3">
                                    <h4 className="font-medium text-foreground">Contact Information</h4>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">{selectedVendor.contactEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-foreground">{selectedVendor.contactPhone}</span>
                                    </div>
                                </div>

                                {/* Payment Information */}
                                {selectedVendor.upiId && (
                                    <div className="glass-card rounded-2xl p-4">
                                        <h4 className="font-medium text-foreground mb-2">Payment Information</h4>
                                        <p className="text-sm text-muted-foreground mb-1">UPI ID:</p>
                                        <p className="text-sm font-mono text-foreground">{selectedVendor.upiId}</p>
                                        {selectedVendor.paymentInformation && (
                                            <>
                                                <p className="text-sm text-muted-foreground mt-3 mb-1">Additional Info:</p>
                                                <p className="text-sm text-foreground">{selectedVendor.paymentInformation}</p>
                                            </>
                                        )}
                                    </div>
                                )}

                                {/* Owners */}
                                <div>
                                    <h4 className="font-medium text-foreground mb-2">Owners</h4>
                                    <div className="space-y-2">
                                        {selectedVendor.owners.map((owner) => (
                                            <div key={owner.id} className="flex items-center gap-2 text-sm">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <span className="text-xs font-medium">{owner.name.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <p className="text-foreground font-medium">{owner.name}</p>
                                                    <p className="text-xs text-muted-foreground">{owner.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Members */}
                                {selectedVendor.members.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">Members</h4>
                                        <div className="space-y-2">
                                            {selectedVendor.members.map((member) => (
                                                <div key={member.id} className="flex items-center gap-2 text-sm">
                                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                                        <span className="text-xs font-medium">{member.name.charAt(0)}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-foreground font-medium">{member.name}</p>
                                                        <p className="text-xs text-muted-foreground">{member.email}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Listings */}
                                {selectedVendor.listings.length > 0 && (
                                    <div>
                                        <h4 className="font-medium text-foreground mb-2">
                                            Listings ({selectedVendor.listings.length})
                                        </h4>
                                        <div className="space-y-1">
                                            {selectedVendor.listings.slice(0, 5).map((listing) => (
                                                <p key={listing.id} className="text-sm text-muted-foreground">
                                                    • {listing.name}
                                                </p>
                                            ))}
                                            {selectedVendor.listings.length > 5 && (
                                                <p className="text-sm text-muted-foreground">
                                                    ... and {selectedVendor.listings.length - 5} more
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-2xl"
                                        onClick={() => handleReject(selectedVendor.id)}
                                        disabled={processing}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        className="flex-1 rounded-2xl bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleApprove(selectedVendor.id)}
                                        disabled={processing}
                                    >
                                        <Check className="mr-2 h-4 w-4" />
                                        {processing ? 'Processing...' : 'Approve'}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
