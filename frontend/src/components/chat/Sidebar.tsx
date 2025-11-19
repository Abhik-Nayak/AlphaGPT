import React from "react";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";
import "./Sidebar.scss";

const Sidebar: React.FC = () => {
  const { chats, selectedChatId, selectChat, newChat, loadingChats } =
    useChat();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <button className="btn sidebar__new" onClick={newChat}>
          + New chat
        </button>
      </div>

      <div className="sidebar__chats">
        {loadingChats ? (
          <div className="sidebar__loading">
            <Spinner />
          </div>
        ) : chats.length === 0 ? (
          <div className="sidebar__empty">No chats yet. Start a new one!</div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat._id}
              className={
                "sidebar__chat" +
                (selectedChatId === chat._id ? " sidebar__chat--active" : "")
              }
              onClick={() => selectChat(chat._id)}
            >
              <div className="sidebar__chat-title">
                {chat.title || "New chat"}
              </div>
              <div className="sidebar__chat-sub">
                {new Date(chat.createdAt).toLocaleString()}
              </div>
            </button>
          ))
        )}
      </div>

      <div className="sidebar__bottom">
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div>
            <div className="sidebar__user-name">{user?.name}</div>
            <div className="sidebar__user-email">{user?.email}</div>
          </div>
        </div>
        <button className="btn btn--ghost sidebar__logout" onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
