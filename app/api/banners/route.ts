import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getActiveBanners } from '@/lib/banner-store';

export async function GET() {
  try {
    const db = getDb();
    const banners = getActiveBanners(db);
    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при вчитување банери', details: String(error) }, { status: 500 });
  }
}
