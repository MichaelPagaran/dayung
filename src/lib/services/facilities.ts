import { api } from '@/lib/api';

// =============================================================================
// Types - Matching backend AssetOut schema
// =============================================================================

export interface Facility {
    id: string;
    name: string;
    asset_type: 'REVENUE' | 'SHARED';
    description: string;
    image_url: string | null;
    rental_rate: number | null;
    capacity: number | null;
    location: string;
    requires_deposit: boolean;
    deposit_amount: number | null;
    min_duration_hours: number;
    max_duration_hours: number;
    is_active: boolean;
}

export interface FacilityWithAnalytics {
    id: string;
    name: string;
    asset_type: 'REVENUE' | 'SHARED';
    image_url?: string | null;
    rental_rate: number | null;
    capacity?: number | null;
    income_this_month: number;
    expenses_this_month: number;
    net_income_this_month: number;
    reservation_count_this_month: number;
}

export interface FacilityFilters {
    search?: string;
    asset_type?: 'REVENUE' | 'SHARED';
}

// =============================================================================
// API Methods - Connecting to existing /assets/ endpoints
// =============================================================================

export const facilitiesApi = {
    /**
     * Get all facilities (assets).
     * Supports server-side search and filtering.
     */
    getFacilities: async (filters?: FacilityFilters): Promise<Facility[]> => {
        const params = new URLSearchParams();
        if (filters?.search) params.append('search', filters.search);
        if (filters?.asset_type) params.append('asset_type', filters.asset_type);

        const queryString = params.toString();
        const url = queryString ? `/assets/?${queryString}` : '/assets/';
        const response = await api.get<Facility[]>(url);
        return response.data;
    },

    /**
     * Get a single facility by ID.
     */
    getFacility: async (id: string): Promise<Facility> => {
        const response = await api.get<Facility>(`/assets/${id}`);
        return response.data;
    },

    /**
     * Get facilities with analytics (income, reservation counts).
     */
    getFacilitiesWithAnalytics: async (): Promise<FacilityWithAnalytics[]> => {
        const response = await api.get<FacilityWithAnalytics[]>('/assets/analytics');
        return response.data;
    },

    /**
     * Create a new facility.
     */
    createFacility: async (data: Omit<Facility, 'id' | 'is_active'>): Promise<Facility> => {
        const response = await api.post<Facility>('/assets/', data);
        return response.data;
    },

    /**
     * Update an existing facility.
     */
    updateFacility: async (id: string, data: Partial<Facility>): Promise<Facility> => {
        const response = await api.put<Facility>(`/assets/${id}/`, data);
        return response.data;
    },

    /**
     * Soft delete a facility.
     */
    deleteFacility: async (id: string): Promise<void> => {
        await api.delete(`/assets/${id}/`);
    },

    /**
     * Bulk delete facilities.
     */
    bulkDeleteFacilities: async (ids: string[]): Promise<{ deleted: number }> => {
        const response = await api.post<{ deleted: number }>('/assets/bulk-delete', { asset_ids: ids });
        return response.data;
    },
};
