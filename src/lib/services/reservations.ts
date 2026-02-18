import { api } from '@/lib/api';

// =============================================================================
// Types - Matching backend reservation schemas
// =============================================================================

export interface Reservation {
    id: string;
    asset_id: string;
    asset_name: string;
    unit_id?: string;
    reserved_by_id: string;
    reserved_by_name: string;
    start_datetime: string;
    end_datetime: string;
    hourly_rate: number;
    hours: number;
    subtotal: number;
    discount_amount: number;
    deposit_amount: number;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    status: string;
    payment_status: string;
    income_transaction_id?: string;
    expires_at?: string;
    created_at: string;
}

export interface ReservationFilters {
    asset_id?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
}

export interface ReservationPayload {
    asset_id: string;
    unit_id?: string;
    start_datetime: string;
    end_datetime: string;
    reserved_by_name: string;
    contact_phone?: string;
    contact_email?: string;
    purpose?: string;
    apply_discount_ids?: string[];
}

// =============================================================================
// API Methods
// =============================================================================

export const reservationsApi = {
    /**
     * List reservations with optional filters.
     */
    getReservations: async (filters?: ReservationFilters): Promise<Reservation[]> => {
        const params = new URLSearchParams();
        if (filters?.asset_id) params.append('asset_id', filters.asset_id);
        if (filters?.status) params.append('status', filters.status);
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);

        const queryString = params.toString();
        const url = queryString ? `/assets/reservations?${queryString}` : '/assets/reservations';
        const response = await api.get<Reservation[]>(url);
        return response.data;
    },

    /**
     * Get a single reservation by ID.
     */
    getReservation: async (id: string): Promise<Reservation> => {
        const response = await api.get<Reservation>(`/assets/reservations/${id}`);
        return response.data;
    },

    /**
     * Create a new reservation.
     */
    createReservation: async (data: ReservationPayload): Promise<Reservation> => {
        const response = await api.post<Reservation>('/assets/reservations', data);
        return response.data;
    },

    /**
     * Get availability for an asset over a date range.
     */
    getAvailability: async (
        assetId: string,
        startDate: string,
        endDate: string
    ): Promise<AvailabilitySlot[]> => {
        const response = await api.get<AvailabilitySlot[]>(
            `/assets/${assetId}/availability?start_date=${startDate}&end_date=${endDate}`
        );
        return response.data;
    },
};

// =============================================================================
// Additional Types
// =============================================================================

export interface AvailabilitySlot {
    start_datetime: string;
    end_datetime: string;
    is_available: boolean;
    reservation_id?: string;
    reserved_by_name?: string;
}
