import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { user_id, name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Пополнете ги сите задолжителни полиња.' }, { status: 400 });
    }

    const stmt = db.prepare(`
      INSERT INTO contact_messages (user_id, name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      user_id || null,
      String(name).trim(),
      String(email).trim(),
      phone ? String(phone).trim() : null,
      String(subject).trim(),
      String(message).trim(),
    );

    return NextResponse.json(
      {
        id: result.lastInsertRowid,
        message: 'Пораката е успешно испратена до администраторот.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error sending contact message:', error);
    return NextResponse.json({ error: 'Грешка при испраќање порака.' }, { status: 500 });
  }
}
