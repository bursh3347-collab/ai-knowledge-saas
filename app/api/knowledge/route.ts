import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { getKnowledgeEntries, createKnowledgeEntry, getKnowledgeStats } from '@/lib/db/queries';

const createSchema = z.object({
  content: z.string().min(1),
  category: z.enum(['fact', 'preference', 'skill', 'project', 'person', 'idea', 'general']).default('general'),
});

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') ?? undefined;
    const search = searchParams.get('search') ?? undefined;
    const entries = await getKnowledgeEntries(session.user.id, { category, search });
    const stats = await getKnowledgeStats(session.user.id);
    return NextResponse.json({ entries, stats });
  } catch (error) {
    console.error('Knowledge GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const { content, category } = createSchema.parse(body);
    const entry = await createKnowledgeEntry({ userId: session.user.id, content, category, source: 'manual' });
    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Knowledge POST error:', error);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
