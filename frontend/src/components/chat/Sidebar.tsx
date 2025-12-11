import React, { useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";
import "./Sidebar.scss";
import ConfirmDialog from "../common/ConfirmDialog";


const TrashIcon = () => <span style={{ fontSize: "14px" }}>🗑️</span>;

const Sidebar: React.FC = () => {
  const { chats, selectedChatId, selectChat, newChat, loadingChats, removeChat } =
    useChat();
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    logout(); // will also clean state (we’ll wire that in a moment)
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

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
            <div className="sidebar__chat-row" key={chat._id}>
              <button
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

              <button
                className="sidebar__delete"
                onClick={() => {
                  if (confirm("Delete this chat permanently?")) {
                    removeChat(chat._id);
                  }
                }}
              >
                <TrashIcon />
              </button>
            </div>

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
        <button className="btn btn--ghost sidebar__logout" onClick={handleLogoutClick}>
          Logout
        </button>
        <ConfirmDialog
          open={showConfirm}
          title="Logout"
          message="Are you sure you want to logout? Your unsent message will be lost."
          confirmLabel="Logout"
          cancelLabel="Cancel"
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
