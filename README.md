# 🚀 Full-Stack ChatGPT Clone

### MERN + OpenAI/OpenRouter + JWT Auth + Multi-Chat + Streaming + React Context + Vite + TypeScript + SASS

A complete production-grade AI chat application inspired by ChatGPT — fully open, extendable, and built from scratch.

---

## ✨ Features

### 🔐 Authentication (JWT)

* Register / Login / Logout
* JWT stored securely in `localStorage`
* Auto-logout when token expires
* Global state resets on logout
* Clean UI logout confirmation modal

---

### 💬 Chat System (Multi-Chat)

* Create multiple chat sessions
* Sidebar with conversation list
* Delete chat (+ cascade delete messages)
* Auto-select next chat when one is deleted
* Conversation auto-titles
* Per-user conversation isolation

---

### 🤖 AI Streaming Response

* Real-time token streaming (chunked text / SSE-style)
* Smooth typing animation (“AI is thinking…”)
* Smart auto-scroll (only scroll when user is near bottom)
* Preserves full conversation in MongoDB
* Supports any OpenAI/OpenRouter model

---

### 🧠 Advanced UI Features

* React Context API for Auth + Chat state
* Markdown rendering (ReactMarkdown + GFM)

  * Code blocks
  * Lists
  * Headings
  * Inline code
* Beautiful ChatGPT-like layout
* Message input with Shift+Enter
* Clean SASS styling with variables

---

## 🛠️ Tech Stack

### **Frontend**

* Vite + React + TypeScript
* Context API (Auth + Chat)
* SASS (modular styling)
* React Markdown + Remark GFM
* Reusable UI components
* Streaming with `ReadableStream`

### **Backend**

* Node.js + Express
* MongoDB + Mongoose
* JWT authentication
* Password hashing via bcrypt
* OpenAI/OpenRouter API (streaming enabled)
* REST API architecture
* Middleware-based auth

---

## 📂 Project Structure

### 🟦 Backend (`/server` or `/backend`)

```
backend/
  controllers/
    authController.js
    chatController.js
    conversationController.js
  models/
    User.js
    Chat.js
    Conversation.js
  routes/
    authRoutes.js
    chatRoutes.js
    conversationRoutes.js
  middleware/
    authMiddleware.js
  config/
    db.js
  server.js
  .env
```

### 🟩 Frontend (`/client`)

```
client/
  src/
    api/
      axiosInstance.ts
      auth.ts
      chat.ts
    components/
      auth/
        AuthForm.tsx
      chat/
        ChatLayout.tsx
        Sidebar.tsx
        ChatWindow.tsx
        MessageList.tsx
        MessageInput.tsx
      ui/
        Spinner.tsx
      LogoutModal.tsx
    context/
      AuthContext.tsx
      ChatContext.tsx
    hooks/
      useAuth.ts
      useChat.ts
    pages/
      ChatPage.tsx
      AuthPage.tsx
    styles/
      _variables.scss
      global.scss
    types/
      index.ts
    App.tsx
    main.tsx
  index.html
  vite.config.ts
  tsconfig.json
```

---

## 🔌 Backend API Endpoints

### **Auth**

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Create new user   |
| POST   | `/api/auth/login`    | Login and get JWT |

---

### **Conversations**

| Method | Endpoint                 | Description                    |
| ------ | ------------------------ | ------------------------------ |
| GET    | `/api/conversations`     | Get user’s conversations       |
| POST   | `/api/conversations`     | Create a new conversation      |
| DELETE | `/api/conversations/:id` | Delete conversation + messages |

---

### **Messages**

| Method | Endpoint                            | Description                      |
| ------ | ----------------------------------- | -------------------------------- |
| GET    | `/api/chat/:chatId/messages`        | Get messages for one chat        |
| POST   | `/api/chat/:chatId/messages/stream` | Send prompt → stream AI response |

---

## 📦 Installation & Setup

### 1. Clone Repository

```sh
git clone https://github.com/yourusername/chatgpt-clone.git
cd chatgpt-clone
```

---

## 🗄️ Backend Setup

```sh
cd backend
npm install
```

### Create a `.env` file:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/gpt_clone
JWT_SECRET=your_secret_here
OPENROUTER_API_KEY=your_api_key
```

### Start backend:

```sh
npm run dev
```

---

## 🎨 Frontend Setup

```sh
cd client
npm install
```

Start frontend:

```sh
npm run dev
```

Visit:

```
http://localhost:5173
```

---

## 🚀 How it Works

### Login Flow:

* User logs in → JWT decoded → schedules auto-logout when token expires
* User + Token saved in context + localStorage
* ChatContext automatically resets when token becomes null

### Chat Flow:

1. Create/select a conversation
2. Send a message
3. Frontend posts message → starts reading stream
4. Backend streams OpenAI token chunks
5. Frontend progressively updates assistant bubble
6. Mongo stores user + assistant messages

---

## 🧹 Auto Cleanup Features

### ✔ Logout modal

Users must confirm logout for better UX.

### ✔ Auto-logout on token expiration

JWT decoded → `exp` determines logout time.

### ✔ Auto-clear chat state on logout

No more old user messages showing after switching accounts.

### ✔ Auto-clear chat data if token expired

If backend returns 401 → logout & reset chat state.

---

## 🎯 Roadmap

* 🔜 Message editing
* 🔜 Export chat as Markdown / PDF
* 🔜 Model selector
* 🔜 Voice input + text-to-speech output
* 🔜 Theme switch (Dark/Light)

---

## 📄 License

MIT — free for personal or commercial use.

---

## 💬 Final Notes

This project is architected to be:

* Modular
* Scalable
* Easy to replace UI components
* Ready for production-level enhancements

If you want, I can also generate:

* **Postman API collection**
* **Authentication guards for frontend routes**
* **Docker compose for full stack**
* **Prod build (Nginx + PM2)**

Just tell me!
