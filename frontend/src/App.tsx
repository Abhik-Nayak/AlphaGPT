import React from "react";
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  return <div className="app">{user ? <ChatPage /> : <AuthPage />}</div>;
};

export default App;
