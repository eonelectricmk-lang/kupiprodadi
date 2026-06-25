import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Сите полиња се задолжителни' },
        { status: 400 }
      );
    }

    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Оваа е-пошта е веќе регистрирана' },
        { status: 400 }
      );
    }

    const hashedPassword = hashPassword(password);
    const stmt = db.prepare(
      'INSERT INTO users (email, password, name, phone) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(email, hashedPassword, name, phone || null);
    const createdUser = db.prepare(`
      SELECT id, email, name, phone, location, rating, created_at, avatar_url
      FROM users
      WHERE id = ?
    `).get(result.lastInsertRowid) as any;

    return NextResponse.json(
      { 
        message: 'Успешна регистрација',
        user: {
          id: createdUser?.id ?? result.lastInsertRowid,
          email: createdUser?.email ?? email,
          name: createdUser?.name ?? name,
          phone: createdUser?.phone || phone || null,
          location: createdUser?.location || null,
          rating: createdUser?.rating ?? 5,
          created_at: createdUser?.created_at || null,
          avatar_url: createdUser?.avatar_url || null,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Грешка при регистрација' },
      { status: 500 }
    );
  }
}
