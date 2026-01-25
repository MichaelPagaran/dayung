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
    SquarePen
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";

// --- Types ---
type Property = {
    id: string
    block: string
    lot: string
    owner: string
    occupancy: "Occupied" | "Vacant"
    owner_status: "Good Standing" | "Delinquent" | "Non-member"
}

// --- Mock Data ---
const MOCK_DATA: Property[] = Array.from({ length: 15 }, () => ({
    id: `System_Defined`,
    block: "#",
    lot: "#",
    owner: "FirstName_LastName",
    occupancy: "Occupied",
    owner_status: "Good Standing",
}));

// --- Mock Metadata ---
const MOCK_BLOCKS = Array.from({ length: 25 }, (_, i) => ({
    label: `Block ${i + 1}`,
    value: `${i + 1}`,
}));

const MOCK_OCCUPANCY = [
    { label: "Inhabited", value: "Inhabited" },
    { label: "Vacant", value: "Vacant" },
    { label: "Under Construction", value: "Under Construction" },
];

const MOCK_STATUS = [
    { label: "Good Standing", value: "Good Standing" },
    { label: "Delinquent", value: "Delinquent" },
    { label: "Non-member", value: "Non-member" },
];

// --- Columns ---
const columns: ColumnDef<Property>[] = [
    {
        accessorKey: "id",
        header: "Unit ID",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("id")}</span>,
    },
    {
        accessorKey: "block",
        header: "Block",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("block")}</span>,
    },
    {
        accessorKey: "lot",
        header: "Lot",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("lot")}</span>,
    },
    {
        accessorKey: "owner",
        header: "Owner",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("owner")}</span>,
    },
    {
        accessorKey: "occupancy",
        header: "Occupancy",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("occupancy")}</span>,
    },
    {
        accessorKey: "owner_status",
        header: "Membership Status",
        cell: ({ row }) => <span className="text-gray-600">{row.getValue("owner_status")}</span>,
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
    const [showFilters, setShowFilters] = React.useState(false);
    const [filters, setFilters] = React.useState({
        block: "",
        occupancy: "",
        status: ""
    });

    const table = useReactTable({
        data: MOCK_DATA,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

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
                        <Input placeholder="Search" className="w-[300px] bg-gray-50 border-gray-200" />
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
                        <Button variant="destructive" className="gap-2 bg-danger text-white hover:bg-red-600 typography-btn">
                            <Trash2 className="h-4 w-4" /> Delete
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
                                options={MOCK_BLOCKS}
                                value={filters.block}
                                onChange={(val) => setFilters(prev => ({ ...prev, block: val }))}
                            />
                        </div>

                        {/* Occupancy */}
                        <div className="w-full sm:w-[200px]">
                            <Combobox
                                placeholder="Select Occupancy"
                                options={MOCK_OCCUPANCY}
                                value={filters.occupancy}
                                onChange={(val) => setFilters(prev => ({ ...prev, occupancy: val }))}
                            />
                        </div>

                        {/* Membership Status */}
                        <div className="w-full sm:w-[200px]">
                            <Combobox
                                placeholder="Select Status"
                                options={MOCK_STATUS}
                                value={filters.status}
                                onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
                            />
                        </div>
                    </div>
                )}

                <div className="px-4 pb-2 text-xs text-gray-400">

                    Showing # of Data
                </div>

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
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:bg-gray-50 border-gray-100 even:bg-gray-100/60"
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
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
}
