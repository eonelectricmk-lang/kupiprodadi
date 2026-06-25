import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = Number(request.nextUrl.searchParams.get('user_id'));
    const page = Math.max(1, Number(request.nextUrl.searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get('limit')) || 20));
    const offset = (page - 1) * limit;

    if (!Number.isFinite(userId)) {
      return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
    }

    const db = getDb();

    const total = db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?'
    ).get(userId) as { count: number };

    const transactions = db.prepare(`
      SELECT id, amount, type, description, reference_type, created_at
      FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);

    return NextResponse.json({
      transactions,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Грешка при вчитување трансакции' }, { status: 500 });
  }
}
