import api from "./axiosInstance";
import type { AuthResponse } from "../types";

export const register = (data: {
  name: string;
  email: string;
  password: string;
}) => api.post<AuthResponse>("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  api.post<AuthResponse>("/auth/login", data);
