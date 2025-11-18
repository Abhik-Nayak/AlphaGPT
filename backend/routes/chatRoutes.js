import express from 'express';
import { chatWithAI } from '../controllers/chartController.js';
import { Chat } from '../models/Chat.js';

const router = express.Router();

router.post("/chat", chatWithAI);

router.get("/history", async (req, res) => {
  const messages = await Chat.find().sort({ createdAt: 1 });
  res.json(messages);
});


export default router;