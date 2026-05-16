import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { getWeekStart } from '@/lib/workout-utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const weekStart = searchParams.get('weekStart') || getWeekStart();

  try {
    let query = supabase
      .from('workout_entries')
      .select('id, user_id, week_start, day_of_week, workout_type, duration, distance_km')
      .eq('week_start', weekStart)
      .order('day_of_week');

    if (userId) {
      query = query.eq('user_id', parseInt(userId));
    } else {
      query = query.order('user_id');
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, dayOfWeek, workoutType, duration, weekStart, distanceKm } = body;

    const week = weekStart || getWeekStart();
    const distance = distanceKm || 0;

    const { error: upsertError } = await supabase
      .from('workout_entries')
      .upsert(
        {
          user_id: userId,
          week_start: week,
          day_of_week: dayOfWeek,
          workout_type: workoutType,
          duration,
          distance_km: distance,
        },
        { onConflict: 'user_id,week_start,day_of_week' }
      );

    if (upsertError) throw upsertError;

    const { data, error } = await supabase
      .from('workout_entries')
      .select('id, user_id, week_start, day_of_week, workout_type, duration, distance_km')
      .eq('user_id', userId)
      .eq('week_start', week)
      .order('day_of_week');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const dayOfWeek = searchParams.get('dayOfWeek');
    const weekStart = searchParams.get('weekStart') || getWeekStart();

    if (!userId || !dayOfWeek) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('workout_entries')
      .delete()
      .eq('user_id', parseInt(userId))
      .eq('week_start', weekStart)
      .eq('day_of_week', dayOfWeek);

    if (deleteError) throw deleteError;

    const { data, error } = await supabase
      .from('workout_entries')
      .select('id, user_id, week_start, day_of_week, workout_type, duration, distance_km')
      .eq('user_id', parseInt(userId))
      .eq('week_start', weekStart)
      .order('day_of_week');

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json({ error: 'Failed to delete workout' }, { status: 500 });
  }
}
