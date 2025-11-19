export type User = {
  _id: string;
  name: string;
  email: string;
};

export type ChatSummary = {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt?: string;
};

export type Message = {
  _id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

export type AuthResponse = {
  user: User;
  token: string;
};
