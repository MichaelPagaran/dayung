/**
 * Audit Log API Service
 *
 * Provides access to the audit trail recorded by the backend.
 * Only admins, board members, and auditors have read access
 * (requires LEDGER_VIEW_REPORT permission on the backend).
 */
import api from "@/lib/api";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export interface AuditLog {
    id: string;
    org_id: string;
    action: string;
    target_type: string;
    target_id: string;
    target_label: string;
    performed_by_name: string | null;
    performed_at: string; // ISO 8601
    context: Record<string, unknown>;
}

export interface AuditLogFilters {
    action?: string;
    target_type?: string;
    start_date?: string; // YYYY-MM-DD
    end_date?: string;   // YYYY-MM-DD
    limit?: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Known action constants (mirrors backend AuditAction class)
// ──────────────────────────────────────────────────────────────────────────────

export const AuditAction = {
    // Ledger
    CREATE_INCOME: "CREATE_INCOME",
    CREATE_EXPENSE: "CREATE_EXPENSE",
    VERIFY_TRANSACTION: "VERIFY_TRANSACTION",
    CANCEL_TRANSACTION: "CANCEL_TRANSACTION",
    // Ledger config
    CREATE_CATEGORY: "CREATE_CATEGORY",
    CREATE_DISCOUNT: "CREATE_DISCOUNT",
    CREATE_PENALTY: "CREATE_PENALTY",
    UPDATE_BILLING_CONFIG: "UPDATE_BILLING_CONFIG",
    // Assets
    CREATE_ASSET: "CREATE_ASSET",
    UPDATE_ASSET: "UPDATE_ASSET",
    DELETE_ASSET: "DELETE_ASSET",
    UPDATE_ASSET_CONFIG: "UPDATE_ASSET_CONFIG",
    // Reservations
    CREATE_RESERVATION: "CREATE_RESERVATION",
    RECORD_PAYMENT: "RECORD_PAYMENT",
    CONFIRM_RECEIPT: "CONFIRM_RECEIPT",
    CANCEL_RESERVATION: "CANCEL_RESERVATION",
    // Governance
    APPROVE_REQUEST: "APPROVE_REQUEST",
    REJECT_REQUEST: "REJECT_REQUEST",
    // Registry
    CREATE_UNIT: "CREATE_UNIT",
    UPDATE_UNIT: "UPDATE_UNIT",
    DELETE_UNIT: "DELETE_UNIT",
} as const;

export type AuditActionType = (typeof AuditAction)[keyof typeof AuditAction];

// ──────────────────────────────────────────────────────────────────────────────
// API methods
// ──────────────────────────────────────────────────────────────────────────────

export const auditApi = {
    /**
     * Fetch audit log entries with optional filters.
     * Supported filters: action, target_type, start_date, end_date, limit (max 500).
     */
    async getLogs(filters: AuditLogFilters = {}): Promise<AuditLog[]> {
        const params = new URLSearchParams();
        if (filters.action) params.set("action", filters.action);
        if (filters.target_type) params.set("target_type", filters.target_type);
        if (filters.start_date) params.set("start_date", filters.start_date);
        if (filters.end_date) params.set("end_date", filters.end_date);
        if (filters.limit) params.set("limit", String(filters.limit));

        const queryString = params.toString();
        const url = `/governance/audit-logs${queryString ? `?${queryString}` : ""}`;
        const response = await api.get(url);
        return response.data;
    },

    /**
     * Fetch a single audit log entry by ID.
     */
    async getLog(id: string): Promise<AuditLog> {
        const response = await api.get(`/governance/audit-logs/${id}`);
        return response.data;
    },
};
