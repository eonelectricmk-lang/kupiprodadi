import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';

const SYSTEM_EMAIL = 'kupiprodadi@system.mk';

const CATEGORY_MAP: Record<string, string> = {
  'автомобили': 'Моторни Возила',
  'автомобил': 'Моторни Возила',
  'возење': 'Моторни Возила',
  'мотоцикли': 'Моторни Возила',
  'велосипеди': 'Моторни Возила',
  'резервни делови': 'Моторни Возила',
  'станови': 'Недвижности',
  'куќи': 'Недвижности',
  'куки': 'Недвижности',
  'земја': 'Недвижности',
  'zemja': 'Недвижности',
  'недвижности': 'Недвижности',
  'намештај': 'Дом и Градина',
  'nametej': 'Дом и Градина',
  'мебел': 'Дом и Градина',
  'дом': 'Дом и Градина',
  'градина': 'Дом и Градина',
  'бела техника': 'Дом и Градина',
  'мода': 'Мода и Облека и Обувки',
  'облека': 'Мода и Облека и Обувки',
  'обувки': 'Мода и Облека и Обувки',
  'мобилни': 'Мобилни телефони и додатоци',
  'телефон': 'Мобилни телефони и додатоци',
  'iphone': 'Мобилни телефони и додатоци',
  'самсунг': 'Мобилни телефони и додатоци',
  'samsung': 'Мобилни телефони и додатоци',
  'таблет': 'Мобилни телефони и додатоци',
  'компјутер': 'Компјутери',
  'kompjuter': 'Компјутери',
  'лаптоп': 'Компјутери',
  'laptop': 'Компјутери',
  'десктоп': 'Компјутери',
  'монитор': 'Компјутери',
  'телевизор': 'ТВ, Видео, Фото и Мултимедија',
  'тв': 'ТВ, Видео, Фото и Мултимедија',
  'tv': 'ТВ, Видео, Фото и Мултимедија',
  'фото': 'ТВ, Видео, Фото и Мултимедија',
  'видео': 'ТВ, Видео, Фото и Мултимедија',
  'музички': 'Музички инструменти и опрема',
  'гитара': 'Музички инструменти и опрема',
  'часовник': 'Часовници и Накит',
  'часовници': 'Часовници и Накит',
  'накит': 'Часовници и Накит',
  'беби': 'Беби и Детски производи',
  'бeби': 'Беби и Детски производи',
  'детски': 'Беби и Детски производи',
  'играчки': 'Беби и Детски производи',
  'здравје': 'Здравје, Убавина додатоци и опрема',
  'ubavina': 'Здравје, Убавина додатоци и опрема',
  'козметика': 'Здравје, Убавина додатоци и опрема',
  'книги': 'Книги и литература',
  'knigi': 'Книги и литература',
  'литература': 'Книги и литература',
  'спорт': 'Спортска опрема и активности',
  'sport': 'Спортска опрема и активности',
  'фитнес': 'Спортска опрема и активности',
  'fitnes': 'Спортска опрема и активности',
  'хоби': 'Слободно време и хоби, Животни',
  'hobi': 'Слободно време и хоби, Животни',
  'животни': 'Слободно време и хоби, Животни',
  'храна': 'Храна и готвење',
  'hrana': 'Храна и готвење',
  'бизнис': 'Бизнис и дејности, Машини алати',
  'biznis': 'Бизнис и дејности, Машини алати',
  'услуги': 'Услуги, Сервисери',
  'uslugi': 'Услуги, Сервисери',
  'сервис': 'Услуги, Сервисери',
  'вработување': 'Вработување',
  'vrabotuvanje': 'Вработување',
  'настани': 'Настани, Ноќен живот, Изложби',
  'nastani': 'Настани, Ноќен живот, Изложби',
  'туризам': 'Одмор, Туризам, Билети, Патувања',
  'turizam': 'Одмор, Туризам, Билети, Патувања',
  'патување': 'Одмор, Туризам, Билети, Патувања',
  'одмор': 'Одмор, Туризам, Билети, Патувања',
};

function mapCategory(raw: string): string {
  if (!raw) return 'Останато';
  const key = raw.toLowerCase().trim();
  if (CATEGORY_MAP[key]) return CATEGORY_MAP[key];
  for (const [pattern, mapped] of Object.entries(CATEGORY_MAP)) {
    if (key.includes(pattern)) return mapped;
  }
  return 'Останато';
}

export async function POST(request: NextRequest) {
  try {
    const db = getDb();

    const systemUser = db.prepare('SELECT id FROM users WHERE email = ?').get(SYSTEM_EMAIL) as any;
    if (!systemUser) {
      return NextResponse.json({ error: 'Системскиот корисник не постои' }, { status: 500 });
    }

    const body = await request.json();

    const {
      title, description, price, city, category,
      sellerName, phone, images, link, rawText
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Насловот е задолжителен' }, { status: 400 });
    }

    const categoryName = mapCategory(category || '');
    const imageList = Array.isArray(images)
      ? images.filter((img: string) => typeof img === 'string' && img.length > 0).slice(0, 8)
      : [];
    const primaryImage = imageList[0] || null;
    const resolvedLocation = city || '';

    const insertProduct = db.prepare(`
      INSERT INTO products (
        title, description, price, currency, category, location,
        seller_id, image_url, contact_name, contact_phone, status,
        city, subcategory, condition, negotiable,
        neighborhood, address_note, delivery, contact_email, preferred_contact
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
        description || '',
        Number(price) || 0,
        'дин',
        categoryName,
        resolvedLocation,
        systemUser.id,
        primaryImage,
        sellerName || 'Непознат',
        phone || '',
        'active',
        city || null,
        null,
        null,
        0,
        null,
        null,
        null,
        null,
        null,
      );

      const productId = Number(result.lastInsertRowid);
      imageList.forEach((image: string, index: number) => insertImage.run(productId, image, index));
      return productId;
    });

    const id = createProduct();

    return NextResponse.json({
      id,
      url: `/products/${id}`,
      message: 'Огласот е објавен на КупиПродади',
    }, {
      status: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  } catch (error) {
    console.error('Error importing product:', error);
    return NextResponse.json(
      { error: 'Грешка при импорт на оглас', details: String(error) },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
