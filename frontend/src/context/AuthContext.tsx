import React, { createContext, useEffect, useState } from "react";
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
    };

    return (
        <AuthContext.Provider
            value={{ user, token, loading, login, register, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}