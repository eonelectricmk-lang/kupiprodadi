import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const { buyer_id, product_id, quantity } = await request.json();

    if (!buyer_id || !product_id) {
      return NextResponse.json(
        { error: 'Недостаток информации' },
        { status: 400 }
      );
    }

    const product = db.prepare(
      'SELECT id, price, seller_id FROM products WHERE id = ?'
    ).get(product_id);

    if (!product) {
      return NextResponse.json(
        { error: 'Производот не постои' },
        { status: 404 }
      );
    }

    if (product.seller_id === buyer_id) {
      return NextResponse.json(
        { error: 'Не можеш да го купиш твој производ' },
        { status: 400 }
      );
    }

    const totalPrice = product.price * (quantity || 1);

    const stmt = db.prepare(`
      INSERT INTO orders (buyer_id, seller_id, product_id, quantity, total_price)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(buyer_id, product.seller_id, product_id, quantity || 1, totalPrice);

    return NextResponse.json(
      {
        message: 'Налог е успешно креиран',
        orderId: result.lastInsertRowid
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Грешка при креирање налог' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const userId = request.nextUrl.searchParams.get('user_id');
    const type = request.nextUrl.searchParams.get('type');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID е задолжителен' },
        { status: 400 }
      );
    }

    let orders;
    if (type === 'selling') {
      orders = db.prepare(`
        SELECT o.*, p.title, u.name as buyer_name, u.email as buyer_email
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.buyer_id = u.id
        WHERE o.seller_id = ?
        ORDER BY o.created_at DESC
      `).all(userId);
    } else {
      orders = db.prepare(`
        SELECT o.*, p.title, u.name as seller_name, u.email as seller_email, u.phone as seller_phone
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users u ON o.seller_id = u.id
        WHERE o.buyer_id = ?
        ORDER BY o.created_at DESC
      `).all(userId);
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање налози' },
      { status: 500 }
    );
  }
}
