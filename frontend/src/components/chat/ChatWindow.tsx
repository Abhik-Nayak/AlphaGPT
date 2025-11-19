import React from "react";
import { useChat } from "../../hooks/useChat";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./ChatWindow.scss";

const ChatWindow: React.FC = () => {
  const { messages, typing, loadingMessages, selectedChatId } = useChat();

  return (
    <section className="chat">
      {!selectedChatId ? (
        <div className="chat__empty">
          <h2>Welcome to your ChatGPT clone</h2>
          <p>Create a new chat from the sidebar to start talking to the AI.</p>
        </div>
      ) : (
        <>
          <div className="chat__main">
            {loadingMessages && messages.length === 0 ? (
              <div className="chat__loading">Loading conversation…</div>
            ) : (
              <MessageList messages={messages} typing={typing} />
            )}
          </div>
          <MessageInput />
        </>
      )}
    </section>
  );
};

export default ChatWindow;
