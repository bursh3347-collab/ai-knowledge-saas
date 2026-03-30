# \uD83E\uDDE0 AI Knowledge SaaS

**AI That Remembers Everything About You**

An AI assistant with persistent memory -- it builds a knowledge graph from your conversations and gets smarter with every interaction.

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **Database**: Drizzle ORM + PostgreSQL
- **Auth**: Jose JWT (custom, no NextAuth)
- **Payments**: Stripe
- **AI**: OpenAI GPT-4o-mini
- **UI**: Radix UI + Tailwind CSS 4
- **Validation**: Zod

## Features

- \uD83D\uDCAC **AI Chat with Memory** -- Every conversation enriches your knowledge base
- \uD83E\uDDE0 **Auto Knowledge Extraction** -- Facts, preferences, and context are saved automatically
- \uD83D\uDD17 **Smart Context Injection** -- Relevant knowledge is loaded before each response
- \uD83D\uDCCA **Knowledge Dashboard** -- Browse, search, and manage your knowledge entries
- \uD83D\uDCB3 **Stripe Billing** -- Free / Pro ($19/mo) / Team ($49/mo)

## Quick Start

```bash
# 1. Clone
git clone https://github.com/bursh3347-collab/ai-knowledge-saas.git
cd ai-knowledge-saas

# 2. Install
pnpm install

# 3. Setup environment
cp .env.example .env
# Fill in: POSTGRES_URL, STRIPE_SECRET_KEY, AUTH_SECRET, OPENAI_API_KEY

# 4. Setup database
pnpm db:setup

# 5. Seed demo data (optional)
pnpm db:seed
# Demo user: demo@aiknowledge.com / password123

# 6. Run
pnpm dev
```

Open http://localhost:3000

## Architecture

```
app/
  (marketing)/     -> Landing page + pricing
  (login)/         -> Sign in / Sign up
  (dashboard)/     -> Dashboard, Chat, Knowledge, Settings
  api/
    auth/          -> Sign in / Sign up endpoints
    chat/          -> AI chat with knowledge context
    knowledge/     -> Knowledge CRUD
lib/
  ai/              -> OpenAI client, context builder, knowledge extractor
  auth/            -> Jose JWT session management
  db/              -> Drizzle schema, queries, migrations
  payments/        -> Stripe integration
```

## Knowledge Categories

| Category | Example |
|----------|--------|
| fact | "User is a software engineer" |
| preference | "Prefers TypeScript over JavaScript" |
| skill | "Experienced with Next.js" |
| project | "Working on an AI SaaS product" |
| person | "Has a colleague named Alice" |
| idea | "Wants to build a Chrome extension" |

## How AI Memory Works

1. **Chat** -- User sends a message
2. **Context** -- System searches knowledge entries for relevant info
3. **Respond** -- AI generates response with knowledge context
4. **Extract** -- New facts are auto-extracted and saved
5. **Loop** -- Next chat benefits from accumulated knowledge

## Roadmap

- [ ] Vector search (pgvector) for semantic knowledge retrieval
- [ ] Streaming chat responses (Vercel AI SDK)
- [ ] Knowledge graph visualization
- [ ] Team knowledge sharing
- [ ] Import from Notion / Google Docs
- [ ] Shadow AI security scanner module

## License

MIT
