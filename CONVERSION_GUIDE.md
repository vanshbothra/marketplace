# Complete Server to Client Component Conversion Guide

## Summary
Converting all server components to client components to use `NEXT_PUBLIC_BACKEND_URL` and `credentials: 'include'` for all backend API calls.

## Files Already Converted
1. ✅ `/app/marketplace/page.tsx` - Marketplace listing page
2. ✅ `/app/vendor/[id]/listings/new/page.tsx` - Already client
3. ✅ `/app/vendor/[id]/edit/page.tsx` - Already client
4. ✅ `/app/vendor/new/page.tsx` - Already client
5. ✅ `/app/listings/[id]/edit/page.tsx` - Already client
6. ✅ `/app/auth/signin/page.tsx` - Already client
7. ✅ `/app/marketplace/[id]/page.tsx` - Already client (uses NEXT_PUBLIC)

## Files That Need Conversion

### 1. `/app/vendor/[id]/page.tsx`
**Current**: Server component with `cookies()` and `BACKEND_URL`
**Changes needed**:
- Add `"use client"`
- Replace `params: Promise<{ id: string }>` with `useParams()`
- Replace `cookies()` with `credentials: 'include'`
- Use `NEXT_PUBLIC_BACKEND_URL`
- Convert to `useEffect` for data fetching
- Add loading state
- Replace `notFound()` with error handling/redirect

### 2. `/app/dashboard/page.tsx`
**Current**: Server component
**Changes needed**:
- Add `"use client"`
- Use `useEffect` for fetching
- Use `NEXT_PUBLIC_BACKEND_URL`
- Add `credentials: 'include'`
- Add loading/error states

### 3. `/app/orders/page.tsx`
**Current**: Server component
**Changes needed**:
- Add `"use client"`
- Use `useEffect` for fetching
- Use `NEXT_PUBLIC_BACKEND_URL`
- Add `credentials: 'include'`
- Add loading/error states

### 4. `/app/listings/[id]/orders/page.tsx`
**Current**: Server component with params
**Changes needed**:
- Add `"use client"`
- Replace `params` with `useParams()`
- Use `useEffect` for fetching
- Use `NEXT_PUBLIC_BACKEND_URL`
- Add `credentials: 'include'`
- Add loading/error states

### 5. `/app/page.tsx` (Home)
**Current**: Server component
**Changes needed**:
- Add `"use client"`
- Convert any server-side logic to client-side
- Use `NEXT_PUBLIC_BACKEND_URL` if making API calls

### 6. `/app/admin/page.tsx`
**Current**: Server component
**Changes needed**:
- Add `"use client"`
- Use `useEffect` for fetching
- Use `NEXT_PUBLIC_BACKEND_URL`
- Add `credentials: 'include'`
- Add loading/error states

## Conversion Template

```typescript
// BEFORE (Server Component)
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export default async function MyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${BACKEND_URL}/api/${id}`, {
        cache: 'no-store',
        headers: {
            'Cookie': cookieHeader,
        },
    });

    const data = await response.json();

    return <div>{data.name}</div>;
}

// AFTER (Client Component)
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';

export default function MyPage() {
    const params = useParams();
    const id = params.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(`${BACKEND_URL}/api/${id}`, {
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch');
                }

                const result = await response.json();
                setData(result.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return <div>{data?.name}</div>;
}
```

## Key Changes Summary

### 1. Imports
```typescript
// Remove
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

// Add
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
```

### 2. Environment Variables
```typescript
// Before
const BACKEND_URL = process.env.BACKEND_URL;

// After
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
```

### 3. Fetch Calls
```typescript
// Before
const response = await fetch(url, {
    cache: 'no-store',
    headers: {
        'Cookie': cookieHeader,
    },
});

// After
const response = await fetch(url, {
    credentials: 'include',
});
```

### 4. Params Handling
```typescript
// Before (Server)
export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
}

// After (Client)
export default function Page() {
    const params = useParams();
    const id = params.id as string;
}
```

### 5. Search Params
```typescript
// Before (Server)
export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ query?: string }>;
}) {
    const params = await searchParams;
    const query = params.query;
}

// After (Client)
export default function Page() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query');
}
```

## Middleware Removal

Delete or rename these files:
- `/src/proxy.ts` - No longer needed
- `/src/middleware.ts` - If exists

The `AuthProvider` component now handles all authentication checks client-side.

## Environment Variables Required

Make sure your `.env` file has:
```env
# Client-side (required for all client components)
NEXT_PUBLIC_BACKEND_URL=https://backend.ashokamarketplace.tech

# Server-side (only if you have any remaining server components)
BACKEND_URL=https://backend.ashokamarketplace.tech
```

## Testing Checklist

After conversion, test:
- [ ] All pages load correctly
- [ ] Authentication works (cookies sent with requests)
- [ ] Protected routes redirect to signin
- [ ] Token refresh works automatically
- [ ] All API calls include credentials
- [ ] Loading states show correctly
- [ ] Error handling works

## Benefits

✅ All requests from browser with `credentials: 'include'`
✅ No server-side cookie handling needed
✅ Simpler deployment (no server-side rendering complexity)
✅ Client-side auth checking with `AuthProvider`
✅ Automatic token refresh
✅ Better debugging (can see all requests in browser DevTools)
