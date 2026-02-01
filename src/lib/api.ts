import axios, { AxiosError } from "axios";

// Create axios instance with base URL from environment
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
    // Critical: Include credentials for httpOnly cookie auth
    withCredentials: true,
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Redirect to login if unauthorized
            if (typeof window !== 'undefined') {
                window.location.href = '/login?error=session_expired';
            }
        }
        return Promise.reject(error);
    }
);

// =============================================================================
// Auth API Types
// =============================================================================

export interface User {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    org_id: string;
    org_name?: string;
    unit_id?: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    message?: string;
}

// =============================================================================
// Auth API Methods
// =============================================================================

export const authApi = {
    /**
     * Login with username and password.
     * Sets httpOnly cookies automatically.
     */
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/identity/login', credentials);
        return response.data;
    },

    /**
     * Logout and clear auth cookies.
     */
    logout: async (): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/identity/logout');
        return response.data;
    },

    /**
     * Refresh access token using refresh token cookie.
     */
    refresh: async (): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/identity/refresh');
        return response.data;
    },

    /**
     * Get current authenticated user.
     */
    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/identity/me');
        return response.data;
    },
};
