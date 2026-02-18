"use client";

import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import {
    Plus,
    Loader2,
    TrendingUp,
    TrendingDown,
    Wallet,
    Settings,
    Percent,
    AlertTriangle,
    ReceiptText,
    Zap,
} from "lucide-react";

import { ListPageLayout } from "@/components/layout/list-page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
    ledgerApi,
    Transaction,
    FinancialSummary,
    Category,
    IncomePayload,
    ExpensePayload,
    BillingConfig,
    DuesStatement,
    DiscountConfig,
    PenaltyPolicy,
} from "@/lib/services/ledger";

// =============================================================================
// Status Badge Helpers
// =============================================================================

const STATUS_STYLES: Record<string, string> = {
    POSTED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-blue-100 text-blue-700",
    CANCELLED: "bg-red-100 text-red-700",
    DRAFT: "bg-gray-100 text-gray-600",
};

const DUES_STATUS_STYLES: Record<string, string> = {
    UNPAID: "bg-red-100 text-red-700",
    PARTIAL: "bg-amber-100 text-amber-700",
    PAID: "bg-emerald-100 text-emerald-700",
    OVERDUE: "bg-red-200 text-red-800",
    WAIVED: "bg-gray-100 text-gray-600",
};

// =============================================================================
// Transaction Table Columns
// =============================================================================

