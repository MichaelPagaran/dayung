"use client";

import * as React from "react";
import Image from "next/image";
import { Calendar, Users, Banknote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FacilityCardProps {
    /** Unique facility ID */
    id: string;
    /** Facility name */
    name: string;
    /** Optional image URL - uses placeholder if not provided */
    image?: string;
    /** Number of scheduled reservations */
    scheduledCount?: number;
    /** Capacity (pax) */
    capacity?: number;
    /** Rental rate per hour */
    rate?: number;
    /** Whether the facility is fully booked */
    isFullyBooked?: boolean;
    /** Callback when Schedule button is clicked */
    onSchedule?: () => void;
    /** Callback when View Details button is clicked */
    onViewDetails?: () => void;
    /** Additional class names */
    className?: string;
}

/**
 * FacilityCard - Displays a facility with image, stats, and action buttons.
 * Composed from shadcn/ui primitives (Card, Badge, Button).
 */
export function FacilityCard({
    id,
    name,
    image,
    scheduledCount = 0,
    capacity,
    rate,
    isFullyBooked = false,
    onSchedule,
    onViewDetails,
    className,
}: FacilityCardProps) {
    // Placeholder image when no image is provided
    const imageUrl = image || "/images/facility-placeholder.jpg";

    return (
        <Card className={cn("overflow-hidden flex flex-col", className)}>
            {/* Image Section with Status Badge */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                <Image
                    src={imageUrl}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                />
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <Badge
                        className={cn(
                            "px-2 py-1 text-xs font-medium rounded-md",
                            isFullyBooked
                                ? "bg-orange-500 text-white border-orange-500"
                                : "bg-primary-500 text-white border-primary-500"
                        )}
                    >
                        <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-white/80" />
                        {isFullyBooked ? "Fully Booked" : "Vacant"}
                    </Badge>
                </div>
            </div>

            {/* Content Section */}
            <CardContent className="flex flex-col flex-1 p-4">
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-800 mb-4 truncate">
                    {name}
                </h3>

                {/* Stats Row */}
                <div className="flex items-center justify-between mb-4 border-t border-b border-gray-100 py-3">
                    {/* Scheduled */}
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-lg font-bold text-gray-800 typography-num">
                            {scheduledCount}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>Scheduled</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200" />

                    {/* Pax */}
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-lg font-bold text-gray-800 typography-num">
                            {capacity ?? "—"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            <span>Pax</span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="h-8 w-px bg-gray-200" />

                    {/* Rate */}
                    <div className="flex flex-col items-center flex-1">
                        <span className="text-lg font-bold text-gray-800 typography-num">
                            {rate != null ? `₱ ${rate.toLocaleString()}` : "—"}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Banknote className="h-3 w-3" />
                            <span>Rate</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                    <Button
                        variant="outline"
                        className="flex-1 text-brand border-brand hover:bg-brand-light typography-btn"
                        onClick={onSchedule}
                    >
                        Schedule
                    </Button>
                    <Button
                        className="flex-1 bg-primary-500 hover:bg-primary-600 typography-btn"
                        onClick={onViewDetails}
                    >
                        View Details
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
