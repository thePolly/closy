import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { analyzeClothing, type ClothingAnalysis } from "../ai/analyzeClothing";
import { recommendOutfit, type WardrobeItemSummary } from "../ai/recommendOutfit";
import { pool } from "../db/pool";

export const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(__dirname, "../../uploads");

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
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

const SELECT_COLUMNS = `
  id, image_url, name, clothing_type, fit, primary_color, secondary_color, pattern,
  season, style, material, suitable_occasions, confidence_score, analysis_status,
  created_at
`;

const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
};

export function mimeTypeForFile(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  return MIME_TYPES_BY_EXTENSION[extension] ?? "image/jpeg";
}

export interface ClothingItemInput {
  name: string;
  clothingType: string;
  fit: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  pattern: string | null;
  season: string | null;
  style: string | null;
  material: string | null;
  suitableOccasions: string | null;
  confidenceScore: number | null;
}

export async function saveClothingItem(imageUrl: string, item: ClothingItemInput) {
  const result = await pool.query(
    `INSERT INTO clothing_item (
       image_url, name, clothing_type, fit, primary_color, secondary_color, pattern,
       season, style, material, suitable_occasions, confidence_score, analysis_status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'completed')
     RETURNING ${SELECT_COLUMNS}`,
    [
      imageUrl,
      await uniqueName(item.name),
      item.clothingType,
      item.fit,
      item.primaryColor,
      item.secondaryColor,
      item.pattern,
      item.season,
      item.style,
      item.material,
      item.suitableOccasions,
      item.confidenceScore,
    ]
  );
  return result.rows[0];
}

async function runAnalysis(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{ status: "completed"; analysis: ClothingAnalysis } | { status: "failed" }> {
  try {
    const analysis = await analyzeClothing(imageBuffer, mimeType);
    return { status: "completed", analysis };
  } catch (error) {
    console.error("Clothing analysis failed", error);
    return { status: "failed" };
  }
}

// Returns baseName if it's free, otherwise the next available "baseName N".
// Matching is case-insensitive. Wardrobes are small, so all names are fetched
// and compared in memory rather than with a LIKE query (avoids escaping issues).
export async function uniqueName(baseName: string): Promise<string> {
  const result = await pool.query("SELECT name FROM clothing_item WHERE name IS NOT NULL");
  const taken = new Set<string>(
    result.rows.map((row: { name: string }) => row.name.toLowerCase())
  );

  if (!taken.has(baseName.toLowerCase())) {
    return baseName;
  }

  let suffix = 2;
  while (taken.has(`${baseName} ${suffix}`.toLowerCase())) {
    suffix += 1;
  }
  return `${baseName} ${suffix}`;
}

export const wardrobeRouter = Router();

wardrobeRouter.get("/", async (_req, res) => {
  const result = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM clothing_item ORDER BY created_at DESC`
  );
  res.json(result.rows);
});

wardrobeRouter.get("/:id", async (req, res) => {
  const result = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM clothing_item WHERE id = $1`,
    [req.params.id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Clothing item not found" });
    return;
  }

  res.json(result.rows[0]);
});

wardrobeRouter.patch("/:id", async (req, res) => {
  const { name } = req.body as { name?: unknown };

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ message: "Name is required" });
    return;
  }
  if (name.trim().length > 100) {
    res.status(400).json({ message: "Name is too long (max 100 characters)" });
    return;
  }

  const result = await pool.query(
    `UPDATE clothing_item SET name = $1 WHERE id = $2 RETURNING ${SELECT_COLUMNS}`,
    [name.trim(), req.params.id]
  );

  if (result.rows.length === 0) {
    res.status(404).json({ message: "Clothing item not found" });
    return;
  }

  res.json(result.rows[0]);
});

function currentDayType(): "Workday" | "Weekend" {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? "Weekend" : "Workday";
}

wardrobeRouter.post("/recommend-outfit", async (req, res) => {
  const { weather } = req.body as {
    weather?: { temperature: number; condition: string } | null;
  };

  const result = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM clothing_item WHERE analysis_status = 'completed'`
  );

  if (result.rows.length === 0) {
    res.json({
      description: "Add some clothes to your wardrobe to get outfit ideas!",
      items: [],
      missingSuggestions: [],
    });
    return;
  }

  const summaries: WardrobeItemSummary[] = result.rows.map((row) => ({
    id: row.id,
    name: row.name,
    clothingType: row.clothing_type,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    pattern: row.pattern,
    season: row.season,
    style: row.style,
    material: row.material,
    suitableOccasions: row.suitable_occasions,
  }));

  const recommendation = await recommendOutfit(summaries, weather ?? null, currentDayType());

  const items = result.rows.filter((row) => recommendation.itemIds.includes(row.id));

  res.json({
    description: recommendation.description,
    items,
    missingSuggestions: recommendation.missingSuggestions,
  });
});

wardrobeRouter.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ message: "Image file is required" });
    return;
  }

  const imageBuffer = await readFile(req.file.path);
  const outcome = await runAnalysis(imageBuffer, req.file.mimetype);
  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

  if (outcome.status === "failed") {
    const result = await pool.query(
      `INSERT INTO clothing_item (image_url, analysis_status) VALUES ($1, 'failed')
       RETURNING ${SELECT_COLUMNS}`,
      [imageUrl]
    );
    res.status(201).json(result.rows[0]);
    return;
  }

  const saved = await saveClothingItem(imageUrl, {
    ...outcome.analysis,
  });
  res.status(201).json(saved);
});

wardrobeRouter.post("/:id/retry-analysis", async (req, res) => {
  const { id } = req.params;

  const existing = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM clothing_item WHERE id = $1`,
    [id]
  );

  if (existing.rows.length === 0) {
    res.status(404).json({ message: "Clothing item not found" });
    return;
  }

  const { image_url: imageUrl } = existing.rows[0];
  const filename = path.basename(new URL(imageUrl).pathname);
  const imageBuffer = await readFile(path.join(UPLOADS_DIR, filename));
  const outcome = await runAnalysis(imageBuffer, mimeTypeForFile(filename));

  if (outcome.status === "failed") {
    await pool.query("UPDATE clothing_item SET analysis_status = 'failed' WHERE id = $1", [id]);
    res.status(502).json({ message: "Analysis failed again. Please try again later." });
    return;
  }

  const result = await pool.query(
    `UPDATE clothing_item SET
       name = $1, clothing_type = $2, fit = $3, primary_color = $4, secondary_color = $5,
       pattern = $6, season = $7, style = $8, material = $9,
       suitable_occasions = $10, confidence_score = $11, analysis_status = 'completed'
     WHERE id = $12
     RETURNING ${SELECT_COLUMNS}`,
    [
      await uniqueName(outcome.analysis.name),
      outcome.analysis.clothingType,
      outcome.analysis.fit,
      outcome.analysis.primaryColor,
      outcome.analysis.secondaryColor,
      outcome.analysis.pattern,
      outcome.analysis.season,
      outcome.analysis.style,
      outcome.analysis.material,
      outcome.analysis.suitableOccasions,
      outcome.analysis.confidenceScore,
      id,
    ]
  );

  res.json(result.rows[0]);
});
