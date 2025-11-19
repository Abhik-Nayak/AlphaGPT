import React from "react";
import Sidebar from "./Sidebar";
import ChatWindow from "./ChatWindow";
import "./ChatLayout.scss";

const ChatLayout: React.FC = () => {
  return (
    <div className="layout">
      <Sidebar />
      <ChatWindow />
    </div>
  );
};

export default ChatLayout;
