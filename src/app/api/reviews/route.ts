import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const listingId = searchParams.get("listingId");
        const businessId = searchParams.get("businessId");

        const reviews = await prisma.review.findMany({
            where: {
                ...(listingId && { listingId }),
                ...(businessId && { businessId }),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                listing: {
                    select: {
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(reviews);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { listingId, rating, comment } = body;

        // Get listing to get businessId
        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        // Check if user already reviewed this listing
        const existingReview = await prisma.review.findUnique({
            where: {
                listingId_userId: {
                    listingId,
                    userId: session.user.id,
                },
            },
        });

        if (existingReview) {
            return NextResponse.json({ error: "You have already reviewed this listing" }, { status: 400 });
        }

        // Validate rating
        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
        }

        const review = await prisma.review.create({
            data: {
                listingId,
                businessId: listing.businessId,
                userId: session.user.id,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
            },
        });

        return NextResponse.json(review, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
