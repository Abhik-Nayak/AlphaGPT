import OpenAI from "openai";
import dotenv from "dotenv";
import { Chat } from "../models/Chat.js";

dotenv.config();
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    // save user message
    await Chat.create({ role: "user", content: message });

    const response = await openai.chat.completions.create({
      // model: "gpt-4o-mini",
      model: "openai/gpt-oss-20b:free",
      messages: [{ role: "user", content: message }]
    });

    const reply = response.choices[0].message.content;

    // save assistant response
    await Chat.create({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (error) {
    console.error("AI Error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
};
