import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireAdmin();
    const { id } = await context.params;
    const userId = Number(id);
    const db = getDb();
    const body = await request.json();
    const nextIsActive = body?.is_active === false ? 0 : 1;

    const existing = db.prepare(`
      SELECT id, role, name, email, COALESCE(is_active, 1) AS is_active
      FROM users
      WHERE id = ?
    `).get(userId) as
      | { id: number; role: string; name: string; email: string; is_active: number }
      | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Корисникот не постои' }, { status: 404 });
    }

    if (existing.role === 'admin') {
      return NextResponse.json({ error: 'Admin профилите не се деактивираат од овој дел.' }, { status: 400 });
    }

    if (existing.id === admin.id) {
      return NextResponse.json({ error: 'Не можеш да се деактивираш самиот.' }, { status: 400 });
    }

    db.prepare(`
      UPDATE users
      SET is_active = ?
      WHERE id = ?
    `).run(nextIsActive, userId);

    return NextResponse.json({
      success: true,
      user: {
        ...existing,
        is_active: nextIsActive,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при менување статус на корисник', details: String(error) }, { status: 500 });
  }
}
