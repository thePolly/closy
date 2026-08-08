import { pool } from "./pool";

export async function ensureSchema(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS app_user (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      login TEXT NOT NULL,
      email TEXT,
      password_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE UNIQUE INDEX IF NOT EXISTS app_user_login_lower_idx ON app_user (lower(login));

    CREATE TABLE IF NOT EXISTS clothing_item (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      image_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES app_user(id);
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
    ALTER TABLE clothing_item ADD COLUMN IF NOT EXISTS distinctive_details TEXT;

    ALTER TABLE clothing_item ALTER COLUMN clothing_type DROP NOT NULL;
    ALTER TABLE clothing_item DROP COLUMN IF EXISTS color;

    CREATE TABLE IF NOT EXISTS daily_recommendation (
      user_id UUID PRIMARY KEY REFERENCES app_user(id),
      date DATE NOT NULL,
      description TEXT NOT NULL,
      item_ids TEXT NOT NULL,
      missing_suggestions TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}
