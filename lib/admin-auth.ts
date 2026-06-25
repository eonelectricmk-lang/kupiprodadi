import crypto from 'crypto';
import { cookies } from 'next/headers';
import getDb from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

const SESSION_COOKIE = 'kp_admin_session';
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 14;
const SESSION_SECRET = process.env.SESSION_SECRET || 'kupiprodadi-session-secret-2024';

type AdminUser = {
  id: number;
  email: string;
  name: string;
  role: string;
};

function signCookie(userId: number, expires: number): string {
  const payload = `${userId}:${expires}`;
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
  return `${payload}:${hmac}`;
}

function verifyCookie(value: string): number | null {
  const parts = value.split(':');
  if (parts.length !== 3) return null;
  const [userIdStr, expiresStr, sig] = parts;
  const userId = Number(userIdStr);
  const expires = Number(expiresStr);
  if (!userId || !expires || Date.now() > expires) return null;
  const expected = signCookie(userId, expires);
  if (expected !== value) return null;
  return userId;
}

export async function getAdminFromSession(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;

  const userId = verifyCookie(value);
  if (!userId) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  const db = getDb();
  const row = db.prepare(`
    SELECT id, email, name, role FROM users WHERE id = ? AND role = 'admin'
  `).get(userId) as AdminUser | undefined;

  return row || null;
}

export async function requireAdmin() {
  const admin = await getAdminFromSession();
  if (!admin) {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return admin;
}

export function hasAnyAdmin(): boolean {
  const db = getDb();
  const row = db.prepare(`SELECT COUNT(*) as count FROM users WHERE role = 'admin'`).get() as { count: number };
  return row.count > 0;
}

export async function createAdminSession(userId: number) {
  const expires = Date.now() + SESSION_DURATION_MS;
  const value = signCookie(userId, expires);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    expires: new Date(expires),
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export function createInitialAdmin(input: { email: string; password: string; name: string; phone?: string }) {
  const db = getDb();
  if (hasAnyAdmin()) throw new Error('ADMIN_EXISTS');
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(input.email);
  if (existing) throw new Error('EMAIL_EXISTS');

  const result = db.prepare(`
    INSERT INTO users (email, password, name, phone, role)
    VALUES (?, ?, ?, ?, 'admin')
  `).run(input.email, hashPassword(input.password), input.name, input.phone || null);

  return Number(result.lastInsertRowid);
}

export function authenticateAdmin(email: string, password: string): AdminUser | null {
  const db = getDb();
  const user = db.prepare(`
    SELECT id, email, password, name, role
    FROM users
    WHERE email = ? AND role = 'admin'
  `).get(email) as (AdminUser & { password: string }) | undefined;

  if (!user) return null;
  if (!verifyPassword(password, user.password)) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
