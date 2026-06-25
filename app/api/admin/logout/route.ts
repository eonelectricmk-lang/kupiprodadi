import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/admin-auth';

export async function POST() {
  try {
    await clearAdminSession();
    return NextResponse.json({ message: 'Одјавен admin' });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при admin одјава', details: String(error) }, { status: 500 });
  }
}
