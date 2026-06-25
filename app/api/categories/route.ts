import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getCategoryTree } from '@/lib/category-store';
import { requireAdmin } from '@/lib/admin-auth';
import { slugify } from '@/lib/slugify';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const includeInactive = request.nextUrl.searchParams.get('all') === '1';
    const categories = getCategoryTree(db, includeInactive);
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json({ error: 'Грешка при вчитување категории', details: String(error) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const { name, slug, icon, parentId } = await request.json();
    const cleanName = String(name || '').trim();
    const cleanSlug = slugify(slug || cleanName);

    if (!cleanName || !cleanSlug) {
      return NextResponse.json({ error: 'Името и slug се задолжителни' }, { status: 400 });
    }

    const existing = db.prepare('SELECT id FROM categories WHERE slug = ?').get(cleanSlug);
    if (existing) {
      return NextResponse.json({ error: 'Овој slug веќе постои' }, { status: 400 });
    }

    const row = db.prepare(`
      INSERT INTO categories (parent_id, name, slug, icon, sort_order, is_active)
      VALUES (?, ?, ?, ?, COALESCE((SELECT MAX(sort_order) + 1 FROM categories WHERE parent_id IS ?), 0), 1)
    `).run(parentId || null, cleanName, cleanSlug, parentId ? null : (icon || 'layout-grid'), parentId || null);

    return NextResponse.json({ id: Number(row.lastInsertRowid), message: 'Категоријата е додадена' }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при додавање категорија', details: String(error) }, { status: 500 });
  }
}
