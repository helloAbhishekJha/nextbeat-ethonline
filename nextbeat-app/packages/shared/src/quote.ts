/** Metered quote: floor + depth, never above cap. All amounts in tinybars. */
export type QuoteInput = {
  baseTinybars: bigint;
  capTinybars: bigint;
  transactionCount: number;
  graphRowCount: number;
  perTransactionTinybars?: bigint;
  perGraphRowTinybars?: bigint;
};

export type QuoteResult = {
  tinybars: bigint;
  components: {
    base: bigint;
    transactions: bigint;
    graphRows: bigint;
    uncapped: bigint;
    capped: boolean;
  };
};

const PER_TX = 100n;
const PER_ROW = 50n;

export function quoteBeat(input: QuoteInput): QuoteResult {
  const perTx = input.perTransactionTinybars ?? PER_TX;
  const perRow = input.perGraphRowTinybars ?? PER_ROW;
  const txCount = Math.max(0, input.transactionCount);
  const rows = Math.max(0, input.graphRowCount);

  const txCost = perTx * BigInt(txCount);
  const rowCost = perRow * BigInt(rows);
  const uncapped = input.baseTinybars + txCost + rowCost;
  const capped = uncapped > input.capTinybars;
  const tinybars = capped ? input.capTinybars : uncapped;

  if (tinybars < 1n) {
    throw new Error('Quote must be at least 1 tinybar');
  }

  return {
    tinybars,
    components: {
      base: input.baseTinybars,
      transactions: txCost,
      graphRows: rowCost,
      uncapped,
      capped,
    },
  };
}
