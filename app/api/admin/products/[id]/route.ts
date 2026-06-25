import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const ALLOWED = new Set(['pending', 'active', 'rejected']);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const db = getDb();
    const params = await context.params;
    const id = Number(params.id);
    const { status } = await request.json();

    if (!ALLOWED.has(status)) {
      return NextResponse.json({ error: 'Невалиден статус' }, { status: 400 });
    }

    db.prepare(`UPDATE products SET status = ? WHERE id = ?`).run(status, id);
    return NextResponse.json({ message: 'Статусот е ажуриран' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при менување статус', details: String(error) }, { status: 500 });
  }
}
