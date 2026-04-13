/**
 * Local JSON Storage — Read/write data to local files
 */
import fs from 'fs-extra';
import path from 'path';
import { HuntResult, ProjectAnalysis } from '../types/index.js';
import { log } from './utils.js';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const HUNT_DIR = path.join(DATA_DIR, 'hunt-results');
const ANALYSIS_DIR = path.join(DATA_DIR, 'analyses');
const REPORTS_DIR = path.resolve(process.cwd(), 'reports');

/** Ensure all data directories exist */
export async function ensureDataDirs(): Promise<void> {
  await fs.ensureDir(HUNT_DIR);
  await fs.ensureDir(ANALYSIS_DIR);
  await fs.ensureDir(REPORTS_DIR);
}

/**
 * Save hunt results to a JSON file
 * @param category - Category name (used in filename)
 * @param results - Array of HuntResult
 */
export async function saveHuntResults(
  category: string,
  results: HuntResult[]
): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  const filename = `${category}-${date}.json`;
  const filepath = path.join(HUNT_DIR, filename);

  // Load existing results for deduplication
  const existing = await loadHuntResults(category);
  const existingNames = new Set(existing.map(r => r.fullName));

  // Merge: add only new results
  const newResults = results.filter(r => !existingNames.has(r.fullName));
  const merged = [...existing, ...newResults];

  await fs.writeJson(filepath, merged, { spaces: 2 });
  log.success(`Saved ${newResults.length} new results to ${filename} (${merged.length} total)`);

  return filepath;
}

/**
 * Load hunt results for a category (latest file)
 */
export async function loadHuntResults(category?: string): Promise<HuntResult[]> {
  const files = await fs.readdir(HUNT_DIR);
  const jsonFiles = files
    .filter(f => f.endsWith('.json'))
    .filter(f => !category || f.startsWith(category))
    .sort()
    .reverse();

  if (jsonFiles.length === 0) return [];

  // Load all matching files and merge
  const allResults: HuntResult[] = [];
  const seen = new Set<string>();

  for (const file of jsonFiles) {
    const data = await fs.readJson(path.join(HUNT_DIR, file));
    for (const item of data) {
      if (!seen.has(item.fullName)) {
        seen.add(item.fullName);
        allResults.push(item);
      }
    }
  }

  return allResults;
}

/**
 * Load all hunt results across all categories
 */
export async function loadAllHuntResults(): Promise<HuntResult[]> {
  return loadHuntResults();
}

/**
 * Save a project analysis
 */
export async function saveAnalysis(analysis: ProjectAnalysis): Promise<string> {
  const filename = `${analysis.fullName.replace('/', '-')}.json`;
  const filepath = path.join(ANALYSIS_DIR, filename);

  await fs.writeJson(filepath, analysis, { spaces: 2 });
  log.success(`Analysis saved: ${filename}`);

  return filepath;
}

/**
 * Load a project analysis (if exists)
 */
export async function loadAnalysis(fullName: string): Promise<ProjectAnalysis | null> {
  const filename = `${fullName.replace('/', '-')}.json`;
  const filepath = path.join(ANALYSIS_DIR, filename);

  if (await fs.pathExists(filepath)) {
    return fs.readJson(filepath);
  }
  return null;
}

/**
 * Load all analyses
 */
export async function loadAllAnalyses(): Promise<ProjectAnalysis[]> {
  const files = await fs.readdir(ANALYSIS_DIR);
  const analyses: ProjectAnalysis[] = [];

  for (const file of files) {
    if (file.endsWith('.json')) {
      const data = await fs.readJson(path.join(ANALYSIS_DIR, file));
      analyses.push(data);
    }
  }

  return analyses;
}

/**
 * Check if a project has already been analyzed
 */
export async function isAnalyzed(fullName: string): Promise<boolean> {
  const filename = `${fullName.replace('/', '-')}.json`;
  return fs.pathExists(path.join(ANALYSIS_DIR, filename));
}

/**
 * Save a report to the reports directory
 */
export async function saveReport(content: string, filename?: string): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  const fname = filename || `github-scan-${date}.md`;
  const filepath = path.join(REPORTS_DIR, fname);

  await fs.writeFile(filepath, content, 'utf-8');
  log.success(`Report saved: ${fname}`);

  return filepath;
}
