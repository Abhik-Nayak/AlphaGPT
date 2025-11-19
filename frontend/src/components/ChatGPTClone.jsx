// src/components/ChatGPTClone.jsx
import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_BASE = "http://localhost:5000"; // change if needed

export default function ChatGPTClone() {
  const [messages, setMessages] = useState([]); // {id, role, content}
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll when messages grow
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Smart auto-scroll: only if user is near bottom already
    const threshold = 80; // px
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;

    if (atBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setError(null);

    const userMsg = {
      id: Date.now(),
      role: "user",
      content: trimmed,
    };

    const assistantId = Date.now() + 1;

    // Add user message + empty assistant message
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    setInput("");
    setIsThinking(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Network error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value || new Uint8Array(), {
          stream: !done,
        });

        if (chunkValue) {
          // Append chunk to assistant's last message
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunkValue }
                : m
            )
          );
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to reach AI. Please try again.");
      // Mark assistant message as error
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "assistant" && !m.content
            ? { ...m, content: "⚠️ Error generating response." }
            : m
        )
      );
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="chat-root" style={styles.root}>
      <div style={styles.sidebar}>
        <h2 style={styles.appTitle}>Alpha ChatGPT</h2>
        {/* Later we’ll put “Multiple chats” list here */}
      </div>

      <div style={styles.main}>
        <div ref={scrollContainerRef} style={styles.messagesContainer}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.message,
                ...(msg.role === "user"
                  ? styles.userMessage
                  : styles.assistantMessage),
              }}
            >
              <div style={styles.messageRole}>
                {msg.role === "user" ? "You" : "AI"}
              </div>
              <div style={styles.messageContent}>
                {msg.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content || " "}
                  </ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {isThinking && (
            <div style={{ ...styles.message, ...styles.assistantMessage }}>
              <div style={styles.messageRole}>AI</div>
              <div style={styles.typingIndicator}>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
                <span style={styles.dot}></span>
                <span style={{ marginLeft: 8 }}>AI is thinking…</span>
              </div>
            </div>
          )}

          {error && <div style={styles.error}>{error}</div>}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} style={styles.inputForm}>
          <textarea
            style={styles.textarea}
            value={input}
            rows={2}
            placeholder="Ask anything..."
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            style={styles.sendButton}
            disabled={!input.trim() || isThinking}
          >
            {isThinking ? "Generating..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Very simple inline styles to keep everything in one file
const styles = {
  root: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    backgroundColor: "#050816",
    color: "#e5e7eb",
  },
  sidebar: {
    width: 260,
    borderRight: "1px solid #1f2933",
    padding: "16px",
    boxSizing: "border-box",
    background:
      "radial-gradient(circle at top left, #1d4ed8 0, #020617 40%, #000 100%)",
  },
  appTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  messagesContainer: {
    flex: 1,
    padding: "16px",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  message: {
    maxWidth: "80%",
    padding: "10px 14px",
    marginBottom: "10px",
    borderRadius: 16,
    fontSize: 14,
    lineHeight: 1.5,
    boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
  },
  userMessage: {
    marginLeft: "auto",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(236,72,153,0.9))",
    color: "#f9fafb",
  },
  assistantMessage: {
    marginRight: "auto",
    background: "rgba(15,23,42,0.9)",
    border: "1px solid #1f2937",
  },
  messageRole: {
    fontSize: 11,
    textTransform: "uppercase",
    opacity: 0.6,
    marginBottom: 4,
  },
  messageContent: {
    fontSize: 14,
  },
  inputForm: {
    display: "flex",
    gap: 8,
    padding: 12,
    borderTop: "1px solid #1f2937",
    backgroundColor: "#020617",
  },
  textarea: {
    flex: 1,
    resize: "none",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #334155",
    backgroundColor: "#020617",
    color: "#e5e7eb",
    outline: "none",
    fontFamily: "inherit",
  },
  sendButton: {
    padding: "0 18px",
    borderRadius: 999,
    border: "none",
    fontWeight: 500,
    cursor: "pointer",
    background:
      "linear-gradient(135deg, rgba(59,130,246,0.9), rgba(236,72,153,0.9))",
    color: "#f9fafb",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#9ca3af",
    marginRight: 4,
    animation: "pulse 1s infinite alternate",
  },
  error: {
    marginTop: 8,
    color: "#f97373",
    fontSize: 13,
  },
};
