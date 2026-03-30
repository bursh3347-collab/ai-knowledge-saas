import { getCurrentUser } from '@/lib/auth';
import { getTeamForUser } from '@/lib/db/queries';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) return null;
  const team = await getTeamForUser(user.id);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">\u2699\uFE0F Settings</h1>
      <div className="p-4 border rounded-lg mb-4">
        <h2 className="font-semibold mb-3">Profile</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Name:</span> {user.name || 'Not set'}</p>
          <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
          <p><span className="text-muted-foreground">Joined:</span> {user.createdAt.toLocaleDateString()}</p>
        </div>
      </div>
      <div className="p-4 border rounded-lg mb-4">
        <h2 className="font-semibold mb-3">Subscription</h2>
        <div className="space-y-2 text-sm">
          <p><span className="text-muted-foreground">Plan:</span> {team?.planName || 'Free'}</p>
          <p><span className="text-muted-foreground">Status:</span> {team?.subscriptionStatus || 'Active'}</p>
        </div>
        <button className="mt-3 text-sm border px-4 py-2 rounded-md hover:bg-secondary">Upgrade Plan</button>
      </div>
      <div className="p-4 border border-red-200 rounded-lg">
        <h2 className="font-semibold mb-3 text-red-500">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-3">Delete your account and all associated data.</p>
        <button className="text-sm bg-red-500 text-white px-4 py-2 rounded-md hover:opacity-90">Delete Account</button>
      </div>
    </div>
  );
}
