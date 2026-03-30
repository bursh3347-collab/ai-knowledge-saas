import 'dotenv/config';
import { db } from './drizzle';
import { users, teams, teamMembers } from './schema';
import { hashSync } from 'bcryptjs';

async function seed() {
  console.log('Seeding database...');

  const [user] = await db.insert(users).values({
    email: 'demo@aiknowledge.com',
    passwordHash: hashSync('password123', 10),
    name: 'Demo User',
  }).returning();

  const [team] = await db.insert(teams).values({
    name: 'Demo Team',
    planName: 'free',
    subscriptionStatus: 'active',
  }).returning();

  await db.insert(teamMembers).values({
    userId: user.id,
    teamId: team.id,
    role: 'owner',
  });

  console.log('Seed complete! Demo user: demo@aiknowledge.com / password123');
  process.exit(0);
}

seed().catch(console.error);
