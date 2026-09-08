import type { GraphProtocolSnapshot } from '@nextbeat/shared';
import { fetchJson } from './http.js';

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

async function queryOne(endpoint: string, apiKey: string | undefined): Promise<GraphProtocolSnapshot> {
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
        protocolName: `factory:${factory.id ?? 'unknown'}`,
        tvlUsd: factory.totalValueLockedUSD ?? null,
        extra: {
          poolCount: factory.poolCount ?? null,
          txCount: factory.txCount ?? null,
        },
      };
    }

    const err = first.errors?.[0]?.message ?? second.errors?.[0]?.message ?? 'empty subgraph result';
    return { endpoint: redactEndpoint(endpoint), ok: false, protocolName: null, tvlUsd: null, extra: {}, error: err };
  } catch (err) {
    return {
      endpoint: redactEndpoint(endpoint),
      ok: false,
      protocolName: null,
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
    return `${u.origin}${u.pathname}`;
  } catch {
    return 'invalid-url';
  }
}

export function reasonAboutBeats(
  assignment: string,
  graph: GraphProtocolSnapshot[],
  txCount: number,
  accountId: string,
): string {
  const live = graph.filter((g) => g.ok);
  if (live.length === 0) {
    return `Beat 1 skipped: no live Graph endpoints. Hedera beat still covers ${accountId} (${txCount} recent txs). Configure GRAPH_QUERY_URLS for The Graph prize. Assignment: ${assignment}`;
  }
  const lines = live.map((g) => {
    const tvl = g.tvlUsd ?? 'n/a';
    return `${g.protocolName ?? 'protocol'} TVL_USD=${tvl}`;
  });
  return `Assignment “${assignment}”: standardized snapshot across ${live.length} protocol subgraph(s): ${lines.join('; ')}. Hedera account ${accountId} shows ${txCount} recent testnet txs in this beat. Compare protocol TVL/activity (Graph) with this account’s settlement trail (Hedera) — do not treat either feed as the other chain.`;
}
