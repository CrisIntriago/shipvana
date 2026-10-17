'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { SESSION_COOKIE } from '@/lib/server/session';
import { USERS } from '@/lib/server/store';

export async function switchUser(formData: FormData) {
  const id = String(formData.get('userId') ?? '');
  const jar = await cookies();
  if (USERS.some((u) => u.id === id)) jar.set(SESSION_COOKIE, id, { httpOnly: true, sameSite: 'lax', path: '/' });
  else jar.delete(SESSION_COOKIE);
  revalidatePath('/', 'layout');
}
