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

    // load conversation
    const convo = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id,
    });
    if (!convo)
      return res.status(404).json({ error: "Conversation not found" });

    // save user message
    await Chat.create({
      conversation: conversationId,
      user: req.user.id,
      role: "user",
      content: message,
    });

    // Step 1: get previous messages
    const history = await Chat.find({
      conversation: conversationId,
      user: req.user.id,
    })
      .sort({ createdAt: 1 })
      .lean();
    console.log("history", history);

    // Step 2: format for OpenAI
    const openAIMessages = history.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Step 3: Add the new message
    openAIMessages.push({ role: "user", content: message });

    // streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    // Step 4: CALL OpenAI with full conversation context
    const stream = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      // model: "openai/gpt-4o-mini",
      messages: openAIMessages,
      stream: true,
    });

    let reply = "";

    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      reply += delta;
      res.write(delta);
    }

    // save assistant reply
    await Chat.create({
      conversation: conversationId,
      user: req.user.id,
      role: "assistant",
      content: reply,
    });

    // save conversation title and update last message time
    convo.title = history[0]
      ? history[0].content.slice(0, 15)
      : message.slice(0, 15);
    convo.lastMessageAt = new Date();
    await convo.save();

    res.end();
  } catch (err) {
    console.error(err);
    res.end("Error occurred");
  }
};
// If ChatGPT needs full conversation context every time,
// how the hell does it handle millions of users, giant histories, and billions of tokens daily?
// Isn't this insanely expensive and heavy?

// get conversation/thread related chats for loggedin user what shows right sidebar of application , it gave conversation related chats 
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
