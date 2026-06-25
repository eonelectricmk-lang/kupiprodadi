import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID требан' },
        { status: 400 }
      );
    }

    const messages = db.prepare(`
      SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.product_id,
        m.content,
        m.read,
        m.created_at,
        u_sender.name as sender_name,
        u_receiver.name as receiver_name,
        p.title as product_title
      FROM messages m
      LEFT JOIN users u_sender ON m.sender_id = u_sender.id
      LEFT JOIN users u_receiver ON m.receiver_id = u_receiver.id
      LEFT JOIN products p ON m.product_id = p.id
      WHERE m.receiver_id = ? OR m.sender_id = ?
      ORDER BY m.created_at DESC
    `).all(user_id, user_id);

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање пораки' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { sender_id, receiver_id, product_id, content } = await request.json();

    if (!sender_id || !receiver_id || !content) {
      return NextResponse.json(
        { error: 'Сите полиња се задолжителни' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO messages (sender_id, receiver_id, product_id, content)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(sender_id, receiver_id, product_id || null, content);

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: 'Порака успешно пратена'
    }, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Грешка при пратање порака' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const db = getDb();
    const { receiver_id } = await request.json();
    if (!receiver_id) {
      return NextResponse.json({ error: 'Receiver ID е задолжителен' }, { status: 400 });
    }
    const result = db.prepare(`
      UPDATE messages SET read = 1 WHERE receiver_id = ? AND read = 0
    `).run(receiver_id);
    return NextResponse.json({ updated: result.changes }, { status: 200 });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ error: 'Грешка при означување прочитано' }, { status: 500 });
  }
}
