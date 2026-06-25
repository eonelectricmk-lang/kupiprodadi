import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getHomepageSections } from '@/lib/homepage-sections';

export async function GET() {
  try {
    const db = getDb();
    const sections = getHomepageSections(db);
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при вчитување на почетните секции', details: String(error) }, { status: 500 });
  }
}
