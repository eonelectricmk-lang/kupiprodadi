import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const to_user_id = searchParams.get('to_user_id');

    if (!to_user_id) {
      return NextResponse.json(
        { error: 'User ID требан' },
        { status: 400 }
      );
    }

    const reviews = db.prepare(`
      SELECT 
        r.id,
        r.from_user_id,
        r.rating,
        r.comment,
        r.created_at,
        u.name as from_user_name
      FROM reviews r
      JOIN users u ON r.from_user_id = u.id
      WHERE r.to_user_id = ?
      ORDER BY r.created_at DESC
    `).all(to_user_id);

    const avg_rating_result = db.prepare(`
      SELECT AVG(rating) as avg_rating FROM reviews WHERE to_user_id = ?
    `).get(to_user_id) as any;

    return NextResponse.json({
      reviews,
      avg_rating: avg_rating_result?.avg_rating || 5.0,
      total: reviews.length
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање рецензии' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { from_user_id, to_user_id, rating, comment } = await request.json();

    if (!from_user_id || !to_user_id || !rating) {
      return NextResponse.json(
        { error: 'Сите полиња се задолжителни' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Рејтинг мора да биде помеѓу 1 и 5' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO reviews (from_user_id, to_user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `);
    
    const result = stmt.run(from_user_id, to_user_id, rating, comment || null);

    // Update user average rating
    const avgRating = db.prepare(`SELECT AVG(rating) as avg FROM reviews WHERE to_user_id = ?`).get(to_user_id) as any;
    db.prepare(`UPDATE users SET rating = ? WHERE id = ?`).run(avgRating.avg || 5.0, to_user_id);

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: 'Рецензија успешно пратена'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Грешка при пратање рецензија' },
      { status: 500 }
    );
  }
}
