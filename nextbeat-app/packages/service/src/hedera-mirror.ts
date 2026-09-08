import type { HederaAccountBrief } from '@nextbeat/shared';
import { fetchJson } from './http.js';

type MirrorAccount = {
  account?: string;
  evm_address?: string;
  balance?: { balance?: number };
};

type MirrorTx = {
  transactions?: Array<{
    transaction_id?: string;
    name?: string;
    result?: string;
    consensus_timestamp?: string;
  }>;
};

export async function loadHederaBrief(
  mirrorBase: string,
  accountId: string,
  limit: number,
): Promise<HederaAccountBrief> {
  const base = mirrorBase.replace(/\/$/, '');
  const [account, txs] = await Promise.all([
    fetchJson<MirrorAccount>(`${base}/api/v1/accounts/${encodeURIComponent(accountId)}`),
    fetchJson<MirrorTx>(
      `${base}/api/v1/transactions?account.id=${encodeURIComponent(accountId)}&limit=${limit}&order=desc`,
    ),
  ]);

  return {
    accountId: account.account ?? accountId,
    balanceTinybars: account.balance?.balance != null ? String(account.balance.balance) : null,
    evmAddress: account.evm_address ?? null,
    transactions: (txs.transactions ?? []).map((t) => ({
      transactionId: t.transaction_id ?? '',
      name: t.name ?? '',
      result: t.result ?? '',
      consensusTimestamp: t.consensus_timestamp ?? '',
    })),
  };
}
