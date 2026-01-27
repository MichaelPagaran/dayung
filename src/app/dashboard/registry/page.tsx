"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Filter,
    Plus,
    Trash2,
    Eye,
    SquarePen,
    Loader2
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { useDebounce } from "@/hooks/use-debounce";
import { registryApi, Unit, FilterOptions } from "@/lib/services/registry";

// --- Status Display Helpers ---
const OCCUPANCY_LABELS: Record<string, string> = {
    INHABITED: "Inhabited",
    VACANT: "Vacant",
    UNDER_CONSTRUCTION: "Under Construction",
};

const MEMBERSHIP_LABELS: Record<string, string> = {
    GOOD_STANDING: "Good Standing",
    DELINQUENT: "Delinquent",
    NON_MEMBER: "Non-Member",
};

// --- Columns ---
const columns: ColumnDef<Unit>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "Unit ID",
        cell: ({ row }) => (
            <span className="text-gray-600 text-xs font-mono">
                {(row.getValue("id") as string).slice(0, 8)}...
            </span>
        ),
    },
    {
        accessorKey: "section_identifier",
        header: "Block",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("section_identifier")}</span>,
    },
    {
        accessorKey: "unit_identifier",
        header: "Lot",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("unit_identifier")}</span>,
    },
    {
        accessorKey: "owner_name",
        header: "Owner",
        cell: ({ row }) => (
            <span className="text-gray-600">
                {row.getValue("owner_name") || <span className="text-gray-400 italic">No owner</span>}
            </span>
        ),
    },
    {
        accessorKey: "occupancy_status",
        header: "Occupancy",
        cell: ({ row }) => (
            <span className="text-gray-600">
                {OCCUPANCY_LABELS[row.getValue("occupancy_status") as string] || row.getValue("occupancy_status")}
            </span>
        ),
    },
    {
        accessorKey: "membership_status",
        header: "Membership Status",
        cell: ({ row }) => {
            const status = row.getValue("membership_status") as string;
            const label = MEMBERSHIP_LABELS[status] || status;

            const colorClasses = {
                GOOD_STANDING: "text-success",
                DELINQUENT: "text-danger",
                NON_MEMBER: "text-gray-500",
            }[status] || "text-gray-600";

            return <span className={colorClasses}>{label}</span>;
        },
    },
    {
        id: "actions",
        cell: () => {
            return (
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-brand border-brand hover:bg-brand-light">
                        <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-brand border-brand hover:bg-brand-light">
                        <SquarePen className="h-3 w-3" />
                    </Button>
                </div>
            )
        },
        header: () => <div>Action</div>,
    },
]

