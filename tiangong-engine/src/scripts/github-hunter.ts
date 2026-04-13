#!/usr/bin/env tsx
/**
 * 🔍 GitHub Hunter — Batch search GitHub repos by category/keyword
 *
 * Usage:
 *   npm run hunt -- --all --min-stars=100
 *   npm run hunt -- --topic="shadow ai" --min-stars=50 --language=TypeScript
 */
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { initGitHub, searchRepos } from '../lib/github.js';
import { ensureDataDirs, saveHuntResults, loadAllHuntResults } from '../lib/storage.js';
import { log, formatNumber } from '../lib/utils.js';
import type { SearchCategory, HuntResult } from '../types/index.js';

// ============== PRE-DEFINED CATEGORIES ==============

const CATEGORIES: SearchCategory[] = [
  {
    name: 'SaaS Templates',
    id: 'saas-templates',
    queries: [
      'saas boilerplate',
      'saas starter template',
      'nextjs stripe template',
      'nextjs supabase starter',
      'react saas kit',
    ],
    defaultLanguage: 'TypeScript',
    defaultMinStars: 100,
  },
  {
    name: 'AI Security',
    id: 'ai-security',
    queries: [
      'shadow ai detection',
      'ai security scanner',
      'llm security',
      'agent security',
      'ai vulnerability scanner',
      'prompt injection detection',
    ],
    defaultMinStars: 30,
  },
  {
    name: 'AI Tools',
    id: 'ai-tools',
    queries: [
      'ai tool open source',
      'gpt wrapper',
      'openai api tool',
      'ai api wrapper',
      'llm application',
    ],
    defaultMinStars: 100,
  },
  {
    name: 'Agent Frameworks',
    id: 'agent-frameworks',
    queries: [
      'ai agent framework',
      'multi agent system',
      'agent memory system',
      'mcp server',
      'agent orchestration',
    ],
    defaultMinStars: 50,
  },
  {
    name: 'One-Person Company Tools',
    id: 'solo-tools',
    queries: [
      'indie hacker tools',
      'micro saas',
      'solo developer automation',
      'one person startup',
      'developer tools monetization',
    ],
    defaultMinStars: 50,
  },
  {
    name: 'Landing Pages & Marketing',
    id: 'landing-marketing',
    queries: [
      'landing page template nextjs',
      'startup landing page',
      'saas marketing site',
      'waitlist page template',
    ],
    defaultLanguage: 'TypeScript',
    defaultMinStars: 100,
  },
  {
    name: 'Auth & Payments',
    id: 'auth-payments',
    queries: [
      'nextjs authentication template',
      'stripe subscription template',
      'supabase auth starter',
      'payment integration boilerplate',
    ],
    defaultLanguage: 'TypeScript',
    defaultMinStars: 50,
  },
];

// ============== MAIN ==============

const program = new Command();

program
  .name('github-hunter')
  .description('🔍 Hunt for high-value GitHub projects')
  .option('--all', 'Search all pre-defined categories')
  .option('--topic <query>', 'Custom search query')
  .option('--category <id>', 'Search specific category by ID')
  .option('--min-stars <n>', 'Minimum stars', '100')
  .option('--max-results <n>', 'Max results per query', '20')
  .option('--language <lang>', 'Filter by language')
  .parse();

const opts = program.opts();

async function main() {
  // Validate env
  if (!process.env.GITHUB_TOKEN) {
    log.error('GITHUB_TOKEN not set in .env file');
    process.exit(1);
  }

  initGitHub(process.env.GITHUB_TOKEN);
  await ensureDataDirs();

  log.header('🔍 天工代码猎手 — GitHub Hunter');

  const minStars = parseInt(opts.minStars);
  const maxResults = parseInt(opts.maxResults);

  let totalFound = 0;
  let categoriesToSearch: SearchCategory[] = [];

  if (opts.all) {
    categoriesToSearch = CATEGORIES;
  } else if (opts.category) {
    const cat = CATEGORIES.find(c => c.id === opts.category);
    if (!cat) {
      log.error(`Category "${opts.category}" not found. Available: ${CATEGORIES.map(c => c.id).join(', ')}`);
      process.exit(1);
    }
    categoriesToSearch = [cat];
  } else if (opts.topic) {
    categoriesToSearch = [{
      name: 'Custom Search',
      id: 'custom',
      queries: [opts.topic],
      defaultMinStars: minStars,
      defaultLanguage: opts.language,
    }];
  } else {
    log.error('Specify --all, --category <id>, or --topic <query>');
    log.info(`Available categories: ${CATEGORIES.map(c => `${c.id} (${c.name})`).join(', ')}`);
    process.exit(1);
  }

  // Load existing for dedup count
  const existing = await loadAllHuntResults();
  log.info(`Existing projects in database: ${formatNumber(existing.length)}`);
  console.log('');

  for (const category of categoriesToSearch) {
    log.header(`🏁 ${category.name}`);

    const categoryResults: HuntResult[] = [];

    for (const query of category.queries) {
      const spinner = ora(`Searching: "${query}"`).start();

      const results = await searchRepos(query, {
        minStars: category.defaultMinStars || minStars,
        language: category.defaultLanguage || opts.language,
        maxResults,
        category: category.id,
      });

      spinner.succeed(`"${query}" → ${chalk.green(results.length)} repos found`);
      categoryResults.push(...results);
    }

    // Deduplicate within category
    const seen = new Set<string>();
    const unique = categoryResults.filter(r => {
      if (seen.has(r.fullName)) return false;
      seen.add(r.fullName);
      return true;
    });

    // Save
    await saveHuntResults(category.id, unique);
    totalFound += unique.length;

    // Print top 5
    console.log('');
    log.info(`Top projects in ${category.name}:`);
    unique
      .sort((a, b) => b.stars - a.stars)
      .slice(0, 5)
      .forEach((r, i) => {
        console.log(
          `  ${chalk.yellow(`#${i + 1}`)} ${chalk.bold(r.fullName)} ` +
          `${chalk.dim(`★${formatNumber(r.stars)}`)} ` +
          `${chalk.dim(r.language || '')} ` +
          `${r.license ? chalk.green(r.license) : chalk.red('No license')}`
        );
        if (r.description) {
          console.log(`     ${chalk.dim(r.description.slice(0, 80))}`);
        }
      });
    console.log('');
  }

  // Summary
  log.header('📊 Hunt Summary');
  log.info(`Categories searched: ${categoriesToSearch.length}`);
  log.info(`Total projects found: ${chalk.bold.green(formatNumber(totalFound))}`);
  log.info(`Results saved to: data/hunt-results/`);
  console.log('');
  log.info(`Next step: ${chalk.cyan('npm run batch -- --top=20')} to analyze top projects`);
}

main().catch(err => {
  log.error(`Fatal: ${err.message}`);
  process.exit(1);
});
