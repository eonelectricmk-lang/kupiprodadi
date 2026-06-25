import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';
import { slugify } from '@/lib/slugify';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const db = getDb();
    const params = await context.params;
    const id = Number(params.id);
    const { name, slug, icon, isActive } = await request.json();

    const existing = db.prepare('SELECT id, parent_id, slug FROM categories WHERE id = ?').get(id) as { id: number; parent_id: number | null; slug: string } | undefined;
    if (!existing) {
      return NextResponse.json({ error: 'Категоријата не постои' }, { status: 404 });
    }

    const cleanName = typeof name === 'string' && name.trim() ? name.trim() : null;
    const cleanSlug = typeof slug === 'string' && slug.trim() ? slugify(slug) : null;

    if (cleanSlug) {
      const duplicate = db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').get(cleanSlug, id);
      if (duplicate) {
        return NextResponse.json({ error: 'Овој slug веќе постои' }, { status: 400 });
      }
    }

    const nextIsParent = existing.parent_id === null;

    db.transaction(() => {
      if (cleanSlug && cleanSlug !== existing.slug) {
        if (nextIsParent) {
          db.prepare('UPDATE products SET category = ? WHERE category = ?').run(cleanSlug, existing.slug);
        } else {
          db.prepare('UPDATE products SET subcategory = ? WHERE subcategory = ?').run(cleanSlug, existing.slug);
        }
      }

      db.prepare(`
        UPDATE categories
        SET name = COALESCE(?, name),
            slug = COALESCE(?, slug),
            icon = CASE WHEN parent_id IS NULL THEN COALESCE(?, icon) ELSE icon END,
            is_active = COALESCE(?, is_active)
        WHERE id = ?
      `).run(cleanName, cleanSlug, icon || null, typeof isActive === 'boolean' ? (isActive ? 1 : 0) : null, id);
    })();

    return NextResponse.json({ message: 'Категоријата е зачувана' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при уредување категорија', details: String(error) }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const db = getDb();
    const params = await context.params;
    const id = Number(params.id);
    db.prepare('DELETE FROM categories WHERE id = ? OR parent_id = ?').run(id, id);
    return NextResponse.json({ message: 'Категоријата е избришана' });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при бришење категорија', details: String(error) }, { status: 500 });
  }
}
