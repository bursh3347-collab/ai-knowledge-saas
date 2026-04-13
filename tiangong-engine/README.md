# 🏗️ 天工引擎 v3.0 — AI-Powered GitHub Code Hunter

> 从 GitHub 上亿项目中系统性发现、分类、拆解高价值开源项目。
> 为一人公司创始人打造的代码情报引擎。

## 🚀 Quick Start

```bash
cd tiangong-engine
npm install
cp .env.example .env
# Edit .env with your GitHub token and OpenAI API key

# Hunt for projects in all categories
npm run hunt:all

# Analyze top projects
npm run batch -- --top=20

# Generate report
npm run report

# Or do everything in one command
npm run full-scan
```

## 📖 Commands

### 🔍 Hunt — Search GitHub for projects
```bash
# Search all pre-defined categories
npm run hunt:all

# Search specific topic
npm run hunt -- --topic="shadow ai scanner" --min-stars=50 --language=TypeScript

# Custom search with max results
npm run hunt -- --topic="saas boilerplate" --min-stars=200 --max-results=30
```

### 🔬 Analyze — Deep-dive a single project
```bash
npm run analyze -- --repo="vercel/next-saas-starter"
npm run analyze -- --repo="Pantheon-Security/medusa"
```

### 📦 Batch Analyze — Analyze top projects from hunt results
```bash
npm run batch -- --top=20 --min-stars=200
npm run batch -- --category="ai-security" --top=10
```

### 📊 Report — Generate markdown report
```bash
npm run report
```

## 📁 Data

- `data/hunt-results/` — Raw search results (JSON)
- `data/analyses/` — Project analysis results (JSON)
- `reports/` — Generated markdown reports

## 🏗️ Architecture

```
src/
├── lib/
│   ├── github.ts      — GitHub API client (Octokit wrapper)
│   ├── openai.ts      — OpenAI API client (analysis & scoring)
│   ├── storage.ts     — Local JSON file storage
│   └── utils.ts       — Rate limiting, logging, helpers
├── scripts/
│   ├── github-hunter.ts      — Batch search GitHub repos
│   ├── project-analyzer.ts   — Deep analyze single project
│   ├── batch-analyze.ts      — Run analyzer on multiple projects
│   └── report-generator.ts   — Generate markdown reports
└── types/
    └── index.ts       — TypeScript interfaces
```

## ⚡ Pre-defined Search Categories

| Category | Search Terms |
|----------|-------------|
| SaaS Templates | saas boilerplate, saas starter, nextjs stripe, nextjs supabase |
| AI Security | shadow ai, ai security scanner, llm security, agent security |
| AI Tools | ai tool, ai api wrapper, gpt wrapper, openai tool |
| Agent Frameworks | ai agent framework, multi agent, agent memory, mcp server |
| One-Person Company | solo developer tool, indie hacker, micro saas, automation tool |

## 📜 License

MIT
