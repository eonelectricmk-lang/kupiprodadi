import path from 'path';
import { migrateCategorySlugs, seedDefaultCategories } from '@/lib/category-store';
import { seedDefaultBanners } from '@/lib/banner-store';
import { seedHomepageSections } from '@/lib/homepage-sections';
import { ensureUserBalanceColumns, ensureBillingTables, getBillingConfig } from '@/lib/billing';

let db: any = null;

function addColumnIfMissing(database: any, table: string, column: string, definition: string) {
  const columns = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  if (!columns.some((existingColumn) => existingColumn.name === column)) {
    database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function initializeDb() {
  if (db) return db;
  
  try {
    const Database = require('better-sqlite3');
    const isVercel = process.env.VERCEL === '1';
    let dbPath: string;
    if (isVercel) {
      const fs = require('fs');
      const srcPath = path.join(process.cwd(), 'kupiprodadi.db');
      const tmpPath = '/tmp/kupiprodadi.db';
      if (!fs.existsSync(tmpPath)) {
        fs.copyFileSync(srcPath, tmpPath);
      }
      dbPath = tmpPath;
    } else {
      dbPath = path.join(process.cwd(), 'kupiprodadi.db');
    }
    db = new Database(dbPath);

    // Initialize database tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        location TEXT,
        role TEXT DEFAULT 'user',
        rating REAL DEFAULT 5.0,
        reviews_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        currency TEXT DEFAULT 'дин',
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        seller_id INTEGER NOT NULL,
        image_url TEXT,
        subcategory TEXT,
        condition TEXT,
        negotiable BOOLEAN DEFAULT 0,
        city TEXT,
        neighborhood TEXT,
        address_note TEXT,
        delivery TEXT,
        contact_name TEXT,
        contact_phone TEXT,
        contact_email TEXT,
        preferred_contact TEXT,
        status TEXT DEFAULT 'active',
        views INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        image_url TEXT NOT NULL,
        sort_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        buyer_id INTEGER NOT NULL,
        seller_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER DEFAULT 1,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (buyer_id) REFERENCES users(id),
        FOREIGN KEY (seller_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        product_id INTEGER,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      );

      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_user_id INTEGER NOT NULL,
        to_user_id INTEGER NOT NULL,
        rating REAL NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (from_user_id) REFERENCES users(id),
        FOREIGN KEY (to_user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        icon TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS admin_sessions (
        token TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS banners (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image_url TEXT NOT NULL,
        eyebrow TEXT,
        title TEXT,
        subtitle TEXT,
        link_url TEXT,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS homepage_sections (
        section_key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const productColumns: Array<[string, string]> = [
      ['subcategory', 'TEXT'],
      ['condition', 'TEXT'],
      ['negotiable', 'BOOLEAN DEFAULT 0'],
      ['city', 'TEXT'],
      ['neighborhood', 'TEXT'],
      ['address_note', 'TEXT'],
      ['delivery', 'TEXT'],
      ['contact_name', 'TEXT'],
      ['contact_phone', 'TEXT'],
      ['contact_email', 'TEXT'],
      ['preferred_contact', 'TEXT'],
    ];

    productColumns.forEach(([column, definition]) => {
      addColumnIfMissing(db, 'products', column, definition);
    });

    addColumnIfMissing(db, 'users', 'role', "TEXT DEFAULT 'user'");
    addColumnIfMissing(db, 'users', 'is_active', 'BOOLEAN DEFAULT 1');
    addColumnIfMissing(db, 'users', 'avatar_url', 'TEXT');
    ensureUserBalanceColumns(db);
    ensureBillingTables(db);
    seedDefaultCategories(db);
    migrateCategorySlugs(db);
    seedDefaultBanners(db);
    seedHomepageSections(db);

    const systemEmail = 'kupiprodadi@system.mk';
    const systemUser = db.prepare('SELECT id FROM users WHERE email = ?').get(systemEmail);
    if (!systemUser) {
      db.prepare(`
        INSERT INTO users (email, password, name, phone, location)
        VALUES (?, ?, ?, ?, ?)
      `).run(systemEmail, 'system', 'КупиПродади', '', '');
    }

    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export default function getDb() {
  return initializeDb();
}
