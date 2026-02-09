"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Filter, Plus, Trash2, Loader2 } from "lucide-react";

import { ListPageLayout } from "@/components/layout/list-page-layout";
import { FacilityCard } from "@/components/dashboard/facility-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebounce } from "@/hooks/use-debounce";
import { facilitiesApi, FacilityWithAnalytics } from "@/lib/services/facilities";

export default function FacilitiesPage() {
    const router = useRouter();

    // UI State
    const [showFilters, setShowFilters] = React.useState(false);
    const [search, setSearch] = React.useState("");

    // Selection & Deletion State
    const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Data State
    const [facilities, setFacilities] = React.useState<FacilityWithAnalytics[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const debouncedSearch = useDebounce(search, 300);

    // Fetch facilities on mount
    React.useEffect(() => {
        const fetchFacilities = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await facilitiesApi.getFacilitiesWithAnalytics();
                setFacilities(data);
            } catch (err) {
                console.error("Failed to fetch facilities:", err);
                setError("Failed to load facilities. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchFacilities();
    }, []);

    // Filter facilities based on search
    const filteredFacilities = React.useMemo(() => {
        if (!debouncedSearch) return facilities;
        const searchLower = debouncedSearch.toLowerCase();
        return facilities.filter((f) =>
            f.name.toLowerCase().includes(searchLower)
        );
    }, [facilities, debouncedSearch]);

    // Handle selection toggle
    const toggleSelection = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    // Handle select all
    const toggleSelectAll = () => {
        if (selectedIds.size === filteredFacilities.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredFacilities.map((f) => f.id)));
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            await facilitiesApi.bulkDeleteFacilities(Array.from(selectedIds));
            setFacilities((prev) => prev.filter((f) => !selectedIds.has(f.id)));
            setSelectedIds(new Set());
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Delete failed:", err);
            setError("Failed to delete selected facilities.");
        } finally {
            setIsDeleting(false);
        }
    };

    const selectedCount = selectedIds.size;

    return (
        <>
            <ListPageLayout
                title="Facilities"
                subtitle="Manage shared amenities, view schedules, and track reservations."
            >
                {/* Toolbar Row */}
                <div className="flex-shrink-0 flex flex-col gap-4 p-4 border-b border-gray-100 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="Search facilities..."
                            className="w-full sm:w-[300px] bg-gray-50 border-gray-200"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Button
                            className="bg-primary-500 hover:bg-primary-600 gap-2 typography-btn"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            className="gap-2 text-brand border-brand hover:bg-brand-light typography-btn"
                        >
                            <Plus className="h-4 w-4" /> Add Facility
                        </Button>
                        <Button
                            variant="destructive"
                            className="gap-2 bg-danger text-white hover:bg-red-600 typography-btn disabled:opacity-50"
                            disabled={selectedCount === 0}
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete {selectedCount > 0 && `(${selectedCount})`}
                        </Button>
                    </div>
                </div>

                {/* Status Row */}
                <div className="flex-shrink-0 px-4 py-2 text-xs text-gray-400 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Checkbox
                            checked={selectedIds.size === filteredFacilities.length && filteredFacilities.length > 0}
                            onCheckedChange={toggleSelectAll}
                            aria-label="Select all"
                        />
                        <span>
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                                </span>
                            ) : (
                                `Showing ${filteredFacilities.length} of ${facilities.length} facilities`
                            )}
                        </span>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="flex-shrink-0 mx-4 my-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Scrollable Grid Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-48 text-gray-500">
                            <Loader2 className="h-6 w-6 animate-spin mr-2" />
                            Loading facilities...
                        </div>
                    ) : filteredFacilities.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                            <p>No facilities found.</p>
                            {search && (
                                <p className="text-xs mt-1">
                                    Try adjusting your search.
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                            {filteredFacilities.map((facility) => (
                                <div key={facility.id} className="relative">
                                    {/* Selection Checkbox */}
                                    <div className="absolute top-2 right-2 z-10">
                                        <Checkbox
                                            checked={selectedIds.has(facility.id)}
                                            onCheckedChange={() => toggleSelection(facility.id)}
                                            aria-label={`Select ${facility.name}`}
                                            className="bg-white/90 border-gray-300"
                                        />
                                    </div>
                                    <FacilityCard
                                        id={facility.id}
                                        name={facility.name}
                                        image={facility.image_url ?? undefined}
                                        scheduledCount={facility.reservation_count_this_month}
                                        capacity={facility.capacity ?? undefined}
                                        rate={facility.rental_rate ?? undefined}
                                        isFullyBooked={facility.reservation_count_this_month >= 10}
                                        onSchedule={() => router.push(`/dashboard/facilities/${facility.id}/schedule`)}
                                        onViewDetails={() => router.push(`/dashboard/facilities/${facility.id}`)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ListPageLayout>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete Facilities"
                description={`Are you sure you want to delete ${selectedCount} facility(s)? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleBulkDelete}
                isLoading={isDeleting}
            />
        </>
    );
}
