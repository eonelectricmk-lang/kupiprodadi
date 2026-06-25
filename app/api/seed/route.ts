import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST() {
  try {
    const db = getDb();

    // Check if data already exists
    const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    if (existingUsers.count > 0) {
      return NextResponse.json({ message: 'Database already seeded' });
    }

    // Create sample users
    const sellers = [
      { email: 'marko@example.com', password: '123456', name: 'Марко М.', phone: '+389 70 123 456', location: 'Скопје', rating: 4.8 },
      { email: 'ana@example.com', password: '123456', name: 'Ана П.', phone: '+389 71 234 567', location: 'Битола', rating: 4.9 },
      { email: 'ivan@example.com', password: '123456', name: 'Иван К.', phone: '+389 72 345 678', location: 'Охрид', rating: 4.7 },
      { email: 'petro@example.com', password: '123456', name: 'Петар В.', phone: '+389 73 456 789', location: 'Прилеп', rating: 4.6 },
      { email: 'marina@example.com', password: '123456', name: 'Марина Ј.', phone: '+389 74 567 890', location: 'Куманово', rating: 4.8 },
      { email: 'alexa@example.com', password: '123456', name: 'Алекса Г.', phone: '+389 75 678 901', location: 'Велес', rating: 4.5 },
    ];

    const insertUser = db.prepare(`
      INSERT INTO users (email, password, name, phone, location, rating)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const userIds: number[] = [];
    for (const seller of sellers) {
      const result = insertUser.run(seller.email, seller.password, seller.name, seller.phone, seller.location, seller.rating) as any;
      userIds.push(result.lastInsertRowid);
    }

    // Create sample products
    const products = [
      {
        seller_id: userIds[0],
        title: 'iPhone 13 Pro',
        description: 'Одлично сочуван, 256GB, Space Gray, со сите аксесоари',
        price: 450,
        category: 'Мобилни телефони',
        location: 'Скопје',
        image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[1],
        title: 'Велосипед Scott Mountain',
        description: 'Планински велосипед, 29" колација, одлично состојба',
        price: 120,
        category: 'Велосипеди',
        location: 'Битола',
        image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[2],
        title: 'MacBook Pro 14"',
        description: 'М3 Max, нов, 512GB SSD, 16GB RAM',
        price: 950,
        category: 'Лаптопи / компјутери',
        location: 'Охрид',
        image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[3],
        title: 'Гаража 50м²',
        description: 'Гаража во центарот на Прилеп, канализирана, добра локација',
        price: 45000,
        category: 'Деловен простор',
        location: 'Прилеп',
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[4],
        title: 'BMW 320d',
        description: '2015 година, 150ks, дизел, одлично сочувана',
        price: 8500,
        category: 'Автомобили',
        location: 'Куманово',
        image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[5],
        title: 'Канапе IKEA',
        description: 'Триместна канапе, сива боја, многу добра состојба',
        price: 280,
        category: 'Мебел',
        location: 'Велес',
        image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[0],
        title: 'iPad Air 5',
        description: '64GB, Wi-Fi только, нов, со гаранција',
        price: 600,
        category: 'Мобилни телефони',
        location: 'Скопје',
        image_url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[1],
        title: 'Фитнес екипаж',
        description: 'Гири, шипка со тегови, и други фитнес опреми',
        price: 350,
        category: 'Фитнес опрема',
        location: 'Битола',
        image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[2],
        title: 'Sony 55 OLED TV',
        description: '4K, Smart TV, многу добра слика, нов',
        price: 800,
        category: 'ТВ / аудио / видео',
        location: 'Охрид',
        image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[3],
        title: 'Ново грнда во Прилеп',
        description: '2 спални, кујна, дневна, добра локација со паркинг',
        price: 120000,
        category: 'Куќи и вили',
        location: 'Прилеп',
        image_url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[4],
        title: 'Мерцедес A200',
        description: '2018 година, бензин, црвена боја, одлично состојба',
        price: 12000,
        category: 'Автомобили',
        location: 'Куманово',
        image_url: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=400&h=400&fit=crop',
      },
      {
        seller_id: userIds[5],
        title: 'Кревет со ортопедски душек',
        description: '160x200, бела боја, многу удобен',
        price: 400,
        category: 'Мебел',
        location: 'Велес',
        image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=400&fit=crop',
      },
    ];

    const insertProduct = db.prepare(`
      INSERT INTO products (seller_id, title, description, price, category, location, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const product of products) {
      insertProduct.run(
        product.seller_id,
        product.title,
        product.description,
        product.price,
        product.category,
        product.location,
        product.image_url
      );
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      users: sellers.length,
      products: products.length,
    });
  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
