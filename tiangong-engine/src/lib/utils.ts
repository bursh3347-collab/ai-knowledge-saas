/**
 * Utilities — Rate limiting, logging, helpers
 */
import chalk from 'chalk';

// ============== LOGGING ==============

export const log = {
  info: (msg: string) => console.log(chalk.blue('ℹ'), msg),
  success: (msg: string) => console.log(chalk.green('✓'), msg),
  warn: (msg: string) => console.log(chalk.yellow('⚠'), msg),
  error: (msg: string) => console.log(chalk.red('✗'), msg),
  dim: (msg: string) => console.log(chalk.dim(msg)),
  header: (msg: string) => {
    console.log('');
    console.log(chalk.bold.cyan(`━━━ ${msg} ━━━`));
    console.log('');
  },
  table: (data: Record<string, any>) => {
    for (const [key, value] of Object.entries(data)) {
      console.log(`  ${chalk.gray(key)}: ${chalk.white(String(value))}`);
    }
  },
};

// ============== RATE LIMITER ==============

class RateLimiter {
  private lastGitHub = 0;
  private lastOpenAI = 0;
  private gitHubInterval = 100;   // 10 requests/second
  private openAIInterval = 200;   // 5 requests/second

  async waitForGitHub(): Promise<void> {
    const now = Date.now();
    const wait = Math.max(0, this.gitHubInterval - (now - this.lastGitHub));
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    this.lastGitHub = Date.now();
  }

  async waitForOpenAI(): Promise<void> {
    const now = Date.now();
    const wait = Math.max(0, this.openAIInterval - (now - this.lastOpenAI));
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    this.lastOpenAI = Date.now();
  }
}

export const rateLimiter = new RateLimiter();

// ============== HELPERS ==============

/** Format a number with commas */
export function formatNumber(n: number): string {
  return n.toLocaleString();
}

/** Truncate a string to max length */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 3) + '...';
}

/** Classify license risk */
export function classifyLicense(license: string | null): 'safe' | 'caution' | 'dangerous' {
  if (!license) return 'caution';
  const safe = ['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'Unlicense', '0BSD'];
  const dangerous = ['GPL-2.0', 'GPL-3.0', 'AGPL-3.0', 'AGPL-3.0-or-later', 'GPL-3.0-only', 'GPL-2.0-only'];

  if (safe.includes(license)) return 'safe';
  if (dangerous.includes(license)) return 'dangerous';
  return 'caution';
}

/** Sleep for ms */
export function sleep(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}
