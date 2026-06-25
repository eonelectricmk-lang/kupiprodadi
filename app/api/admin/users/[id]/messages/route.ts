import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const db = getDb();
    const { id } = await context.params;
    const userId = Number(id);

    if (!Number.isFinite(userId) || userId <= 0) {
      return NextResponse.json({ error: 'Невалиден корисник.' }, { status: 400 });
    }

    const user = db
      .prepare(`SELECT id, name, email FROM users WHERE id = ?`)
      .get(userId) as { id: number; name: string; email: string } | undefined;

    if (!user) {
      return NextResponse.json({ error: 'Корисникот не постои.' }, { status: 404 });
    }

    const messages = db
      .prepare(`
        SELECT
          m.id,
          m.sender_id,
          m.receiver_id,
          m.product_id,
          m.content,
          COALESCE(m.read, 0) AS read,
          m.created_at,
          u_sender.name AS sender_name,
          u_receiver.name AS receiver_name,
          p.title AS product_title
        FROM messages m
        LEFT JOIN users u_sender ON m.sender_id = u_sender.id
        LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
        LEFT JOIN products p ON m.product_id = p.id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.created_at DESC
      `)
      .all(userId, userId);

    return NextResponse.json({ user, messages });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Грешка при вчитување на пораките.', details: String(error) }, { status: 500 });
  }
}
