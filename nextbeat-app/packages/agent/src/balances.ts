type MirrorAccount = {
  account?: string;
  balance?: { balance?: number };
};

export type WalletBalance = {
  accountId: string;
  tinybars: string | null;
};

export async function fetchWalletBalances(
  mirrorBase: string,
  accountIds: string[],
): Promise<WalletBalance[]> {
  const base = mirrorBase.replace(/\/$/, '');
  return Promise.all(
    accountIds.map(async (accountId) => {
      try {
        const res = await fetch(`${base}/api/v1/accounts/${encodeURIComponent(accountId)}`);
        if (!res.ok) return { accountId, tinybars: null };
        const data = (await res.json()) as MirrorAccount;
        return {
          accountId: data.account ?? accountId,
          tinybars: data.balance?.balance != null ? String(data.balance.balance) : null,
        };
      } catch {
        return { accountId, tinybars: null };
      }
    }),
  );
}

export function facilitatorFromTxId(txId: string | null | undefined): string | null {
  if (!txId) return null;
  const match = String(txId).match(/^(\d+\.\d+\.\d+)/);
  return match?.[1] ?? null;
}
