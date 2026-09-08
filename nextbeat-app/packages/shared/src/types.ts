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
  }>;
};

export type BeatPayload = {
  assignment: string;
  network: 'hedera:testnet';
  quotedAt: string;
  priceTinybars: string;
  hedera: HederaAccountBrief;
  graph: GraphProtocolSnapshot[];
  reasoning: string;
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
