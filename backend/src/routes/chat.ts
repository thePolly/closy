import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import { generateClothingImage } from "../ai/generateClothingImage";
import { type ChatTurn, generateStylistReply } from "../ai/generateStylistReply";
import { pool } from "../db/pool";
import { requireUser } from "../middleware/requireUser";
import { saveClothingItem, UPLOADS_DIR } from "./wardrobe";

export const chatRouter = Router();

chatRouter.use(requireUser);

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
    "SELECT clothing_type, primary_color FROM clothing_item WHERE user_id = $1 ORDER BY created_at DESC",
    [req.userId]
  );

  const result = await generateStylistReply(
    message,
    history ?? [],
    wardrobeResult.rows.map((row) => ({
      clothingType: row.clothing_type,
      primaryColor: row.primary_color,
    }))
  );

  if (result.type === "text") {
    res.json({ reply: result.reply });
    return;
  }

  try {
    const imageBuffer = await generateClothingImage(result.item);
    const filename = `${randomUUID()}.png`;
    await writeFile(path.join(UPLOADS_DIR, filename), imageBuffer);
    const imageUrl = `/uploads/${filename}`;

    const saved = await saveClothingItem(
      imageUrl,
      { ...result.item, distinctiveDetails: null, confidenceScore: null },
      req.userId as string
    );

    res.json({ reply: `Added ${saved.name} to your wardrobe!` });
  } catch (error) {
    console.error("Failed to add clothing item from chat", error);
    res.json({ reply: "Sorry, I couldn't add that item — please try again in a bit." });
  }
});
