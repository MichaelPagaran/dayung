"use client";

import * as React from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
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
import {
    facilitiesApi,
    Facility,
    FacilityWithAnalytics,
    FacilityTransaction,
    AvailabilitySlot,
} from "@/lib/services/facilities";
import { cn } from "@/lib/utils";

// =============================================================================
// Stub Income Data (since reservation support isn't ready yet)
// =============================================================================
const STUB_INCOME: FacilityTransaction[] = [
    {
        id: "1",
        transaction_type: "INCOME",
        amount: 200,
        category: "Rental Income",
        description: "John Smith - Unit A-102",
        payment_method: "CASH",
        transaction_date: "2024-01-20",
        reservation_id: null,
        created_at: "2024-01-20T08:00:00Z",
    },
    {
        id: "2",
        transaction_type: "INCOME",
        amount: 200,
        category: "Rental Income",
        description: "Michael Martin - Unit A-105",
        payment_method: "CASH",
        transaction_date: "2024-02-20",
        reservation_id: null,
        created_at: "2024-02-20T08:00:00Z",
    },
    {
        id: "3",
        transaction_type: "INCOME",
        amount: 300,
        category: "Rental Income",
        description: "Rizel Gabrielle - Unit B-105",
        payment_method: "CASH",
        transaction_date: "2024-03-20",
        reservation_id: null,
        created_at: "2024-03-20T08:00:00Z",
    },
];

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
    const [availability, setAvailability] = React.useState<AvailabilitySlot[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

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
                    // Expenses might be empty
                    setExpenses([]);
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
                        <Button className="gap-2 bg-primary-500 hover:bg-primary-600">
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
                    <TabsTrigger value="schedule" disabled>
                        Schedule
                        <Badge variant="secondary" className="ml-2 text-xs">
                            Coming Soon
                        </Badge>
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
                                                    {facility.min_duration_hours}AM -{" "}
                                                    {facility.max_duration_hours}PM
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
                            <ReservationTimeline slots={availability} />

                            {/* Income Section (Stub Data) */}
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
                                    {STUB_INCOME.map((inc) => (
                                        <TransactionItem
                                            key={inc.id}
                                            transaction={inc}
                                            type="income"
                                        />
                                    ))}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="schedule">
                    <div className="flex items-center justify-center min-h-[300px] text-gray-500">
                        Schedule feature coming soon...
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
