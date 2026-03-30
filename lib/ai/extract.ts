import { openai } from './openai';
import { createKnowledgeEntry } from '@/lib/db/queries';

const EXTRACTION_PROMPT = `Analyze the following conversation and extract any new facts, preferences, or information the user shared about themselves.

Return a JSON object with an "entries" array of objects with:
- "content": the fact or information (concise, one sentence)
- "category": one of "fact", "preference", "skill", "project", "person", "idea", "general"

Only extract genuinely new information. Skip greetings, questions, and generic statements.
If nothing new was shared, return {"entries": []}.

Conversation:
`;

export async function extractAndSaveKnowledge(
  userId: number,
  userMessage: string,
  assistantResponse: string
): Promise<void> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: EXTRACTION_PROMPT },
        { role: 'user', content: `User: ${userMessage}\nAssistant: ${assistantResponse}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return;

    const parsed = JSON.parse(content);
    const entries = Array.isArray(parsed) ? parsed : parsed.entries ?? [];

    for (const entry of entries) {
      if (entry.content && entry.category) {
        await createKnowledgeEntry({
          userId,
          content: entry.content,
          category: entry.category,
          source: 'auto-extracted',
        });
      }
    }
  } catch (error) {
    console.error('Knowledge extraction failed:', error);
  }
}
