import { Router } from "express";
import { pool } from "../db/pool";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
  const { login } = req.body as { login?: unknown };

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
    "SELECT id, login FROM app_user WHERE lower(login) = lower($1)",
    [trimmed]
  );

  if (existing.rows.length > 0) {
    res.json({ ...existing.rows[0], isNew: false });
    return;
  }

  const created = await pool.query(
    "INSERT INTO app_user (login) VALUES ($1) RETURNING id, login",
    [trimmed]
  );

  res.status(201).json({ ...created.rows[0], isNew: true });
});
