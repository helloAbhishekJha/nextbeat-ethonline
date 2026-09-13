export type GraphProtocolSnapshot = {
  endpoint: string;
  ok: boolean;
  protocolName: string | null;
  tvlUsd: string | null;
  extra: Record<string, string | number | null>;
  error?: string;
};

export type HederaAccountBrief = {
  accountId: string;
  balanceTinybars: string | null;
  evmAddress: string | null;
  transactions: Array<{
    transactionId: string;
    name: string;
    result: string;
    consensusTimestamp: string;
    /** Human label when this is an agent → treasury beat payment. */
    label?: string;
  }>;
};

import type { AgentRun } from './agent-run.js';

export type BeatPayload = {
  assignment: string;
  network: 'hedera:testnet';
  quotedAt: string;
  priceTinybars: string;
  hedera: HederaAccountBrief;
  graph: GraphProtocolSnapshot[];
  /** Subset of graph rows to chart for this question (not always Compound + Uniswap). */
  chartGraph?: GraphProtocolSnapshot[];
  chartTitle?: string;
  caseIntent?: string;
  reasoning: string;
  reasoningSource?: 'llm' | 'template';
  llmProvider?: string;
  llmModel?: string;
  /** Sponsor-aligned agent tool trace for this beat */
  agentRun?: AgentRun;
  hcs?: { topicId: string; status: string };
};

export class NextBeatError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status = 400,
  ) {
    super(message);
    this.name = 'NextBeatError';
  }
}
