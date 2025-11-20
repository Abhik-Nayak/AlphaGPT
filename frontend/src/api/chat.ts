import api from "./axiosInstance";
import type { ChatSummary, Message } from "../types";

export const fetchChats = () => api.get<ChatSummary[]>("/conversations");

export const createChat = (data?: { title?: string }) =>
  api.post<ChatSummary>("/conversations", data);

export const deleteChat = (chatId: string) =>
  api.delete(`/conversations/${chatId}`);

export const fetchMessages = (chatId: string) =>
  api.get<Message[]>(`/chats/${chatId}/messages`);

// We’ll handle streaming using fetch directly (not axios) because we need response.body.getReader().