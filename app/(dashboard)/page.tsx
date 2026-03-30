import { getCurrentUser } from '@/lib/auth';
import { getKnowledgeStats, getConversations } from '@/lib/db/queries';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const stats = await getKnowledgeStats(user.id);
  const conversations = await getConversations(user.id, 5);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Welcome back, {user.name || 'there'} \uD83D\uDC4B</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Knowledge Entries</p>
          <p className="text-3xl font-bold">{stats?.total ?? 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-3xl font-bold">{stats?.categories ?? 0}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Recent Chats</p>
          <p className="text-3xl font-bold">{conversations.length}</p>
        </div>
      </div>
      <div className="flex gap-4 mb-8">
        <Link href="/dashboard/chat" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90">\uD83D\uDCAC New Chat</Link>
        <Link href="/dashboard/knowledge" className="border px-6 py-3 rounded-lg hover:bg-secondary">\uD83E\uDDE0 View Knowledge</Link>
      </div>
      {conversations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Conversations</h2>
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div key={conv.id} className="p-3 border rounded-md">
                <p className="font-medium">{conv.title}</p>
                <p className="text-xs text-muted-foreground">{conv.createdAt.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
