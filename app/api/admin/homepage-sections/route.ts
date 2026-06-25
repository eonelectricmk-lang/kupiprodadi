import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { DEFAULT_HOMEPAGE_SECTIONS, getHomepageSections, type HomepageTrustItem } from '@/lib/homepage-sections';

const ALLOWED_ICONS = new Set(['shield-check', 'badge-check', 'zap', 'users']);

function normalizeCategorySlugs(input: unknown, fallback: string[]) {
  if (!Array.isArray(input)) return fallback;
  const cleaned = input
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return cleaned.length ? cleaned : fallback;
}

function normalizeTrustItems(input: unknown): HomepageTrustItem[] {
  if (!Array.isArray(input) || input.length !== 4) {
    return DEFAULT_HOMEPAGE_SECTIONS.trustItems;
  }

  return input.map((item, index) => {
    const next = item && typeof item === 'object' ? item as Record<string, unknown> : {};
    const fallback = DEFAULT_HOMEPAGE_SECTIONS.trustItems[index];
    const icon = String(next.icon || fallback.icon);
    return {
      icon: ALLOWED_ICONS.has(icon) ? (icon as HomepageTrustItem['icon']) : fallback.icon,
      color: String(next.color || fallback.color),
      title: String(next.title || fallback.title).trim() || fallback.title,
      subtitle: String(next.subtitle || fallback.subtitle).trim() || fallback.subtitle,
    };
  });
}

export async function GET() {
  try {
    await requireAdmin();
    const db = getDb();
    const sections = getHomepageSections(db);
    return NextResponse.json(sections);
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при вчитување на уредувањето на банери', details: String(error) }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const body = await request.json();

    const headerCategorySlugs = normalizeCategorySlugs(body?.headerCategorySlugs, DEFAULT_HOMEPAGE_SECTIONS.headerCategorySlugs);
    const homeCategorySlugs = normalizeCategorySlugs(body?.homeCategorySlugs, DEFAULT_HOMEPAGE_SECTIONS.homeCategorySlugs);
    const trustItems = normalizeTrustItems(body?.trustItems);

    const upsert = db.prepare(`
      INSERT INTO homepage_sections (section_key, data, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(section_key) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      upsert.run('header_category_strip', JSON.stringify({ categorySlugs: headerCategorySlugs }));
      upsert.run('trust_bar', JSON.stringify({ items: trustItems }));
      upsert.run('home_category_strip', JSON.stringify({ categorySlugs: homeCategorySlugs }));
    });

    transaction();

    return NextResponse.json({ message: 'Почетните банери се зачувани.' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при зачувување на банерите', details: String(error) }, { status: 500 });
  }
}