export default function PropertyRegistryPage() {
    // UI State
    const [showFilters, setShowFilters] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [filters, setFilters] = React.useState({
        section: "",
        occupancy: "",
        membership: ""
    });

    // Selection & Deletion State
    const [rowSelection, setRowSelection] = React.useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Data State
    const [units, setUnits] = React.useState<Unit[]>([]);
    const [filterOptions, setFilterOptions] = React.useState<FilterOptions>({
        sections: [],
        occupancy: [],
        membership: [],
    });
    const [isLoading, setIsLoading] = React.useState(true);
    const [refreshKey, setRefreshKey] = React.useState(0); // Trigger to reload data
    const [error, setError] = React.useState<string | null>(null);

    // Debounce search input (300ms delay)
    const debouncedSearch = useDebounce(search, 300);

    // Fetch filter options on mount
    React.useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const options = await registryApi.getFilterOptions();
                setFilterOptions(options);
            } catch (err) {
                console.error("Failed to fetch filter options:", err);
            }
        };
        fetchFilterOptions();
    }, []);

    // Fetch units when search, filters, or refreshKey change
    React.useEffect(() => {
        const fetchUnits = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await registryApi.getUnits({
                    search: debouncedSearch || undefined,
                    section: filters.section || undefined,
                    occupancy: filters.occupancy || undefined,
                    membership: filters.membership || undefined,
                });
                setUnits(data);
                // Reset selection on data reload
                setRowSelection({});
            } catch (err) {
                console.error("Failed to fetch units:", err);
                setError("Failed to load units. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUnits();
    }, [debouncedSearch, filters, refreshKey]);

    // Handle Deletion
    const handleBulkDelete = async () => {
        setIsDeleting(true);
        try {
            const selectedIds = Object.keys(rowSelection);
            await registryApi.bulkDeleteUnits(selectedIds);

            // Success - refresh list
            setShowDeleteConfirm(false);
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            console.error("Delete failed:", err);
            // In a real app, show a toast here
            setError("Failed to delete selected units.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Transform filter options for Combobox
    const blockOptions = filterOptions.sections.map(s => ({ label: `Block ${s}`, value: s }));
    const occupancyOptions = filterOptions.occupancy.map(o => ({
        label: OCCUPANCY_LABELS[o] || o,
        value: o
    }));
    const membershipOptions = filterOptions.membership.map(m => ({
        label: MEMBERSHIP_LABELS[m] || m,
        value: m
    }));

    const table = useReactTable({
        data: units,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id, // Use ID as key for selection
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        state: {
            rowSelection,
        },
    })

    const selectedCount = Object.keys(rowSelection).length;

    return (
        <div className="space-y-6">
            {/* 1. Header */}
            <div>
                <h1 className="text-2xl text-brand typography-h1">Property Registry</h1>
                <p className="mt-1 text-sm text-gray-500 font-sans">Manage units, view ownership details, and track payment status.</p>
            </div>

            {/* 2. Main Content Card */}
            <Card className="min-h-[600px] border-none shadow-none bg-white">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <Input
                            placeholder="Search owner, block, lot..."
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
                        <Button variant="outline" className="gap-2 text-brand border-brand hover:bg-brand-light typography-btn">
                            <Plus className="h-4 w-4" /> Add Property
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

                {/* Filter Controls Row */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 px-4 pb-4 animate-in fade-in slide-in-from-top-1">
                        {/* Block */}
                        <div className="w-full sm:w-[200px]">
                            <Combobox
                                placeholder="Select Block"
                                options={blockOptions}
                                value={filters.section}
                                onChange={(val) => setFilters(prev => ({ ...prev, section: val }))}
                            />
                        </div>

                        {/* Occupancy */}
                        <div className="w-full sm:w-[200px]">
                            <Combobox
                                placeholder="Select Occupancy"
                                options={occupancyOptions}
                                value={filters.occupancy}
                                onChange={(val) => setFilters(prev => ({ ...prev, occupancy: val }))}
                            />
                        </div>

                        {/* Membership Status */}
                        <div className="w-full sm:w-[200px]">
                            <Combobox
                                placeholder="Select Status"
                                options={membershipOptions}
                                value={filters.membership}
                                onChange={(val) => setFilters(prev => ({ ...prev, membership: val }))}
                            />
                        </div>

                        {/* Clear Filters */}
                        {(filters.section || filters.occupancy || filters.membership) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilters({ section: "", occupancy: "", membership: "" })}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Clear filters
                            </Button>
                        )}
                    </div>
                )}

                <div className="px-4 pb-2 text-xs text-gray-400">
                    {isLoading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                        </span>
                    ) : (
                        `Showing ${units.length} unit${units.length !== 1 ? 's' : ''}`
                    )}
                </div>

                {/* Error State */}
                {error && (
                    <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                        {error}
                    </div>
                )}

                {/* Data Table */}
                <div className="">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id} className="bg-gray-50 hover:bg-gray-50 border-gray-100">
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} className="text-gray-500 font-medium text-xs uppercase tracking-wider h-10">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        <div className="flex items-center justify-center gap-2 text-gray-500">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            Loading units...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-gray-50 border-gray-100 even:bg-gray-100/60 transition-colors data-[state=selected]:bg-gray-100"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="py-3 text-sm">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center text-gray-500">
                                        No units found.
                                        {(search || filters.section || filters.occupancy || filters.membership) && (
                                            <span className="block text-xs mt-1">
                                                Try adjusting your search or filters.
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={showDeleteConfirm}
                onOpenChange={setShowDeleteConfirm}
                title="Delete Properties"
                description={`Are you sure you want to delete ${selectedCount} unit(s)? This action will soft-delete the records and log the deletion.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={handleBulkDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
