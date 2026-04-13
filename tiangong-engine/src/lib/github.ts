/**
 * GitHub API Client — Wraps Octokit for repo search and file reading
 */
import { Octokit } from '@octokit/rest';
import { HuntResult } from '../types/index.js';
import { rateLimiter, log } from './utils.js';

let octokit: Octokit;

/** Initialize the GitHub client */
export function initGitHub(token: string): void {
  octokit = new Octokit({ auth: token });
}

/**
 * Search GitHub repositories by query
 * @param query - Search query (e.g. "saas boilerplate")
 * @param options - Search options
 * @returns Array of HuntResult
 */
export async function searchRepos(
  query: string,
  options: {
    minStars?: number;
    language?: string;
    maxResults?: number;
    category?: string;
  } = {}
): Promise<HuntResult[]> {
  const { minStars = 50, language, maxResults = 30, category = 'custom' } = options;

  let searchQuery = query;
  if (minStars > 0) searchQuery += ` stars:>=${minStars}`;
  if (language) searchQuery += ` language:${language}`;

  const results: HuntResult[] = [];
  const perPage = Math.min(maxResults, 100);
  const pages = Math.ceil(maxResults / perPage);

  for (let page = 1; page <= pages; page++) {
    await rateLimiter.waitForGitHub();

    try {
      const response = await octokit.rest.search.repos({
        q: searchQuery,
        sort: 'stars',
        order: 'desc',
        per_page: perPage,
        page,
      });

      for (const repo of response.data.items) {
        if (results.length >= maxResults) break;

        results.push({
          fullName: repo.full_name,
          owner: repo.owner?.login || '',
          repo: repo.name,
          description: repo.description,
          stars: repo.stargazers_count || 0,
          forks: repo.forks_count || 0,
          language: repo.language,
          license: repo.license?.spdx_id || null,
          lastUpdated: repo.updated_at || '',
          createdAt: repo.created_at || '',
          topics: repo.topics || [],
          url: repo.html_url || '',
          openIssues: repo.open_issues_count || 0,
          defaultBranch: repo.default_branch || 'main',
          category,
          searchQuery: query,
          huntedAt: new Date().toISOString(),
        });
      }

      // If fewer results than requested, no more pages
      if (response.data.items.length < perPage) break;
    } catch (error: any) {
      log.error(`GitHub search failed for "${query}": ${error.message}`);
      if (error.status === 403) {
        log.warn('Rate limited. Waiting 60s...');
        await new Promise(r => setTimeout(r, 60000));
      }
    }
  }

  return results;
}

/**
 * Get file contents from a GitHub repo
 * @param owner - Repo owner
 * @param repo - Repo name
 * @param path - File path
 * @returns File content as string, or null if not found
 */
export async function getFileContent(
  owner: string,
  repo: string,
  path: string
): Promise<string | null> {
  await rateLimiter.waitForGitHub();

  try {
    const response = await octokit.rest.repos.getContent({
      owner,
      repo,
      path,
    });

    if ('content' in response.data && response.data.type === 'file') {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error: any) {
    if (error.status === 404) return null;
    log.error(`Failed to read ${owner}/${repo}/${path}: ${error.message}`);
    return null;
  }
}

/**
 * Get directory structure (top 2 levels) of a GitHub repo
 * @returns Formatted directory tree string
 */
export async function getDirectoryStructure(
  owner: string,
  repo: string
): Promise<string> {
  await rateLimiter.waitForGitHub();

  try {
    const response = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: 'HEAD',
      recursive: 'true',
    });

    const tree = response.data.tree
      .filter((item: any) => {
        const depth = item.path.split('/').length;
        return depth <= 3;  // Top 3 levels
      })
      .map((item: any) => {
        const indent = '  '.repeat(item.path.split('/').length - 1);
        const icon = item.type === 'tree' ? '📁' : '📄';
        const name = item.path.split('/').pop();
        return `${indent}${icon} ${name}`;
      })
      .slice(0, 60)  // Max 60 entries
      .join('\n');

    return tree || 'Unable to read directory structure';
  } catch (error: any) {
    log.error(`Failed to read tree for ${owner}/${repo}: ${error.message}`);
    return 'Unable to read directory structure';
  }
}

/**
 * Get repo metadata (commits, contributors count)
 */
export async function getRepoStats(
  owner: string,
  repo: string
): Promise<{ recentCommits: number; contributors: number }> {
  await rateLimiter.waitForGitHub();

  try {
    const [commits, contributors] = await Promise.all([
      octokit.rest.repos.listCommits({
        owner,
        repo,
        per_page: 1,
        since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      }).catch(() => ({ data: [] })),
      octokit.rest.repos.listContributors({
        owner,
        repo,
        per_page: 1,
      }).catch(() => ({ data: [] })),
    ]);

    return {
      recentCommits: commits.data.length > 0 ? 1 : 0,  // At least 1 recent commit
      contributors: contributors.data.length || 0,
    };
  } catch {
    return { recentCommits: 0, contributors: 0 };
  }
}
