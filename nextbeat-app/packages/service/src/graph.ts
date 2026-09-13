import type { GraphProtocolSnapshot } from '@nextbeat/shared';
import { fetchJson } from './http.js';

const UNISWAP_V2_FACTORY = '0x1f98431c8ad98523631ae4a59f267346ea31f984';
const SUBGRAPH_LABELS: Record<string, string> = {
  '4tbqva8p2dobd5qdbpmwmdzv3csjjwtxo8nvsqf2ta9a': 'Compound V2 (lending)',
  '5zvr82qoaoxyfydeklz9t6v9adgnptxypkpsbxtgvenfv': 'Uniswap V2 (DEX)',
};

export type CaseIntent =
  | 'vendor_approval'
  | 'volume_normality'
  | 'yield_deploy'
  | 'stress_triage'
  | 'board_brief'
  | 'general';

/** Messari-like + DEX factory fallbacks — one shape, many deployments. */
const STANDARDIZED_QUERY = `{
  protocols(first: 1) {
    name
    totalValueLockedUSD
  }
}`;

const DEX_FALLBACK_QUERY = `{
  factories(first: 1) {
    id
    poolCount
    txCount
    totalValueLockedUSD
  }
}`;

type ProtocolResponse = {
  data?: {
    protocols?: Array<{ name?: string; totalValueLockedUSD?: string }>;
    factories?: Array<{
      id?: string;
      poolCount?: string;
      txCount?: string;
      totalValueLockedUSD?: string;
    }>;
    errors?: unknown;
  };
  errors?: Array<{ message?: string }>;
};

export async function loadGraphSnapshots(
  endpoints: string[],
  apiKey: string | undefined,
): Promise<GraphProtocolSnapshot[]> {
  if (endpoints.length === 0) return [];

  return Promise.all(endpoints.map((endpoint) => queryOne(endpoint, apiKey)));
}

function labelFromEndpoint(endpoint: string): string {
  const id = subgraphIdFromEndpoint(endpoint);
  if (id && SUBGRAPH_LABELS[id]) return SUBGRAPH_LABELS[id];
  return 'Protocol';
}

