import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

const MAX_ACTIVE_BANNERS = 10;

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const banners = db.prepare(`
      SELECT id, image_url, eyebrow, title, subtitle, link_url, sort_order, is_active, created_at
      FROM banners
      ORDER BY sort_order ASC, id ASC
    `).all();

    return NextResponse.json({ banners });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при вчитување банери', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const body = await request.json();
    const imageUrl = String(body.image_url || '').trim();
    const wantsActive = body.is_active === false ? 0 : 1;

    if (!imageUrl) {
      return NextResponse.json({ error: 'Сликата е задолжителна' }, { status: 400 });
    }

    if (wantsActive) {
      const activeCountRow = db.prepare('SELECT COUNT(*) as count FROM banners WHERE is_active = 1').get() as { count: number };
      if (activeCountRow.count >= MAX_ACTIVE_BANNERS) {
        return NextResponse.json({ error: `Дозволени се максимум ${MAX_ACTIVE_BANNERS} активни банери.` }, { status: 400 });
      }
    }

    const nextSortOrder = db.prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as nextOrder FROM banners').get() as { nextOrder: number };
    const result = db.prepare(`
      INSERT INTO banners (image_url, eyebrow, title, subtitle, link_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      imageUrl,
      null,
      null,
      null,
      String(body.link_url || '').trim() || null,
      Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : nextSortOrder.nextOrder,
      wantsActive,
    );

    return NextResponse.json({ id: Number(result.lastInsertRowid), message: 'Банерот е зачуван.' }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при зачувување банер', details: String(error) }, { status: 500 });
  }
}
