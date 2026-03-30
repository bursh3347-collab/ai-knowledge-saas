import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { openai, SYSTEM_PROMPT } from '@/lib/ai/openai';
import { buildKnowledgeContext } from '@/lib/ai/context';
import { extractAndSaveKnowledge } from '@/lib/ai/extract';
import { saveMessage, createConversation } from '@/lib/db/queries';

const schema = z.object({ message: z.string().min(1), conversationId: z.number().optional() });

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { message, conversationId: convId } = schema.parse(body);
    const userId = session.user.id;

    let conversationId = convId;
    if (!conversationId) {
      const conv = await createConversation(userId, message.slice(0, 100));
      conversationId = conv.id;
    }

    await saveMessage(conversationId, 'user', message);

    const { context, knowledgeIds } = await buildKnowledgeContext(userId, message);
    const systemContent = context ? `${SYSTEM_PROMPT}\n\n${context}` : SYSTEM_PROMPT;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0]?.message?.content ?? 'Sorry, I could not respond.';
    await saveMessage(conversationId, 'assistant', assistantMessage, knowledgeIds);

    extractAndSaveKnowledge(userId, message, assistantMessage).catch(console.error);

    return NextResponse.json({ message: assistantMessage, conversationId, knowledgeUsed: knowledgeIds.length });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
