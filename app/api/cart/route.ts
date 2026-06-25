import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { user_id, product_id, quantity } = await request.json();

    if (!user_id || !product_id) {
      return NextResponse.json(
        { error: 'Недостаток информации' },
        { status: 400 }
      );
    }

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(product_id);
    if (!product) {
      return NextResponse.json(
        { error: 'Производот не постои' },
        { status: 404 }
      );
    }

    const existing = db.prepare(
      'SELECT id FROM cart WHERE user_id = ? AND product_id = ?'
    ).get(user_id, product_id);

    if (existing) {
      db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(
        quantity || 1,
        existing.id
      );
    } else {
      db.prepare(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)'
      ).run(user_id, product_id, quantity || 1);
    }

    return NextResponse.json(
      { message: 'Додадено во кошница' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: 'Грешка при додавање во кошница' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const userId = request.nextUrl.searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID е задолжителен' },
        { status: 400 }
      );
    }

    const cartItems = db.prepare(`
      SELECT 
        c.id,
        c.quantity,
        p.id as product_id,
        p.title,
        p.price,
        p.image_url,
        (p.price * c.quantity) as subtotal
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `).all(userId);

    const total = cartItems.reduce((sum: number, item: any) => sum + item.subtotal, 0);

    return NextResponse.json(
      { items: cartItems, total },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање кошница' },
      { status: 500 }
    );
  }
}
