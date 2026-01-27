import { NextRequest, NextResponse } from 'next/server';
import { initDb, sql } from '@/lib/db';
import { getWeekStart } from '@/lib/workout-utils';
import { WorkoutEntry } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const weekStart = searchParams.get('weekStart') || getWeekStart();

  try {
    await initDb();
    if (userId) {
      const workouts = await sql`
        SELECT id, user_id, week_start, day_of_week, workout_type, duration
        FROM workout_entries
        WHERE user_id = ${parseInt(userId)} AND week_start = ${weekStart}
        ORDER BY day_of_week
      ` as WorkoutEntry[];

      return NextResponse.json(workouts);
    } else {
      const workouts = await sql`
        SELECT id, user_id, week_start, day_of_week, workout_type, duration
        FROM workout_entries
        WHERE week_start = ${weekStart}
        ORDER BY user_id, day_of_week
      ` as WorkoutEntry[];

      return NextResponse.json(workouts);
    }
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDb();
    const body = await request.json();
    const { userId, dayOfWeek, workoutType, duration, weekStart } = body;

    const week = weekStart || getWeekStart();

    await sql`
      INSERT INTO workout_entries (user_id, week_start, day_of_week, workout_type, duration)
      VALUES (${userId}, ${week}, ${dayOfWeek}, ${workoutType}, ${duration})
      ON CONFLICT (user_id, week_start, day_of_week)
      DO UPDATE SET workout_type = EXCLUDED.workout_type, duration = EXCLUDED.duration
    `;

    const workouts = await sql`
      SELECT id, user_id, week_start, day_of_week, workout_type, duration
      FROM workout_entries
      WHERE user_id = ${userId} AND week_start = ${week}
      ORDER BY day_of_week
    ` as WorkoutEntry[];

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initDb();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const weekStart = searchParams.get('weekStart') || getWeekStart();

    if (!userId || !dayOfWeek) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await sql`
      DELETE FROM workout_entries
      WHERE user_id = ${parseInt(userId)} AND week_start = ${weekStart} AND day_of_week = ${dayOfWeek}
    `;

    const workouts = await sql`
      SELECT id, user_id, week_start, day_of_week, workout_type, duration
      FROM workout_entries
      WHERE user_id = ${parseInt(userId)} AND week_start = ${weekStart}
      ORDER BY day_of_week
    ` as WorkoutEntry[];

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
