import OpenAI from "openai";
import dotenv from "dotenv";
import { Chat } from "../models/Chat.js";
import { Conversation } from "../models/Conversation.js";

dotenv.config();
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const chatWithAI = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    const convo = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id,
    });

    if (!convo) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    // Save user message
    const userMsg = await Chat.create({
      conversation: conversationId,
      user: req.user.id,
      role: "user",
      content: message,
    });

    // (Optional) auto-title conversation from first message
    if (!convo.title || convo.title === "New chat") {
      convo.title = message.slice(0, 40);
    }
    convo.lastMessageAt = new Date();
    await convo.save();

    // STREAMING SETUP (simplified)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const stream = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        // you can also pull previous Chat docs here if you want full context
        { role: "user", content: message },
      ],
      stream: true,
    });

    let fullReply = "";

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (!delta) continue;
      fullReply += delta;
      // send chunk to client
      res.write(delta);
    }

    // Save assistant response
    await Chat.create({
      conversation: conversationId,
      user: req.user.id,
      role: "assistant",
      content: fullReply,
    });

    convo.lastMessageAt = new Date();
    await convo.save();

    res.end();
   } catch (error) {
    console.error("AI Error:", error);
    try {
      res.write('data: [ERROR]\n\n');
      res.end();
    } catch (_) {}
  }
};
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    // Make sure this convo belongs to user
    const convo = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id,
    });

    if (!convo) {
      return res.status(404).json({ error: "Conversation not found" });
    }
    const messages = await Chat.find({
      conversation: conversationId,
      user: req.user.id,
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Failed to load messages" });
  }
};
