import { Router } from "express";
import { type ChatTurn, generateStylistReply } from "../ai/generateStylistReply";
import { pool } from "../db/pool";

export const chatRouter = Router();

chatRouter.post("/", async (req, res) => {
  const { message, history } = req.body as {
    message?: unknown;
    history?: ChatTurn[];
  };

  if (typeof message !== "string" || message.trim().length === 0) {
    res.status(400).json({ message: "message is required" });
    return;
  }

  const wardrobeResult = await pool.query(
    "SELECT clothing_type, color FROM clothing_item ORDER BY created_at DESC"
  );

  const reply = await generateStylistReply(
    message,
    history ?? [],
    wardrobeResult.rows.map((row) => ({
      clothingType: row.clothing_type,
      color: row.color,
    }))
  );

  res.json({ reply });
});
