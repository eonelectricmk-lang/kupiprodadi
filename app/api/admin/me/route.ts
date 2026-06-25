import { NextResponse } from 'next/server';
import { getAdminFromSession, hasAnyAdmin } from '@/lib/admin-auth';

export async function GET() {
  try {
    const admin = await getAdminFromSession();
    return NextResponse.json({
      authenticated: Boolean(admin),
      setupRequired: !hasAnyAdmin(),
      admin,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при проверка на admin', details: String(error) }, { status: 500 });
  }
}
