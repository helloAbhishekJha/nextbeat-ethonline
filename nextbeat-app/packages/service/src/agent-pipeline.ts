import type { AgentRun, GraphProtocolSnapshot } from '@nextbeat/shared';
import { TREASURY_AGENT_FRAMEWORK } from '@nextbeat/shared';

export function buildTreasuryAgentRun(opts: {
  graph: GraphProtocolSnapshot[];
  graphRowCount: number;
  txCount: number;
  accountId: string;
  reasoningSource: 'llm' | 'template';
  llmProvider?: string;
  llmModel?: string;
  presetCase: boolean;
  hcsPublished: boolean;
}): AgentRun {
  const graphOk = opts.graph.filter((g) => g.ok).length;
  const protocols = opts.graph
    .filter((g) => g.ok)
    .map((g) => g.protocolName ?? 'protocol')
    .join(', ');

  const reasonTool =
    opts.reasoningSource === 'llm'
      ? `LLM synthesis (${opts.llmProvider ?? 'openai'} / ${opts.llmModel ?? 'gpt-4o-mini'})`
      : 'Treasury case template (preset workflow)';

  return {
    framework: TREASURY_AGENT_FRAMEWORK,
    steps: [
      {
        id: 'world_human_gate',
        sponsor: 'world',
        tool: 'Selfie Check (IDKit v4)',
        status: 'ok',
        summary:
          'Human operator authorized on desk before agent wallet spend (World gate on POST /api/buy).',
      },
      {
        id: 'graph_subgraph_query',
        sponsor: 'graph',
        tool: 'Studio gateway GraphQL',
        status: graphOk > 0 ? 'ok' : opts.graph.length === 0 ? 'skipped' : 'failed',
        summary:
          graphOk > 0
            ? `Queried ${graphOk} live subgraph(s): ${protocols}.`
            : 'No live Graph rows — check GRAPH_QUERY_URLS + GRAPH_API_KEY.',
      },
      {
        id: 'hedera_mirror',
        sponsor: 'hedera',
        tool: 'Hedera Mirror Node REST',
        status: 'ok',
        summary: `Loaded treasury ${opts.accountId}: ${opts.txCount} recent beat-payment transfer(s).`,
      },
      {
        id: 'treasury_reason',
        sponsor: 'nextbeat',
        tool: reasonTool,
        status: 'ok',
        summary: opts.presetCase
          ? 'Preset treasury case — template answer with live Graph + Hedera evidence.'
          : 'Custom question — Graph-grounded LLM answer (gpt-4o-mini).',
      },
      {
        id: 'hedera_x402_settle',
        sponsor: 'hedera',
        tool: 'x402 exact / Blocky402 facilitator',
        status: 'ok',
        summary: `Agent wallet paid beat fee in tinybars; service returned brief after settle.`,
      },
      ...(opts.hcsPublished
        ? [
            {
              id: 'hedera_hcs_receipt',
              sponsor: 'hedera' as const,
              tool: 'HCS topic message',
              status: 'ok' as const,
              summary: 'Brief receipt hash published to configured HCS topic.',
            },
          ]
        : []),
    ],
  };
}
