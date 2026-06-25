import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const search = request.nextUrl.searchParams.get('search')?.trim() || '';
    const sort = request.nextUrl.searchParams.get('sort') || 'newest';
    const status = request.nextUrl.searchParams.get('status') || 'all';

    const whereClauses: string[] = [];
    const params: Array<string | number> = [];

    if (search) {
      whereClauses.push(`(
        u.name LIKE ?
        OR u.email LIKE ?
        OR COALESCE(u.phone, '') LIKE ?
        OR COALESCE(u.location, '') LIKE ?
        OR CAST(u.id AS TEXT) LIKE ?
      )`);
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (status === 'active') {
      whereClauses.push('COALESCE(u.is_active, 1) = 1');
    } else if (status === 'inactive') {
      whereClauses.push('COALESCE(u.is_active, 1) = 0');
    }

    const where = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const orderByMap: Record<string, string> = {
      newest: 'u.created_at DESC',
      oldest: 'u.created_at ASC',
      rating_high: 'u.rating DESC, u.reviews_count DESC, u.created_at DESC',
      rating_low: 'u.rating ASC, u.reviews_count ASC, u.created_at DESC',
      ads_high: 'ads_count DESC, u.created_at DESC',
      ads_low: 'ads_count ASC, u.created_at DESC',
    };
    const orderBy = orderByMap[sort] || orderByMap.newest;

    const users = db.prepare(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.location,
        u.role,
        u.rating,
        u.reviews_count,
        u.created_at,
        COALESCE(u.is_active, 1) AS is_active,
        (
          SELECT COUNT(*)
          FROM products p
          WHERE p.seller_id = u.id
        ) AS ads_count
      FROM users u
      ${where}
      ORDER BY ${orderBy}
    `).all(...params);

    const counts = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN COALESCE(is_active, 1) = 1 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN COALESCE(is_active, 1) = 0 THEN 1 ELSE 0 END) AS inactive
      FROM users
    `).get() as { total: number; active: number; inactive: number };

    return NextResponse.json({
      users,
      counts: {
        total: counts?.total || 0,
        active: counts?.active || 0,
        inactive: counts?.inactive || 0,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при вчитување корисници', details: String(error) }, { status: 500 });
  }
}
