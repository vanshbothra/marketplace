// TypeScript types matching the backend Prisma schema

export type ListingType = "PRODUCT" | "SERVICE";
export type InventoryType = "STOCK" | "ON_DEMAND";
export type OrderStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export interface User {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
    roles: string[];
    isAdmin: boolean;
    isActive: boolean;
    isBlocked: boolean;
    phone?: string;
    address?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Vendor {
    id: string;
    name: string;
    logo: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    categories: string[];
    isActive: boolean;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    owners?: User[];
    members?: User[];
    listings?: Listing[];
}

export interface Listing {
    id: string;
    name: string;
    images: string[];
    description: string;
    type: ListingType;
    inventoryType: InventoryType;
    availableQty?: number;
    isAvailable?: boolean;
    price?: number;
    variants: string[];
    vendorId: string;
    vendor?: Vendor;
    tags?: Tag[];
    reviews?: Review[];
    orders?: Order[];
    wishlistedBy?: User[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Review {
    id: string;
    rating: number;
    comments: string[];
    userId: string;
    user?: User;
    listingId: string;
    listing?: Listing;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Order {
    id: string;
    userId: string;
    user?: User;
    listingId: string;
    listing?: Listing;
    quantity: number;
    totalPrice: number;
    status: OrderStatus;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
