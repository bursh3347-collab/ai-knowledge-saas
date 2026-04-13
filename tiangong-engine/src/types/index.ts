/**
 * Core types for the Tiangong Engine
 */

/** A GitHub repository discovered by the hunter */
export interface HuntResult {
  fullName: string;          // e.g. "vercel/next-saas-starter"
  owner: string;
  repo: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;    // e.g. "MIT", "Apache-2.0", "AGPL-3.0"
  lastUpdated: string;       // ISO date
  createdAt: string;         // ISO date
  topics: string[];
  url: string;               // GitHub URL
  openIssues: number;
  defaultBranch: string;
  category: string;          // Search category that found this repo
  searchQuery: string;       // The query that found this repo
  huntedAt: string;          // When we found it (ISO date)
}

/** TEMC scoring for a project */
export interface TEMCScore {
  T: number;  // Tech maturity (0-100)
  E: number;  // Ecosystem activity (0-100)
  M: number;  // Market timing (0-100)
  C: number;  // Competitive advantage (0-100)
  composite: number;  // Weighted average
}

/** Deep analysis of a GitHub project */
export interface ProjectAnalysis {
  fullName: string;
  url: string;
  analyzedAt: string;

  // Basic info
  stars: number;
  language: string | null;
  license: string | null;
  licenseRisk: 'safe' | 'caution' | 'dangerous';  // MIT/Apache=safe, LGPL=caution, GPL/AGPL=dangerous

  // AI-generated analysis
  techStack: string;           // Summary of technologies used
  coreModules: string[];       // Most valuable parts
  decomposability: number;     // 1-10: can modules be extracted independently?
  commercialPotential: string; // What product could this become?
  targetCustomer: string;      // Who would pay?
  pricingEstimate: string;     // How much?
  strengths: string[];         // Key strengths
  weaknesses: string[];        // Key weaknesses

  // Scores
  temc: TEMCScore;

  // Raw data
  readmeExcerpt: string;       // First 2000 chars
  dependencies: Record<string, string>;  // From package.json
  directoryStructure: string;  // Top 2 levels
  category: string;
}

/** Search category definition */
export interface SearchCategory {
  name: string;
  id: string;
  queries: string[];
  defaultLanguage?: string;
  defaultMinStars?: number;
}

/** Configuration for a hunt run */
export interface HuntConfig {
  categories: SearchCategory[];
  minStars: number;
  maxResults: number;
  language?: string;
}

/** Batch analysis configuration */
export interface BatchConfig {
  top: number;
  minStars: number;
  category?: string;
  skipExisting: boolean;
}
