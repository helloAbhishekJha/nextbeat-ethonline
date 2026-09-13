import { hashscanTransactionUrl, mirrorTransactionId } from '@nextbeat/shared';

type MirrorTransfer = { account?: string; amount?: number };
type MirrorTxResponse = {
  transactions?: Array<{
    transaction_id?: string;
    consensus_timestamp?: string;
    result?: string;
    transfers?: MirrorTransfer[];
  }>;
};

export type PaymentTransferLine = {
  accountId: string;
  amountTinybars: number;
  role: 'agent' | 'treasury' | 'facilitator' | 'network' | 'other';
};

export type PaymentProof = {
  transactionId: string;
  consensusTimestamp: string | null;
  hashscan: string | null;
  result: string | null;
  transfers: PaymentTransferLine[];
  agentToTreasuryTinybars: number | null;
};

function roleForAccount(
  account: string,
  agentId: string | undefined,
  serviceId: string | undefined,
  facilitatorId: string | null,
): PaymentTransferLine['role'] {
  if (agentId && account === agentId) return 'agent';
  if (serviceId && account === serviceId) return 'treasury';
  if (facilitatorId && account === facilitatorId) return 'facilitator';
  if (account === '0.0.802') return 'network';
  return 'other';
}

export async function fetchPaymentProof(
  mirrorBase: string,
  paymentTxId: string,
  opts: { agentAccountId?: string; serviceAccountId?: string; facilitatorId?: string | null },
): Promise<PaymentProof | null> {
  const hyphenId = mirrorTransactionId(paymentTxId);
  const base = mirrorBase.replace(/\/$/, '');
  try {
    const res = await fetch(
      `${base}/api/v1/transactions/${encodeURIComponent(hyphenId)}`,
    );
    if (!res.ok) return null;
    const data = (await res.json()) as MirrorTxResponse;
    const tx = data.transactions?.[0];
    if (!tx) return null;

    const facilitatorId = opts.facilitatorId ?? hyphenId.match(/^(\d+\.\d+\.\d+)/)?.[1] ?? null;
    const transfers = (tx.transfers ?? [])
      .filter((t) => t.account && (t.amount ?? 0) !== 0)
      .map((t) => ({
        accountId: t.account!,
        amountTinybars: t.amount ?? 0,
        role: roleForAccount(t.account!, opts.agentAccountId, opts.serviceAccountId, facilitatorId),
      }));

    const agentDebit = transfers.find((t) => t.role === 'agent' && t.amountTinybars < 0);
    const treasuryCredit = transfers.find((t) => t.role === 'treasury' && t.amountTinybars > 0);
    const agentToTreasury =
      agentDebit && treasuryCredit ? Math.abs(agentDebit.amountTinybars) : null;

    const consensusTimestamp = tx.consensus_timestamp ?? null;
    return {
      transactionId: tx.transaction_id ?? hyphenId,
      consensusTimestamp,
      hashscan: hashscanTransactionUrl('testnet', {
        txId: tx.transaction_id ?? hyphenId,
        consensusTimestamp,
      }),
      result: tx.result ?? null,
      transfers,
      agentToTreasuryTinybars: agentToTreasury,
    };
  } catch {
    return null;
  }
}
