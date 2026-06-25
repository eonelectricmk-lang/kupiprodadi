import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const MIN_ACTIVE_BANNERS = 1;
const MAX_ACTIVE_BANNERS = 10;

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const db = getDb();
    const params = await context.params;
    const id = Number(params.id);
    const body = await request.json();
    const existing = db.prepare('SELECT id, is_active FROM banners WHERE id = ?').get(id) as { id: number; is_active: number } | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Банерот не постои.' }, { status: 404 });
    }

    const nextIsActive = body.is_active === false ? 0 : 1;
    const activeCountRow = db.prepare('SELECT COUNT(*) as count FROM banners WHERE is_active = 1').get() as { count: number };

    if (existing.is_active === 0 && nextIsActive === 1 && activeCountRow.count >= MAX_ACTIVE_BANNERS) {
      return NextResponse.json({ error: `Дозволени се максимум ${MAX_ACTIVE_BANNERS} активни банери.` }, { status: 400 });
    }

    if (existing.is_active === 1 && nextIsActive === 0 && activeCountRow.count <= MIN_ACTIVE_BANNERS) {
      return NextResponse.json({ error: 'Мора да остане најмалку 1 активен банер.' }, { status: 400 });
    }

    db.prepare(`
      UPDATE banners
      SET
        image_url = ?,
        eyebrow = ?,
        title = ?,
        subtitle = ?,
        link_url = ?,
        sort_order = ?,
        is_active = ?
      WHERE id = ?
    `).run(
      String(body.image_url || '').trim(),
      null,
      null,
      null,
      String(body.link_url || '').trim() || null,
      Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
      nextIsActive,
      id,
    );

    return NextResponse.json({ message: 'Банерот е ажуриран.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при ажурирање банер', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const db = getDb();
    const params = await context.params;
    const id = Number(params.id);
    const existing = db.prepare('SELECT id, is_active FROM banners WHERE id = ?').get(id) as { id: number; is_active: number } | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Банерот не постои.' }, { status: 404 });
    }

    if (existing.is_active === 1) {
      const activeCountRow = db.prepare('SELECT COUNT(*) as count FROM banners WHERE is_active = 1').get() as { count: number };
      if (activeCountRow.count <= MIN_ACTIVE_BANNERS) {
        return NextResponse.json({ error: 'Не можеш да го избришеш последниот активен банер.' }, { status: 400 });
      }
    }

    db.prepare('DELETE FROM banners WHERE id = ?').run(id);
    return NextResponse.json({ message: 'Банерот е избришан.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при бришење банер', details: String(error) }, { status: 500 });
  }
}
