import { GoogleGenAI } from "@google/genai"; // 1) New SDK
import dotenv from "dotenv";
import { Chat } from "../models/Chat.js";
import { Conversation } from "../models/Conversation.js";
import logger from "../utils/logger.js";

dotenv.config();

// 2) Initialize Gemini AI client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Use a fast, capable model for summarization
const SUMMARIZATION_MODEL = "gemini-2.5-flash";
// Use a capable model for the main chat
const CHAT_MODEL = "gemini-2.5-flash"; 


// Helper function to map your DB roles to the Gemini API roles
const mapToGeminiRoles = (messages) => {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user", // Gemini uses 'model' for the AI's role
    parts: [{ text: m.content }],
  }));
};


// Every 5–7 messages, summarize the conversation so far and store it in the conversation document.
// Trigger Condition:
//      You should update memory when:
//      total messages > 10
//      OR last summary update > 10 minutes ago
//      OR summary is empty
async function updateConversationSummary(conversationId, userId) {
  try {
    logger.info({ conversationId }, "Starting conversation summary update");

    const messages = await Chat.find({
      conversation: conversationId,
      user: userId,
    }).sort({ createdAt: 1 });

    logger.info(
      { count: messages.length },
      "Fetched messages for summarization"
    );

    // Format for Gemini API: [{ role: "user", parts: [{ text: "..." }] }, { role: "model", parts: [{ text: "..." }] }]
    const formattedHistory = mapToGeminiRoles(messages);

    // Prompt for summarization
    const summaryPrompt = [
      {
        role: "user",
        parts: [
          {
            text: `Summarize the following conversation. Include major points, instructions, preferences, tasks, and technical details. Keep it under 15 lines.`,
          },
        ],
      },
    ];

    logger.info("Sending summary request to Gemini model");

    // 3) Use `generateContent` for non-streaming completion
    const response = await ai.models.generateContent({
      model: SUMMARIZATION_MODEL,
      contents: [...formattedHistory, ...summaryPrompt],
    });

    const summary = response.text;

    await Conversation.findByIdAndUpdate(conversationId, {
      summary,
      memoryUpdatedAt: new Date(),
    });

    logger.info("Summary updated successfully");
  } catch (error) {
    logger.error({ error }, "Failed to update conversation summary");
  }
}

// =====================================================
// Main Chat Controller With Streaming + Logging
// =====================================================
export const chatWithAI = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { message } = req.body;

    logger.info(
      { conversationId, userId: req.user.id, message },
      "Incoming user chat message"
    );

    // 1) Load conversation
    const convo = await Conversation.findOne({
      _id: conversationId,
      user: req.user.id,
    });

    if (!convo) {
      logger.warn({ conversationId }, "Conversation not found");
      return res.status(404).json({ error: "Conversation not found" });
    }

    // 2) Save user message
    await Chat.create({
      conversation: conversationId,
      user: req.user.id,
      role: "user",
      content: message,
    });

    logger.info("User message saved to DB");

    // 3) Short-term memory → last 10 messages
    const recentMessages = await Chat.find({
      conversation: conversationId,
      user: req.user.id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    logger.info({ count: recentMessages.length }, "Loaded short-term memory");

    recentMessages.reverse(); // keep chronological order

    // 4) Format short-term memory (using helper)
    const shortTerm = mapToGeminiRoles(recentMessages);

    // 5) Long-term summary (if available) - This is inserted as a system instruction
    const longTermSummaryInstruction = convo.summary
      ? [
          {
            role: "user", // Insert summary as a user prompt for the model to process
            parts: [
              {
                text: `Conversation summary (for context): ${convo.summary}`,
              },
            ],
          },
          {
            role: "model", // Add an empty model response to treat the summary as context already processed
            parts: [{ text: "Got it. I will use the summary for long-term context." }],
          },
        ]
      : [];

    // 6) Build final prompt: System Instruction + Long-Term Summary + Short-Term History + Current Message
    const systemInstruction = `You are a helpful AI assistant. Use the provided conversation summary and recent messages to stay on topic.`;

    const finalPrompt = [
        ...longTermSummaryInstruction,
        ...shortTerm,
        // The *actual* current message from the user
        { role: "user", parts: [{ text: message }] }, 
    ];

    logger.info("Built final AI prompt");

    // 7) Set streaming headers
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");
    res.setHeader("Cache-Control", "no-cache");

    logger.info("Sending streaming request to Gemini…");

    // 8) Use `generateContentStream` for streaming
    const stream = await ai.models.generateContentStream({
      model: CHAT_MODEL,
      contents: finalPrompt,
      config: {
        // Set the system instruction here
        systemInstruction: systemInstruction,
      },
    });
    
    let aiReply = "";

    // STREAM PART
    for await (const chunk of stream) {
      const delta = chunk.text; // Use .text property for the stream's response content
      if (delta) {
        aiReply += delta;
        res.write(delta);
      }
    }

    logger.info("AI streaming completed");

    // 9) Save assistant response
    await Chat.create({
      conversation: conversationId,
      user: req.user.id,
      role: "assistant",
      content: aiReply,
    });
    logger.info("AI reply saved to DB");

    // 10) Optionally trigger summary update
    const totalMessages = await Chat.countDocuments({
      conversation: conversationId,
      user: req.user.id,
    });
    logger.info({ totalMessages }, "Checking summary update condition");

    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    const isSummaryStale = !convo.memoryUpdatedAt || new Date(convo.memoryUpdatedAt).getTime() < tenMinutesAgo;

    if (totalMessages >= 10 && isSummaryStale) {
      logger.info("Triggering background summary update...");
      // NOTE: This intentionally does NOT await
      updateConversationSummary(conversationId, req.user.id);
    }

    res.end();
  } catch (err) {
    logger.error({ error: err }, "Failed to handle chat request");
    // Ensure response is closed on error
    if (!res.headersSent) {
      res.status(500).json({ error: "Error occurred during chat processing." });
    } else {
      res.end(); // If headers were sent (mid-stream), just close the connection
    }
  }
};

// =====================================================
// getConversationMessages remains unchanged
// =====================================================
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