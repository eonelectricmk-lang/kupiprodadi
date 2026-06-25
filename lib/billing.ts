import getDb from '@/lib/db';

export type BillingConfig = {
  refresh_cost: number;
  promote_cost: number;
  promote_duration: number;
  monthly_refresh_limit: number;
  default_balance: number;
  default_bonus: number;
  currency: string;
};

export type UserBalance = {
  balance: number;
  bonus_balance: number;
  spent_today: number;
  spent_month: number;
  refresh_today: number;
  refresh_week: number;
  refresh_month: number;
  monthly_refresh_limit: number;
  monthly_refreshes_remaining: number;
  ads_active: number;
  ads_this_month: number;
  ads_this_year: number;
  refresh_cost: number;
  promote_cost: number;
  currency: string;
};

export function getBillingConfig(db: any): BillingConfig {
  const config = db.prepare('SELECT * FROM billing_config WHERE id = 1').get() as BillingConfig | undefined;
  return config || {
    refresh_cost: 5,
    promote_cost: 50,
    promote_duration: 7,
    monthly_refresh_limit: 50,
    default_balance: 0,
    default_bonus: 500,
    currency: 'MKD',
  };
}

export function ensureUserBalanceColumns(db: any) {
  const columns = db.prepare('PRAGMA table_info(users)').all() as Array<{ name: string }>;
  const colNames = new Set(columns.map((c) => c.name));

  const userCols: Array<[string, string]> = [
    ['balance', 'REAL DEFAULT 0'],
    ['bonus_balance', 'REAL DEFAULT 0'],
    ['spent_today', 'REAL DEFAULT 0'],
    ['spent_month', 'REAL DEFAULT 0'],
    ['spent_date', 'TEXT'],
    ['refresh_reset_month', 'TEXT'],
    ['monthly_refreshes', 'INTEGER DEFAULT 0'],
    ['ads_this_month', 'INTEGER DEFAULT 0'],
    ['ads_this_year', 'INTEGER DEFAULT 0'],
  ];

  userCols.forEach(([col, def]) => {
    if (!colNames.has(col)) {
      db.exec(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
    }
  });
}

export function ensureBillingTables(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      description TEXT,
      reference_id INTEGER,
      reference_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS billing_config (
      id INTEGER PRIMARY KEY CHECK(id = 1),
      refresh_cost REAL DEFAULT 5,
      promote_cost REAL DEFAULT 50,
      promote_duration INTEGER DEFAULT 7,
      monthly_refresh_limit INTEGER DEFAULT 50,
      default_balance REAL DEFAULT 0,
      default_bonus REAL DEFAULT 500,
      currency TEXT DEFAULT 'MKD',
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    INSERT OR IGNORE INTO billing_config (id, refresh_cost, promote_cost, monthly_refresh_limit, default_bonus)
    VALUES (1, 5, 50, 50, 500)
  `);
}

export function resetUserSpendTracking(db: any, userId: number) {
  const user = db.prepare('SELECT spent_date, refresh_reset_month FROM users WHERE id = ?').get(userId) as
    | { spent_date: string | null; refresh_reset_month: string | null }
    | undefined;
  if (!user) return;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const monthStr = today.toISOString().slice(0, 7);

  const updates: string[] = [];
  const params: any[] = [];

  if (user.spent_date !== todayStr) {
    updates.push('spent_today = 0');
    updates.push('spent_date = ?');
    params.push(todayStr);
  }

  if (user.refresh_reset_month !== monthStr) {
    updates.push('spent_month = 0');
    updates.push('monthly_refreshes = 0');
    updates.push('refresh_reset_month = ?');
    params.push(monthStr);
  }

  if (updates.length > 0) {
    params.push(userId);
    db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  }
}

export function deductRefreshCost(db: any, userId: number): { success: boolean; error?: string } {
  const config = getBillingConfig(db);

  const user = db.prepare(`
    SELECT balance, bonus_balance, monthly_refreshes, refresh_reset_month
    FROM users WHERE id = ?
  `).get(userId) as { balance: number; bonus_balance: number; monthly_refreshes: number; refresh_reset_month: string | null } | undefined;

  if (!user) return { success: false, error: 'User not found' };

  const monthStr = new Date().toISOString().slice(0, 7);
  const refreshesUsed = user.refresh_reset_month === monthStr ? user.monthly_refreshes : 0;

  if (refreshesUsed >= config.monthly_refresh_limit) {
    return { success: false, error: `Искористен е месечниот лимит од ${config.monthly_refresh_limit} обновувања.` };
  }

  const totalBalance = user.balance + user.bonus_balance;
  if (totalBalance < config.refresh_cost) {
    return { success: false, error: `Немате доволно средства. Потребни: ${config.refresh_cost} ${config.currency}.` };
  }

  const deductFromBonus = Math.min(user.bonus_balance, config.refresh_cost);
  const deductFromBalance = config.refresh_cost - deductFromBonus;

  db.prepare(`
    UPDATE users SET
      bonus_balance = bonus_balance - ?,
      balance = balance - ?,
      spent_today = spent_today + ?,
      spent_month = spent_month + ?,
      monthly_refreshes = CASE WHEN refresh_reset_month = ? THEN monthly_refreshes + 1 ELSE 1 END,
      refresh_reset_month = ?,
      spent_date = ?
    WHERE id = ?
  `).run(deductFromBonus, deductFromBalance, config.refresh_cost, config.refresh_cost, monthStr, monthStr, new Date().toISOString().slice(0, 10), userId);

  db.prepare(`
    INSERT INTO transactions (user_id, amount, type, description, reference_type)
    VALUES (?, ?, 'spend', ?, 'refresh')
  `).run(userId, -config.refresh_cost, `Обновување на оглас (-${config.refresh_cost} ${config.currency})`);

  return { success: true };
}

export function getUserBalance(db: any, userId: number): UserBalance {
  resetUserSpendTracking(db, userId);

  const config = getBillingConfig(db);
  const user = db.prepare(`
    SELECT balance, bonus_balance, spent_today, spent_month, spent_date, monthly_refreshes, refresh_reset_month
    FROM users WHERE id = ?
  `).get(userId) as { balance: number; bonus_balance: number; spent_today: number; spent_month: number; spent_date: string | null; monthly_refreshes: number; refresh_reset_month: string | null } | undefined;

  if (!user) {
    return {
      balance: 0, bonus_balance: 0, spent_today: 0, spent_month: 0,
      refresh_today: 0, refresh_week: 0, refresh_month: 0,
      monthly_refresh_limit: config.monthly_refresh_limit,
      monthly_refreshes_remaining: config.monthly_refresh_limit,
      ads_active: 0, ads_this_month: 0, ads_this_year: 0,
      refresh_cost: config.refresh_cost, promote_cost: config.promote_cost,
      currency: config.currency,
    };
  }

  const monthStr = new Date().toISOString().slice(0, 7);
  const refreshesThisMonth = user.refresh_reset_month === monthStr ? user.monthly_refreshes : 0;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  const refreshToday = db.prepare(`
    SELECT COUNT(*) as count FROM transactions
    WHERE user_id = ? AND type = 'spend' AND reference_type = 'refresh'
    AND created_at >= ?
  `).get(userId, todayStart.toISOString()) as { count: number };

  const refreshWeek = db.prepare(`
    SELECT COUNT(*) as count FROM transactions
    WHERE user_id = ? AND type = 'spend' AND reference_type = 'refresh'
    AND created_at >= ?
  `).get(userId, weekStart.toISOString()) as { count: number };

  const adsActive = db.prepare(`
    SELECT COUNT(*) as count FROM products WHERE seller_id = ? AND status = 'active'
  `).get(userId) as { count: number };

  const yearStr = String(new Date().getFullYear());
  const adsThisMonth = db.prepare(`
    SELECT COUNT(*) as count FROM products WHERE seller_id = ? AND strftime('%Y-%m', created_at) = ?
  `).get(userId, monthStr) as { count: number };

  const adsThisYear = db.prepare(`
    SELECT COUNT(*) as count FROM products WHERE seller_id = ? AND strftime('%Y', created_at) = ?
  `).get(userId, yearStr) as { count: number };

  return {
    balance: user.balance,
    bonus_balance: user.bonus_balance,
    spent_today: user.spent_date === new Date().toISOString().slice(0, 10) ? user.spent_today : 0,
    spent_month: user.refresh_reset_month === monthStr ? user.spent_month : 0,
    refresh_today: refreshToday.count,
    refresh_week: refreshWeek.count,
    refresh_month: refreshesThisMonth,
    monthly_refresh_limit: config.monthly_refresh_limit,
    monthly_refreshes_remaining: Math.max(0, config.monthly_refresh_limit - refreshesThisMonth),
    ads_active: adsActive.count,
    ads_this_month: adsThisMonth.count,
    ads_this_year: adsThisYear.count,
    refresh_cost: config.refresh_cost,
    promote_cost: config.promote_cost,
    currency: config.currency,
  };
}

export function deductPromoteCost(db: any, userId: number): { success: boolean; error?: string } {
  const config = getBillingConfig(db);

  const user = db.prepare(`
    SELECT balance, bonus_balance
    FROM users WHERE id = ?
  `).get(userId) as { balance: number; bonus_balance: number } | undefined;

  if (!user) return { success: false, error: 'User not found' };

  const cost = config.promote_cost;
  let remaining = cost;

  const deductFromBonus = Math.min(user.bonus_balance, remaining);
  remaining -= deductFromBonus;

  if (remaining > 0) {
    if (user.balance >= remaining) {
      const deductFromBalance = remaining;
      remaining = 0;
      db.prepare('UPDATE users SET balance = balance - ?, spent_today = spent_today + ?, spent_month = spent_month + ? WHERE id = ?')
        .run(deductFromBalance, cost, cost, userId);
    } else {
      return { success: false, error: `Немате доволно средства. Потребни: ${cost} ${config.currency}.` };
    }
  }

  if (deductFromBonus > 0) {
    db.prepare('UPDATE users SET bonus_balance = bonus_balance - ?, spent_today = spent_today + ? WHERE id = ?')
      .run(deductFromBonus, cost, userId);
  }

  const todayStr = new Date().toISOString().slice(0, 10);
  db.prepare('UPDATE users SET spent_date = ? WHERE id = ? AND spent_date IS NULL')
    .run(todayStr, userId);

  db.prepare(`
    INSERT INTO transactions (user_id, amount, type, description, reference_type)
    VALUES (?, ?, 'spend', ?, 'promote')
  `).run(userId, -cost, `Промоција на оглас (-${cost} ${config.currency})`);

  return { success: true };
}
