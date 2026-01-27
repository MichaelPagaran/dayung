"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * Client-side auth guard component.
 * Wraps protected content and redirects to login if not authenticated.
 * Acts as a fallback to middleware-based auth checking.
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading state while checking auth
    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-brand" />
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render children if not authenticated (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
