#!/usr/bin/env node
/**
 * Run 10 treasury questions through composeBeat reasoning.
 * Requires GROQ_API_KEY, OPENAI_API_KEY, or LLM_BASE_URL (Hedera/LM Studio pattern).
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import pino from 'pino';
import { loadServiceEnv } from '@nextbeat/shared';
import { createLogger } from '../packages/service/dist/logger.js';
import { composeBeat } from '../packages/service/dist/beats.js';

config({ path: resolve(process.cwd(), '.env') });

const env = loadServiceEnv();
const logger = createLogger('info');

const QUESTIONS = [
  'Should I approve vendor invoices this week?',
  'Is month-end transfer volume normal?',
  'We have idle HBAR — deploy to yield?',
  'Alert on unusual outflows — market stress or us?',
  'Board wants a one-page DeFi brief',
  'What is the current Compound TVL?',
  'Can we safely pay 50 contractors tomorrow?',
  'Why did our treasury balance drop last night?',
  'Compare lending vs DEX risk for our portfolio',
  'Is Hedera testnet congestion affecting settlements?',
];

const hasLlm =
  Boolean(process.env.GROQ_API_KEY) ||
  Boolean(process.env.OPENAI_API_KEY) ||
  Boolean(process.env.LLM_BASE_URL);

if (!hasLlm) {
  console.error('Set GROQ_API_KEY, OPENAI_API_KEY, or LLM_BASE_URL in .env first.');
  process.exit(1);
}

console.log('LLM:', process.env.GROQ_API_KEY ? 'groq' : process.env.OPENAI_API_KEY ? 'openai' : 'openai_compatible');
console.log('---');

for (const q of QUESTIONS) {
  const beat = await composeBeat(env, logger, q, '0.0.10449882', 3);
  const first = beat.reasoning.replace(/\s+/g, ' ').slice(0, 140);
  console.log(`Q: ${q}`);
  console.log(`  intent=${beat.caseIntent} source=${beat.reasoningSource ?? 'template'} provider=${beat.llmProvider ?? '-'}`);
  console.log(`  A: ${first}…\n`);
}
