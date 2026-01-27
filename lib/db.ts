import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

let initialized = false;

export async function initDb() {
  if (initialized) return;

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
      week_start TEXT NOT NULL,
      day_of_week TEXT NOT NULL,
      workout_type TEXT NOT NULL,
      duration INTEGER NOT NULL,
      UNIQUE(user_id, week_start, day_of_week)
    );
  `;

  await sql`INSERT INTO users (name) VALUES ('TM') ON CONFLICT (name) DO NOTHING;`;
  await sql`INSERT INTO users (name) VALUES ('TC') ON CONFLICT (name) DO NOTHING;`;

  initialized = true;
}

export { sql };
