import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
