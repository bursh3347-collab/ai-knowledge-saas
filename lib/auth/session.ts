import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const ALGORITHM = 'HS256';

export type SessionData = {
  user: { id: number };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, key, { algorithms: [ALGORITHM] });
  return payload as unknown as SessionData;
}

export async function getSession() {
  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie) return null;
  try {
    return await verifyToken(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function setSession(userId: number) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = { user: { id: userId }, expires: expiresInOneDay.toISOString() };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
}

export async function clearSession() {
  (await cookies()).delete('session');
}
