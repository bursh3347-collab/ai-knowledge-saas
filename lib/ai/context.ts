import { searchKnowledgeForContext, getKnowledgeEntries } from '@/lib/db/queries';
import type { KnowledgeEntry } from '@/lib/db/schema';

export async function buildKnowledgeContext(
  userId: number,
  userMessage: string
): Promise<{ context: string; knowledgeIds: number[] }> {
  const recentEntries = await getKnowledgeEntries(userId, { limit: 10 });
  const relevantEntries = await searchKnowledgeForContext(userId, userMessage, 5);

  const allEntries = new Map<number, KnowledgeEntry>();
  for (const entry of [...relevantEntries, ...recentEntries]) {
    allEntries.set(entry.id, entry);
  }

  const entries = Array.from(allEntries.values());
  const knowledgeIds = entries.map((e) => e.id);

  if (entries.length === 0) {
    return { context: '', knowledgeIds: [] };
  }

  const context = [
    '## Your Knowledge About This User',
    '',
    ...entries.map((e) => `- [${e.category}] ${e.content}`),
    '',
    'Use this knowledge naturally in your response when relevant.',
  ].join('\n');

  return { context, knowledgeIds };
}
