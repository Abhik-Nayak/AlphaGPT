import OpenAI from "openai";
import dotenv from "dotenv";
import { Chat } from "../models/Chat.js";

dotenv.config();

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const chatWithAI = async (req, res) => {
  // Important: set headers BEFORE any await
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const { message } = req.body;

    // 1) Save user message
    await Chat.create({ role: "user", content: message });

    // 2) Ask OpenAI with streaming enabled
    const stream = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: message }],
      stream: true, // 🔑 this enables streaming
    });

    let fullReply = "";

    // 3) Read chunks as they arrive and pipe to client
    for await (const chunk of stream) {
      const delta = chunk.choices?.[0]?.delta?.content || "";
      if (!delta) continue;

      fullReply += delta;
      res.write(delta); // send this piece to the browser immediately
    }

    // 4) After streaming fully finishes, save assistant reply
    await Chat.create({ role: "assistant", content: fullReply });

    // 5) End HTTP response
    res.end();
  } catch (error) {
    console.error("AI Error:", error);

    // If we haven't started streaming yet, send JSON error
    if (!res.headersSent) {
      return res.status(500).json({ error: "Something went wrong" });
    }

    // If we were already streaming, just end the stream with an error marker
    try {
      res.write("\n[ERROR: something went wrong]");
      res.end();
    } catch (_) {
      // ignore
    }
  }
};
