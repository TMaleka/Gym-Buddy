import { NextRequest, NextResponse } from 'next/server';
import { initDb, sql } from '@/lib/db';
import { WorkoutEntry } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  try {
    await initDb();
    if (userId) {
      const workouts = await sql`
        SELECT id, user_id, week_start, day_of_week, workout_type, duration
        FROM workout_entries
        WHERE user_id = ${parseInt(userId)}
        ORDER BY week_start DESC
      ` as WorkoutEntry[];

      return NextResponse.json(workouts);
    } else {
      const workouts = await sql`
        SELECT id, user_id, week_start, day_of_week, workout_type, duration
        FROM workout_entries
        ORDER BY week_start DESC
      ` as WorkoutEntry[];

      return NextResponse.json(workouts);
    }
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
