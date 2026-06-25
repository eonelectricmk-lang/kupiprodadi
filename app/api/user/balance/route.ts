import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getUserBalance } from '@/lib/billing';

export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.nextUrl.searchParams.get('user_id'));
    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const db = getDb();
    const balance = getUserBalance(db, userId);
    return NextResponse.json(balance, { status: 200 });
  } catch (error) {
    console.error('Error fetching balance:', error);
    return NextResponse.json({ error: 'Грешка при вчитување на состојба' }, { status: 500 });
  }
}
