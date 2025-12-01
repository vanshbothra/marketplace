import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const listing = await prisma.listing.findUnique({
            where: { id: params.id },
            include: {
                business: {
                    include: {
                        members: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                reviews: {
                    include: {
                        user: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                },
            },
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        return NextResponse.json(listing);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: params.id },
            include: {
                business: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        // Verify user is a member of the business
        const isMember = listing.business.members.some((m: typeof listing.business.members[0]) => m.userId === session.user.id);

        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();

        const updatedListing = await prisma.listing.update({
            where: { id: params.id },
            data: body,
        });

        return NextResponse.json(updatedListing);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: params.id },
            include: {
                business: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!listing) {
            return NextResponse.json({ error: "Listing not found" }, { status: 404 });
        }

        // Verify user is a member of the business
        const isMember = listing.business.members.some((m: typeof listing.business.members[0]) => m.userId === session.user.id);

        if (!isMember) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.listing.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
