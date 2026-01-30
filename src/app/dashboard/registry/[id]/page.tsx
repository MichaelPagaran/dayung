"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Edit,
    Archive,
    Home,
    User,
    MapPin,
    CreditCard,
    Wallet,
    AlertCircle,
    Loader2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { registryApi, Unit } from "@/lib/services/registry";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

// Dynamically import MapView to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/ui/map-view"), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-lg flex items-center justify-center text-gray-400">Loading Map...</div>
});

export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [unit, setUnit] = React.useState<Unit | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        const fetchUnit = async () => {
            setIsLoading(true);
            try {
                const data = await registryApi.getUnit(id);
                setUnit(data);
            } catch (err) {
                console.error("Failed to fetch unit:", err);
                setError("Failed to load property details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchUnit();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (error || !unit) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="text-gray-600 font-medium">{error || "Property not found"}</p>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    // Default center if no coordinates (Manila) or use unit coordinates
    // Using a default fallback but FlyTo will handle updates
    const mapCenter: [number, number] = [
        Number(unit.latitude) || 14.5995,
        Number(unit.longitude) || 120.9842
    ];

    const hasCoordinates = unit.latitude !== null && unit.longitude !== null;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <Button
                        variant="ghost"
                        className="pl-0 text-gray-500 hover:text-gray-900 gap-2 mb-2"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="h-4 w-4" /> Back to Units
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">Property Details</h1>
                    <p className="text-gray-500">Review unit details, occupancy status, and associated financial records.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 text-brand border-brand hover:bg-brand-light">
                        <Edit className="h-4 w-4" /> Edit
                    </Button>
                    <Button variant="outline" className="gap-2 text-gray-600 hover:bg-gray-100">
                        <Archive className="h-4 w-4" /> Archive
                    </Button>
                </div>
            </div>

            {/* Top Row: Unit Info & Map */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Unit Info Card takes 2/3 space on large screens */}
                <Card className="lg:col-span-2 shadow-sm border-gray-200">
                    <CardHeader className="pb-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                {unit.location_name || "Property Location"}
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Left Column: Unit Details */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Unit Information</h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Unit ID</p>
                                        <p className="font-mono text-gray-900 font-medium">{unit.unit_identifier}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Location</p>
                                        <p className="font-medium text-gray-900">
                                            Block {unit.section_identifier}, {unit.unit_identifier}
                                            {unit.location_name && <span className="block text-gray-600 text-sm mt-0.5">{unit.location_name}</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Type</p>
                                        <p className="font-medium text-gray-900 capitalize">{unit.category.toLowerCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Occupancy Status</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                            ${unit.occupancy_status === 'INHABITED' ? 'bg-green-100 text-green-700' :
                                                unit.occupancy_status === 'VACANT' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {unit.occupancy_status.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Owner Details */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Owner / Resident Information</h4>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{unit.owner_name || "No Owner Linked"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Member Status</p>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                            ${unit.membership_status === 'GOOD_STANDING' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {unit.membership_status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Email</p>
                                        <p className="text-gray-900 truncate">{unit.owner_email || "—"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Phone</p>
                                        <p className="text-gray-900">{unit.owner_phone || "—"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Map Card */}
                <Card className="shadow-sm border-gray-200 overflow-hidden flex flex-col">
                    <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" /> Residence Map
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 min-h-[300px] relative bg-white">
                        <MapView
                            center={mapCenter}
                            zoom={18}
                            markers={hasCoordinates ? [{
                                position: mapCenter,
                                title: `Block ${unit.section_identifier} Lot ${unit.unit_identifier}`
                            }] : []}
                            height="100%"
                            className="absolute inset-0"
                        />
                        {!hasCoordinates && (
                            <div className="absolute inset-x-0 bottom-4 text-center z-[1000] pointer-events-none">
                                <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium shadow-sm text-gray-600 border border-gray-200">
                                    Approximate Location (No explicit coordinates)
                                </span>
                            </div>
                        )}
                    </div>
                </Card>
            </div>

            {/* Financial Summary */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Financial Summary</h3>
                    <Button variant="link" className="text-brand h-auto p-0 hover:text-brand-dark">View More</Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-gray-200 shadow-sm bg-white">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Current Balance</p>
                                <h2 className="text-2xl font-bold text-gray-900">₱0.00</h2>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-full text-gray-500">
                                <Home className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 shadow-sm bg-white">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Outstanding Dues</p>
                                <h2 className="text-2xl font-bold text-gray-900">₱0.00</h2>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-full text-gray-500">
                                <CreditCard className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-gray-200 shadow-sm bg-white">
                        <CardContent className="p-5 flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">Payment Status</p>
                                <h2 className="text-xl font-bold text-green-600">Up to date</h2>
                            </div>
                            <div className="p-2 bg-gray-100 rounded-full text-gray-500">
                                <Wallet className="h-5 w-5" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Payment History Table Placeholder */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                <Card className="shadow-sm border-gray-200">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50 hover:bg-gray-50">
                                <TableHead className="w-[150px]">Date</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Reference</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {/* Placeholder Empty State */}
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                                    No recent payment history found.
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
}
