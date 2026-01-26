import { sql } from '@vercel/postgres';

let initialized = false;

export async function initDb() {
  if (initialized) return;
  if (!process.env.POSTGRES_URL) {
    throw new Error('Missing POSTGRES_URL environment variable');
  }

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS workout_entries (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      week_start DATE NOT NULL,
      day_of_week TEXT NOT NULL,
      workout_type TEXT NOT NULL,
      duration INTEGER NOT NULL,
      UNIQUE(user_id, week_start, day_of_week)
    );
  `;

  await sql`INSERT INTO users (name) VALUES ('TM') ON CONFLICT (name) DO NOTHING;`;
  await sql`INSERT INTO users (name) VALUES ('TC') ON CONFLICT (name) DO NOTHING;`;
  await sql`UPDATE users SET name = 'TM' WHERE name = 'User 1' AND NOT EXISTS (SELECT 1 FROM users WHERE name = 'TM');`;
  await sql`UPDATE users SET name = 'TC' WHERE name = 'User 2' AND NOT EXISTS (SELECT 1 FROM users WHERE name = 'TC');`;

  initialized = true;
}

export { sql };
