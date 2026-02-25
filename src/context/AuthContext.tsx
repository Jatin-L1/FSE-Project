"use client";

import React, { createContext, useReducer, useEffect, useCallback } from "react";
import { authService, type AuthResponse } from "@/services/auth";
import { userService, type UserProfile } from "@/services/user";

// ─── State Shape ──────────────────────────────────────────────
export interface AuthState {
    isAuthenticated: boolean;
    user: {
        name: string;
        email: string;
        role: "free" | "pro";
        credits: number;
    } | null;
    token: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true, // true on mount to check stored session
    error: null,
};

// ─── Actions ──────────────────────────────────────────────────
type AuthAction =
    | { type: "AUTH_LOADING" }
    | { type: "AUTH_SUCCESS"; payload: { user: AuthState["user"]; token: string } }
    | { type: "AUTH_ERROR"; payload: string }
    | { type: "LOGOUT" }
    | { type: "UPDATE_USER"; payload: Partial<NonNullable<AuthState["user"]>> }
    | { type: "CLEAR_ERROR" };

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "AUTH_LOADING":
            return { ...state, loading: true, error: null };

        case "AUTH_SUCCESS":
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload.user,
                token: action.payload.token,
                loading: false,
                error: null,
            };

        case "AUTH_ERROR":
            return {
                ...state,
                isAuthenticated: false,
                user: null,
                token: null,
                loading: false,
                error: action.payload,
            };

        case "LOGOUT":
            return { ...initialState, loading: false };

        case "UPDATE_USER":
            return {
                ...state,
                user: state.user ? { ...state.user, ...action.payload } : null,
            };

        case "CLEAR_ERROR":
            return { ...state, error: null };

        default:
            return state;
    }
}

// ─── Context ──────────────────────────────────────────────────
interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    googleLogin: () => void;
    logout: () => void;
    refreshUser: () => Promise<void>;
    updateCredits: (credits: number) => void;
    clearError: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Restore session on mount
    useEffect(() => {
        const restoreSession = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                dispatch({ type: "LOGOUT" });
                return;
            }

            try {
                const user = await authService.getMe();
                dispatch({
                    type: "AUTH_SUCCESS",
                    payload: { user, token },
                });
            } catch {
                localStorage.removeItem("token");
                dispatch({ type: "LOGOUT" });
            }
        };

        restoreSession();
    }, []);

    // ─── Auth Actions ─────────────────────────────────────────
    const login = useCallback(async (email: string, password: string) => {
        dispatch({ type: "AUTH_LOADING" });
        try {
            const data: AuthResponse = await authService.loginWithEmail(email, password);
            localStorage.setItem("token", data.token);
            dispatch({
                type: "AUTH_SUCCESS",
                payload: { user: data.user, token: data.token },
            });
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Login failed. Please try again.";
            dispatch({ type: "AUTH_ERROR", payload: message });
            throw err;
        }
    }, []);

    const signup = useCallback(async (name: string, email: string, password: string) => {
        dispatch({ type: "AUTH_LOADING" });
        try {
            const data: AuthResponse = await authService.signupWithEmail(name, email, password);
            localStorage.setItem("token", data.token);
            dispatch({
                type: "AUTH_SUCCESS",
                payload: { user: data.user, token: data.token },
            });
        } catch (err: unknown) {
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                "Signup failed. Please try again.";
            dispatch({ type: "AUTH_ERROR", payload: message });
            throw err;
        }
    }, []);

    const googleLogin = useCallback(() => {
        window.location.href = authService.getGoogleOAuthUrl();
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        dispatch({ type: "LOGOUT" });
    }, []);

    const refreshUser = useCallback(async () => {
        try {
            const profile: UserProfile = await userService.getProfile();
            dispatch({ type: "UPDATE_USER", payload: profile });
        } catch {
            // Silent fail — user stays with stale data
        }
    }, []);

    const updateCredits = useCallback((credits: number) => {
        dispatch({ type: "UPDATE_USER", payload: { credits } });
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: "CLEAR_ERROR" });
    }, []);

    const value: AuthContextValue = {
        ...state,
        login,
        signup,
        googleLogin,
        logout,
        refreshUser,
        updateCredits,
        clearError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
