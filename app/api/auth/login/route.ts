import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Е-пошта и лозинка се задолжителни' },
        { status: 400 }
      );
    }

    const user = db.prepare(`
      SELECT id, email, password, name, phone, location, rating, created_at, avatar_url, COALESCE(is_active, 1) AS is_active
      FROM users
      WHERE email = ?
    `).get(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Корисникот не постои' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Овој профил е деактивиран. Контактирајте го админот за повеќе информации.' },
        { status: 403 }
      );
    }

    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { error: 'Погрешна лозинка' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        message: 'Успешно логирање',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone || null,
          location: user.location || null,
          rating: user.rating ?? 5,
          created_at: user.created_at || null,
          avatar_url: user.avatar_url || null,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Грешка при логирање' },
      { status: 500 }
    );
  }
}
