import { compare, hash } from 'bcryptjs';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSession, setSession, clearSession } from './session';

export { getSession, setSession, clearSession };

export async function hashPassword(password: string) {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return compare(password, hashedPassword);
}

export async function signUp(email: string, password: string, name?: string) {
  const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (existing) throw new Error('User already exists');
  const passwordHash = await hashPassword(password);
  const [user] = await db.insert(users).values({ email, passwordHash, name }).returning();
  await setSession(user.id);
  return user;
}

export async function signIn(email: string, password: string) {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user) throw new Error('Invalid credentials');
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) throw new Error('Invalid credentials');
  await setSession(user.id);
  return user;
}

export async function signOut() {
  await clearSession();
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  return await db.query.users.findFirst({ where: eq(users.id, session.user.id) }) ?? null;
}
