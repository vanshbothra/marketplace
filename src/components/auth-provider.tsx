"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://ashokamarketplace.tech/backend';

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: any | null;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<any | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    // Public routes that don't require authentication
    const publicRoutes = ['/auth/signin', '/auth/error'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Helper function to set user cookies
    function setUserCookies(user: any) {
        if (typeof document === 'undefined') return; // Skip on server

        const cookieOptions = `path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax${process.env.NODE_ENV === 'production' ? '; secure' : ''}`;

        if (user.id) {
            document.cookie = `user-id=${user.id}; ${cookieOptions}`;
        }
        if (user.name) {
            document.cookie = `user-name=${encodeURIComponent(user.name)}; ${cookieOptions}`;
        }
        if (user.email) {
            document.cookie = `user-email=${encodeURIComponent(user.email)}; ${cookieOptions}`;
        }
        if (user.imageUrl) {
            document.cookie = `user-image=${encodeURIComponent(user.imageUrl)}; ${cookieOptions}`;
        }
    }

    // Helper function to clear user cookies
    function clearUserCookies() {
        if (typeof document === 'undefined') return; // Skip on server

        const expiredCookie = 'path=/; max-age=0';
        document.cookie = `user-id=; ${expiredCookie}`;
        document.cookie = `user-name=; ${expiredCookie}`;
        document.cookie = `user-email=; ${expiredCookie}`;
        document.cookie = `user-image=; ${expiredCookie}`;
    }

    useEffect(() => {
        async function checkAuth() {
            // Skip auth check for public routes
            if (isPublicRoute) {
                setIsLoading(false);
                return;
            }

            try {
                // Check if user is authenticated
                const response = await fetch(`${BACKEND_URL}/auth/browser/me`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.data && data.data.user) {
                        // Backend returns data.data.user
                        const userData = data.data.user;
                        setUser(userData);
                        setIsAuthenticated(true);

                        // Set user data cookies for client-side access
                        setUserCookies(userData);

                        setIsLoading(false);
                        return;
                    }
                }

                // If 401, try to refresh the token
                if (response.status === 401) {
                    console.log('Token expired, attempting refresh...');
                    const refreshed = await refreshToken();

                    if (refreshed) {
                        // Retry getting user info
                        const retryResponse = await fetch(`${BACKEND_URL}/auth/browser/me`, {
                            credentials: 'include',
                        });

                        if (retryResponse.ok) {
                            const data = await retryResponse.json();
                            if (data.success && data.data && data.data.user) {
                                // Backend returns data.data.user
                                const userData = data.data.user;
                                setUser(userData);
                                setIsAuthenticated(true);

                                // Set user data cookies for client-side access
                                setUserCookies(userData);

                                setIsLoading(false);
                                return;
                            }
                        }
                    }
                }

                // If we get here, authentication failed
                console.log('Authentication failed, redirecting to signin...');
                setIsAuthenticated(false);
                setUser(null);
                clearUserCookies();
                setIsLoading(false);
                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
                setUser(null);
                clearUserCookies();
                setIsLoading(false);
                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            }
        }

        checkAuth();
    }, [pathname, router, isPublicRoute]);

    async function refreshToken(): Promise<boolean> {
        try {
            const response = await fetch(`${BACKEND_URL}/auth/browser/refresh`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.code === 200) {
                    console.log('Token refreshed successfully');
                    return true;
                }
            }

            console.log('Token refresh failed');
            return false;
        } catch (error) {
            console.error('Error refreshing token:', error);
            return false;
        }
    }

    // Show loading state while checking authentication
    if (isLoading && !isPublicRoute) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
                <div className="text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, isLoading, user }}>
            {children}
        </AuthContext.Provider>
    );
}
