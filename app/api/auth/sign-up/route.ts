import { NextResponse } from 'next/server';
import { z } from 'zod';
import { signUp } from '@/lib/auth';

const schema = z.object({ name: z.string().optional(), email: z.string().email(), password: z.string().min(8) });

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = schema.parse(body);
    const user = await signUp(email, password, name);
    return NextResponse.json({ user: { id: user.id, email: user.email } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Sign up failed' }, { status: 400 });
  }
}
