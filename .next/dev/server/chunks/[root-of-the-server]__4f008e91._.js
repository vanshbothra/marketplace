module.exports = [
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/lib/incremental-cache/tags-manifest.external.js [external] (next/dist/server/lib/incremental-cache/tags-manifest.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/lib/incremental-cache/tags-manifest.external.js", () => require("next/dist/server/lib/incremental-cache/tags-manifest.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/Desktop/projects/marketplace/src/proxy.ts [middleware] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "default",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$projects$2f$marketplace$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/projects/marketplace/node_modules/next/server.js [middleware] (ecmascript)");
;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
async function middleware(request) {
    const { pathname } = request.nextUrl;
    // Public routes that don't require authentication
    const publicRoutes = [
        '/auth/signin',
        '/api/auth'
    ];
    const isPublicRoute = publicRoutes.some((route)=>pathname.startsWith(route));
    if (isPublicRoute) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$projects$2f$marketplace$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    }
    // Check authentication with backend
    try {
        const response = await fetch(`${BACKEND_URL}/auth/browser/me`, {
            method: 'GET',
            headers: {
                'Cookie': request.headers.get('cookie') || ''
            },
            credentials: 'include'
        });
        const data = await response.json();
        // If not authenticated, try to refresh the token
        if (!data.success || data.code === 401) {
            try {
                const refreshResponse = await fetch(`${BACKEND_URL}/auth/browser/refresh`, {
                    method: 'POST',
                    headers: {
                        'Cookie': request.headers.get('cookie') || '',
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({})
                });
                const refreshData = await refreshResponse.json();
                // If refresh successful, forward the Set-Cookie headers to the client
                if (refreshData.success && refreshData.code === 200) {
                    const res = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$projects$2f$marketplace$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
                    // Forward Set-Cookie headers from backend to client
                    const setCookieHeaders = refreshResponse.headers.getSetCookie();
                    if (setCookieHeaders && setCookieHeaders.length > 0) {
                        setCookieHeaders.forEach((cookie)=>{
                            // Parse the cookie to extract name, value, and attributes
                            const [nameValue, ...attributes] = cookie.split(';').map((s)=>s.trim());
                            if (!nameValue) return;
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
            return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$projects$2f$marketplace$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(signInUrl);
        }
        // User is authenticated, store user data in cookies for client-side access
        const user = data.data?.user;
        if (user) {
            const res = __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$projects$2f$marketplace$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
            // Store user data in cookies (accessible by client components)
            res.cookies.set('user-id', user.id, {
                httpOnly: false,
                secure: ("TURBOPACK compile-time value", "development") === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7
            });
            if (user.name) {
                res.cookies.set('user-name', user.name, {
                    httpOnly: false,
                    secure: ("TURBOPACK compile-time value", "development") === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7
                });
            }
            if (user.email) {
                res.cookies.set('user-email', user.email, {
                    httpOnly: false,
                    secure: ("TURBOPACK compile-time value", "development") === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7
                });
            }
            if (user.imageUrl) {
                res.cookies.set('user-image', user.imageUrl, {
                    httpOnly: false,
                    secure: ("TURBOPACK compile-time value", "development") === 'production',
                    sameSite: 'lax',
                    maxAge: 60 * 60 * 24 * 7
                });
            }
            return res;
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$projects$2f$marketplace$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].next();
    } catch (error) {
        console.error('Auth check failed:', error);
        // On error, redirect to signin
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$projects$2f$marketplace$2f$node_modules$2f$next$2f$server$2e$js__$5b$middleware$5d$__$28$ecmascript$29$__["NextResponse"].redirect(signInUrl);
    }
}
const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (public folder)
         */ '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4f008e91._.js.map