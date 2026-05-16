import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { MARATHON_PLAN } from '@/lib/marathon-plan';

export async function GET() {
  try {
    const planStart = MARATHON_PLAN[0].weekStart;
    const lastWeek = MARATHON_PLAN[MARATHON_PLAN.length - 1];
    const planEnd = lastWeek.weekStart;

    const { data: workouts, error } = await supabase
      .from('workout_entries')
      .select('id, user_id, week_start, day_of_week, workout_type, duration, distance_km')
      .gte('week_start', planStart)
      .lte('week_start', planEnd)
      .order('week_start')
      .order('day_of_week');

    if (error) throw error;

    const progress = MARATHON_PLAN.map((week) => {
      const user1Workouts = (workouts || []).filter(
        (w) => w.user_id === 1 && w.week_start === week.weekStart
      );
      const user2Workouts = (workouts || []).filter(
        (w) => w.user_id === 2 && w.week_start === week.weekStart
      );

      const user1Km = user1Workouts.reduce((sum, w) => sum + (Number(w.distance_km) || 0), 0);
      const user2Km = user2Workouts.reduce((sum, w) => sum + (Number(w.distance_km) || 0), 0);

      const user1Runs = user1Workouts.filter(
        (w) => w.workout_type === 'Run' || w.workout_type === 'Walk'
      ).length;
      const user2Runs = user2Workouts.filter(
        (w) => w.workout_type === 'Run' || w.workout_type === 'Walk'
      ).length;

      return {
        ...week,
        user1: {
          actualKm: Math.round(user1Km * 10) / 10,
          actualRuns: user1Runs,
          totalWorkouts: user1Workouts.length,
          workouts: user1Workouts,
        },
        user2: {
          actualKm: Math.round(user2Km * 10) / 10,
          actualRuns: user2Runs,
          totalWorkouts: user2Workouts.length,
          workouts: user2Workouts,
        },
      };
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching marathon data:', error);
    return NextResponse.json({ error: 'Failed to fetch marathon data' }, { status: 500 });
  }
}
