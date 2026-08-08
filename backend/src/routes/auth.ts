import { Router } from "express";
import { pool } from "../db/pool";

export const authRouter = Router();

const SELECT_COLUMNS = "id, login, age_group, style_preference";

// Only a non-empty string within a sane length is kept; anything else (missing,
// wrong type, blank) becomes null rather than failing the whole login — these
// are optional, skippable-at-onboarding fields, not identity like `login`.
function optionalField(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 30
    ? value.trim()
    : null;
}

authRouter.post("/login", async (req, res) => {
  const { login, age_group, style_preference } = req.body as {
    login?: unknown;
    age_group?: unknown;
    style_preference?: unknown;
  };

  if (typeof login !== "string" || login.trim().length === 0) {
    res.status(400).json({ message: "login is required" });
    return;
  }
  if (login.trim().length > 50) {
    res.status(400).json({ message: "login is too long (max 50 characters)" });
    return;
  }

  const trimmed = login.trim();

  const existing = await pool.query(
    `SELECT ${SELECT_COLUMNS} FROM app_user WHERE lower(login) = lower($1)`,
    [trimmed]
  );

  if (existing.rows.length > 0) {
    res.json(existing.rows[0]);
    return;
  }

  // age_group/style_preference are only ever set here, at account creation —
  // an existing account's saved preferences are never overwritten by a later
  // login (e.g. re-onboarding after a reinstall with the fields left blank).
  const created = await pool.query(
    `INSERT INTO app_user (login, age_group, style_preference) VALUES ($1, $2, $3)
     RETURNING ${SELECT_COLUMNS}`,
    [trimmed, optionalField(age_group), optionalField(style_preference)]
  );

  res.status(201).json(created.rows[0]);
});
