-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 2. Create workout_entries table
CREATE TABLE IF NOT EXISTS workout_entries (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,
  day_of_week TEXT NOT NULL,
  workout_type TEXT NOT NULL,
  duration INTEGER NOT NULL,
  distance_km DOUBLE PRECISION DEFAULT 0,
  UNIQUE(user_id, week_start, day_of_week)
);

-- 3. Seed users
INSERT INTO users (name) VALUES ('Tshepo') ON CONFLICT (name) DO NOTHING;
INSERT INTO users (name) VALUES ('Lerato') ON CONFLICT (name) DO NOTHING;

-- 4. Enable Row Level Security (but allow all for service role)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_entries ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access on workout_entries" ON workout_entries FOR ALL USING (true) WITH CHECK (true);
