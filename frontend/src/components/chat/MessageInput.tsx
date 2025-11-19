import React, { useState } from "react";
import { useChat } from "../../hooks/useChat";
import "./MessageInput.scss";

const MessageInput: React.FC = () => {
  const { sendMessageStreaming, streaming, selectedChatId } = useChat();
  const [value, setValue] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !selectedChatId || streaming) return;
    const text = value;
    setValue("");
    await sendMessageStreaming(text);
  };

  return (
    <form className="input" onSubmit={onSubmit}>
      <textarea
        className="input__textarea"
        rows={1}
        placeholder={
          selectedChatId
            ? "Send a message..."
            : "Create a new chat to start..."
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={!selectedChatId || streaming}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit(e);
          }
        }}
      />
      <button
        type="submit"
        className="btn input__send"
        disabled={!value.trim() || !selectedChatId || streaming}
      >
        {streaming ? "Streaming..." : "Send"}
      </button>
    </form>
  );
};

export default MessageInput;
