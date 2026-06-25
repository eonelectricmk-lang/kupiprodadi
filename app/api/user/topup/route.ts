import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getBillingConfig } from '@/lib/billing';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const userId = Number(payload.user_id);
    const amount = Number(payload.amount);

    if (!Number.isFinite(userId) || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Невалидни параметри' }, { status: 400 });
    }

    if (amount > 10000) {
      return NextResponse.json({ error: 'Максимален износ за додавање е 10,000 MKD' }, { status: 400 });
    }

    const db = getDb();
    const config = getBillingConfig(db);

    db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, userId);
    db.prepare(`
      INSERT INTO transactions (user_id, amount, type, description)
      VALUES (?, ?, 'deposit', ?)
    `).run(userId, amount, `Дополнување на сметка (+${amount.toFixed(2)} ${config.currency})`);

    const user = db.prepare('SELECT balance, bonus_balance FROM users WHERE id = ?').get(userId) as { balance: number; bonus_balance: number } | undefined;

    return NextResponse.json({
      message: 'Сметката е дополнета.',
      balance: user?.balance || 0,
      bonus_balance: user?.bonus_balance || 0,
    }, { status: 200 });
  } catch (error) {
    console.error('Error topping up:', error);
    return NextResponse.json({ error: 'Грешка при дополнување' }, { status: 500 });
  }
}
