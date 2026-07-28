import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/pool";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function requireUser(req: Request, res: Response, next: NextFunction) {
  const userId = req.header("X-User-Id");

  if (!userId) {
    res.status(401).json({ message: "X-User-Id header is required" });
    return;
  }

  const result = await pool.query("SELECT id FROM app_user WHERE id = $1", [userId]);
  if (result.rows.length === 0) {
    res.status(401).json({ message: "Unknown user" });
    return;
  }

  req.userId = userId;
  next();
}
