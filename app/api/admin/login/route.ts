import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createAdminSession } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email и лозинка се задолжителни' }, { status: 400 });
    }

    const admin = authenticateAdmin(email, password);
    if (!admin) {
      return NextResponse.json({ error: 'Погрешни admin податоци' }, { status: 401 });
    }

    await createAdminSession(admin.id);
    return NextResponse.json({ message: 'Успешна admin најава', admin });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при admin најава', details: String(error) }, { status: 500 });
  }
}
