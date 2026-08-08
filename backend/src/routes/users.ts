import { Router } from "express";
import { pool } from "../db/pool";
import { requireUser } from "../middleware/requireUser";

const SELECT_COLUMNS = "id, login, age_group, style_preference";

export const usersRouter = Router();

usersRouter.use(requireUser);

usersRouter.get("/me", async (req, res) => {
  const result = await pool.query(`SELECT ${SELECT_COLUMNS} FROM app_user WHERE id = $1`, [
    req.userId,
  ]);
  res.json(result.rows[0]);
});

function validateField(value: unknown, label: string, maxLength: number): string | null {
  if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new Error(`${label} must be a non-empty string (max ${maxLength} characters)`);
  }
  return value.trim();
}

usersRouter.patch("/me", async (req, res) => {
  const { age_group, style_preference } = req.body as {
    age_group?: unknown;
    style_preference?: unknown;
  };

  let ageGroup: string | null = null;
  let stylePreference: string | null = null;

  try {
    if (age_group !== undefined) ageGroup = validateField(age_group, "age_group", 30);
    if (style_preference !== undefined) {
      // Comma-separated tags (e.g. "Classic, Minimalist") — several tags fit well within 200.
      stylePreference = validateField(style_preference, "style_preference", 200);
    }
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : String(error) });
    return;
  }

  // COALESCE keeps the existing value for whichever field wasn't included in
  // this request, so either field can be updated independently.
  const result = await pool.query(
    `UPDATE app_user SET
       age_group = COALESCE($1, age_group),
       style_preference = COALESCE($2, style_preference)
     WHERE id = $3
     RETURNING ${SELECT_COLUMNS}`,
    [ageGroup, stylePreference, req.userId]
  );

  res.json(result.rows[0]);
});
