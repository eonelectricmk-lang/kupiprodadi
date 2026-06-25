import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { user_id, image_data } = await request.json();
    if (!user_id || !image_data) {
      return NextResponse.json({ error: 'user_id и image_data се задолжителни' }, { status: 400 });
    }
    if (!image_data.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Невалиден формат на слика' }, { status: 400 });
    }
    if (image_data.length > 500000) {
      return NextResponse.json({ error: 'Сликата е преголема (макс 500KB)' }, { status: 400 });
    }
    db.prepare('UPDATE users SET avatar_url = ? WHERE id = ?').run(image_data, user_id);
    return NextResponse.json({ avatar_url: image_data, message: 'Аватарот е зачуван' });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при зачувување аватар' }, { status: 500 });
  }
}
