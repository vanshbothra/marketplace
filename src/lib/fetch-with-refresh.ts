/**
 * Custom fetch wrapper that handles automatic token refresh on 401 responses
 * This should be used for all client-side API calls to the backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

interface FetchWithRefreshOptions extends RequestInit {
    skipRefresh?: boolean; // Set to true to skip automatic refresh (e.g., for the refresh endpoint itself)
}

/**
 * Attempts to refresh the access token using the refresh token
 * @returns true if refresh was successful, false otherwise
 */
async function refreshAccessToken(): Promise<boolean> {
    try {
        const response = await fetch(`${BACKEND_URL}/auth/browser/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important: sends cookies including refresh token
        });

        if (!response.ok) {
            console.error('Token refresh failed:', response.status);
            return false;
        }

        const data = await response.json();

        if (data.success && data.code === 200) {
            console.log('Access token refreshed successfully');
            return true;
        }

        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}

/**
 * Custom fetch that automatically handles 401 responses by refreshing the token
 * and retrying the original request
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options (same as native fetch)
 * @returns Promise<Response>
 * 
 * @example
 * const response = await fetchWithRefresh('/api/orders/me', {
 *   method: 'GET',
 *   credentials: 'include'
 * });
 */
export async function fetchWithRefresh(
    url: string,
    options: FetchWithRefreshOptions = {}
): Promise<Response> {
    const { skipRefresh, ...fetchOptions } = options;

    // Ensure credentials are included by default
    const finalOptions: RequestInit = {
        credentials: 'include',
        ...fetchOptions,
    };

    // Make the initial request
    let response = await fetch(url, finalOptions);

    // If we get a 401 and haven't been told to skip refresh
    if (response.status === 401 && !skipRefresh) {
        console.log('Received 401, attempting to refresh token...');

        // Try to refresh the token
        const refreshed = await refreshAccessToken();

        if (refreshed) {
            // Retry the original request with the new token
            console.log('Token refreshed, retrying original request...');
            response = await fetch(url, finalOptions);
        } else {
            // Refresh failed, redirect to login
            console.error('Token refresh failed, redirecting to login...');

            // Only redirect if we're in the browser
            if (typeof window !== 'undefined') {
                const currentPath = window.location.pathname;
                window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`;
            }
        }
    }

    return response;
}

/**
 * Convenience wrapper for making JSON API calls with automatic token refresh
 * 
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Promise with parsed JSON data
 * 
 * @example
 * const orders = await fetchJSON('/orders/me');
 * const newOrder = await fetchJSON('/orders', {
 *   method: 'POST',
 *   body: JSON.stringify({ listingId: '123', quantity: 2 })
 * });
 */
export async function fetchJSON<T = any>(
    url: string,
    options: FetchWithRefreshOptions = {}
): Promise<T> {
    const finalOptions: FetchWithRefreshOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    const response = await fetchWithRefresh(url, finalOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Helper to build full backend URLs
 * @param path - API path (e.g., '/orders/me')
 * @returns Full URL to backend
 */
export function getBackendUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${BACKEND_URL}${cleanPath}`;
}
