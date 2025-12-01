import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const businesses = await prisma.business.findMany({
            where: {
                members: {
                    some: {
                        userId: session.user.id,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
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

        return NextResponse.json(businesses);
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

        // Check business count
        const businessCount = await prisma.businessMember.count({
            where: { userId: session.user.id },
        });

        if (businessCount >= 5) {
            return NextResponse.json({ error: "Maximum business limit reached" }, { status: 400 });
        }

        const body = await request.json();
        const { name, description } = body;

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
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        return NextResponse.json(business, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
