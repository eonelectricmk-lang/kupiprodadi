import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const db = getDb();
    const { receiver_id, receiver_ids, content } = await request.json();
    const normalizedIds = Array.from(
      new Set(
        (Array.isArray(receiver_ids) ? receiver_ids : receiver_id ? [receiver_id] : [])
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value > 0)
      )
    );

    if (!normalizedIds.length || !content?.trim()) {
      return NextResponse.json({ error: 'Барем еден корисник и порака се задолжителни.' }, { status: 400 });
    }

    const placeholders = normalizedIds.map(() => '?').join(',');
    const receivers = db.prepare(`
      SELECT id, name, email, COALESCE(is_active, 1) AS is_active
      FROM users
      WHERE id IN (${placeholders})
    `).all(...normalizedIds) as Array<{ id: number; name: string; email: string; is_active: number }>;

    if (!receivers.length) {
      return NextResponse.json({ error: 'Корисникот не постои.' }, { status: 404 });
    }

    const insertMessage = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, product_id, content)
      VALUES (?, ?, NULL, ?)
    `);

    return NextResponse.json({
      sent: db.transaction(() => {
        let lastId = 0;
        receivers.forEach((receiver) => {
          const result = insertMessage.run(admin.id, receiver.id, content.trim());
          lastId = Number(result.lastInsertRowid);
        });
        return { count: receivers.length, lastId };
      })(),
      message: receivers.length === 1 ? 'Пораката е испратена.' : `Пораката е испратена до ${receivers.length} корисници.`,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при испраќање порака', details: String(error) }, { status: 500 });
  }
}
