import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = join(root, 'images');
const baseUrl = process.env.SCREENSHOT_URL ?? 'http://127.0.0.1:3001';
const vendorQuestion =
  "Our payment agent is about to settle this week's vendor invoices from the treasury — should I approve the batch given current lending pool depth and this account's recent transfers?";

mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.DeskResults != null);
await page.waitForTimeout(1000);
await page.screenshot({ path: join(outDir, 'screenshot-01-desk.png'), fullPage: false });

await page.getByRole('button', { name: /Vendor batch/i }).click({ force: true });
await page.waitForTimeout(500);
await page.locator('#stepCase').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: join(outDir, 'screenshot-02-assignment.png'), fullPage: false });

// Inject a settled beat for screenshot-03 (no live payment needed for dashboard image).
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
    hashscan:
      'https://hashscan.io/testnet/transaction/1789316805.391572804?tid=0.0.7162784-1789316799-254727691',
    payload: { beat },
  };
  const report = document.getElementById('report');
  const verifyLinks = document.getElementById('verifyLinks');
  const vizBlock = document.getElementById('vizBlock');
  const agentRun = document.getElementById('agentRun');
  const detailsBlock = document.getElementById('detailsBlock');
  const out = document.getElementById('out');
  const config = window.__nextbeatConfig ?? {
    agentAccountId: '0.0.10456496',
    serviceAccountId: '0.0.10449882',
    blocky402FacilitatorAccountId: '0.0.7162784',
  };
  if (window.DeskResults) {
    const { beat, reasoning } = window.DeskResults.updateAfterBeat({
      data,
      paymentTxId: data.paymentTxId,
      vizRoot: vizBlock,
      agentRoot: agentRun,
      verifyRoot: verifyLinks,
      config,
    });
    if (report) {
      report.textContent = reasoning;
      report.hidden = false;
    }
    if (out) out.textContent = JSON.stringify(beat, null, 2);
    if (detailsBlock) detailsBlock.hidden = false;
    const verifyCard = document.getElementById('verifyCard');
    if (verifyCard) verifyCard.hidden = false;
  }
}, vendorQuestion);

await page.waitForTimeout(800);
await page.locator('#report').scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
await page.screenshot({ path: join(outDir, 'screenshot-03-beat.png'), fullPage: false });

await browser.close();
console.log('Wrote screenshots to', outDir);
