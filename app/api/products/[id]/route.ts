import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { normalizeCategorySlug } from '@/lib/category-aliases';
import { deductRefreshCost, deductPromoteCost, resetUserSpendTracking } from '@/lib/billing';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const db = getDb();
    const includeAll = request.nextUrl.searchParams.get('all') === '1';
    const product = db.prepare(`
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
        u.email as seller_email,
        u.rating as seller_rating,
        u.avatar_url as seller_avatar_url
      FROM products p
      JOIN users u ON p.seller_id = u.id
      WHERE p.id = ? ${includeAll ? '' : "AND p.status = 'active'"}
    `).get(resolvedParams.id);

    if (!product) {
      return NextResponse.json(
        { error: 'Производот не постои' },
        { status: 404 }
      );
    }

    const images = db.prepare(`
      SELECT image_url
      FROM product_images
      WHERE product_id = ?
      ORDER BY sort_order ASC, id ASC
    `).all(resolvedParams.id) as Array<{ image_url: string }>;

    return NextResponse.json({
      ...(product as Record<string, unknown>),
      images: images.map((image) => image.image_url),
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Грешка при преземање производ' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const db = getDb();
    const payload = await request.json();
    const action = payload?.action || 'update';

    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: 'Невалиден идентификатор' }, { status: 400 });
    }

    const existing = db.prepare(`SELECT id, seller_id FROM products WHERE id = ?`).get(id) as
      | { id: number; seller_id: number }
      | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Производот не постои' }, { status: 404 });
    }

    if (payload?.seller_id && Number(payload.seller_id) !== existing.seller_id) {
      return NextResponse.json({ error: 'Немате дозвола за оваа измена' }, { status: 403 });
    }

    if (action === 'bump') {
      const sellerId = Number(payload?.seller_id || 0);
      if (!Number.isFinite(sellerId) || sellerId !== existing.seller_id) {
        return NextResponse.json({ error: 'Немате дозвола за оваа измена' }, { status: 403 });
      }

      resetUserSpendTracking(db, sellerId);
      const deduction = deductRefreshCost(db, sellerId);

      if (!deduction.success) {
        return NextResponse.json({ error: deduction.error || 'Грешка при обновување' }, { status: 402 });
      }

      db.prepare(`
        UPDATE products
        SET created_at = CURRENT_TIMESTAMP,
            status = 'active'
        WHERE id = ?
      `).run(id);

      return NextResponse.json({ message: 'Огласот е обновен' }, { status: 200 });
    }

    if (action === 'promote') {
      const sellerId = Number(payload?.seller_id || 0);
      if (!Number.isFinite(sellerId) || sellerId !== existing.seller_id) {
        return NextResponse.json({ error: 'Немате дозвола за оваа измена' }, { status: 403 });
      }

      const duration = Number(payload?.duration) || 7;
      const deduction = deductPromoteCost(db, sellerId);

      if (!deduction.success) {
        return NextResponse.json({ error: deduction.error || 'Грешка при промоција' }, { status: 402 });
      }

      const promoteUntil = new Date();
      promoteUntil.setDate(promoteUntil.getDate() + duration);

      db.prepare(`
        UPDATE products
        SET promoted = 1,
            promoted_at = CURRENT_TIMESTAMP,
            promoted_until = ?
        WHERE id = ?
      `).run(promoteUntil.toISOString(), id);

      return NextResponse.json({ message: `Огласот е промовиран ${duration} дена.` }, { status: 200 });
    }

    const normalizedCategory = normalizeCategorySlug(payload?.category);
    const normalizedSubcategory = normalizeCategorySlug(payload?.subcategory);
    const imageList: string[] = Array.isArray(payload?.images)
      ? payload.images.filter((image: unknown): image is string => typeof image === 'string' && image.length > 0).slice(0, 8)
      : [];
    const primaryImage = payload?.image_url || imageList[0] || null;
    const resolvedLocation = payload?.location || [payload?.city, payload?.neighborhood].filter(Boolean).join(', ');

    if (!payload?.title || !payload?.description || !payload?.price || !normalizedCategory || (!resolvedLocation && !payload?.city)) {
      return NextResponse.json(
        { error: 'Сите задолжителни полиња треба да бидат пополнети' },
        { status: 400 }
      );
    }

    const updateProduct = db.prepare(`
      UPDATE products
      SET title = ?,
          description = ?,
          price = ?,
          currency = ?,
          category = ?,
          subcategory = ?,
          condition = ?,
          negotiable = ?,
          location = ?,
          city = ?,
          neighborhood = ?,
          address_note = ?,
          delivery = ?,
          contact_name = ?,
          contact_phone = ?,
          contact_email = ?,
          preferred_contact = ?,
          image_url = ?,
          status = ?
      WHERE id = ?
    `);

    const deleteImages = db.prepare(`DELETE FROM product_images WHERE product_id = ?`);
    const insertImage = db.prepare(`
      INSERT INTO product_images (product_id, image_url, sort_order)
      VALUES (?, ?, ?)
    `);

    const update = db.transaction(() => {
      updateProduct.run(
        payload.title.trim(),
        payload.description.trim(),
        Number(payload.price),
        payload.currency || 'дин',
        normalizedCategory,
        normalizedSubcategory || null,
        payload.condition || null,
        payload.negotiable ? 1 : 0,
        resolvedLocation || '',
        payload.city || null,
        payload.neighborhood || null,
        payload.address_note || null,
        payload.delivery || null,
        payload.contact_name || null,
        payload.contact_phone || null,
        payload.contact_email || null,
        payload.preferred_contact || null,
        primaryImage,
        payload.status || 'active',
        id,
      );

      deleteImages.run(id);
      imageList.forEach((image: string, index: number) => insertImage.run(id, image, index));
    });

    update();

    return NextResponse.json({ message: 'Огласот е ажуриран' }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Грешка при ажурирање производ', details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const db = getDb();
    const sellerId = request.nextUrl.searchParams.get('seller_id');

    const existing = db.prepare(`SELECT id, seller_id FROM products WHERE id = ?`).get(id) as
      | { id: number; seller_id: number }
      | undefined;

    if (!existing) {
      return NextResponse.json({ error: 'Производот не постои' }, { status: 404 });
    }

    if (sellerId && Number(sellerId) !== existing.seller_id) {
      return NextResponse.json({ error: 'Немате дозвола за бришење' }, { status: 403 });
    }

    const remove = db.transaction(() => {
      db.prepare(`DELETE FROM product_images WHERE product_id = ?`).run(id);
      db.prepare(`DELETE FROM cart WHERE product_id = ?`).run(id);
      db.prepare(`DELETE FROM favorites WHERE product_id = ?`).run(id);
      db.prepare(`DELETE FROM messages WHERE product_id = ?`).run(id);
      db.prepare(`DELETE FROM orders WHERE product_id = ?`).run(id);
      db.prepare(`DELETE FROM products WHERE id = ?`).run(id);
    });

    remove();

    return NextResponse.json({ message: 'Огласот е избришан' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Грешка при бришење производ', details: String(error) },
      { status: 500 }
    );
  }
}
