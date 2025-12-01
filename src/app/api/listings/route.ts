import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");
        const type = searchParams.get("type");
        const businessId = searchParams.get("businessId");

        const listings = await prisma.listing.findMany({
            where: {
                isAvailable: true,
                ...(businessId && { businessId }),
                ...(search && {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { description: { contains: search, mode: "insensitive" } },
                    ],
                }),
                ...(type && { type: type as any }),
            },
            include: {
                business: {
                    select: {
                        name: true,
                        logo: true,
                        status: true,
                    },
                },
                reviews: {
                    select: {
                        rating: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 100,
        });

        return NextResponse.json(listings);
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
        const { businessId, title, description, type, price, stock, images } = body;

        // Verify user is a member of the business
        const member = await prisma.businessMember.findFirst({
            where: {
                businessId,
                userId: session.user.id,
            },
            include: {
                business: true,
            },
        });

        if (!member || member.business.status !== "APPROVED") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const listing = await prisma.listing.create({
            data: {
                businessId,
                title,
                description,
                type,
                price: price ? parseFloat(price) : null,
                stock: stock ? parseInt(stock) : null,
                images: images || [],
                isAvailable: true,
            },
            include: {
                business: true,
            },
        });

        return NextResponse.json(listing, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
