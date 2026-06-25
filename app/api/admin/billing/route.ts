import { NextRequest, NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { getBillingConfig } from '@/lib/billing';
import { getAdminFromSession } from '@/lib/admin-auth';

async function checkAdmin() {
  const admin = await getAdminFromSession();
  if (!admin) return false;
  return true;
}

export async function GET() {
  try {
    const ok = await checkAdmin();
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const config = getBillingConfig(db);

    const users = db.prepare(`
      SELECT id, name, email, balance, bonus_balance, spent_today, spent_month, monthly_refreshes
      FROM users
      ORDER BY id ASC
    `).all();

    return NextResponse.json({ config, users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return NextResponse.json({ error: 'Грешка' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ok = await checkAdmin();
    if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = getDb();
    const payload = await request.json();

    if (payload.action === 'update_config') {
      const allowedFields = ['refresh_cost', 'promote_cost', 'promote_duration', 'monthly_refresh_limit', 'default_balance', 'default_bonus', 'currency'];
      const updates: string[] = [];
      const params: any[] = [];

      allowedFields.forEach((field) => {
        if (payload[field] !== undefined) {
          updates.push(`${field} = ?`);
          params.push(payload[field]);
        }
      });

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(1);
        db.prepare(`UPDATE billing_config SET ${updates.join(', ')} WHERE id = ?`).run(...params);
      }

      return NextResponse.json({ message: 'Config updated' }, { status: 200 });
    }

    if (payload.action === 'adjust_balance') {
      const { user_id, amount, type, description } = payload;
      if (!Number.isFinite(user_id) || !Number.isFinite(amount)) {
        return NextResponse.json({ error: 'Invalid params' }, { status: 400 });
      }

      const field = type === 'bonus' ? 'bonus_balance' : 'balance';
      db.prepare(`UPDATE users SET ${field} = ${field} + ? WHERE id = ?`).run(amount, user_id);

      db.prepare(`
        INSERT INTO transactions (user_id, amount, type, description)
        VALUES (?, ?, ?, ?)
      `).run(user_id, amount, type === 'bonus' ? 'bonus' : 'deposit', description || 'Admin adjustment');

      return NextResponse.json({ message: 'Balance adjusted' }, { status: 200 });
    }

    if (payload.action === 'reset_refresh_limits') {
      const { user_id } = payload;
      if (Number.isFinite(user_id)) {
        db.prepare('UPDATE users SET monthly_refreshes = 0, spent_month = 0 WHERE id = ?').run(user_id);
      } else {
        db.prepare('UPDATE users SET monthly_refreshes = 0, spent_month = 0').run();
      }
      return NextResponse.json({ message: 'Refresh limits reset' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Error updating billing:', error);
    return NextResponse.json({ error: 'Грешка' }, { status: 500 });
  }
}
