import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export const PLANS = {
  free: { name: 'Free', knowledgeLimit: 50, chatsPerDay: 10, price: 0 },
  pro: { name: 'Pro', knowledgeLimit: 500, chatsPerDay: -1, price: 19 },
  team: { name: 'Team', knowledgeLimit: -1, chatsPerDay: -1, price: 49 },
} as const;

export type PlanKey = keyof typeof PLANS;
