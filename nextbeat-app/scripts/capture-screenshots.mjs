import { chromium } from 'playwright';
import { mkdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = join(root, 'images');
const baseUrl = process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:3001';
const vendorQuestion =
  "Our payment agent is about to settle this week's vendor invoices from the treasury — should I approve the batch given current lending pool depth and this account's recent transfers?";

mkdirSync(outDir, { recursive: true });

function setSteps(page, active) {
  return page.evaluate((which) => {
    const map = { human: 'stepHuman', case: 'stepCase', pay: 'stepPay' };
    for (const [key, id] of Object.entries(map)) {
      const el = document.getElementById(id);
      if (!el) continue;
      el.className = key === which ? 'step active' : which === 'pay' || (which === 'case' && key === 'human') ? 'step done' : 'step';
    }
  }, active);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.DeskResults != null);
await page.waitForTimeout(1000);

// 01 — World gate ONLY (no case form visible)
await page.evaluate(() => {
  const hide = ['caseCard', 'gateDoneCard', 'resultCard', 'verifyCard', 'walletCard'];
  for (const id of hide) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }
  const gate = document.getElementById('gateCard');
  if (gate) {
    gate.hidden = false;
    gate.style.display = '';
  }
  window.scrollTo(0, 0);
});
await setSteps(page, 'human');
await page.locator('#gateCard').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outDir, 'screenshot-01-desk.png'), fullPage: false });

// 02 — Step 2 case form ONLY (World done banner + filled question + Buy)
await page.evaluate(() => {
  const gate = document.getElementById('gateCard');
  if (gate) gate.style.display = 'none';

  const done = document.getElementById('gateDoneCard');
  if (done) {
    done.hidden = false;
    done.style.display = '';
  }

  const caseCard = document.getElementById('caseCard');
  if (caseCard) {
    caseCard.style.display = '';
    caseCard.classList.remove('locked');
  }

  const buy = document.getElementById('buy');
  if (buy) buy.disabled = false;

  for (const id of ['resultCard', 'verifyCard', 'walletCard']) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }
});
await setSteps(page, 'case');
await page.locator('#assignment').fill(vendorQuestion);
await page.getByRole('button', { name: /Vendor batch/i }).click({ force: true });
await page.evaluate(() => {
  const status = document.getElementById('status');
  if (status) status.textContent = 'Case loaded — buy a beat to see the live answer.';
});
await page.evaluate(() => {
  const card = document.getElementById('gateDoneCard');
  const top = (card?.offsetTop ?? 0) - 12;
  window.scrollTo(0, Math.max(0, top));
});
await page.waitForTimeout(500);
await page.screenshot({ path: join(outDir, 'screenshot-02-assignment.png'), fullPage: false });

// 03 — settled beat
await page.evaluate(() => {
  for (const id of ['gateCard', 'gateDoneCard', 'caseCard']) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }
  const result = document.getElementById('resultCard');
  if (result) result.style.display = '';
});
await page.evaluate((question) => {
  const beat = {
    case: question,
    reasoning:
      'Compound v2 TVL is ~$116M while Uniswap V2 factory liquidity is much larger — different risk lenses. Treasury 0.0.10449882 shows 2 recent mirror transfers; approve vendor batch only if amounts match expected invoices and pool depth supports your policy buffer.',
    graph: [
      { ok: true, protocolName: 'Compound v2', tvlUsd: '115841820.12' },
      { ok: true, protocolName: 'Uniswap V2', tvlUsd: '2075145401042.19' },
    ],
    chartGraph: [{ ok: true, protocolName: 'Compound v2', tvlUsd: '115841820.12' }],
    chartTitle: 'Lending pool depth (vendor batch context)',
    agentRun: {
      framework: { pattern: 'Human gate → Graph → Hedera mirror → reason → x402 settle' },
      steps: [
        { sponsor: 'World', tool: 'Selfie Check', status: 'ok', summary: 'Operator authorized' },
        { sponsor: 'The Graph', tool: 'Subgraph query', status: 'ok', summary: 'Compound + Uniswap TVL' },
        { sponsor: 'Hedera', tool: 'Mirror Node', status: 'ok', summary: 'Treasury transfers loaded' },
        { sponsor: 'NextBeat', tool: 'gpt-4o-mini', status: 'ok', summary: 'Risk brief generated' },
        { sponsor: 'Hedera', tool: 'x402 payment', status: 'ok', summary: 'Agent paid 1000 tinybars' },
      ],
    },
  };
  const data = {
    paymentTxId: '0.0.7162784-1789316799-254727691',
    blocky402FacilitatorAccountId: '0.0.7162784',
    paymentProof: {
      consensusTimestamp: '1789316805.391572804',
      hashscan:
        'https://hashscan.io/testnet/transaction/1789316805.391572804?tid=0.0.7162784-1789316799-254727691',
      result: 'SUCCESS',
      agentToTreasuryTinybars: 1000,
      transfers: [
        { accountId: '0.0.10456496', amountTinybars: -1000, role: 'agent' },
        { accountId: '0.0.10449882', amountTinybars: 1000, role: 'treasury' },
      ],
    },
    payload: { beat },
  };
  const config = {
    agentAccountId: '0.0.10456496',
    serviceAccountId: '0.0.10449882',
    blocky402FacilitatorAccountId: '0.0.7162784',
  };
  window.DeskResults.updateAfterBeat({
    data,
    paymentTxId: data.paymentTxId,
    vizRoot: document.getElementById('vizBlock'),
    agentRoot: document.getElementById('agentRun'),
    verifyRoot: document.getElementById('verifyLinks'),
    config,
  });
  const { reasoning } = window.DeskResults.extractBeat(data);
  const report = document.getElementById('report');
  if (report) {
    report.textContent = reasoning || beat.reasoning;
    report.hidden = false;
  }
  const doneEl = document.getElementById('done');
  if (doneEl) doneEl.hidden = false;
  const verifyCard = document.getElementById('verifyCard');
  if (verifyCard) {
    verifyCard.hidden = false;
    verifyCard.style.display = '';
  }
  const stepPay = document.getElementById('stepPay');
  if (stepPay) stepPay.className = 'step done';
}, vendorQuestion);

await page.evaluate(() => {
  const el = document.getElementById('resultCard');
  const top = (el?.offsetTop ?? 0) - 16;
  window.scrollTo(0, Math.max(0, top));
});
await page.waitForTimeout(500);
await page.screenshot({ path: join(outDir, 'screenshot-03-beat.png'), fullPage: false });

await browser.close();

for (const name of ['screenshot-01-desk.png', 'screenshot-02-assignment.png', 'screenshot-03-beat.png']) {
  console.log(`${name}: ${statSync(join(outDir, name)).size} bytes`);
}
console.log('Wrote screenshots to', outDir);
