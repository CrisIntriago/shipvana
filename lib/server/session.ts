import 'server-only';
import { cookies } from 'next/headers';
import type { Role, User } from '@/lib/core/types';
import { USERS } from './store';

// Demo auth: no passwords, no email. A cookie holds which demo user is signed in.
export const SESSION_COOKIE = 'sv_user';

export async function getCurrentUser(): Promise<User | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return USERS.find((u) => u.id === id) ?? null;
}

// Analyst/Buyer: read, create alerts. Contributor: also adds events. Admin: everything.
export const can = {
  createAlert: (u: User | null) => !!u,
  addEvent: (u: User | null) => !!u && (u.role === 'contributor' || u.role === 'admin'),
  useAi: (u: User | null) => !!u,
  admin: (u: User | null) => u?.role === 'admin',
};

export async function requireUser(check: (u: User | null) => boolean = can.useAi): Promise<User> {
  const u = await getCurrentUser();
  if (!u || !check(u)) throw new Error('Not allowed. Sign in with a role that can do this.');
  return u;
}

export const roleLabel: Record<Role, string> = {
  analyst: 'Analyst / Buyer',
  contributor: 'Contributor',
  admin: 'Admin',
};
