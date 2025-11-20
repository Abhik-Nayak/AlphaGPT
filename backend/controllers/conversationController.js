import { Conversation } from "../models/Conversation.js";
import { Chat } from "../models/Chat.js";

//for sidebar here we get conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .lean();

    res.json(conversations);
  } catch (err) {
    console.error("Get conversations error:", err);
    res.status(500).json({ error: "Failed to load conversations" });
  }
};

export const createConversation = async (req, res) => {
  try {
    // const { title } = req.body;
    const { title } = req.body || {};

    const conversation = await Conversation.create({
      user: req.user.id,
      title: title || "New chat",
    });

    res.status(201).json(conversation);
  } catch (err) {
    console.error("Create conversation error:", err);
    res.status(500).json({ error: "Failed to create conversation" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Delete all messages for the conversation
    await Chat.deleteMany({ conversation: conversationId });

    // Delete conversation entry
    await Conversation.deleteOne({ _id: conversationId });

    res.json({ success: true, conversationId });
  } catch (err) {}
};
