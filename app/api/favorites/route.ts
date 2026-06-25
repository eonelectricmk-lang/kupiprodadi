import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID требан' },
        { status: 400 }
      );
    }

    const favorites = db.prepare(`
      SELECT 
        f.id,
        p.id as product_id,
        p.title,
        p.price,
        p.currency,
        p.location,
        p.image_url,
        p.category,
        u.name as seller_name
      FROM favorites f
      JOIN products p ON f.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `).all(user_id);

    return NextResponse.json(favorites, { status: 200 });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање сачувани огласи' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { user_id, product_id } = await request.json();

    if (!user_id || !product_id) {
      return NextResponse.json(
        { error: 'User ID и Product ID се задолжителни' },
        { status: 400 }
      );
    }

    // Check if already exists
    const existing = db.prepare(`
      SELECT id FROM favorites WHERE user_id = ? AND product_id = ?
    `).get(user_id, product_id);

    if (existing) {
      // Delete if exists
      db.prepare(`DELETE FROM favorites WHERE user_id = ? AND product_id = ?`).run(user_id, product_id);
      return NextResponse.json({
        message: 'Огласот е отстранет од сачувани'
      }, { status: 200 });
    }

    // Add to favorites
    const stmt = db.prepare(`
      INSERT INTO favorites (user_id, product_id)
      VALUES (?, ?)
    `);
    
    const result = stmt.run(user_id, product_id);

    return NextResponse.json({
      id: result.lastInsertRowid,
      message: 'Огласот е додаден во сачувани'
    }, { status: 201 });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Грешка при зачувување' },
      { status: 500 }
    );
  }
}
