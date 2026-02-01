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

        <div className="w-full max-w-[1920px] mx-auto space-y-6">
            {/* Header Section */}
            <div>
                <Button
                    variant="ghost"
                    className="pl-0 text-gray-500 hover:text-gray-900 gap-2 mb-4"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Units
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl text-brand typography-h1">Property Details</h1>
                        <p className="text-sm text-gray-500 font-sans">Review unit details, occupancy status, and associated financial records.</p>
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

                {/* Divider */}
                <div className="h-1 bg-gradient-to-r from-brand to-cyan-400 rounded-full" />
            </div>

            {/* Top Row: Unit Info, Owner, & Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* Card 1: Unit Details */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold text-gray-900">
                                Property Information
                            </CardTitle>
                            <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded border border-gray-200">
                                {unit.unit_identifier}
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Full Location</p>
                            <p className="font-medium text-gray-900 text-lg">
                                {unit.location_name || "Main Street"}
                            </p>
                            <p className="text-gray-600 text-sm">
                                Block {unit.section_identifier}, Lot {unit.unit_identifier}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Type</p>
                                <p className="font-medium text-gray-900 capitalize">{unit.category.toLowerCase()}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Occupancy</p>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                    ${unit.occupancy_status === 'INHABITED' ? 'bg-green-100 text-green-800' :
                                        unit.occupancy_status === 'VACANT' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>
                                    {unit.occupancy_status.replace('_', ' ')}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 2: Owner Details */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="pb-4 border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" /> Owner Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Name</p>
                                <p className="font-medium text-gray-900 text-lg">{unit.owner_name || "No Owner Linked"}</p>
                            </div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                ${unit.membership_status === 'GOOD_STANDING' ? 'bg-green-100 text-green-800' :
                                    unit.membership_status === 'DELINQUENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'}`}>
                                {unit.membership_status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-500 w-16">Email:</span>
                                <span className="text-gray-900 font-medium truncate">{unit.owner_email || "—"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-500 w-16">Phone:</span>
                                <span className="text-gray-900 font-medium">{unit.owner_phone || "—"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <span className="text-gray-500 w-16">Resident:</span>
                                <span className="text-gray-900 font-medium">{unit.resident_name || "Same as owner"}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Map Card */}
                <Card className="shadow-sm border-gray-200 overflow-hidden flex flex-col min-h-[300px] xl:min-h-0">
                    <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500" /> Residence Map
                        </CardTitle>
                    </CardHeader>
                    <div className="flex-1 relative bg-white">
                        <MapView
                            center={mapCenter}
                            zoom={18}
                            scrollWheelZoom={true}
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
                                    Approximate Location
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
