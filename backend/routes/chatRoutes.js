import express from 'express';
// import { chatWithAI } from '../controllers/streamController.js';
import { chatWithAI, getConversationMessages } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.get("/:conversationId/messages", getConversationMessages);
router.post("/:conversationId/message", chatWithAI); // streaming endpoint



export default router;