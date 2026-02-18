import { api } from '@/lib/api';

// =============================================================================
// Types - Matching backend ledger schemas
// =============================================================================

export interface Transaction {
    id: string;
    org_id: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    status: string;
    amount: number;
    net_amount: number;
    category: string;
    transaction_date: string;
    is_verified: boolean;
}

export interface TransactionDetail {
    id: string;
    org_id: string;
    unit_id?: string;
    category_id?: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    status: string;
    payment_type: string;
    gross_amount: number;
    net_amount: number;
    category: string;
    description: string;
    payer_name?: string;
    reference_number?: string;
    transaction_date: string;
    requires_receipt: boolean;
    receipt_verified: boolean;
    created_by_id?: string;
    verified_by_id?: string;
    verified_at?: string;
    created_at: string;
    is_verified: boolean;
}

export interface TransactionFilters {
    start_date?: string;
    end_date?: string;
    category_id?: string;
    transaction_type?: string;
    status?: string;
    unit_id?: string;
    limit?: number;
}

export interface FinancialSummary {
    period: string;
    total_income: number;
    total_expense: number;
    net_balance: number;
    transaction_count: number;
}

export interface Category {
    id: string;
    name: string;
    transaction_type: 'INCOME' | 'EXPENSE';
    description: string;
    is_active: boolean;
    is_default: boolean;
}

export interface IncomePayload {
    unit_id?: string;
    category_id?: string;
    category: string;
    amount: number;
    payment_type?: 'EXACT' | 'ADVANCE';
    description?: string;
    payer_name?: string;
    reference_number?: string;
    transaction_date: string;
    apply_discount_ids?: string[];
}

export interface ExpensePayload {
    category_id?: string;
    category: string;
    amount: number;
    description?: string;
    transaction_date: string;
    asset_id?: string;
    unit_id?: string;
}

// =============================================================================
// API Methods
// =============================================================================

export const ledgerApi = {
    /**
     * List transactions with optional filters.
     */
    getTransactions: async (filters?: TransactionFilters): Promise<Transaction[]> => {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.category_id) params.append('category_id', filters.category_id);
        if (filters?.transaction_type) params.append('transaction_type', filters.transaction_type);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.unit_id) params.append('unit_id', filters.unit_id);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const queryString = params.toString();
        const url = queryString ? `/ledger/transactions?${queryString}` : '/ledger/transactions';
        const response = await api.get<Transaction[]>(url);
        return response.data;
    },

    /**
     * Get a single transaction by ID.
     */
    getTransaction: async (id: string): Promise<TransactionDetail> => {
        const response = await api.get<TransactionDetail>(`/ledger/transactions/${id}`);
        return response.data;
    },

    /**
     * Get financial summary for a period (MTD or YTD).
     */
    getFinancialSummary: async (period: 'MTD' | 'YTD' = 'MTD'): Promise<FinancialSummary> => {
        const response = await api.get<FinancialSummary>(`/ledger/analytics/summary?period=${period}`);
        return response.data;
    },

    /**
     * List transaction categories, optionally filtered by type.
     */
    getCategories: async (transactionType?: 'INCOME' | 'EXPENSE'): Promise<Category[]> => {
        const params = transactionType ? `?transaction_type=${transactionType}` : '';
        const response = await api.get<Category[]>(`/ledger/categories${params}`);
        return response.data;
    },

    /**
     * Create an income transaction.
     */
    createIncome: async (data: IncomePayload): Promise<TransactionDetail> => {
        const response = await api.post<TransactionDetail>('/ledger/transactions/income', data);
        return response.data;
    },

    /**
     * Create an expense transaction.
     */
    createExpense: async (data: ExpensePayload): Promise<TransactionDetail> => {
        const response = await api.post<TransactionDetail>('/ledger/transactions/expense', data);
        return response.data;
    },
};
