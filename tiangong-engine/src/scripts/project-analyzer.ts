#!/usr/bin/env tsx
/**
 * 🔬 Project Analyzer — Deep analyze a single GitHub project
 *
 * Usage:
 *   npm run analyze -- --repo="vercel/next-saas-starter"
 */
import 'dotenv/config';
import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { initGitHub, getFileContent, getDirectoryStructure, getRepoStats } from '../lib/github.js';
import { initOpenAI, analyzeProject } from '../lib/openai.js';
import { ensureDataDirs, saveAnalysis, loadAnalysis } from '../lib/storage.js';
import { log, classifyLicense, truncate } from '../lib/utils.js';
import type { ProjectAnalysis, HuntResult } from '../types/index.js';

// ============== CORE ANALYZER ==============

/**
 * Analyze a single GitHub project
 * @param fullName - e.g. "vercel/next-saas-starter"
 * @param huntData - Optional hunt result with pre-fetched metadata
 * @returns ProjectAnalysis or null
 */
export async function analyzeSingleProject(
  fullName: string,
  huntData?: Partial<HuntResult>
): Promise<ProjectAnalysis | null> {
  const [owner, repo] = fullName.split('/');
  if (!owner || !repo) {
    log.error(`Invalid repo format: ${fullName}. Use owner/repo.`);
    return null;
  }

  // Step 1: Read README
  const readmeSpinner = ora('Reading README...').start();
  const readme = await getFileContent(owner, repo, 'README.md');
  if (readme) {
    readmeSpinner.succeed('README loaded');
  } else {
    readmeSpinner.warn('No README found');
  }

  // Step 2: Read package.json
  const pkgSpinner = ora('Reading package.json...').start();
  const packageJson = await getFileContent(owner, repo, 'package.json');
  if (packageJson) {
    pkgSpinner.succeed('package.json loaded');
  } else {
    pkgSpinner.warn('No package.json (might not be a JS/TS project)');
  }

  // Step 3: Read directory structure
  const dirSpinner = ora('Reading directory structure...').start();
  const dirStructure = await getDirectoryStructure(owner, repo);
  dirSpinner.succeed('Directory structure loaded');

  // Step 4: Read LICENSE
  const licenseContent = await getFileContent(owner, repo, 'LICENSE');

  // Step 5: Parse dependencies
  let dependencies: Record<string, string> = {};
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);
      dependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    } catch { /* ignore parse errors */ }
  }

  // Step 6: AI Analysis
  const aiSpinner = ora('AI analyzing project...').start();
  const aiResult = await analyzeProject({
    fullName,
    stars: huntData?.stars || 0,
    language: huntData?.language || null,
    license: huntData?.license || null,
    description: huntData?.description || null,
    readme: readme || 'No README available',
    packageJson,
    directoryStructure: dirStructure,
  });

  if (!aiResult) {
    aiSpinner.fail('AI analysis failed');
    return null;
  }
  aiSpinner.succeed('AI analysis complete');

  // Step 7: Compose result
  const analysis: ProjectAnalysis = {
    fullName,
    url: `https://github.com/${fullName}`,
    analyzedAt: new Date().toISOString(),
    stars: huntData?.stars || 0,
    language: huntData?.language || null,
    license: huntData?.license || null,
    licenseRisk: classifyLicense(huntData?.license || null),
    techStack: aiResult.techStack,
    coreModules: aiResult.coreModules,
    decomposability: aiResult.decomposability,
    commercialPotential: aiResult.commercialPotential,
    targetCustomer: aiResult.targetCustomer,
    pricingEstimate: aiResult.pricingEstimate,
    strengths: aiResult.strengths,
    weaknesses: aiResult.weaknesses,
    temc: aiResult.temc,
    readmeExcerpt: (readme || '').slice(0, 2000),
    dependencies,
    directoryStructure: dirStructure,
    category: huntData?.category || 'custom',
  };

  return analysis;
}

// ============== CLI ==============

const program = new Command();

program
  .name('project-analyzer')
  .description('🔬 Deep analyze a GitHub project')
  .requiredOption('--repo <fullName>', 'Repository (owner/repo)')
  .option('--force', 'Re-analyze even if already done')
  .parse();

const opts = program.opts();

async function main() {
  if (!process.env.GITHUB_TOKEN) {
    log.error('GITHUB_TOKEN not set');
    process.exit(1);
  }
  if (!process.env.OPENAI_API_KEY) {
    log.error('OPENAI_API_KEY not set');
    process.exit(1);
  }

  initGitHub(process.env.GITHUB_TOKEN);
  initOpenAI(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL);
  await ensureDataDirs();

  const fullName = opts.repo;

  log.header(`🔬 Analyzing: ${fullName}`);

  // Check if already analyzed
  if (!opts.force) {
    const existing = await loadAnalysis(fullName);
    if (existing) {
      log.warn(`Already analyzed on ${existing.analyzedAt}. Use --force to re-analyze.`);
      printAnalysisSummary(existing);
      return;
    }
  }

  const analysis = await analyzeSingleProject(fullName);
  if (!analysis) {
    log.error('Analysis failed.');
    process.exit(1);
  }

  await saveAnalysis(analysis);

  console.log('');
  printAnalysisSummary(analysis);
}

/** Print a formatted summary of an analysis */
function printAnalysisSummary(a: ProjectAnalysis): void {
  log.header(`📊 ${a.fullName}`);

  console.log(chalk.bold('  Tech Stack:'), a.techStack);
  console.log(chalk.bold('  License:'), a.license || 'Unknown',
    a.licenseRisk === 'safe' ? chalk.green('✓ Safe') :
    a.licenseRisk === 'dangerous' ? chalk.red('✗ Dangerous') :
    chalk.yellow('⚠ Caution'));
  console.log(chalk.bold('  Stars:'), a.stars);
  console.log(chalk.bold('  Decomposability:'), `${a.decomposability}/10`);
  console.log('');

  console.log(chalk.bold('  🎯 Commercial Potential:'));
  console.log(`     ${a.commercialPotential}`);
  console.log(`     Target: ${a.targetCustomer}`);
  console.log(`     Price: ${a.pricingEstimate}`);
  console.log('');

  console.log(chalk.bold('  🧩 Core Modules:'));
  a.coreModules.forEach(m => console.log(`     • ${m}`));
  console.log('');

  console.log(chalk.bold('  ✅ Strengths:'));
  a.strengths.forEach(s => console.log(`     • ${s}`));
  console.log(chalk.bold('  ⚠️ Weaknesses:'));
  a.weaknesses.forEach(w => console.log(`     • ${w}`));
  console.log('');

  console.log(chalk.bold('  📊 TEMC Scores:'));
  console.log(`     T(Tech): ${colorScore(a.temc.T)}  E(Eco): ${colorScore(a.temc.E)}  M(Market): ${colorScore(a.temc.M)}  C(Compete): ${colorScore(a.temc.C)}`);
  console.log(`     ${chalk.bold(`Composite: ${colorScore(a.temc.composite)}`)}`  );
}

function colorScore(score: number): string {
  if (score >= 80) return chalk.green(`${score}`);
  if (score >= 60) return chalk.yellow(`${score}`);
  return chalk.red(`${score}`);
}

main().catch(err => {
  log.error(`Fatal: ${err.message}`);
  process.exit(1);
});
