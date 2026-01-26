"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authApi, User, LoginCredentials, AuthResponse } from '@/lib/api';

// =============================================================================
// Types
// =============================================================================

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshAuth: () => Promise<void>;
    clearError: () => void;
}

// =============================================================================
// Context
// =============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// =============================================================================
// Provider Component
// =============================================================================

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!user;

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const userData = await authApi.getMe();
            setUser(userData);
        } catch {
            // Not authenticated - this is expected on first load
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);

            const response: AuthResponse = await authApi.login(credentials);

            if (response.success && response.user) {
                setUser(response.user);
                return true;
            } else {
                setError(response.message || 'Login failed');
                return false;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            // Extract error message from API response if available
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const axiosError = err as { response?: { data?: { detail?: string } } };
                setError(axiosError.response?.data?.detail || message);
            } else {
                setError(message);
            }
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch {
            // Ignore logout errors
        } finally {
            setUser(null);
        }
    }, []);

    const refreshAuth = useCallback(async () => {
        try {
            const response = await authApi.refresh();
            if (response.success && response.user) {
                setUser(response.user);
            }
        } catch {
            // Refresh failed, user needs to login again
            setUser(null);
        }
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
        refreshAuth,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// =============================================================================
// Hook
// =============================================================================

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
