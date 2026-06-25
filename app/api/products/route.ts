import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { normalizeCategorySlug } from '@/lib/category-aliases';

export async function GET(request: NextRequest) {
  try {
    const db = getDb();
    const searchParams = request.nextUrl.searchParams;
    const category = normalizeCategorySlug(searchParams.get('category'));
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const sellerId = searchParams.get('seller_id');
    const includeAll = searchParams.get('all') === '1';
    const subcategory = normalizeCategorySlug(searchParams.get('subcategory') || searchParams.get('sub'));
    const condition = searchParams.get('condition');
    const city = searchParams.get('city');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '20', 10) || 20, 1), 100);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10) || 0, 0);

    const filters: string[] = includeAll ? [] : ["p.status = 'active'"];
    const values: Array<string | number> = [];

    if (category) {
      filters.push('p.category = ?');
      values.push(category);
    }
    if (sellerId) {
      filters.push('p.seller_id = ?');
      values.push(Number(sellerId));
    }
    if (search) {
      const trimmedSearch = search.trim();
      const normalizedIdSearch = trimmedSearch.match(/^KP-(\d+)$/i)?.[1] || trimmedSearch.match(/^(\d+)$/)?.[1] || null;

      if (normalizedIdSearch) {
        const numericId = Number(normalizedIdSearch);
        filters.push('(p.id = ? OR printf(\'KP-%06d\', p.id) = ? OR p.title LIKE ? OR p.description LIKE ?)');
        values.push(numericId, `KP-${String(numericId).padStart(6, '0')}`, `%${trimmedSearch}%`, `%${trimmedSearch}%`);
      } else {
        filters.push('(p.title LIKE ? OR p.description LIKE ? OR printf(\'KP-%06d\', p.id) LIKE ?)');
        values.push(`%${trimmedSearch}%`, `%${trimmedSearch}%`, `%${trimmedSearch}%`);
      }
    }
    if (location) {
      filters.push('p.location LIKE ?');
      values.push(`%${location}%`);
    }
    if (subcategory) {
      filters.push('p.subcategory = ?');
      values.push(subcategory);
    }
    if (condition) {
      filters.push('p.condition = ?');
      values.push(condition);
    }
    if (city) {
      filters.push('p.city = ?');
      values.push(city);
    }
    if (minPrice) {
      filters.push('p.price >= ?');
      values.push(Number(minPrice));
    }
    if (maxPrice) {
      filters.push('p.price <= ?');
      values.push(Number(maxPrice));
    }

    const whereClause = filters.length > 0 ? filters.join(' AND ') : '1=1';

    const products = db.prepare(`
      SELECT 
        p.id, 
        p.title, 
        p.description, 
        p.price,
        p.currency,
        p.category,
        p.subcategory,
        p.condition,
        p.negotiable,
        p.location,
        p.city,
        p.neighborhood,
        p.address_note,
        p.delivery,
        p.contact_name,
        p.contact_phone,
        p.contact_email,
        p.preferred_contact,
        p.image_url,
        p.views,
        p.created_at,
        u.id as seller_id,
        u.name as seller_name,
        u.phone as seller_phone,
        u.rating as seller_rating
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...values, limit, offset);

    const countResult = db.prepare(`
      SELECT COUNT(*) as count
      FROM products p
      WHERE ${whereClause}
    `).get(...values) as any;

    const productIds = products.map((product: any) => product.id);
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

    const productsWithImages = products.map((product: any) => ({
      ...product,
      images: imagesByProduct.get(product.id) || (product.image_url ? [product.image_url] : []),
    }));

    return NextResponse.json({
      products: productsWithImages,
      total: countResult.count,
      limit,
      offset
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање производи', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();
    const {
      title,
      description,
      price,
      currency,
      category,
      subcategory,
      condition,
      negotiable,
      city,
      neighborhood,
      address_note,
      delivery,
      contact_name,
      contact_phone,
      contact_email,
      preferred_contact,
      location,
      seller_id,
      image_url,
      images,
    } = await request.json();

    const normalizedCategory = normalizeCategorySlug(category);
    const normalizedSubcategory = normalizeCategorySlug(subcategory);

    if (!title || !description || !price || !normalizedCategory || !seller_id || (!location && !city)) {
      return NextResponse.json(
        { error: 'Сите задолжителни полиња треба да бидат пополнети' },
        { status: 400 }
      );
    }

    const imageList = Array.isArray(images)
      ? images.filter((image): image is string => typeof image === 'string' && image.length > 0).slice(0, 8)
      : [];
    const primaryImage = image_url || imageList[0] || null;
    const resolvedLocation = location || [city, neighborhood].filter(Boolean).join(', ');

    const insertProduct = db.prepare(`
      INSERT INTO products (
        title,
        description,
        price,
        currency,
        category,
        subcategory,
        condition,
        negotiable,
        location,
        city,
        neighborhood,
        address_note,
        delivery,
        contact_name,
        contact_phone,
        contact_email,
        preferred_contact,
        seller_id,
        image_url,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertImage = db.prepare(`
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES (?, ?, ?)
    `);

    const createProduct = db.transaction(() => {
      const result = insertProduct.run(
        title,
        description,
        Number(price),
        currency || 'дин',
        normalizedCategory,
        normalizedSubcategory || null,
        condition || null,
        negotiable ? 1 : 0,
        resolvedLocation,
        city || null,
        neighborhood || null,
        address_note || null,
        delivery || null,
        contact_name || null,
        contact_phone || null,
        contact_email || null,
        preferred_contact || null,
        seller_id,
        primaryImage,
        'pending',
      );

      const productId = Number(result.lastInsertRowid);
      imageList.forEach((image, index) => insertImage.run(productId, image, index));
      return productId;
    });

    const id = createProduct();

    return NextResponse.json({
      id,
      status: 'pending',
      message: 'Огласот е пратен на одобрување'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Грешка при создавање оглас', details: String(error) },
      { status: 500 }
    );
  }
}
