import path from 'path';
import { migrateCategorySlugs, seedDefaultCategories } from '@/lib/category-store';
import { seedDefaultBanners } from '@/lib/banner-store';
import { seedHomepageSections } from '@/lib/homepage-sections';
import { ensureUserBalanceColumns, ensureBillingTables, getBillingConfig } from '@/lib/billing';

let db: any = null;
let isRemote = false;

function addColumnIfMissing(database: any, table: string, column: string, definition: string) {
  try {
    const columns = database.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
    if (!columns.some((existingColumn) => existingColumn.name === column)) {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch {
    // remote might not support PRAGMA this way
  }
}

async function ensureSchemaRemote(client: any) {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, name TEXT NOT NULL, phone TEXT,
      location TEXT, role TEXT DEFAULT 'user',
      rating REAL DEFAULT 5.0, reviews_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      description TEXT NOT NULL, price REAL NOT NULL,
      currency TEXT DEFAULT 'дин', category TEXT NOT NULL,
      location TEXT NOT NULL, seller_id INTEGER NOT NULL,
      image_url TEXT, subcategory TEXT, condition TEXT,
      negotiable BOOLEAN DEFAULT 0, city TEXT, neighborhood TEXT,
      address_note TEXT, delivery TEXT, contact_name TEXT,
      contact_phone TEXT, contact_email TEXT, preferred_contact TEXT,
      status TEXT DEFAULT 'active', views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL, quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT, buyer_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1, total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL, product_id INTEGER,
      content TEXT NOT NULL, read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    `CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER,
      name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
      subject TEXT NOT NULL, message TEXT NOT NULL,
      status TEXT DEFAULT 'new', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )`,
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT, from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL, rating REAL NOT NULL, comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    )`,
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT, parent_id INTEGER,
      name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, icon TEXT,
      sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY, user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT, image_url TEXT NOT NULL,
      eyebrow TEXT, title TEXT, subtitle TEXT, link_url TEXT,
      sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS homepage_sections (
      section_key TEXT PRIMARY KEY, data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
  ];

  for (const sql of tables) {
    try { await client.execute(sql); } catch (e) {
      console.error('Schema error:', (e as any).message?.substring(0, 100));
    }
  }

  const colChecks: Array<[string, string, string]> = [
    ['users', 'role', "TEXT DEFAULT 'user'"],
    ['users', 'is_active', 'BOOLEAN DEFAULT 1'],
    ['users', 'avatar_url', 'TEXT'],
    ['users', 'balance', 'REAL DEFAULT 0'],
    ['users', 'bonus_balance', 'REAL DEFAULT 0'],
    ['users', 'spent_today', 'REAL DEFAULT 0'],
    ['users', 'spent_month', 'REAL DEFAULT 0'],
    ['users', 'spent_date', 'TEXT'],
    ['users', 'refresh_reset_month', 'TEXT'],
    ['users', 'monthly_refreshes', 'INTEGER DEFAULT 0'],
    ['users', 'ads_this_month', 'INTEGER DEFAULT 0'],
    ['users', 'ads_this_year', 'INTEGER DEFAULT 0'],
    ['products', 'subcategory', 'TEXT'],
    ['products', 'condition', 'TEXT'],
    ['products', 'negotiable', 'BOOLEAN DEFAULT 0'],
    ['products', 'city', 'TEXT'],
    ['products', 'neighborhood', 'TEXT'],
    ['products', 'address_note', 'TEXT'],
    ['products', 'delivery', 'TEXT'],
    ['products', 'contact_name', 'TEXT'],
    ['products', 'contact_phone', 'TEXT'],
    ['products', 'contact_email', 'TEXT'],
    ['products', 'preferred_contact', 'TEXT'],
    ['products', 'promoted', 'INTEGER DEFAULT 0'],
    ['products', 'promoted_at', 'TEXT'],
    ['products', 'promoted_until', 'TEXT'],
  ];

  for (const [table, col, def] of colChecks) {
    try {
      const r = await client.execute(`PRAGMA table_info(${table})`);
      const names = r.rows.map((row: any) => row.name);
      if (!names.includes(col)) {
        await client.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
      }
    } catch { /* skip */ }
  }

  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      amount REAL NOT NULL, type TEXT NOT NULL, description TEXT,
      reference_id INTEGER, reference_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
  } catch { /* skip */ }

  try {
    await client.execute(`CREATE TABLE IF NOT EXISTS billing_config (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      refresh_cost REAL DEFAULT 5, promote_cost REAL DEFAULT 50,
      promote_duration INTEGER DEFAULT 7, monthly_refresh_limit INTEGER DEFAULT 50,
      default_balance REAL DEFAULT 0, default_bonus REAL DEFAULT 500,
      currency TEXT DEFAULT 'MKD', updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  } catch { /* skip */ }

  try {
    await client.execute(`INSERT OR IGNORE INTO billing_config (id, refresh_cost, promote_cost, monthly_refresh_limit, default_bonus) VALUES (1, 5, 50, 50, 500)`);
  } catch { /* skip */ }
}

function initRemote() {
  const { createClient } = require('@libsql/client');
  const url = process.env.TURSO_DB_URL || '';
  const token = process.env.TURSO_DB_TOKEN || '';
  const client = createClient({ url, authToken: token });

  ensureSchemaRemote(client).catch((e: any) => console.error('Remote schema init error:', e.message?.substring(0, 100)));

  const sys = client.execute("SELECT id FROM users WHERE email = 'kupiprodadi@system.mk'");
  // fire and forget system user check

  return client;
}

function initLocal() {
  const Database = require('better-sqlite3');
  const isVercel = process.env.VERCEL === '1';
  let dbPath: string;
  if (isVercel) {
    const fs = require('fs');
    const srcPath = path.join(process.cwd(), 'kupiprodadi.db');
    const tmpPath = '/tmp/kupiprodadi.db';
    if (!fs.existsSync(tmpPath)) {
      if (fs.existsSync(srcPath)) fs.copyFileSync(srcPath, tmpPath);
    }
    dbPath = tmpPath;
  } else {
    dbPath = path.join(process.cwd(), 'kupiprodadi.db');
  }

  if (!require('fs').existsSync(dbPath)) {
    console.warn('Database file not found, using remote only');
    return initRemote();
  }

  const database = new Database(dbPath);

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL, name TEXT NOT NULL, phone TEXT,
      location TEXT, role TEXT DEFAULT 'user',
      rating REAL DEFAULT 5.0, reviews_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL,
      description TEXT NOT NULL, price REAL NOT NULL,
      currency TEXT DEFAULT 'дин', category TEXT NOT NULL,
      location TEXT NOT NULL, seller_id INTEGER NOT NULL,
      image_url TEXT, subcategory TEXT, condition TEXT,
      negotiable BOOLEAN DEFAULT 0, city TEXT, neighborhood TEXT,
      address_note TEXT, delivery TEXT, contact_name TEXT,
      contact_phone TEXT, contact_email TEXT, preferred_contact TEXT,
      status TEXT DEFAULT 'active', views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT, product_id INTEGER NOT NULL,
      image_url TEXT NOT NULL, sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL, quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT, buyer_id INTEGER NOT NULL,
      seller_id INTEGER NOT NULL, product_id INTEGER NOT NULL,
      quantity INTEGER DEFAULT 1, total_price REAL NOT NULL,
      status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (buyer_id) REFERENCES users(id),
      FOREIGN KEY (seller_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL, product_id INTEGER,
      content TEXT NOT NULL, read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id),
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER,
      name TEXT NOT NULL, email TEXT NOT NULL, phone TEXT,
      subject TEXT NOT NULL, message TEXT NOT NULL,
      status TEXT DEFAULT 'new', created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, product_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT, from_user_id INTEGER NOT NULL,
      to_user_id INTEGER NOT NULL, rating REAL NOT NULL, comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT, parent_id INTEGER,
      name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, icon TEXT,
      sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      token TEXT PRIMARY KEY, user_id INTEGER NOT NULL,
      expires_at DATETIME NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT, image_url TEXT NOT NULL,
      eyebrow TEXT, title TEXT, subtitle TEXT, link_url TEXT,
      sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS homepage_sections (
      section_key TEXT PRIMARY KEY, data TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const productColumns: Array<[string, string]> = [
    ['subcategory', 'TEXT'], ['condition', 'TEXT'],
    ['negotiable', 'BOOLEAN DEFAULT 0'], ['city', 'TEXT'],
    ['neighborhood', 'TEXT'], ['address_note', 'TEXT'],
    ['delivery', 'TEXT'], ['contact_name', 'TEXT'],
    ['contact_phone', 'TEXT'], ['contact_email', 'TEXT'],
    ['preferred_contact', 'TEXT'],
  ];
  productColumns.forEach(([column, definition]) => {
    addColumnIfMissing(database, 'products', column, definition);
  });

  addColumnIfMissing(database, 'users', 'role', "TEXT DEFAULT 'user'");
  addColumnIfMissing(database, 'users', 'is_active', 'BOOLEAN DEFAULT 1');
  addColumnIfMissing(database, 'users', 'avatar_url', 'TEXT');
  ensureUserBalanceColumns(database);
  ensureBillingTables(database);
  seedDefaultCategories(database);
  migrateCategorySlugs(database);
  seedDefaultBanners(database);
  seedHomepageSections(database);

  const systemEmail = 'kupiprodadi@system.mk';
  const systemUser = database.prepare('SELECT id FROM users WHERE email = ?').get(systemEmail);
  if (!systemUser) {
    database.prepare('INSERT INTO users (email, password, name, phone, location) VALUES (?, ?, ?, ?, ?)')
      .run(systemEmail, 'system', 'КупиПродади', '', '');
  }

  return database;
}

function initializeDb() {
  if (db) return db;

  const useRemote = process.env.VERCEL === '1' || process.env.TURSO_DB_URL ? true : false;
  isRemote = useRemote;

  try {
    if (useRemote && process.env.TURSO_DB_URL) {
      console.log('Using Turso remote database');
      db = initRemote();
    } else {
      db = initLocal();
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    if (!useRemote) {
      try { db = initRemote(); } catch { throw error; }
    } else {
      throw error;
    }
  }

  return db;
}

export default function getDb() {
  return initializeDb();
}

export function isUsingRemote() {
  return isRemote;
}
