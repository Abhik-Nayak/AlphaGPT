const MessageBubble = ({ role, content }) => {
  return (
    <div className={`message ${role}`}>
      <strong>{role === "user" ? "You" : "AI"}</strong>
      <div>{content}</div>
    </div>
  );
};

export default MessageBubble;