const transactionColumns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "transaction_date",
        header: "Date",
        cell: ({ row }) => {
            const date = new Date(row.original.transaction_date);
            return (
                <span className="text-sm text-gray-700 whitespace-nowrap">
                    {date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    })}
                </span>
            );
        },
    },
    {
        accessorKey: "transaction_type",
        header: "Type",
        cell: ({ row }) => {
            const type = row.original.transaction_type;
            return (
                <Badge
                    className={cn(
                        "font-medium",
                        type === "INCOME"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                    )}
                >
                    {type === "INCOME" ? "Income" : "Expense"}
                </Badge>
            );
        },
    },
    {
        accessorKey: "category",
        header: "Category",
        cell: ({ row }) => (
            <span className="text-sm text-gray-900 font-medium">
                {row.original.category}
            </span>
        ),
    },
    {
        accessorKey: "amount",
        header: () => <span className="text-right block">Amount</span>,
        cell: ({ row }) => {
            const isIncome = row.original.transaction_type === "INCOME";
            return (
                <span
                    className={cn(
                        "text-sm font-semibold block text-right whitespace-nowrap",
                        isIncome ? "text-emerald-600" : "text-red-600"
                    )}
                >
                    {isIncome ? "+" : "-"} ₱{" "}
                    {Math.abs(row.original.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                    })}
                </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge className={STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_verified",
        header: "Verified",
        cell: ({ row }) => (
            <span className="text-sm">
                {row.original.is_verified ? (
                    <Badge className="bg-emerald-100 text-emerald-700">✓</Badge>
                ) : (
                    <Badge className="bg-gray-100 text-gray-500">—</Badge>
                )}
            </span>
        ),
    },
];

// =============================================================================
// Dues Statement Table Columns
// =============================================================================

const duesColumns: ColumnDef<DuesStatement>[] = [
    {
        accessorKey: "period",
        header: "Period",
        cell: ({ row }) => {
            const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return (
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                    {months[row.original.statement_month]} {row.original.statement_year}
                </span>
            );
        },
    },
    {
        accessorKey: "unit_id",
        header: "Unit",
        cell: ({ row }) => (
            <span className="text-sm text-gray-600 font-mono">
                {row.original.unit_id.slice(0, 8)}...
            </span>
        ),
    },
    {
        accessorKey: "base_amount",
        header: () => <span className="text-right block">Base</span>,
        cell: ({ row }) => (
            <span className="text-sm text-gray-700 block text-right whitespace-nowrap">
                ₱ {row.original.base_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        ),
    },
    {
        accessorKey: "penalty_amount",
        header: () => <span className="text-right block">Penalty</span>,
        cell: ({ row }) => {
            const penalty = row.original.penalty_amount;
            return penalty > 0 ? (
                <span className="text-sm text-red-600 block text-right whitespace-nowrap">
                    +₱ {penalty.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            ) : (
                <span className="text-sm text-gray-400 block text-right">—</span>
            );
        },
    },
    {
        accessorKey: "discount_amount",
        header: () => <span className="text-right block">Discount</span>,
        cell: ({ row }) => {
            const discount = row.original.discount_amount;
            return discount > 0 ? (
                <span className="text-sm text-emerald-600 block text-right whitespace-nowrap">
                    -₱ {discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            ) : (
                <span className="text-sm text-gray-400 block text-right">—</span>
            );
        },
    },
    {
        accessorKey: "net_amount",
        header: () => <span className="text-right block">Net Due</span>,
        cell: ({ row }) => (
            <span className="text-sm font-semibold text-gray-900 block text-right whitespace-nowrap">
                ₱ {row.original.net_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
        ),
    },
    {
        accessorKey: "balance_due",
        header: () => <span className="text-right block">Balance</span>,
        cell: ({ row }) => {
            const balance = row.original.balance_due;
            return (
                <span className={cn(
                    "text-sm font-semibold block text-right whitespace-nowrap",
                    balance > 0 ? "text-red-600" : "text-emerald-600"
                )}>
                    ₱ {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.original.status;
            return (
                <Badge className={DUES_STATUS_STYLES[status] || "bg-gray-100 text-gray-600"}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                </Badge>
            );
        },
    },
    {
        accessorKey: "due_date",
        header: "Due Date",
        cell: ({ row }) => {
            const date = new Date(row.original.due_date);
            return (
                <span className="text-sm text-gray-700 whitespace-nowrap">
                    {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
            );
        },
    },
];

// =============================================================================
// Summary Cards
// =============================================================================

function SummaryCards({ summary, isLoading }: { summary: FinancialSummary | null; isLoading: boolean }) {
    const cards = [
        {
            label: "Total Income",
            value: summary?.total_income ?? 0,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
        },
        {
            label: "Total Expenses",
            value: summary?.total_expense ?? 0,
            icon: TrendingDown,
            color: "text-red-600",
            bg: "bg-red-50",
        },
        {
            label: "Net Balance",
            value: summary?.net_balance ?? 0,
            icon: Wallet,
            color: (summary?.net_balance ?? 0) >= 0 ? "text-emerald-600" : "text-red-600",
            bg: (summary?.net_balance ?? 0) >= 0 ? "bg-emerald-50" : "bg-red-50",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card) => (
                <Card key={card.label} className="shadow-sm border-gray-200">
                    <CardContent className="p-4 flex items-center gap-4">
                        <div className={cn("p-2 rounded-lg", card.bg)}>
                            <card.icon className={cn("h-5 w-5", card.color)} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                {card.label}
                            </p>
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400 mt-1" />
                            ) : (
                                <p className={cn("text-xl font-bold", card.color)}>
                                    ₱{" "}
                                    {card.value.toLocaleString(undefined, {
                                        minimumFractionDigits: 2,
                                    })}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// =============================================================================
// Add Transaction Dialog
// =============================================================================

function AddTransactionDialog({
    open,
    onOpenChange,
    categories,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
    onSuccess: () => void;
}) {
    const [type, setType] = React.useState<"INCOME" | "EXPENSE">("INCOME");
    const [category, setCategory] = React.useState("");
    const [amount, setAmount] = React.useState("");
    const [description, setDescription] = React.useState("");
    const [payerName, setPayerName] = React.useState("");
    const [transactionDate, setTransactionDate] = React.useState(
        new Date().toISOString().split("T")[0]
    );
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const filteredCategories = categories.filter(
        (c) => c.transaction_type === type
    );

    const resetForm = () => {
        setCategory("");
        setAmount("");
        setDescription("");
        setPayerName("");
        setTransactionDate(new Date().toISOString().split("T")[0]);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount || !transactionDate) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (type === "INCOME") {
                const payload: IncomePayload = {
                    category,
                    amount: parseFloat(amount),
                    description,
                    payer_name: payerName || undefined,
                    transaction_date: transactionDate,
                };
                await ledgerApi.createIncome(payload);
            } else {
                const payload: ExpensePayload = {
                    category,
                    amount: parseFloat(amount),
                    description,
                    transaction_date: transactionDate,
                };
                await ledgerApi.createExpense(payload);
            }
            resetForm();
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error("Failed to create transaction:", err);
            setError("Failed to create transaction. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Add Transaction</DialogTitle>
                    <DialogDescription>
                        Record a new income or expense transaction.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Selector */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Type
                        </label>
                        <Select
                            value={type}
                            onValueChange={(v) => {
                                setType(v as "INCOME" | "EXPENSE");
                                setCategory("");
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INCOME">Income</SelectItem>
                                <SelectItem value="EXPENSE">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Category *
                        </label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredCategories.map((c) => (
                                    <SelectItem key={c.id} value={c.name}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Amount (₱) *
                        </label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <Input
                            placeholder="Brief description..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Payer Name (Income only) */}
                    {type === "INCOME" && (
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">
                                Payer Name
                            </label>
                            <Input
                                placeholder="Who paid?"
                                value={payerName}
                                onChange={(e) => setPayerName(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Date */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">
                            Transaction Date *
                        </label>
                        <Input
                            type="date"
                            value={transactionDate}
                            onChange={(e) => setTransactionDate(e.target.value)}
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600">{error}</p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-primary-500 hover:bg-primary-600"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Add {type === "INCOME" ? "Income" : "Expense"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// Edit Billing Config Dialog
// =============================================================================

function EditBillingConfigDialog({
    open,
    onOpenChange,
    config,
    onSuccess,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    config: BillingConfig | null;
    onSuccess: () => void;
}) {
    const [amount, setAmount] = React.useState(config?.monthly_dues_amount?.toString() ?? "");
    const [billingDay, setBillingDay] = React.useState(config?.billing_day?.toString() ?? "1");
    const [gracePeriod, setGracePeriod] = React.useState(config?.grace_period_days?.toString() ?? "15");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (config) {
            setAmount(config.monthly_dues_amount.toString());
            setBillingDay(config.billing_day.toString());
            setGracePeriod(config.grace_period_days.toString());
        }
    }, [config]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) { setError("Monthly amount is required."); return; }
        setIsSubmitting(true);
        setError(null);
        try {
            await ledgerApi.updateBillingConfig({
                monthly_dues_amount: parseFloat(amount),
                billing_day: parseInt(billingDay) || 1,
                grace_period_days: parseInt(gracePeriod) || 15,
            });
            onOpenChange(false);
            onSuccess();
        } catch (err) {
            console.error("Failed to update billing config:", err);
            setError("Failed to save. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Billing Configuration</DialogTitle>
                    <DialogDescription>
                        Set monthly dues amount, billing day, and grace period.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Monthly Dues (₱) *</label>
                        <Input type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Billing Day (1-28)</label>
                        <Input type="number" min="1" max="28" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Grace Period (days)</label>
                        <Input type="number" min="0" value={gracePeriod} onChange={(e) => setGracePeriod(e.target.value)} />
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit" className="bg-primary-500 hover:bg-primary-600" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// =============================================================================
// Billing & Dues Tab Content
// =============================================================================

function BillingDuesTabContent() {
    const [billingConfig, setBillingConfig] = React.useState<BillingConfig | null>(null);
    const [duesStatements, setDuesStatements] = React.useState<DuesStatement[]>([]);
    const [discounts, setDiscounts] = React.useState<DiscountConfig[]>([]);
    const [penalties, setPenalties] = React.useState<PenaltyPolicy[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
    const [showConfigDialog, setShowConfigDialog] = React.useState(false);
    const [isGenerating, setIsGenerating] = React.useState(false);

    const fetchBillingData = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: Record<string, string> = {};
            if (statusFilter !== "ALL") filters.status = statusFilter;

            const [config, statements, discs, pens] = await Promise.allSettled([
                ledgerApi.getBillingConfig(),
                ledgerApi.getDuesStatements(filters),
                ledgerApi.getDiscounts(),
                ledgerApi.getPenalties(),
            ]);

            setBillingConfig(config.status === "fulfilled" ? config.value : null);
            setDuesStatements(statements.status === "fulfilled" ? statements.value : []);
            setDiscounts(discs.status === "fulfilled" ? discs.value : []);
            setPenalties(pens.status === "fulfilled" ? pens.value : []);
        } catch (err) {
            console.error("Failed to fetch billing data:", err);
            setError("Failed to load billing data.");
        } finally {
            setIsLoading(false);
        }
    }, [statusFilter]);

    React.useEffect(() => {
        fetchBillingData();
    }, [fetchBillingData]);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await ledgerApi.triggerBillingGeneration();
            alert(`Generated ${result.statements_created} statement(s).`);
            fetchBillingData();
        } catch (err) {
            console.error("Failed to generate statements:", err);
            alert("Failed to generate. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const duesTable = useReactTable({
        data: duesStatements,
        columns: duesColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-500">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading billing data...
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 p-4">
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Config + Discounts + Penalties row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Billing Config Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Settings className="h-4 w-4 text-gray-500" />
                            Billing Config
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={() => setShowConfigDialog(true)}
                        >
                            Edit
                        </Button>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                        {billingConfig ? (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Monthly Dues</span>
                                    <span className="font-semibold">₱ {billingConfig.monthly_dues_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Billing Day</span>
                                    <span className="font-medium">Day {billingConfig.billing_day}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Grace Period</span>
                                    <span className="font-medium">{billingConfig.grace_period_days} days</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">Not configured. Click Edit to set up.</p>
                        )}
                        <Button
                            size="sm"
                            className="w-full mt-2 gap-2 bg-primary-500 hover:bg-primary-600"
                            disabled={!billingConfig || isGenerating}
                            onClick={handleGenerate}
                        >
                            {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
                            Generate Statements
                        </Button>
                    </CardContent>
                </Card>

                {/* Discounts Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <Percent className="h-4 w-4 text-emerald-500" />
                            Active Discounts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                        {discounts.length === 0 ? (
                            <p className="text-sm text-gray-400">No active discounts.</p>
                        ) : (
                            discounts.map((d) => (
                                <div key={d.id} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{d.name}</span>
                                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                        {d.discount_type === "PERCENTAGE" ? `${d.value}%` : `₱${d.value}`}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Penalties Card */}
                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                            Active Penalties
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-2">
                        {penalties.length === 0 ? (
                            <p className="text-sm text-gray-400">No active penalties.</p>
                        ) : (
                            penalties.map((p) => (
                                <div key={p.id} className="flex justify-between text-sm">
                                    <span className="text-gray-700">{p.name}</span>
                                    <Badge className="bg-amber-100 text-amber-700 text-xs">
                                        {p.rate_type === "PERCENT" ? `${p.rate_value}%/mo` : `₱${p.rate_value}`}
                                    </Badge>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Dues Statements section */}
            <div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <ReceiptText className="h-4 w-4 text-gray-500" />
                        Dues Statements
                        <Badge variant="secondary" className="text-xs">{duesStatements.length}</Badge>
                    </h3>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-full sm:w-[160px]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                            <SelectItem value="PARTIAL">Partial</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                            <SelectItem value="WAIVED">Waived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {duesStatements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-gray-500 border border-dashed border-gray-200 rounded-lg">
                        <p>No dues statements found.</p>
                        <p className="text-xs mt-1">Configure billing and generate statements to see them here.</p>
                    </div>
                ) : (
                    <div className="border border-gray-200 rounded-lg overflow-auto">
                        <Table>
                            <TableHeader>
                                {duesTable.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {duesTable.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Config Dialog */}
            <EditBillingConfigDialog
                open={showConfigDialog}
                onOpenChange={setShowConfigDialog}
                config={billingConfig}
                onSuccess={fetchBillingData}
            />
        </div>
    );
}

// =============================================================================
// Main Page
// =============================================================================

export default function LedgerPage() {
    // Data State
    const [transactions, setTransactions] = React.useState<Transaction[]>([]);
    const [summary, setSummary] = React.useState<FinancialSummary | null>(null);
    const [categories, setCategories] = React.useState<Category[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    // Filter State
    const [typeFilter, setTypeFilter] = React.useState<string>("ALL");
    const [statusFilter, setStatusFilter] = React.useState<string>("ALL");

    // Dialog State
    const [showAddDialog, setShowAddDialog] = React.useState(false);

    // Fetch data
    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const filters: Record<string, string> = {};
            if (typeFilter !== "ALL") filters.transaction_type = typeFilter;
            if (statusFilter !== "ALL") filters.status = statusFilter;

            const [txn, sum, cats] = await Promise.all([
                ledgerApi.getTransactions(filters),
                ledgerApi.getFinancialSummary("MTD"),
                ledgerApi.getCategories(),
            ]);
            setTransactions(txn);
            setSummary(sum);
            setCategories(cats);
        } catch (err) {
            console.error("Failed to fetch ledger data:", err);
            setError("Failed to load ledger data. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [typeFilter, statusFilter]);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Table
    const table = useReactTable({
        data: transactions,
        columns: transactionColumns,
        getCoreRowModel: getCoreRowModel(),
        getRowId: (row) => row.id,
    });

    return (
        <>
            <ListPageLayout
                title="Expenses & Budget"
                subtitle="Track income, expenses, and financial health of the organization."
            >
                <Tabs defaultValue="transactions" className="flex flex-col flex-1 min-h-0">
                    <div className="flex-shrink-0 px-4 pt-2 border-b border-gray-100">
                        <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-grid">
                            <TabsTrigger value="transactions" className="text-sm">
                                Transactions
                            </TabsTrigger>
                            <TabsTrigger value="billing" className="text-sm">
                                Billing & Dues
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* === Transactions Tab === */}
                    <TabsContent value="transactions" className="flex flex-col flex-1 min-h-0 mt-0">
                        {/* Summary Cards */}
                        <div className="flex-shrink-0 p-4 border-b border-gray-100">
                            <SummaryCards summary={summary} isLoading={isLoading} />
                        </div>

                        {/* Toolbar */}
                        <div className="flex-shrink-0 flex flex-col gap-3 p-4 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <Select value={typeFilter} onValueChange={setTypeFilter}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Types</SelectItem>
                                        <SelectItem value="INCOME">Income</SelectItem>
                                        <SelectItem value="EXPENSE">Expense</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-full sm:w-[160px]">
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Statuses</SelectItem>
                                        <SelectItem value="POSTED">Posted</SelectItem>
                                        <SelectItem value="PENDING">Pending</SelectItem>
                                        <SelectItem value="APPROVED">Approved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="gap-2 bg-primary-500 hover:bg-primary-600 typography-btn"
                                onClick={() => setShowAddDialog(true)}
                            >
                                <Plus className="h-4 w-4" /> Add Transaction
                            </Button>
                        </div>

                        {/* Status Bar */}
                        <div className="flex-shrink-0 px-4 py-2 text-xs text-gray-400 border-b border-gray-100 flex items-center justify-between">
                            <span>
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                                    </span>
                                ) : (
                                    `Showing ${transactions.length} transactions`
                                )}
                            </span>
                            {summary && (
                                <span>{summary.period} overview</span>
                            )}
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="flex-shrink-0 mx-4 my-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Table */}
                        <div className="flex-1 min-h-0 overflow-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-48 text-gray-500">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    Loading transactions...
                                </div>
                            ) : transactions.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                                    <p>No transactions found.</p>
                                    <p className="text-xs mt-1">
                                        Try adjusting your filters or add a new transaction.
                                    </p>
                                </div>
                            ) : (
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
                                            <TableRow key={row.id}>
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
                            )}
                        </div>
                    </TabsContent>

                    {/* === Billing & Dues Tab === */}
                    <TabsContent value="billing" className="flex flex-col flex-1 min-h-0 mt-0">
                        <BillingDuesTabContent />
                    </TabsContent>
                </Tabs>
            </ListPageLayout>

            {/* Add Transaction Dialog */}
            <AddTransactionDialog
                open={showAddDialog}
                onOpenChange={setShowAddDialog}
                categories={categories}
                onSuccess={fetchData}
            />
        </>
    );
}
