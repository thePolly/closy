import { pool } from "./pool";

export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clothing_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS clothing_type TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS fit TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS primary_color TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS secondary_color TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS pattern TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS season TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS style TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS material TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS suitable_occasions TEXT;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS confidence_score REAL;
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS analysis_status TEXT NOT NULL DEFAULT 'pending';
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS name TEXT;

    ALTER TABLE clothing_item ALTER COLUMN clothing_type DROP NOT NULL;
    ALTER TABLE clothing_item DROP COLUMN IF EXISTS color;
  `);
}
