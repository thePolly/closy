import { pool } from "./pool";

export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clothing_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      image_url TEXT NOT NULL,
      clothing_type TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
