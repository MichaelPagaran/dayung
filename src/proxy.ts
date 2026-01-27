import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js Proxy for authentication-based route protection.
 * 
 * Checks for the presence of access_token cookie on protected routes:
 * - Unauthenticated users accessing /dashboard/* → redirect to /login
 * - Authenticated users accessing /login → redirect to /dashboard/registry
 * 
 * Note: This only checks cookie presence, not validity.
 * The actual JWT validation happens on the backend API calls.
 */
export function proxy(request: NextRequest) {
    const accessToken = request.cookies.get("access_token");
    const { pathname } = request.nextUrl;

    const isAuthPage = pathname === "/login";
    const isProtectedRoute = pathname.startsWith("/dashboard");

    // Unauthenticated user trying to access protected route → redirect to login
    if (isProtectedRoute && !accessToken) {
        const loginUrl = new URL("/login", request.url);
        // Optionally preserve the intended destination
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Authenticated user on login page → redirect to dashboard
    if (isAuthPage && accessToken) {
        return NextResponse.redirect(new URL("/dashboard/registry", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
