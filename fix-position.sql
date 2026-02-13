-- Fix missing position column
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS position INTEGER;
