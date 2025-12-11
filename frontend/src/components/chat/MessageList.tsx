import React, { useEffect, useRef } from "react";
import type { Message } from "../../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./MessageList.scss";

type Props = {
  messages: Message[];
  typing: boolean;
};

const MessageList: React.FC<Props> = ({ messages, typing }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isUserNearBottomRef = useRef(true);

  // Smart auto-scroll: only if user is at bottom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const threshold = 80; // px
      const position = el.scrollHeight - el.scrollTop - el.clientHeight;
      isUserNearBottomRef.current = position < threshold;
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (isUserNearBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, typing]);

  return (
    <div className="messages" ref={containerRef}>
      {messages.map((m, idx) => (
        <div
          key={m._id || idx}
          className={
            "messages__item messages__item--" +
            (m.role === "user" ? "user" : "assistant")
          }
        >
          <div className="messages__avatar">
            {m.role === "user" ? "You" : "AI"}
          </div>
          <div className="messages__bubble">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // @ts-ignore
                code({ inline, className, children, ...props }) {
                  // const match = /language-(\w+)/.exec(className || "");
                  return !inline ? (
                    <pre className="messages__code">
                      <code className={className} {...props}>
                        {String(children)}
                      </code>
                    </pre>
                  ) : (
                    <code className="messages__code-inline" {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {m.content}
            </ReactMarkdown>
          </div>
        </div>
      ))}

      {typing && (
        <div className="messages__item messages__item--assistant">
          <div className="messages__avatar">AI</div>
          <div className="messages__bubble messages__bubble--typing">
            AI is thinking…
            <span className="messages__dot" />
            <span className="messages__dot" />
            <span className="messages__dot" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
