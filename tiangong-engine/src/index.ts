/**
 * 🏗️ 天工引擎 v3.0 — AI-Powered GitHub Code Hunter
 *
 * This is the main entry point. For actual usage, run the scripts directly:
 *
 *   npm run hunt:all          — Search GitHub for projects
 *   npm run batch -- --top=20 — Analyze top projects
 *   npm run report            — Generate markdown report
 *   npm run full-scan         — Do everything in one command
 *
 * Or use individual scripts:
 *   npm run hunt -- --topic="shadow ai" --min-stars=50
 *   npm run analyze -- --repo="owner/repo"
 */

export { searchRepos, getFileContent, getDirectoryStructure } from './lib/github.js';
export { analyzeProject } from './lib/openai.js';
export { saveHuntResults, loadAllHuntResults, saveAnalysis, loadAllAnalyses } from './lib/storage.js';
export type { HuntResult, ProjectAnalysis, TEMCScore, SearchCategory } from './types/index.js';

console.log('🏗️  天工引擎 v3.0 — AI-Powered GitHub Code Hunter');
console.log('');
console.log('Commands:');
console.log('  npm run hunt:all          — Search all categories');
console.log('  npm run batch -- --top=20 — Analyze top projects');
console.log('  npm run report            — Generate report');
console.log('  npm run full-scan         — Hunt + Analyze + Report');
console.log('');
console.log('See README.md for full documentation.');