async function queryOne(endpoint: string, apiKey: string | undefined): Promise<GraphProtocolSnapshot> {
  const sourceLabel = labelFromEndpoint(endpoint);
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (apiKey) headers.authorization = `Bearer ${apiKey}`;

  try {
    const first = await fetchJson<ProtocolResponse>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: STANDARDIZED_QUERY }),
    });
    const protocol = first.data?.protocols?.[0];
    if (protocol) {
      return {
        endpoint: redactEndpoint(endpoint),
        ok: true,
        protocolName: protocol.name ?? 'unknown',
        tvlUsd: protocol.totalValueLockedUSD ?? null,
        extra: {},
      };
    }

    const second = await fetchJson<ProtocolResponse>(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: DEX_FALLBACK_QUERY }),
    });
    const factory = second.data?.factories?.[0];
    if (factory) {
      return {
        endpoint: redactEndpoint(endpoint),
        ok: true,
        protocolName: labelDexFactory(factory.id),
        tvlUsd: factory.totalValueLockedUSD ?? null,
        extra: {
          poolCount: factory.poolCount ?? null,
          txCount: factory.txCount ?? null,
        },
      };
    }

    const err = first.errors?.[0]?.message ?? second.errors?.[0]?.message ?? 'empty subgraph result';
    return {
      endpoint: redactEndpoint(endpoint),
      ok: false,
      protocolName: sourceLabel,
      tvlUsd: null,
      extra: {},
      error: err,
    };
  } catch (err) {
    return {
      endpoint: redactEndpoint(endpoint),
      ok: false,
      protocolName: sourceLabel,
      tvlUsd: null,
      extra: {},
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function redactEndpoint(url: string): string {
  try {
    const u = new URL(url);
    u.search = '';
    u.username = '';
    u.password = '';
    const path = u.pathname.replace(/\/api\/[^/]+\/subgraphs\//, '/api/***/subgraphs/');
    return `${u.origin}${path}`;
  } catch {
    return 'invalid-url';
  }
}

function labelDexFactory(factoryId: string | undefined): string {
  if ((factoryId ?? '').toLowerCase() === UNISWAP_V2_FACTORY) {
    return 'Uniswap V2 (DEX)';
  }
  return `DEX factory:${factoryId ?? 'unknown'}`;
}

export function displayProtocolName(snapshot: GraphProtocolSnapshot): string {
  if (snapshot.protocolName) {
    if (snapshot.protocolName.toLowerCase().includes('compound')) {
      return 'Compound V2 (lending)';
    }
    return snapshot.protocolName;
  }
  const subgraphId = subgraphIdFromEndpoint(snapshot.endpoint);
  if (subgraphId && SUBGRAPH_LABELS[subgraphId]) {
    return SUBGRAPH_LABELS[subgraphId];
  }
  return 'Protocol';
}

function subgraphIdFromEndpoint(endpoint: string): string | null {
  const match = endpoint.match(/\/subgraphs\/id\/([^/]+)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

function isLending(snapshot: GraphProtocolSnapshot): boolean {
  const name = displayProtocolName(snapshot).toLowerCase();
  return name.includes('compound') || name.includes('lending');
}

function isDex(snapshot: GraphProtocolSnapshot): boolean {
  const name = displayProtocolName(snapshot).toLowerCase();
  return name.includes('uniswap') || name.includes('dex');
}

export function classifyAssignment(assignment: string): CaseIntent {
  const q = assignment.toLowerCase();
  if (/approve|vendor|invoice|batch|settle/.test(q)) return 'vendor_approval';
  if (/month-end|month end|normal|volume|close/.test(q)) return 'volume_normality';
  if (/idle|surplus|yield|deploy|holding/.test(q)) return 'yield_deploy';
  if (/alert|outflow|unusual|stress|investigate|triage/.test(q)) return 'stress_triage';
  if (/board|summarize|brief|one-page|one page/.test(q)) return 'board_brief';
  if (/lend|compound|borrow/.test(q)) return 'yield_deploy';
  if (/uniswap|dex|swap|liquidity/.test(q)) return 'stress_triage';
  return 'general';
}

export function selectChartGraph(
  graph: GraphProtocolSnapshot[],
  intent: CaseIntent,
): GraphProtocolSnapshot[] {
  const live = graph.filter((g) => g.ok);
  switch (intent) {
    case 'vendor_approval':
    case 'yield_deploy':
      return live.filter(isLending);
    case 'stress_triage':
      return live.filter(isDex);
    case 'volume_normality':
    case 'board_brief':
      return live;
    case 'general': {
      const lending = live.filter(isLending);
      const dex = live.filter(isDex);
      if (lending.length > 0 && dex.length === 0) return lending;
      if (dex.length > 0 && lending.length === 0) return dex;
      if (lending.length === 1) return lending;
      if (dex.length === 1) return dex;
      return live.slice(0, 1);
    }
  }
}

export function chartTitleForIntent(intent: CaseIntent): string {
  switch (intent) {
    case 'vendor_approval':
      return 'Lending pool depth (relevant to approval)';
    case 'yield_deploy':
      return 'Lending market size';
    case 'stress_triage':
      return 'DEX liquidity (stress indicator)';
    case 'volume_normality':
      return 'Market depth vs treasury activity';
    case 'board_brief':
      return 'DeFi market context';
    default:
      return 'Relevant market data';
  }
}

function parseTvlUsd(raw: string | null | undefined): number {
  const n = Number.parseFloat(String(raw ?? ''));
  return Number.isFinite(n) ? n : 0;
}

function formatUsd(n: number): string {
  if (n <= 0) return 'n/a';
  const abs = Math.abs(n);
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function findLending(graph: GraphProtocolSnapshot[]): GraphProtocolSnapshot | undefined {
  return graph.find((g) => g.ok && isLending(g));
}

function findDex(graph: GraphProtocolSnapshot[]): GraphProtocolSnapshot | undefined {
  return graph.find((g) => g.ok && isDex(g));
}

function lendingLine(g: GraphProtocolSnapshot | undefined): string | null {
  if (!g) return null;
  if (!g.ok) return `Compound V2 lending data unavailable (${g.error ?? 'query failed'}).`;
  return `Compound V2 lending TVL: ${formatUsd(parseTvlUsd(g.tvlUsd))} (The Graph).`;
}

function dexLine(g: GraphProtocolSnapshot | undefined): string | null {
  if (!g) return null;
  if (!g.ok) return `Uniswap V2 DEX data unavailable (${g.error ?? 'query failed'}).`;
  const pools = g.extra.poolCount != null ? ` across ${g.extra.poolCount} pools` : '';
  return `Uniswap V2 DEX TVL: ${formatUsd(parseTvlUsd(g.tvlUsd))}${pools} (The Graph).`;
}

function treasuryLine(accountId: string, txCount: number): string {
  if (txCount === 0) {
    return `Treasury account ${accountId} on Hedera testnet: no recent beat-payment transfers in this window.`;
  }
  return `Treasury account ${accountId} on Hedera testnet: ${txCount} recent beat-payment transfer${txCount === 1 ? '' : 's'} in this check.`;
}

function answerVendorApproval(
  lending: GraphProtocolSnapshot | undefined,
  txCount: number,
  accountId: string,
): string {
  const tvl = parseTvlUsd(lending?.tvlUsd);
  const deepPool = lending?.ok && tvl >= 50_000_000;
  const lowActivity = txCount <= 3;

  if (deepPool && lowActivity) {
    return `Approve the vendor batch. Lending pools are deep (${formatUsd(tvl)} on Compound V2) and ${accountId} shows only routine settlement traffic (${txCount} transfer${txCount === 1 ? '' : 's'}) — no sign of abnormal outbound pressure.`;
  }
  if (deepPool && !lowActivity) {
    return `Hold the batch for 24 hours. Pool depth is healthy (${formatUsd(tvl)} on Compound V2), but ${accountId} logged ${txCount} recent transfers — higher than baseline — so reconcile those outflows before releasing invoices.`;
  }
  if (!lending?.ok) {
    return lowActivity
      ? `Conditional approve: Hedera activity on ${accountId} looks routine (${txCount} transfer${txCount === 1 ? '' : 's'}), but live lending data is missing — confirm Compound depth manually before signing.`
      : `Do not approve yet. ${accountId} shows elevated transfer activity (${txCount}) and live lending data is unavailable.`;
  }
  return `Review before approving. Compound TVL is ${formatUsd(tvl)} (shallower than our comfort band) and ${accountId} has ${txCount} recent transfer${txCount === 1 ? '' : 's'}.`;
}

function answerVolumeNormality(
  lending: GraphProtocolSnapshot | undefined,
  dex: GraphProtocolSnapshot | undefined,
  txCount: number,
  accountId: string,
): string {
  const lendTvl = parseTvlUsd(lending?.tvlUsd);
  const dexTvl = parseTvlUsd(dex?.tvlUsd);
  const marketScale = lendTvl + dexTvl;
  const normal = txCount <= 5;

  if (marketScale > 0) {
    const scale = formatUsd(marketScale);
    return normal
      ? `Yes — volume looks normal for month-end. ${accountId} recorded ${txCount} transfer${txCount === 1 ? '' : 's'} while combined Compound + Uniswap depth is ${scale}; treasury outflows are negligible versus on-chain market size.`
      : `No — volume is elevated. ${accountId} logged ${txCount} transfers against a combined market depth of ${scale}; flag this account for reconciliation before close.`;
  }
  return normal
    ? `${accountId} shows ${txCount} transfer${txCount === 1 ? '' : 's'} — within a typical month-end band, but Graph market data was unavailable to cross-check scale.`
    : `${accountId} shows ${txCount} transfers — above our usual month-end band. Investigate line items even though Graph market data was unavailable.`;
}

function answerYieldDeploy(lending: GraphProtocolSnapshot | undefined, accountId: string): string {
  const tvl = parseTvlUsd(lending?.tvlUsd);
  if (lending?.ok && tvl >= 100_000_000) {
    return `Yes — deploy idle treasury balance into yield evaluation now. Compound V2 reports ${formatUsd(tvl)} TVL, enough depth for ${accountId} to place a pilot allocation without moving the market.`;
  }
  if (lending?.ok && tvl > 0) {
    return `Proceed with a small pilot only. Compound V2 TVL is ${formatUsd(tvl)} — workable but not deep enough for a full ${accountId} deployment in one tranche.`;
  }
  return `Wait on deployment. Live Compound lending data is unavailable; do not route ${accountId} surplus into yield until pool depth is confirmed.`;
}

function answerStressTriage(
  dex: GraphProtocolSnapshot | undefined,
  txCount: number,
  accountId: string,
): string {
  const tvl = parseTvlUsd(dex?.tvlUsd);
  const liquidityHealthy = dex?.ok && tvl >= 100_000_000;

  if (liquidityHealthy && txCount <= 3) {
    return `Investigate ${accountId} first, not macro stress. Uniswap V2 still shows ${formatUsd(tvl)} DEX liquidity — markets are not in a liquidity-crunch pattern; the alert is likely account-specific (${txCount} recent transfer${txCount === 1 ? '' : 's'} on this wallet).`;
  }
  if (liquidityHealthy && txCount > 3) {
    return `Dual track: ${accountId} has ${txCount} recent transfers (unusual) while Uniswap V2 liquidity remains ${formatUsd(tvl)}. Prioritize internal outflow forensics; external DeFi stress is not the primary signal.`;
  }
  if (!dex?.ok) {
    return `Treat as account-specific until DEX data returns. ${accountId} logged ${txCount} transfer${txCount === 1 ? '' : 's'}; Uniswap subgraph did not respond, so we cannot clear macro liquidity stress from Graph alone.`;
  }
  return `External stress possible. Uniswap V2 TVL is only ${formatUsd(tvl)} while ${accountId} shows ${txCount} transfer${txCount === 1 ? '' : 's'} — widen monitoring across treasury wallets and DEX venues.`;
}

function answerBoardBrief(
  lending: GraphProtocolSnapshot | undefined,
  dex: GraphProtocolSnapshot | undefined,
  txCount: number,
  accountId: string,
): string {
  const parts: string[] = [];
  const lend = lendingLine(lending);
  const dexL = dexLine(dex);
  if (lend) parts.push(lend);
  if (dexL) parts.push(dexL);
  const market =
    parts.length > 0 ? parts.join(' ') : 'Live Graph sources did not respond for this brief.';
  return `Board summary: ${accountId} executed ${txCount} on-chain settlement${txCount === 1 ? '' : 's'} on Hedera testnet in this window. ${market} Net: treasury activity is ${txCount <= 3 ? 'light' : 'active'} relative to current DeFi depth — ${txCount <= 3 ? 'no material market-stress linkage required in the narrative.' : 'note the higher transfer count in the appendix.'}`;
}

function answerGeneral(
  assignment: string,
  lending: GraphProtocolSnapshot | undefined,
  dex: GraphProtocolSnapshot | undefined,
  txCount: number,
  accountId: string,
): string {
  const q = assignment.toLowerCase();
  if (/should i|approve|can we|is it safe|worth/.test(q)) {
    return answerVendorApproval(lending, txCount, accountId);
  }
  if (/how much|what is|size|depth|tvl/.test(q) && isLending(lending ?? { ok: false, endpoint: '', protocolName: '', tvlUsd: null, extra: {} })) {
    const tvl = formatUsd(parseTvlUsd(lending?.tvlUsd));
    return `Compound V2 lending TVL is ${tvl}. ${accountId} shows ${txCount} recent Hedera transfer${txCount === 1 ? '' : 's'} in the same window.`;
  }
  if (lending?.ok && !dex?.ok) {
    return `Based on live data: Compound V2 at ${formatUsd(parseTvlUsd(lending.tvlUsd))}; ${treasuryLine(accountId, txCount).toLowerCase()}`;
  }
  if (dex?.ok && !lending?.ok) {
    return `Based on live data: Uniswap V2 at ${formatUsd(parseTvlUsd(dex.tvlUsd))}; ${treasuryLine(accountId, txCount).toLowerCase()}`;
  }
  return answerBoardBrief(lending, dex, txCount, accountId);
}

export type BeatAnalysis = {
  intent: CaseIntent;
  chartGraph: GraphProtocolSnapshot[];
  chartTitle: string;
  reasoning: string;
};

function formatDataAsOf(quotedAt?: string): string {
  if (!quotedAt) return '';
  try {
    return new Date(quotedAt).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, ' UTC');
  } catch {
    return quotedAt;
  }
}

export function analyzeBeat(
  assignment: string,
  graph: GraphProtocolSnapshot[],
  txCount: number,
  accountId: string,
  quotedAt?: string,
): BeatAnalysis {
  const intent = classifyAssignment(assignment);
  const chartGraph = selectChartGraph(graph, intent);
  const lending = findLending(graph);
  const dex = findDex(graph);

  if (graph.length === 0) {
    return {
      intent,
      chartGraph: [],
      chartTitle: chartTitleForIntent(intent),
      reasoning: `Answer: Unable to pull live DeFi data (Graph not configured). ${treasuryLine(accountId, txCount)} Re-run after GRAPH_QUERY_URLS is set, or base the decision on Hedera mirror activity alone.`,
    };
  }

  let conclusion: string;
  switch (intent) {
    case 'vendor_approval':
      conclusion = answerVendorApproval(lending, txCount, accountId);
      break;
    case 'volume_normality':
      conclusion = answerVolumeNormality(lending, dex, txCount, accountId);
      break;
    case 'yield_deploy':
      conclusion = answerYieldDeploy(lending, accountId);
      break;
    case 'stress_triage':
      conclusion = answerStressTriage(dex, txCount, accountId);
      break;
    case 'board_brief':
      conclusion = answerBoardBrief(lending, dex, txCount, accountId);
      break;
    default:
      conclusion = answerGeneral(assignment, lending, dex, txCount, accountId);
  }

  const evidence: string[] = [];
  if (intent === 'vendor_approval' || intent === 'yield_deploy') {
    const line = lendingLine(lending);
    if (line) evidence.push(line);
  } else if (intent === 'stress_triage') {
    const line = dexLine(dex);
    if (line) evidence.push(line);
  } else {
    const lend = lendingLine(lending);
    const dexL = dexLine(dex);
    if (lend) evidence.push(lend);
    if (dexL) evidence.push(dexL);
  }
  evidence.push(treasuryLine(accountId, txCount));
  const asOf = formatDataAsOf(quotedAt);
  if (asOf) evidence.push(`Data as of ${asOf} (The Graph + Hedera mirror).`);

  const reasoning = `${conclusion}\n\nEvidence:\n${evidence.map((l) => `• ${l}`).join('\n')}`;

  return {
    intent,
    chartGraph,
    chartTitle: chartTitleForIntent(intent),
    reasoning,
  };
}

/** @deprecated use analyzeBeat — kept for tests */
export function reasonAboutBeats(
  assignment: string,
  graph: GraphProtocolSnapshot[],
  txCount: number,
  accountId: string,
): string {
  return analyzeBeat(assignment, graph, txCount, accountId).reasoning;
}
