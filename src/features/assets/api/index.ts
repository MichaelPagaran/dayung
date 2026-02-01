import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
    AssetOut,
    AssetWithAnalyticsOut,
    ReservationOut,
    ReservationIn,
    AvailabilitySlotOut
} from '@/types/backend';

// =============================================================================
// QUERIES
// =============================================================================

export const useAssets = () => {
    return useQuery({
        queryKey: ['assets'],
        queryFn: async () => {
            const { data } = await api.get<AssetWithAnalyticsOut[]>('/assets/analytics'); // Use analytics endpoint for list
            return data;
        },
    });
};

export const useAsset = (id: string) => {
    return useQuery({
        queryKey: ['asset', id],
        queryFn: async () => {
            const { data } = await api.get<AssetOut>(`/assets/${id}`);
            return data;
        },
        enabled: !!id,
    });
};

export const useAssetAvailability = (id: string) => {
    return useQuery({
        queryKey: ['asset-availability', id],
        queryFn: async () => {
            const { data } = await api.get<AvailabilitySlotOut[]>(`/assets/${id}/availability`);
            return data;
        },
        enabled: !!id,
    });
};

// =============================================================================
// MUTATIONS
// =============================================================================

export const useCreateReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: ReservationIn) => {
            const { data } = await api.post('/assets/reservations', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asset-availability'] });
            queryClient.invalidateQueries({ queryKey: ['reservations'] });
        },
    });
};
