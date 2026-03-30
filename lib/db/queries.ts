import { desc, eq, and, ilike, sql } from 'drizzle-orm';
import { db } from './drizzle';
import {
  users,
  knowledgeEntries,
  conversations,
  messages,
  teams,
  teamMembers,
  type NewKnowledgeEntry,
} from './schema';

// ============ USER QUERIES ============

export async function getUserByEmail(email: string) {
  return db.query.users.findFirst({ where: eq(users.email, email) });
}

export async function getUserById(id: number) {
  return db.query.users.findFirst({ where: eq(users.id, id) });
}

// ============ KNOWLEDGE QUERIES ============

export async function getKnowledgeEntries(
  userId: number,
  opts?: { category?: string; search?: string; limit?: number }
) {
  const conditions = [eq(knowledgeEntries.userId, userId), eq(knowledgeEntries.isActive, true)];
  if (opts?.category) conditions.push(eq(knowledgeEntries.category, opts.category));
  if (opts?.search) conditions.push(ilike(knowledgeEntries.content, `%${opts.search}%`));

  return db.select().from(knowledgeEntries)
    .where(and(...conditions))
    .orderBy(desc(knowledgeEntries.updatedAt))
    .limit(opts?.limit ?? 50);
}

export async function createKnowledgeEntry(entry: NewKnowledgeEntry) {
  const [created] = await db.insert(knowledgeEntries).values(entry).returning();
  return created;
}

export async function searchKnowledgeForContext(userId: number, query: string, limit = 10) {
  return db.select().from(knowledgeEntries)
    .where(and(
      eq(knowledgeEntries.userId, userId),
      eq(knowledgeEntries.isActive, true),
      ilike(knowledgeEntries.content, `%${query}%`)
    ))
    .orderBy(desc(knowledgeEntries.updatedAt))
    .limit(limit);
}

export async function getKnowledgeStats(userId: number) {
  const result = await db.select({
    total: sql<number>`count(*)`,
    categories: sql<number>`count(distinct ${knowledgeEntries.category})`,
  }).from(knowledgeEntries)
    .where(and(eq(knowledgeEntries.userId, userId), eq(knowledgeEntries.isActive, true)));
  return result[0];
}

// ============ CONVERSATION QUERIES ============

export async function getConversations(userId: number, limit = 20) {
  return db.select().from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(desc(conversations.updatedAt))
    .limit(limit);
}

export async function getConversationMessages(conversationId: number, limit = 50) {
  return db.select().from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.createdAt)
    .limit(limit);
}

export async function createConversation(userId: number, title?: string) {
  const [conv] = await db.insert(conversations).values({ userId, title: title ?? 'New Chat' }).returning();
  return conv;
}

export async function saveMessage(conversationId: number, role: string, content: string, knowledgeIdsUsed?: number[]) {
  const [msg] = await db.insert(messages).values({ conversationId, role, content, knowledgeIdsUsed }).returning();
  return msg;
}

// ============ TEAM QUERIES ============

export async function getTeamForUser(userId: number) {
  const result = await db.select().from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(eq(teamMembers.userId, userId))
    .limit(1);
  return result[0]?.teams;
}
