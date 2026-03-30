import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-secondary/30 p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-6">\uD83E\uDDE0 AI Knowledge</h2>
        <nav className="space-y-1 flex-1">
          <Link href="/dashboard" className="block px-3 py-2 rounded-md hover:bg-secondary text-sm">\uD83D\uDCCA Overview</Link>
          <Link href="/dashboard/chat" className="block px-3 py-2 rounded-md hover:bg-secondary text-sm">\uD83D\uDCAC Chat</Link>
          <Link href="/dashboard/knowledge" className="block px-3 py-2 rounded-md hover:bg-secondary text-sm">\uD83E\uDDE0 Knowledge Base</Link>
          <Link href="/dashboard/settings" className="block px-3 py-2 rounded-md hover:bg-secondary text-sm">\u2699\uFE0F Settings</Link>
        </nav>
        <div className="text-xs text-muted-foreground">{user.email}</div>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
