import { Conversation } from "../models/Conversation.js";


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