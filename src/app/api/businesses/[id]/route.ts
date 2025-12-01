import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const business = await prisma.business.findUnique({
            where: { id: params.id },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
                listings: {
                    include: {
                        reviews: true,
                    },
                },
                _count: {
                    select: {
                        listings: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!business) {
            return NextResponse.json({ error: "Business not found" }, { status: 404 });
        }

        return NextResponse.json(business);
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

        const body = await request.json();
        const { status } = body;

        // Only admins can update business status
        if (status && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Verify user is a member for other updates
        if (!status) {
            const member = await prisma.businessMember.findFirst({
                where: {
                    businessId: params.id,
                    userId: session.user.id,
                },
            });

            if (!member) {
                return NextResponse.json({ error: "Forbidden" }, { status: 403 });
            }
        }

        const business = await prisma.business.update({
            where: { id: params.id },
            data: body,
        });

        return NextResponse.json(business);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
