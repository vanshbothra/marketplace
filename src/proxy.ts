import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || "https://ashokamarketplace.tech/backend";

export default async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/signin', '/api/auth'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Check authentication with backend
    try {
        const response = await fetch(`${BACKEND_URL}/auth/browser/me`, {
            method: 'GET',
            headers: {
                'Cookie': request.headers.get('cookie') || '',
            },
            credentials: 'include',
        });

        const data = await response.json();

        // If not authenticated, try to refresh the token
        if (!data.success || data.code === 401) {
            try {
                const refreshResponse = await fetch(`${BACKEND_URL}/auth/browser/refresh`, {
                    method: 'POST',
                    headers: {
                        'Cookie': request.headers.get('cookie') || '',
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({}),
                });

                const refreshData = await refreshResponse.json();

                // If refresh successful, forward the Set-Cookie headers to the client
                if (refreshData.success && refreshData.code === 200) {
                    const res = NextResponse.next();

                    // Forward Set-Cookie headers from backend to client
                    const setCookieHeaders = refreshResponse.headers.getSetCookie();
                    if (setCookieHeaders && setCookieHeaders.length > 0) {
                        setCookieHeaders.forEach(cookie => {
                            // Parse the cookie to extract name, value, and attributes
                            const [nameValue, ...attributes] = cookie.split(';').map(s => s.trim());
                            const [name, value] = nameValue.split('=');

                            // Set the cookie on the response
                            res.headers.append('Set-Cookie', cookie);
                        });
                    }

                    return res;
                }
            } catch (refreshError) {
                console.error('Token refresh failed:', refreshError);
            }

            // If refresh failed or was unsuccessful, redirect to signin
            const signInUrl = new URL('/auth/signin', request.url);
            signInUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(signInUrl);
        }

        // User is authenticated, store user data in cookies for client-side access
        const user = data.data?.user;
        if (user) {
            const res = NextResponse.next();

            // Store user data in cookies (accessible by client components)
            res.cookies.set('user-id', user.id, {
                httpOnly: false, // Allow client-side access
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            if (user.name) {
                res.cookies.set('user-name', user.name, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7,
                });
            }

            if (user.email) {
                res.cookies.set('user-email', user.email, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7,
                });
            }

            if (user.imageUrl) {
                res.cookies.set('user-image', user.imageUrl, {
                    httpOnly: false,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7,
                });
            }

            return res;
        }

        return NextResponse.next();
    } catch (error) {
        console.error('Auth check failed:', error);
        // On error, redirect to signin
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }
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
