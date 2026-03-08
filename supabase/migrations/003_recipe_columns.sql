-- Add difficulty and meat_category to recipes
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS difficulty  text DEFAULT 'medium',   -- 'easy' | 'medium' | 'hard'
  ADD COLUMN IF NOT EXISTS meat_category text;                   -- 'mosxari' | 'xoirino' | 'poulerika' | 'arni-katsiki' | 'mixed'
