import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const db = getDb();
    const status = request.nextUrl.searchParams.get('status');
    const sort = request.nextUrl.searchParams.get('sort') || 'newest';
    const where = status ? 'WHERE p.status = ?' : '';

    let orderBy = 'p.created_at DESC';
    switch (sort) {
      case 'oldest': orderBy = 'p.created_at ASC'; break;
      case 'price_asc': orderBy = 'p.price ASC'; break;
      case 'price_desc': orderBy = 'p.price DESC'; break;
      case 'title_asc': orderBy = 'p.title ASC'; break;
      case 'title_desc': orderBy = 'p.title DESC'; break;
    }

    const rows = db.prepare(`
      SELECT
        p.id,
        p.title,
        p.description,
        p.price,
        p.currency,
        p.category,
        p.subcategory,
        p.city,
        p.location,
        p.image_url,
        p.created_at,
        p.status,
        p.contact_name,
        p.contact_phone,
        p.contact_email,
        p.delivery,
        p.condition,
        u.id as seller_id,
        u.name as seller_name,
        u.email as seller_email
      FROM products p
      JOIN users u ON u.id = p.seller_id
      ${where}
      ORDER BY ${orderBy}
    `).all(...(status ? [status] : []));
    const productIds = rows.map((product: any) => product.id);
    const imagesByProduct = new Map<number, string[]>();

    if (productIds.length > 0) {
      const placeholders = productIds.map(() => '?').join(',');
      const images = db.prepare(`
        SELECT product_id, image_url
        FROM product_images
        WHERE product_id IN (${placeholders})
        ORDER BY sort_order ASC, id ASC
      `).all(...productIds) as Array<{ product_id: number; image_url: string }>;

      images.forEach((image) => {
        const list = imagesByProduct.get(image.product_id) || [];
        list.push(image.image_url);
        imagesByProduct.set(image.product_id, list);
      });
    }

    const products = rows.map((product: any) => ({
      ...product,
      images: imagesByProduct.get(product.id) || (product.image_url ? [product.image_url] : []),
    }));

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ error: 'Нема дозвола' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Грешка при вчитување огласи', details: String(error) }, { status: 500 });
  }
}
