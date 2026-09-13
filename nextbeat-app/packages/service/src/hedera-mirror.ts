import type { HederaAccountBrief } from '@nextbeat/shared';
import { fetchJson } from './http.js';

type MirrorAccount = {
  account?: string;
  evm_address?: string;
  balance?: { balance?: number };
};

type MirrorTransfer = {
  account?: string;
  amount?: number;
};

type MirrorTx = {
  transactions?: Array<{
    transaction_id?: string;
    name?: string;
    result?: string;
    consensus_timestamp?: string;
    transfers?: MirrorTransfer[];
  }>;
};

function beatPaymentLabel(
  transfers: MirrorTransfer[],
  agentId: string,
  serviceId: string,
): string | null {
  const agent = transfers.find((t) => t.account === agentId && (t.amount ?? 0) < 0);
  const service = transfers.find((t) => t.account === serviceId && (t.amount ?? 0) > 0);
  if (!agent || !service) return null;
  const tinybars = service.amount ?? 0;
  return `Beat payment: ${agentId} → ${serviceId} (${tinybars} tinybars)`;
}

function isAppBeatPayment(
  transfers: MirrorTransfer[],
  agentId: string | undefined,
  serviceId: string | undefined,
): boolean {
  if (!agentId || !serviceId) return false;
  return beatPaymentLabel(transfers, agentId, serviceId) != null;
}

export async function fetchAccountBalanceTinybars(
  mirrorBase: string,
  accountId: string,
): Promise<string | null> {
  const base = mirrorBase.replace(/\/$/, '');
  const account = await fetchJson<MirrorAccount>(
    `${base}/api/v1/accounts/${encodeURIComponent(accountId)}`,
  );
  return account.balance?.balance != null ? String(account.balance.balance) : null;
}

export async function loadHederaBrief(
  mirrorBase: string,
  accountId: string,
  limit: number,
  opts?: { agentAccountId?: string; serviceAccountId?: string },
): Promise<HederaAccountBrief> {
  const base = mirrorBase.replace(/\/$/, '');
  const agentId = opts?.agentAccountId;
  const serviceId = opts?.serviceAccountId ?? accountId;
  const fetchLimit = agentId && serviceId ? Math.min(limit * 5, 25) : limit;

  const [account, txs] = await Promise.all([
    fetchJson<MirrorAccount>(`${base}/api/v1/accounts/${encodeURIComponent(accountId)}`),
    fetchJson<MirrorTx>(
      `${base}/api/v1/transactions?account.id=${encodeURIComponent(accountId)}&limit=${fetchLimit}&order=desc`,
    ),
  ]);

  const mapped = (txs.transactions ?? []).map((t) => {
    const transfers = t.transfers ?? [];
    const label =
      agentId && serviceId ? beatPaymentLabel(transfers, agentId, serviceId) : null;
    return {
      transactionId: t.transaction_id ?? '',
      name: t.name ?? '',
      result: t.result ?? '',
      consensusTimestamp: t.consensus_timestamp ?? '',
      ...(label ? { label } : {}),
      transfers,
    };
  });

  const filtered =
    agentId && serviceId
      ? mapped.filter((t) => isAppBeatPayment(t.transfers, agentId, serviceId)).slice(0, limit)
      : mapped.slice(0, limit);

  return {
    accountId: account.account ?? accountId,
    balanceTinybars: account.balance?.balance != null ? String(account.balance.balance) : null,
    evmAddress: account.evm_address ?? null,
    transactions: filtered.map(({ transfers: _t, ...tx }) => tx),
  };
}
