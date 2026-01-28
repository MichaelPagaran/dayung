"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ListPageLayoutProps {
    /** Page title */
    title: string;
    /** Optional subtitle/description */
    subtitle?: string;
    /** Main content (toolbar + table, all inside the scrollable data card) */
    children: React.ReactNode;
    /** Additional className for the container */
    className?: string;
}

/**
 * Layout for listing/parent pages.
 * Structure per design:
 * - Header section (title + subtitle) - fixed at top
 * - Divider line
 * - Data card (scrollable) - contains toolbar + table
 */
export function ListPageLayout({
    title,
    subtitle,
    children,
    className,
}: ListPageLayoutProps) {
    return (
        <div className={cn("flex flex-col h-full min-h-0", className)}>
            {/* Header Section - Fixed */}
            <div className="flex-shrink-0 pb-4">
                <h1 className="text-2xl text-brand typography-h1">{title}</h1>
                {subtitle && (
                    <p className="mt-1 text-sm text-gray-500 font-sans">{subtitle}</p>
                )}
            </div>

            {/* Divider */}
            <div className="flex-shrink-0 h-1 bg-gradient-to-r from-brand to-cyan-400 rounded-full mb-4" />

            {/* Data Card - Scrollable */}
            <div className="flex-1 min-h-0 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                {children}
            </div>
        </div>
    );
}
