import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simplified middleware - AuthProvider handles all authentication
export default async function middleware(request: NextRequest) {
    // Just pass through all requests
    // AuthProvider on the client side handles authentication
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
