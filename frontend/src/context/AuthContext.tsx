import React, { createContext, useEffect, useRef, useState } from "react";
import type { User, AuthResponse } from "../types";
import { login as loginApi, register as registerApi } from "../api/auth";


type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const decodeJwt = (token: string): any | null => {
    try {
        const [, payload] = token.split(".");
        const decoded = atob(payload);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const logoutTimerRef = useRef<number | null>(null);

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");
        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const handleAuthSuccess = (data: AuthResponse) => {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    };

    const login = async (email: string, password: string) => {
        const res = await loginApi({ email, password });
        handleAuthSuccess(res.data);
    };

    const register = async (name: string, email: string, password: string) => {
        const res = await registerApi({ name, email, password });
        handleAuthSuccess(res.data);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // VERY IMPORTANT: reset chat context on logout
        if (typeof window !== "undefined") {
            const event = new CustomEvent("chat-reset");
            window.dispatchEvent(event);
        }
    };

    const clearLogoutTimer = () => {
        if (logoutTimerRef.current !== null) {
            window.clearTimeout(logoutTimerRef.current);
            logoutTimerRef.current = null;
        }
    };

    const scheduleAutoLogout = (jwtToken: string) => {
        clearLogoutTimer();
        const payload = decodeJwt(jwtToken);
        if (!payload || !payload.exp) return;

        const expMs = payload.exp * 1000;
        const now = Date.now();
        const delay = expMs - now;

        if (delay <= 0) {
            // already expired
            logout();
            return;
        }

        logoutTimerRef.current = window.setTimeout(() => {
            logout();
            alert("Your session has expired. Please log in again.");
        }, delay);
    };

    // On first load: check token validity
    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const payload = decodeJwt(token);
        if (!payload || !payload.exp || payload.exp * 1000 < Date.now()) {
            // expired or invalid
            logout();
            setLoading(false);
            return;
        }

        scheduleAutoLogout(token);
        setLoading(false);
    }, [token]);

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}