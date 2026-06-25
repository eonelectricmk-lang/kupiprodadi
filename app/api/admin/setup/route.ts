import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, createInitialAdmin, hasAnyAdmin } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    if (hasAnyAdmin()) {
      return NextResponse.json({ error: 'Admin веќе постои' }, { status: 400 });
    }

    const { email, password, name, phone } = await request.json();
    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Име, email и лозинка се задолжителни' }, { status: 400 });
    }

    const userId = createInitialAdmin({ email, password, name, phone });
    await createAdminSession(userId);
    return NextResponse.json({ message: 'Admin профилот е креиран' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при креирање admin', details: String(error) }, { status: 500 });
  }
}
