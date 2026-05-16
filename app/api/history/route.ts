import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');

  try {
    let query = supabase
      .from('workout_entries')
      .select('id, user_id, week_start, day_of_week, workout_type, duration, distance_km')
      .order('week_start', { ascending: false });

    if (userId) {
      query = query.eq('user_id', parseInt(userId));
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
