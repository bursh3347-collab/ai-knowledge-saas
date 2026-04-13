/**
 * OpenAI API Client — Structured project analysis and TEMC scoring
 */
import OpenAI from 'openai';
import { TEMCScore } from '../types/index.js';
import { rateLimiter, log } from './utils.js';

let client: OpenAI;
let model: string;

/** Initialize OpenAI client */
export function initOpenAI(apiKey: string, modelName: string = 'gpt-4o-mini'): void {
  client = new OpenAI({ apiKey });
  model = modelName;
}

/** Analysis prompt template */
const ANALYSIS_PROMPT = `You are an expert software architect and business analyst evaluating open source projects for a solo developer building micro-SaaS products.

Analyze the following GitHub project and return a JSON object with these fields:

{
  "techStack": "Brief summary of technologies used (max 100 chars)",
  "coreModules": ["list of 3-5 most valuable/reusable modules"],
  "decomposability": 7,  // 1-10: can core modules be extracted independently?
  "commercialPotential": "What product could be built from this? (max 200 chars)",
  "targetCustomer": "Who would pay for it? (max 100 chars)",
  "pricingEstimate": "$X/month or one-time, with reasoning (max 100 chars)",
  "strengths": ["3 key strengths"],
  "weaknesses": ["3 key weaknesses or risks"],
  "T": 75,  // Tech maturity 0-100 (code quality, docs, tests, production-readiness)
  "E": 60,  // Ecosystem 0-100 (community, contributors, integrations, plugins)
  "M": 80,  // Market timing 0-100 (is there demand now? growing market?)
  "C": 70   // Competitive advantage 0-100 (uniqueness vs alternatives)
}

IMPORTANT:
- Be practical. This is for a solo developer with 4 hours/day.
- Focus on what can be REUSED or ADAPTED, not just admired.
- License risk: MIT/Apache=safe, LGPL=caution, GPL/AGPL=dangerous (must rewrite, not reuse).
- If the project is NOT useful for building products, say so directly.
- Return ONLY valid JSON, no markdown, no explanation.`;

/**
 * Analyze a project using OpenAI
 * @returns Structured analysis object
 */
export async function analyzeProject(context: {
  fullName: string;
  stars: number;
  language: string | null;
  license: string | null;
  description: string | null;
  readme: string;
  packageJson: string | null;
  directoryStructure: string;
}): Promise<{
  techStack: string;
  coreModules: string[];
  decomposability: number;
  commercialPotential: string;
  targetCustomer: string;
  pricingEstimate: string;
  strengths: string[];
  weaknesses: string[];
  temc: TEMCScore;
} | null> {
  await rateLimiter.waitForOpenAI();

  const projectInfo = `
## Project: ${context.fullName}
- Stars: ${context.stars}
- Language: ${context.language || 'Unknown'}
- License: ${context.license || 'Unknown'}
- Description: ${context.description || 'No description'}

## README (excerpt):
${context.readme.slice(0, 3000)}

## package.json:
${context.packageJson?.slice(0, 2000) || 'Not available'}

## Directory Structure:
${context.directoryStructure.slice(0, 2000)}
`;

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: ANALYSIS_PROMPT },
        { role: 'user', content: projectInfo },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);

    return {
      techStack: parsed.techStack || '',
      coreModules: parsed.coreModules || [],
      decomposability: parsed.decomposability || 0,
      commercialPotential: parsed.commercialPotential || '',
      targetCustomer: parsed.targetCustomer || '',
      pricingEstimate: parsed.pricingEstimate || '',
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      temc: {
        T: parsed.T || 0,
        E: parsed.E || 0,
        M: parsed.M || 0,
        C: parsed.C || 0,
        composite: Math.round(
          (parsed.T || 0) * 0.25 +
          (parsed.E || 0) * 0.20 +
          (parsed.M || 0) * 0.30 +
          (parsed.C || 0) * 0.25
        ),
      },
    };
  } catch (error: any) {
    log.error(`OpenAI analysis failed for ${context.fullName}: ${error.message}`);
    return null;
  }
}
