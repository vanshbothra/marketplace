"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

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
                    if (data.success && data.data) {
                        setUser(data.data);
                        setIsAuthenticated(true);
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
                            if (data.success && data.data) {
                                setUser(data.data);
                                setIsAuthenticated(true);
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
                setIsLoading(false);
                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
                setUser(null);
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
