// routes/conversationRoutes.js
import express from "express";
import { getConversations, createConversation, deleteConversation } from "../controllers/conversationController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware); // protect all

router.get("/", getConversations);
router.post("/", createConversation);
router.delete("/:conversationId", deleteConversation);

export default router;
