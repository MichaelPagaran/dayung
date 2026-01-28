import { api } from '@/lib/api';

// =============================================================================
// Types
// =============================================================================

export interface Unit {
    id: string;
    org_id: string;
    section_identifier: string;
    unit_identifier: string;
    location_name: string;
    category: string;
    owner_id: string | null;
    owner_name: string | null;
    owner_email: string | null;
    owner_phone: string | null;
    resident_name: string | null;
    membership_status: 'GOOD_STANDING' | 'DELINQUENT' | 'NON_MEMBER';
    occupancy_status: 'INHABITED' | 'VACANT' | 'UNDER_CONSTRUCTION';
    is_active: boolean;
}

export interface FilterOptions {
    sections: string[];
    occupancy: string[];
    membership: string[];
}

export interface UnitFilters {
    search?: string;
    section?: string;
    occupancy?: string;
    membership?: string;
}

// =============================================================================
// API Methods
// =============================================================================

export const registryApi = {
    /**
     * Get all units with optional search and filtering.
     */
    getUnits: async (filters?: UnitFilters): Promise<Unit[]> => {
        const params = new URLSearchParams();

        if (filters?.search) params.append('search', filters.search);
        if (filters?.section) params.append('section', filters.section);
        if (filters?.occupancy) params.append('occupancy', filters.occupancy);
        if (filters?.membership) params.append('membership', filters.membership);

        const queryString = params.toString();
        const url = queryString ? `/registry/units?${queryString}` : '/registry/units';

        const response = await api.get<Unit[]>(url);
        return response.data;
    },

    /**
     * Get distinct values for filter dropdowns.
     */
    getFilterOptions: async (): Promise<FilterOptions> => {
        const response = await api.get<FilterOptions>('/registry/units/filter-options');
        return response.data;
    },

    /**
     * Create a new unit.
     */
    createUnit: async (data: Omit<Unit, 'id' | 'org_id' | 'is_active'>): Promise<Unit> => {
        const response = await api.post<Unit>('/registry/units', data);
        return response.data;
    },

    /**
     * Update an existing unit.
     */
    updateUnit: async (id: string, data: Partial<Unit>): Promise<Unit> => {
        const response = await api.put<Unit>(`/registry/units/${id}`, data);
        return response.data;
    },

    /**
     * Soft delete a unit.
     */
    deleteUnit: async (id: string): Promise<void> => {
        await api.delete(`/registry/units/${id}`);
    },

    /**
     * Bulk delete units.
     */
    bulkDeleteUnits: async (ids: string[]): Promise<{ deleted: number }> => {
        const response = await api.post<{ deleted: number }>('/registry/units/bulk-delete', { unit_ids: ids });
        return response.data;
    },
};
