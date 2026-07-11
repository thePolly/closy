import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { detectClothing } from "../ai/detectClothing";
import { pool } from "../db/pool";

const upload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, "../../uploads"),
    filename: (_req, file, callback) => {
      const extension = path.extname(file.originalname) || ".jpg";
      callback(null, `${randomUUID()}${extension}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed"));
      return;
    }
    callback(null, true);
  },
});

export const wardrobeRouter = Router();

wardrobeRouter.get("/", async (_req, res) => {
  const result = await pool.query(
    "SELECT id, image_url, clothing_type, color, created_at FROM clothing_item ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

wardrobeRouter.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "Image file is required" });
    return;
  }

  const imageBuffer = await readFile(req.file.path);
  const { clothingType, color } = await detectClothing(imageBuffer);

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  const result = await pool.query(
    `INSERT INTO clothing_item (image_url, clothing_type, color)
     VALUES ($1, $2, $3)
     RETURNING id, image_url, clothing_type, color, created_at`,
    [imageUrl, clothingType, color]
  );

  res.status(201).json(result.rows[0]);
});
