import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    TransactionOut,
    IncomeIn,
    TransactionFilterIn,
    CategoryOut,
    FinancialSummaryOut,
    SuccessOut
} from '@/types/backend';

// =============================================================================
// QUERIES
// =============================================================================

export const useTransactions = (filters?: Partial<TransactionFilterIn>) => {
    return useQuery({
        queryKey: ['transactions', filters],
        queryFn: async () => {
            const { data } = await api.get<TransactionOut[]>('/ledger/transactions', { params: filters });
            return data;
        },
    });
};

export const useCategories = () => {
    return useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await api.get<CategoryOut[]>('/ledger/categories');
            return data;
        },
    });
};

export const useFinancialSummary = (period: 'month' | 'year' = 'month') => {
    return useQuery({
        queryKey: ['financial-summary', period],
        queryFn: async () => {
            const { data } = await api.get<FinancialSummaryOut>('/ledger/analytics/summary');
            return data;
        },
    });
};

// =============================================================================
// MUTATIONS
// =============================================================================

export const useCreateIncome = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: IncomeIn) => {
            const { data } = await api.post('/ledger/transactions/income', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['transactions'] });
            queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
        },
    });
};
