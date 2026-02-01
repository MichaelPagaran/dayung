/**
 * @file src/types/backend.d.ts
 * @description Manual port of AGMS backend Pydantic schemas.
 * @policy Matches `agms/apps/<app>/schemas.py`. Update when backend schemas change.
 */

// =============================================================================
// SHARED
// =============================================================================

export type UUID = string;
export type Decimal = number; // JSON serializes Decimal as number or string
export type DateString = string; // YYYY-MM-DD
export type DateTimeString = string; // ISO 8601

export interface ErrorOut {
    detail: string;
}

export interface SuccessOut {
    success: boolean;
    message: string;
}

// =============================================================================
// LEDGER (agms/apps/ledger/schemas.py)
// =============================================================================

export enum TransactionTypeEnum {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE'
}

export enum TransactionStatusEnum {
    DRAFT = 'DRAFT',
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    CANCELLED = 'CANCELLED'
}

export enum PaymentTypeEnum {
    EXACT = 'EXACT',
    ADVANCE = 'ADVANCE'
}

export interface IncomeIn {
    unit_id?: UUID;
    category_id?: UUID;
    category: string;
    amount: Decimal;
    payment_type?: 'EXACT' | 'ADVANCE';
    description?: string;
    payer_name?: string;
    reference_number?: string;
    transaction_date: DateString;
    apply_discount_ids?: UUID[];
}

export interface ExpenseIn {
    category_id?: UUID;
    category: string;
    amount: Decimal;
    description?: string;
    transaction_date: DateString;
    asset_id?: UUID;
    unit_id?: UUID;
}

export interface TransactionFilterIn {
    start_date?: DateString;
    end_date?: DateString;
    category_id?: UUID;
    transaction_type?: string;
    status?: string;
    unit_id?: UUID;
}

export interface TransactionOut {
    id: UUID;
    org_id: UUID;
    transaction_type: string;
    status: string;
    amount: Decimal;
    net_amount: Decimal;
    category: string;
    transaction_date: DateString;
    is_verified: boolean;
}

export interface TransactionDetailOut {
    id: UUID;
    org_id: UUID;
    unit_id?: UUID;
    category_id?: UUID;
    transaction_type: string;
    status: string;
    payment_type: string;
    gross_amount: Decimal;
    net_amount: Decimal;
    category: string;
    description: string;
    payer_name?: string;
    reference_number?: string;
    transaction_date: DateString;
    requires_receipt: boolean;
    receipt_verified: boolean;
    created_by_id?: UUID;
    verified_by_id?: UUID;
    verified_at?: DateTimeString;
    created_at: DateTimeString;
    is_verified: boolean;
}

export interface CategoryOut {
    id: UUID;
    name: string;
    transaction_type: string;
    description: string;
    is_active: boolean;
    is_default: boolean;
}

export interface FinancialSummaryOut {
    period: string;
    total_income: Decimal;
    total_expense: Decimal;
    net_balance: Decimal;
    transaction_count: number;
}

export interface MonthlyTrendOut {
    year: number;
    month: number;
    income: Decimal;
    expense: Decimal;
    net: Decimal;
}

// =============================================================================
// ASSETS (agms/apps/assets/schemas.py)
// =============================================================================

export interface AssetIn {
    name: string;
    asset_type?: string;
    description?: string;
    rental_rate?: Decimal;
    capacity?: number;
    location?: string;
    requires_deposit?: boolean;
    deposit_amount?: Decimal;
    min_duration_hours?: number;
    max_duration_hours?: number;
}

export interface AssetOut {
    id: UUID;
    name: string;
    asset_type: string;
    description: string;
    rental_rate?: Decimal;
    capacity?: number;
    location: string;
    requires_deposit: boolean;
    deposit_amount?: Decimal;
    min_duration_hours: number;
    max_duration_hours: number;
    is_active: boolean;
}

export interface AssetWithAnalyticsOut {
    id: UUID;
    name: string;
    asset_type: string;
    rental_rate?: Decimal;
    income_this_month: Decimal;
    expenses_this_month: Decimal;
    net_income_this_month: Decimal;
    reservation_count_this_month: number;
}

export interface ReservationIn {
    asset_id: UUID;
    unit_id?: UUID;
    start_datetime: DateTimeString;
    end_datetime: DateTimeString;
    reserved_by_name: string;
    contact_phone?: string;
    contact_email?: string;
    purpose?: string;
    apply_discount_ids?: UUID[];
}

export interface ReservationOut {
    id: UUID;
    asset_id: UUID;
    asset_name: string;
    unit_id?: UUID;
    reserved_by_id: UUID;
    reserved_by_name: string;
    start_datetime: DateTimeString;
    end_datetime: DateTimeString;
    hourly_rate: Decimal;
    hours: number;
    subtotal: Decimal;
    discount_amount: Decimal;
    deposit_amount: Decimal;
    total_amount: Decimal;
    amount_paid: Decimal;
    balance_due: Decimal;
    status: string;
    payment_status: string;
    income_transaction_id?: UUID;
    expires_at?: DateTimeString;
    created_at: DateTimeString;
}

export interface AvailabilitySlotOut {
    start_datetime: DateTimeString;
    end_datetime: DateTimeString;
    is_available: boolean;
    reservation_id?: UUID;
    reserved_by_name?: string;
}
