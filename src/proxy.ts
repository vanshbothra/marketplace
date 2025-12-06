import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
    const { nextUrl } = req;
    const isAuthenticated = !!req.auth;

    // Public routes that don't require authentication
    const publicRoutes = ["/auth/signin", "/auth/error"];
    const isPublicRoute = publicRoutes.some((route) => nextUrl.pathname.startsWith(route));

    // Redirect unauthenticated users to sign-in page
    if (!isAuthenticated && !isPublicRoute) {
        return NextResponse.redirect(new URL("/auth/signin", nextUrl));
    }

    // Redirect authenticated users away from sign-in page
    if (isAuthenticated && nextUrl.pathname === "/auth/signin") {
        return NextResponse.redirect(new URL("/", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
