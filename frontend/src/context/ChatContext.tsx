import React, { createContext, useEffect, useState } from "react";
import type { ChatSummary, Message } from "../types";
import { fetchChats, createChat, fetchMessages, deleteChat as deleteChatApi } from "../api/chat";
import { useAuth } from "../hooks/useAuth";

type ChatContextType = {
    chats: ChatSummary[];
    selectedChatId: string | null;
    messages: Message[];
    loadingChats: boolean;
    loadingMessages: boolean;
    streaming: boolean;
    typing: boolean; // for "AI is thinking..."
    selectChat: (id: string) => void;
    newChat: () => Promise<void>;
    sendMessageStreaming: (content: string) => Promise<void>;
    removeChat: (id: string) => void;
    resetChat: () => void;
};

export const ChatContext = createContext<ChatContextType | undefined>(
    undefined
);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { token } = useAuth();
    const [chats, setChats] = useState<ChatSummary[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingChats, setLoadingChats] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [streaming, setStreaming] = useState(false);
    const [typing, setTyping] = useState(false);

    // Load chats on mount / token change
    useEffect(() => {
        if (!token) return;
        (async () => {
            setLoadingChats(true);
            try {
                const res = await fetchChats();
                setChats(res.data);
                if (res.data.length > 0) {
                    setSelectedChatId(res.data[0]._id);
                }
            } catch (err) {
                console.error("Error loading chats", err);
            } finally {
                setLoadingChats(false);
            }
        })();
    }, [token]);

    // Load messages when selectedChatId changes
    useEffect(() => {
        if (!selectedChatId) {
            setMessages([]);
            return;
        }
        (async () => {
            setLoadingMessages(true);
            try {
                const res = await fetchMessages(selectedChatId);
                setMessages(res.data);
            } catch (err) {
                console.error("Error loading messages", err);
            } finally {
                setLoadingMessages(false);
            }
        })();
    }, [selectedChatId]);

    useEffect(() => {
        const handler = () => resetChat();

        window.addEventListener("chat-reset", handler);
        return () => window.removeEventListener("chat-reset", handler);
    }, []);


    const selectChat = (id: string) => {
        setSelectedChatId(id);
    };

    const newChat = async () => {
        try {
            const res = await createChat();
            const chat = res.data;
            setChats((prev) => [chat, ...prev]);
            setSelectedChatId(chat._id);
            setMessages([]);
        } catch (err) {
            console.error("Error creating chat", err);
        }
    };

    const removeChat = async (chatId: string) => {
        try {
            await deleteChatApi(chatId);

            // Remove from state
            setChats((prev) => prev.filter((chat) => chat._id !== chatId));

            // If deleted chat is active → pick next one
            if (selectedChatId === chatId) {
                const remaining = chats.filter((c) => c._id !== chatId);
                if (remaining.length > 0) {
                    setSelectedChatId(remaining[0]._id);
                } else {
                    setSelectedChatId(null);
                    setMessages([]);
                }
            }
        } catch (error) {
            console.error("Delete chat error:", error);
        }
    };

    const sendMessageStreaming = async (content: string) => {
        if (!selectedChatId || !token || streaming) return;

        const userMessage: Message = { role: "user", content };
        setMessages((prev) => [...prev, userMessage]);
        setTyping(true);
        setStreaming(true);

        try {
            const res = await fetch(
                `http://localhost:5000/api/chats/${selectedChatId}/messages/stream`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ message: content }),
                }
            );

            if (!res.body) {
                console.error("No response body for streaming");
                setTyping(false);
                setStreaming(false);
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let assistantContent = "";

            // Add a placeholder assistant message and update it as we stream
            let assistantIndex: number | null = null;
            setMessages((prev) => {
                assistantIndex = prev.length;
                return [...prev, { role: "assistant", content: "" }];
            });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;

                setMessages((prev) => {
                    if (assistantIndex === null) return prev;
                    const updated = [...prev];
                    updated[assistantIndex] = {
                        ...updated[assistantIndex],
                        content: assistantContent,
                    };
                    return updated;
                });
            }
        } catch (error) {
            console.error("Streaming error", error);
        } finally {
            setTyping(false);
            setStreaming(false);
        }
    };

    const resetChat = () => {
        setChats([]);
        setSelectedChatId(null);
        setMessages([]);
        setLoadingChats(false);
        setLoadingMessages(false);
        setStreaming(false);
        setTyping(false);
    };


    return (
        <ChatContext.Provider
            value={{
                chats,
                selectedChatId,
                messages,
                loadingChats,
                loadingMessages,
                streaming,
                typing,
                selectChat,
                newChat,
                sendMessageStreaming,
                removeChat,
                resetChat
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

