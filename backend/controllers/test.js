import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const chatWithAI = async (req, res) => {
  try {
    const { message, previousMessages = [] } = req.body;

    // Add new user message to history
    const updatedMessages = [
      ...previousMessages,
      { role: "user", content: message }
    ];

    // ---------------------------
    // FIRST CALL (with reasoning)
    // ---------------------------
    const apiResponse = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      // model:"deepseek/deepseek-r1:free",
      messages: updatedMessages,
      reasoning: { enabled: true },
    });

    // extract response + reasoning
    const firstMsg = apiResponse.choices[0].message;

    // Build messages including reasoning_details
    const messagesWithReasoning = [
      ...updatedMessages,
      {
        role: "assistant",
        content: firstMsg.content,
        reasoning_details: firstMsg.reasoning_details, // pass back unmodified
      },
      {
        role: "user",
        content: "Continue your reasoning.", // Optional: frontend can send this too
      }
    ];

    // ---------------------------
    // SECOND CALL (continuation)
    // ---------------------------
    const apiResponse2 = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: messagesWithReasoning,
    });

    const finalReply = apiResponse2.choices[0].message;

    // Send full data back to frontend
    res.json({
      reply: finalReply.content,
      reasoning: firstMsg.reasoning_details ?? null,
      fullMessages: messagesWithReasoning,
    });

  } catch (error) {
    console.error("AI Error:", error.response?.data || error);
    res.status(500).json({ error: "Something went wrong with AI processing" });
  }
};
