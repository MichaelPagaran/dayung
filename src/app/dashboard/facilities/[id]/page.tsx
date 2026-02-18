"use client";

import * as React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    ArrowLeft,
    Edit,
    Archive,
    Calendar,
    DollarSign,
    Plus,
    Loader2,
    AlertCircle,
    Clock,
    Users,
    Banknote,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    facilitiesApi,
    Facility,
    FacilityWithAnalytics,
    FacilityTransaction,
    AvailabilitySlot,
    ReservationConfig,
} from "@/lib/services/facilities";
import {
    reservationsApi,
    Reservation,
    ReservationPayload,
} from "@/lib/services/reservations";
import { cn } from "@/lib/utils";

// =============================================================================
// Reservation Status Styles
// =============================================================================
const RESERVATION_STATUS_STYLES: Record<string, string> = {
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    FOR_REVIEW: "bg-blue-100 text-blue-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
    EXPIRED: "bg-gray-100 text-gray-500",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
    UNPAID: "bg-red-100 text-red-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    PAID: "bg-emerald-100 text-emerald-700",
    REFUNDED: "bg-gray-100 text-gray-600",
};

const statusLabel = (s: string) =>
    s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\B\w+/g, (c) => c.toLowerCase());

// =============================================================================
// Reservation Table Columns
// =============================================================================
const reservationColumns: ColumnDef<Reservation>[] = [
    {
        accessorKey: "start_datetime",
        header: "Date & Time",
        cell: ({ row }) => {
            const start = new Date(row.original.start_datetime);
            const end = new Date(row.original.end_datetime);
            return (
                <div className="text-sm">
                    <p className="font-medium text-gray-900">
                        {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-gray-500 text-xs">
                        {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                        {" – "}
                        {end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "reserved_by_name",
        header: "Reserved By",
        cell: ({ row }) => (
            <span className="text-sm text-gray-900 font-medium">
                {row.original.reserved_by_name}
            </span>
        ),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <Badge className={RESERVATION_STATUS_STYLES[row.original.status] || "bg-gray-100"}>
                {statusLabel(row.original.status)}
            </Badge>
        ),
    },
    {
        accessorKey: "payment_status",
        header: "Payment",
        cell: ({ row }) => (
            <Badge className={PAYMENT_STATUS_STYLES[row.original.payment_status] || "bg-gray-100"}>
                {statusLabel(row.original.payment_status)}
            </Badge>
        ),
    },
    {
        accessorKey: "total_amount",
        header: () => <span className="text-right block">Amount</span>,
        cell: ({ row }) => (
            <span className="text-sm font-semibold text-gray-900 block text-right whitespace-nowrap">
                ₱ {row.original.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        ),
    },
];

// =============================================================================
// Create Reservation Dialog
// =============================================================================
function CreateReservationDialog({
    open,
    onOpenChange,
    assetId,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assetId: string;
    onSuccess: () => void;
}) {
    const [name, setName] = React.useState("");
    const [phone, setPhone] = React.useState("");
    const [purpose, setPurpose] = React.useState("");
    const [startDate, setStartDate] = React.useState("");
    const [startTime, setStartTime] = React.useState("10:00");
    const [endTime, setEndTime] = React.useState("12:00");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const resetForm = () => {
        setName("");
        setPhone("");
        setPurpose("");
        setStartDate("");
        setStartTime("10:00");
        setEndTime("12:00");
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !startDate || !startTime || !endTime) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const payload: ReservationPayload = {
                asset_id: assetId,
                reserved_by_name: name,
                contact_phone: phone || undefined,
                purpose: purpose || undefined,
                start_datetime: `${startDate}T${startTime}:00`,
                end_datetime: `${startDate}T${endTime}:00`,
            };
            await reservationsApi.createReservation(payload);
            resetForm();
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error("Failed to create reservation:", err);
            setError("Failed to create reservation. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Schedule a Reservation</DialogTitle>
                    <DialogDescription>
                        Book this facility for a specific date and time.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Name *</label>
                        <Input
                            placeholder="Reserved by..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Contact Phone</label>
                        <Input
                            placeholder="Phone number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Purpose</label>
                        <Input
                            placeholder="What's the reservation for?"
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Date *</label>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Start Time *</label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">End Time *</label>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary-500 hover:bg-primary-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Create Reservation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}



// =============================================================================
// Timeline Component
// =============================================================================
function ReservationTimeline({
    slots,
    operatingStart = 9,
    operatingEnd = 22,
}: {
    slots: AvailabilitySlot[];
    operatingStart?: number;
    operatingEnd?: number;
}) {
    const hours = [];
    for (let h = operatingStart; h <= operatingEnd; h++) {
        hours.push(h);
    }

    // Check if an hour is booked
    const isBooked = (hour: number) => {
        return slots.some((slot) => {
            const slotStart = parseInt(slot.start_time.split(":")[0]);
            const slotEnd = parseInt(slot.end_time.split(":")[0]);
            return hour >= slotStart && hour < slotEnd && !slot.is_available;
        });
    };

    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium">
                    Reservation For Today
                </CardTitle>
                <p className="text-sm text-gray-500">{dateStr}</p>
            </CardHeader>
            <CardContent>
                <div className="flex gap-1 overflow-x-auto pb-2">
                    {hours.map((hour) => {
                        const booked = isBooked(hour);
                        const label =
                            hour < 12
                                ? `${hour} AM`
                                : hour === 12
                                    ? "12 PM"
                                    : `${hour - 12} PM`;
                        return (
                            <div
                                key={hour}
                                className={cn(
                                    "flex-shrink-0 px-3 py-2 text-xs font-medium rounded",
                                    booked
                                        ? "bg-orange-400 text-white"
                                        : "bg-gray-100 text-gray-600"
                                )}
                            >
                                {label}
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// =============================================================================
// Transaction List Item
// =============================================================================
function TransactionItem({
    transaction,
    type,
}: {
    transaction: FacilityTransaction;
    type: "expense" | "income";
}) {
    const isExpense = type === "expense";
    const formattedAmount = `${isExpense ? "-" : "+"} ₱ ${Math.abs(transaction.amount).toLocaleString()}`;
    const paymentMethod =
        transaction.payment_method === "BANK_TRANSFER"
            ? "Bank Transfer"
            : transaction.payment_method.charAt(0) +
            transaction.payment_method.slice(1).toLowerCase();

    return (
        <div className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
            <div className="space-y-1">
                <p className="font-medium text-gray-900">{transaction.category}</p>
                <p className="text-sm text-gray-500">{transaction.description}</p>
                <p className="text-xs text-gray-400">{transaction.transaction_date}</p>
            </div>
            <div className="text-right space-y-1">
                <p
                    className={cn(
                        "font-semibold",
                        isExpense ? "text-red-600" : "text-green-600"
                    )}
                >
                    {formattedAmount}
                </p>
                <p className="text-xs text-gray-400">{paymentMethod}</p>
            </div>
        </div>
    );
}

// =============================================================================
// Main Page Component
// =============================================================================
export default function FacilityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    // Data State
    const [facility, setFacility] = React.useState<Facility | null>(null);
    const [analytics, setAnalytics] = React.useState<FacilityWithAnalytics | null>(
        null
    );
    const [expenses, setExpenses] = React.useState<FacilityTransaction[]>([]);
    const [income, setIncome] = React.useState<FacilityTransaction[]>([]);
    const [availability, setAvailability] = React.useState<AvailabilitySlot[]>([]);
    const [config, setConfig] = React.useState<ReservationConfig | null>(null);
    const [reservations, setReservations] = React.useState<Reservation[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [showReservationDialog, setShowReservationDialog] = React.useState(false);

    // Fetch data on mount
    React.useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch facility details
                const facilityData = await facilitiesApi.getFacility(id);
                setFacility(facilityData);

                // Fetch analytics for income/expense totals
                const analyticsData = await facilitiesApi.getFacilitiesWithAnalytics();
                const thisAnalytics = analyticsData.find((a) => a.id === id);
                if (thisAnalytics) setAnalytics(thisAnalytics);

                // Fetch expense transactions
                try {
                    const expenseData = await facilitiesApi.getTransactions(id, "EXPENSE");
                    setExpenses(expenseData);
                } catch {
                    setExpenses([]);
                }

                // Fetch income transactions
                try {
                    const incomeData = await facilitiesApi.getTransactions(id, "INCOME");
                    setIncome(incomeData);
                } catch {
                    setIncome([]);
                }

                // Fetch reservation config (for operating hours)
                try {
                    const configData = await facilitiesApi.getConfig();
                    setConfig(configData);
                } catch {
                    // Config might not exist yet
                }

                // Fetch today's availability
                const today = new Date().toISOString().split("T")[0];
                try {
                    const availData = await facilitiesApi.getAvailability(id, today, today);
                    setAvailability(availData);
                } catch {
                    // Availability might not be set up
                    setAvailability([]);
                }

                // Fetch reservations for this facility
                try {
                    const reservationData = await reservationsApi.getReservations({ asset_id: id });
                    setReservations(reservationData);
                } catch {
                    setReservations([]);
                }
            } catch (err) {
                console.error("Failed to fetch facility:", err);
                setError("Failed to load facility details.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-brand" />
            </div>
        );
    }

    if (error || !facility) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="text-gray-600 font-medium">
                    {error || "Facility not found"}
                </p>
                <Button variant="outline" onClick={() => router.back()}>
                    Go Back
                </Button>
            </div>
        );
    }

    const imageUrl = facility.image_url || "/images/facility-placeholder.jpg";

    return (
        <div className="w-full max-w-[1920px] mx-auto space-y-6">
            {/* Header Section */}
            <div>
                <Button
                    variant="ghost"
                    className="pl-0 text-gray-500 hover:text-gray-900 gap-2 mb-4"
                    onClick={() => router.push("/dashboard/facilities")}
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Facilities
                </Button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl text-brand typography-h1">
                            {facility.name}
                        </h1>
                        <p className="text-sm text-gray-500 font-sans">
                            {facility.description || facility.location}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button
                            className="gap-2 bg-primary-500 hover:bg-primary-600"
                            onClick={() => setShowReservationDialog(true)}
                        >
                            <Calendar className="h-4 w-4" /> Schedule a Reservation
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 text-brand border-brand hover:bg-brand-light"
                        >
                            <DollarSign className="h-4 w-4" /> Add Expense
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 text-gray-600 hover:bg-gray-100"
                        >
                            <Edit className="h-4 w-4" /> Edit
                        </Button>
                        <Button
                            variant="outline"
                            className="gap-2 text-gray-600 hover:bg-gray-100"
                        >
                            <Archive className="h-4 w-4" /> Archive
                        </Button>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-1 bg-gradient-to-r from-brand to-cyan-400 rounded-full" />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="details">Details and Expenses</TabsTrigger>
                    <TabsTrigger value="schedule">
                        Schedule
                        {reservations.length > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {reservations.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="details">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-6">
                            {/* Facility Info Card */}
                            <Card className="shadow-sm border-gray-200 overflow-hidden">
                                <div className="flex flex-col sm:flex-row">
                                    {/* Image */}
                                    <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0">
                                        <Image
                                            src={imageUrl}
                                            alt={facility.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {/* Info */}
                                    <CardContent className="p-4 flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                                            {facility.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            Facility Information
                                        </p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-500">Availability:</span>
                                                <span className="font-medium">
                                                    {config
                                                        ? `${config.operating_hours_start} - ${config.operating_hours_end}`
                                                        : "9:00 AM - 10:00 PM"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-500">Capacity:</span>
                                                <span className="font-medium">
                                                    {facility.capacity
                                                        ? `${facility.capacity} Pax`
                                                        : "—"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Banknote className="h-4 w-4 text-gray-400" />
                                                <span className="text-gray-500">Rate:</span>
                                                <span className="font-medium">
                                                    {facility.rental_rate
                                                        ? `₱${facility.rental_rate.toLocaleString()} Per Hour`
                                                        : "—"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <Badge
                                                className={cn(
                                                    "px-2 py-1",
                                                    availability.length > 0 &&
                                                        availability.every((s) => !s.is_available)
                                                        ? "bg-orange-500 text-white"
                                                        : "bg-primary-500 text-white"
                                                )}
                                            >
                                                {availability.length > 0 &&
                                                    availability.every((s) => !s.is_available)
                                                    ? "Fully Booked"
                                                    : "Vacant"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </div>
                            </Card>

                            {/* Finance Summary Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="shadow-sm border-gray-200">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Facility Income
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₱{" "}
                                            {(analytics?.income_this_month || 0).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Last updated: {new Date().toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="shadow-sm border-gray-200">
                                    <CardContent className="p-4">
                                        <p className="text-sm text-gray-500 mb-1">
                                            Facility Net Income
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            ₱{" "}
                                            {(
                                                analytics?.net_income_this_month || 0
                                            ).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Last updated: {new Date().toLocaleDateString()}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Expenses Section */}
                            <Card className="shadow-sm border-gray-200">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-medium">
                                        Expenses
                                    </CardTitle>
                                    <Button variant="ghost" size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {expenses.length > 0 ? (
                                        expenses.map((exp) => (
                                            <TransactionItem
                                                key={exp.id}
                                                transaction={exp}
                                                type="expense"
                                            />
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No expenses recorded yet.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Today's Timeline */}
                            <ReservationTimeline
                                slots={availability}
                                operatingStart={config ? parseInt(config.operating_hours_start.split(':')[0]) : 9}
                                operatingEnd={config ? parseInt(config.operating_hours_end.split(':')[0]) : 22}
                            />

                            {/* Income Section */}
                            <Card className="shadow-sm border-gray-200">
                                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                    <CardTitle className="text-base font-medium">
                                        Income
                                    </CardTitle>
                                    <Button variant="ghost" size="icon">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {income.length > 0 ? (
                                        income.map((inc) => (
                                            <TransactionItem
                                                key={inc.id}
                                                transaction={inc}
                                                type="income"
                                            />
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 text-center py-4">
                                            No income recorded yet.
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <ScheduleTabContent
                        reservations={reservations}
                        onCreateClick={() => setShowReservationDialog(true)}
                        onRefresh={async () => {
                            try {
                                const data = await reservationsApi.getReservations({ asset_id: id });
                                setReservations(data);
                            } catch { /* ignore */ }
                        }}
                    />
                </TabsContent>
            </Tabs>

            {/* Create Reservation Dialog */}
            <CreateReservationDialog
                open={showReservationDialog}
                onOpenChange={setShowReservationDialog}
                assetId={id}
                onSuccess={async () => {
                    try {
                        const data = await reservationsApi.getReservations({ asset_id: id });
                        setReservations(data);
                    } catch { /* ignore */ }
                }}
            />
        </div>
    );
}

// =============================================================================
// Schedule Tab Content
// =============================================================================
function ScheduleTabContent({
    reservations,
    onCreateClick,
    onRefresh,
}: {
    reservations: Reservation[];
    onCreateClick: () => void;
    onRefresh: () => void;
}) {
    const [selectedReservation, setSelectedReservation] = React.useState<Reservation | null>(null);
    const [showDetailDialog, setShowDetailDialog] = React.useState(false);
    const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
    const [showCancelDialog, setShowCancelDialog] = React.useState(false);

    const table = useReactTable({
        data: reservations,
        columns: reservationColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    const handleRowClick = (reservation: Reservation) => {
        setSelectedReservation(reservation);
        setShowDetailDialog(true);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                    {reservations.length} reservation{reservations.length !== 1 ? "s" : ""}
                </p>
                <Button
                    className="gap-2 bg-primary-500 hover:bg-primary-600"
                    onClick={onCreateClick}
                >
                    <Plus className="h-4 w-4" /> New Reservation
                </Button>
            </div>

            {/* Table */}
            {reservations.length === 0 ? (
                <Card className="shadow-sm border-gray-200">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
                        <Calendar className="h-8 w-8 mb-3 text-gray-400" />
                        <p className="font-medium">No reservations yet</p>
                        <p className="text-sm mt-1">Schedule the first reservation for this facility.</p>
                    </CardContent>
                </Card>
            ) : (
                <Card className="shadow-sm border-gray-200 overflow-hidden">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleRowClick(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Reservation Detail Dialog */}
            {selectedReservation && (
                <ReservationDetailDialog
                    reservation={selectedReservation}
                    open={showDetailDialog}
                    onOpenChange={(open) => {
                        setShowDetailDialog(open);
                        if (!open) setSelectedReservation(null);
                    }}
                    onRecordPayment={() => {
                        setShowDetailDialog(false);
                        setShowPaymentDialog(true);
                    }}
                    onCancel={() => {
                        setShowDetailDialog(false);
                        setShowCancelDialog(true);
                    }}
                    onConfirmReceipt={async () => {
                        try {
                            await reservationsApi.confirmReceipt(selectedReservation.id);
                            setShowDetailDialog(false);
                            onRefresh();
                        } catch (err) {
                            console.error("Failed to confirm receipt:", err);
                            alert("Failed to confirm receipt.");
                        }
                    }}
                />
            )}

            {/* Record Payment Dialog */}
            {selectedReservation && (
                <RecordPaymentDialog
                    reservation={selectedReservation}
                    open={showPaymentDialog}
                    onOpenChange={setShowPaymentDialog}
                    onSuccess={() => {
                        setShowPaymentDialog(false);
                        setSelectedReservation(null);
                        onRefresh();
                    }}
                />
            )}

            {/* Cancel Reservation Dialog */}
            {selectedReservation && (
                <CancelReservationDialog
                    reservation={selectedReservation}
                    open={showCancelDialog}
                    onOpenChange={setShowCancelDialog}
                    onSuccess={() => {
                        setShowCancelDialog(false);
                        setSelectedReservation(null);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}

// =============================================================================
// Reservation Detail Dialog
// =============================================================================
function ReservationDetailDialog({
    reservation,
    open,
    onOpenChange,
    onRecordPayment,
    onCancel,
    onConfirmReceipt,
}: {
    reservation: Reservation;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRecordPayment: () => void;
    onCancel: () => void;
    onConfirmReceipt: () => void;
}) {
    const start = new Date(reservation.start_datetime);
    const end = new Date(reservation.end_datetime);
    const isPendingPayment = reservation.status === "PENDING_PAYMENT";
    const isForReview = reservation.status === "FOR_REVIEW";
    const isConfirmed = reservation.status === "CONFIRMED";
    const isViewOnly = ["COMPLETED", "CANCELLED", "EXPIRED"].includes(reservation.status);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        Reservation Details
                        <Badge className={RESERVATION_STATUS_STYLES[reservation.status] || "bg-gray-100"}>
                            {statusLabel(reservation.status)}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        {reservation.asset_name}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Booking Info */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                            <span className="text-gray-500">Reserved By</span>
                            <p className="font-medium text-gray-900">{reservation.reserved_by_name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Date</span>
                            <p className="font-medium text-gray-900">
                                {start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Time</span>
                            <p className="font-medium text-gray-900">
                                {start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                                {" – "}
                                {end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Duration</span>
                            <p className="font-medium text-gray-900">{reservation.hours} hour(s)</p>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Payment Breakdown */}
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-gray-800">Payment Breakdown</h4>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">₱{reservation.hourly_rate.toLocaleString()} × {reservation.hours} hrs</span>
                                <span className="text-gray-900">₱ {reservation.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {reservation.discount_amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-emerald-600">Discount</span>
                                    <span className="text-emerald-600">-₱ {reservation.discount_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {reservation.deposit_amount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Deposit</span>
                                    <span className="text-gray-900">₱ {reservation.deposit_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-1 border-t border-dashed border-gray-200">
                                <span className="font-semibold text-gray-900">Total</span>
                                <span className="font-bold text-gray-900">₱ {reservation.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                            <Badge className={PAYMENT_STATUS_STYLES[reservation.payment_status] || "bg-gray-100"}>
                                {statusLabel(reservation.payment_status)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                                Paid: ₱ {reservation.amount_paid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        {reservation.balance_due > 0 && (
                            <span className="text-sm font-semibold text-red-600">
                                Balance: ₱ {reservation.balance_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {!isViewOnly && (
                    <DialogFooter className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={onCancel}
                        >
                            Cancel Reservation
                        </Button>
                        <div className="flex-1" />
                        {isPendingPayment && (
                            <Button
                                className="bg-primary-500 hover:bg-primary-600 gap-2"
                                onClick={onRecordPayment}
                            >
                                <Banknote className="h-4 w-4" /> Record Payment
                            </Button>
                        )}
                        {isForReview && (
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                                onClick={onConfirmReceipt}
                            >
                                Confirm Receipt
                            </Button>
                        )}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// Record Payment Dialog
// =============================================================================
function RecordPaymentDialog({
    reservation,
    open,
    onOpenChange,
    onSuccess,
}: {
    reservation: Reservation;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const [amount, setAmount] = React.useState(reservation.balance_due.toString());
    const [refNumber, setRefNumber] = React.useState("");
    const [paymentMethod, setPaymentMethod] = React.useState("CASH");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        setAmount(reservation.balance_due.toString());
        setRefNumber("");
        setPaymentMethod("CASH");
        setError(null);
    }, [reservation]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) {
            setError("Amount must be greater than 0.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        try {
            await reservationsApi.recordPayment(reservation.id, {
                amount: parseFloat(amount),
                reference_number: refNumber || undefined,
                payment_method: paymentMethod,
            });
            onSuccess();
        } catch (err) {
            console.error("Failed to record payment:", err);
            setError("Failed to record payment. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Record Payment</DialogTitle>
                    <DialogDescription>
                        Record a payment for {reservation.asset_name}.
                        Balance due: ₱ {reservation.balance_due.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Amount (₱) *</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Reference Number</label>
                        <Input
                            placeholder="e.g. OR-12345"
                            value={refNumber}
                            onChange={(e) => setRefNumber(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            <option value="CASH">Cash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHECK">Check</option>
                            <option value="GCASH">GCash</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" className="bg-primary-500 hover:bg-primary-600" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Record Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// Cancel Reservation Dialog
// =============================================================================
function CancelReservationDialog({
    reservation,
    open,
    onOpenChange,
    onSuccess,
}: {
    reservation: Reservation;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}) {
    const [reason, setReason] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        try {
            await reservationsApi.cancelReservation(reservation.id, { reason });
            onSuccess();
        } catch (err) {
            console.error("Failed to cancel reservation:", err);
            setError("Failed to cancel. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600">Cancel Reservation</DialogTitle>
                    <DialogDescription>
                        This will cancel the reservation for {reservation.asset_name} on{" "}
                        {new Date(reservation.start_datetime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.
                        This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Reason (optional)</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground"
                            placeholder="Why is this reservation being cancelled?"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Keep Reservation</Button>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Confirm Cancellation
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

