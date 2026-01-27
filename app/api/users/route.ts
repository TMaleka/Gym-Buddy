import { NextResponse } from 'next/server';
import { initDb, sql } from '@/lib/db';
import { User } from '@/lib/types';

export async function GET() {
  try {
    await initDb();
    const users = await sql`SELECT id, name FROM users ORDER BY id` as User[];
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
