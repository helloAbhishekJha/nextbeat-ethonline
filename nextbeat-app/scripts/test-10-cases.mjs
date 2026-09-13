#!/usr/bin/env node
/**
 * Test all 10 treasury cases — template vs LLM, with live Graph when configured.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { loadServiceEnv } from '@nextbeat/shared';
import { createLogger } from '../packages/service/dist/logger.js';
import { composeBeat } from '../packages/service/dist/beats.js';
import { analyzeBeat } from '../packages/service/dist/graph.js';

config({ path: resolve(process.cwd(), '.env') });

const CASES = [
  {
    id: 1,
    label: 'Vendor batch',
    question:
      "Our payment agent is about to settle this week's vendor invoices from the treasury — should I approve the batch given current lending pool depth and this account's recent transfers?",
    accountId: '0.0.10449882',
    expect: /approve|hold|conditional|do not/i,
  },
  {
    id: 2,
    label: 'Month-end close',
    question:
      'For month-end close, does this treasury account\'s transfer volume look normal relative to current Compound and Uniswap market size?',
    accountId: '0.0.10449882',
    expect: /normal|elevated|yes|no/i,
  },
  {
    id: 3,
    label: 'Idle capital',
    question:
      'We are holding surplus HBAR in the treasury — are lending pools large enough that deploying idle balance into yield is worth evaluating now?',
    accountId: '0.0.10449882',
    expect: /yes|pilot|wait|deploy/i,
  },
  {
    id: 4,
    label: 'Alert triage',
    question:
      "We got an alert on unusual Hedera outflows — does today's DeFi liquidity picture point to external market stress, or should we investigate this treasury account specifically?",
    accountId: '0.0.10456496',
    expect: /investigate|stress|account|macro/i,
  },
  {
    id: 5,
    label: 'Board brief',
    question:
      'The board asked how our treasury activity relates to current DeFi market conditions — summarize Graph lending and DEX liquidity versus this account\'s recent Hedera transfers for a one-page brief.',
    accountId: '0.0.10456496',
    expect: /board|summary|compound|uniswap|treasury/i,
  },
  {
    id: 6,
    label: 'Compound TVL (free-form)',
    question: 'What is the current Compound TVL?',
    accountId: '0.0.10449882',
    expect: /tvl|compound|\$/i,
    reject: /deploy idle treasury/i,
  },
  {
    id: 7,
    label: '50 contractors (free-form)',
    question: 'Can we safely pay 50 contractors tomorrow?',
    accountId: '0.0.10449882',
    expect: /approve|hold|safe|pay|contractor/i,
  },
  {
    id: 8,
    label: 'Balance drop (free-form)',
    question: 'Why did our treasury balance drop last night?',
    accountId: '0.0.10449882',
    expect: /transfer|payment|balance|hbar|beat/i,
    reject: /board summary/i,
  },
  {
    id: 9,
    label: 'Lending vs DEX (free-form)',
    question: 'Compare lending vs DEX risk for our portfolio',
    accountId: '0.0.10449882',
    expect: /lend|dex|compound|uniswap|risk/i,
    reject: /deploy idle treasury/i,
  },
  {
    id: 10,
    label: 'Hedera congestion (free-form)',
    question: 'Is Hedera testnet congestion affecting settlements?',
    accountId: '0.0.10449882',
    expect: /hedera|settlement|congest|transfer|network/i,
    reject: /approve the vendor batch/i,
  },
];

const env = loadServiceEnv();
const logger = createLogger('warn');

const llm =
  Boolean(process.env.OPENAI_API_KEY) ||
  Boolean(process.env.GROQ_API_KEY) ||
  Boolean(process.env.LLM_BASE_URL);

console.log('Mode:', llm ? 'LLM + live Graph' : 'TEMPLATE ONLY (no API key)');
console.log('Graph URLs:', process.env.GRAPH_QUERY_URLS ? 'configured' : 'missing');
console.log('='.repeat(72));

let pass = 0;
let fail = 0;

for (const c of CASES) {
  const beat = await composeBeat(env, logger, c.question, c.accountId, 3);
  const answer = beat.reasoning.split('\n')[0];
  const wantSource = c.id <= 5 ? 'template' : 'llm';
  const sourceOk = (beat.reasoningSource ?? 'template') === wantSource;
  const okExpect = c.expect.test(answer) || c.expect.test(beat.reasoning);
  const badReject = c.reject ? c.reject.test(answer) : false;
  const ok = okExpect && !badReject && sourceOk;

  if (ok) pass++;
  else fail++;

  console.log(`\n[${c.id}] ${c.label} — ${ok ? 'PASS' : 'FAIL'}`);
  console.log(`  source=${beat.reasoningSource ?? 'template'} intent=${beat.caseIntent}`);
  console.log(`  Q: ${c.question.slice(0, 70)}…`);
  console.log(`  A: ${answer.slice(0, 200)}${answer.length > 200 ? '…' : ''}`);
  if (!ok) {
    if (!sourceOk) console.log(`  ✗ expected source=${wantSource}, got ${beat.reasoningSource}`);
    if (!okExpect) console.log(`  ✗ missing expected pattern: ${c.expect}`);
    if (badReject) console.log(`  ✗ matched reject pattern: ${c.reject}`);
  }
}

console.log('\n' + '='.repeat(72));
console.log(`Results: ${pass}/10 pass, ${fail}/10 fail`);
process.exit(fail > 0 ? 1 : 0);
