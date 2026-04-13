#!/usr/bin/env tsx
/**
 * 📦 Batch Analyzer — Run project analysis on top hunt results
 *
 * Usage:
 *   npm run batch -- --top=20 --min-stars=200
 *   npm run batch -- --category=ai-security --top=10
 */
import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { initGitHub } from '../lib/github.js';
import { initOpenAI } from '../lib/openai.js';
import { ensureDataDirs, loadAllHuntResults, isAnalyzed, saveAnalysis } from '../lib/storage.js';
import { log, formatNumber, classifyLicense } from '../lib/utils.js';
import { analyzeSingleProject } from './project-analyzer.js';
import type { HuntResult } from '../types/index.js';

const program = new Command();

program
  .name('batch-analyze')
  .description('📦 Batch analyze top GitHub projects')
  .option('--top <n>', 'Analyze top N projects by stars', '20')
  .option('--min-stars <n>', 'Minimum stars filter', '100')
  .option('--category <id>', 'Filter by category')
  .option('--force', 'Re-analyze already analyzed projects')
  .parse();

const opts = program.opts();

async function main() {
  if (!process.env.GITHUB_TOKEN || !process.env.OPENAI_API_KEY) {
    log.error('GITHUB_TOKEN and OPENAI_API_KEY must be set in .env');
    process.exit(1);
  }

  initGitHub(process.env.GITHUB_TOKEN);
  initOpenAI(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL);
  await ensureDataDirs();

  log.header('📦 天工批量分析器 — Batch Analyzer');

  // Load hunt results
  let allResults = await loadAllHuntResults();
  log.info(`Total projects in database: ${formatNumber(allResults.length)}`);

  // Apply filters
  const minStars = parseInt(opts.minStars);
  if (opts.category) {
    allResults = allResults.filter(r => r.category === opts.category);
    log.info(`Filtered to category "${opts.category}": ${allResults.length} projects`);
  }

  allResults = allResults.filter(r => r.stars >= minStars);
  log.info(`Filtered to >=${minStars} stars: ${allResults.length} projects`);

  // Sort by stars and take top N
  const topN = parseInt(opts.top);
  const candidates = allResults
    .sort((a, b) => b.stars - a.stars)
    .slice(0, topN);

  log.info(`Analyzing top ${candidates.length} projects...`);
  console.log('');

  // Filter out already analyzed (unless --force)
  let toAnalyze: HuntResult[] = [];
  if (opts.force) {
    toAnalyze = candidates;
  } else {
    for (const c of candidates) {
      if (!(await isAnalyzed(c.fullName))) {
        toAnalyze.push(c);
      }
    }
    const skipped = candidates.length - toAnalyze.length;
    if (skipped > 0) {
      log.info(`Skipping ${skipped} already-analyzed projects (use --force to re-analyze)`);
    }
  }

  if (toAnalyze.length === 0) {
    log.success('All projects already analyzed!');
    log.info(`Run ${chalk.cyan('npm run report')} to generate report.`);
    return;
  }

  // Analyze each project
  let success = 0;
  let failed = 0;

  for (let i = 0; i < toAnalyze.length; i++) {
    const project = toAnalyze[i];
    const progress = `[${i + 1}/${toAnalyze.length}]`;

    console.log('');
    log.info(`${chalk.cyan(progress)} Analyzing ${chalk.bold(project.fullName)} (★${formatNumber(project.stars)})`);

    try {
      const analysis = await analyzeSingleProject(project.fullName, project);

      if (analysis) {
        await saveAnalysis(analysis);
        success++;

        // Print quick summary
        const risk = classifyLicense(analysis.license);
        console.log(
          `  ${chalk.green('✓')} TEMC: T=${analysis.temc.T} E=${analysis.temc.E} M=${analysis.temc.M} C=${analysis.temc.C} ` +
          `| Composite: ${chalk.bold(String(analysis.temc.composite))} ` +
          `| License: ${risk === 'safe' ? chalk.green(analysis.license) : risk === 'dangerous' ? chalk.red(analysis.license) : chalk.yellow(analysis.license || '?')} ` +
          `| Decomp: ${analysis.decomposability}/10`
        );
      } else {
        failed++;
        log.error(`  Analysis returned null for ${project.fullName}`);
      }
    } catch (err: any) {
      failed++;
      log.error(`  Failed: ${err.message}`);
    }
  }

  // Summary
  console.log('');
  log.header('📊 Batch Summary');
  log.info(`Analyzed: ${chalk.green(String(success))} | Failed: ${chalk.red(String(failed))} | Total: ${toAnalyze.length}`);
  log.info(`Results saved to: data/analyses/`);
  console.log('');
  log.info(`Next step: ${chalk.cyan('npm run report')} to generate markdown report`);
}

main().catch(err => {
  log.error(`Fatal: ${err.message}`);
  process.exit(1);
});
