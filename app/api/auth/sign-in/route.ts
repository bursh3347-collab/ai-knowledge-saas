import { NextResponse } from 'next/server';
import { z } from 'zod';
import { signIn } from '@/lib/auth';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = schema.parse(body);
    const user = await signIn(email, password);
    return NextResponse.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sign in failed' }, { status: 401 });
  }
}
