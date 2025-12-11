import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/conversations", conversationRoutes);

/* ✅ TEST ROUTE */
app.get("/test", (req, res) => {
  res.status(200).json({ message: "API is working! 🎉" });
});

app.listen(process.env.PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${process.env.PORT}`)
);

