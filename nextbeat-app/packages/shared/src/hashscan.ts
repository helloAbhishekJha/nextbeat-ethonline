/** Mirror node hyphen form → HashScan `account@seconds.nanos`. */
export function normalizeHederaTxId(txId: string): string {
  const trimmed = txId.trim();
  const brokenAt = trimmed.match(/^(\d+\.\d+\.\d+)@(\d+)-(\d+)$/);
  if (brokenAt) return `${brokenAt[1]}@${brokenAt[2]}.${brokenAt[3]}`;

  if (trimmed.includes('@')) return trimmed;

  const hyphen = trimmed.match(/^(\d+\.\d+\.\d+)-(\d+)-(\d+)$/);
  if (hyphen) return `${hyphen[1]}@${hyphen[2]}.${hyphen[3]}`;

  return trimmed;
}

/** HashScan / mirror API hyphen form: `0.0.x-seconds-nanos`. */
export function mirrorTransactionId(txId: string): string {
  const trimmed = txId.trim();
  if (/^\d+\.\d+\.\d+-\d+-\d+$/.test(trimmed)) return trimmed;
  const normalized = normalizeHederaTxId(trimmed);
  const at = normalized.match(/^(\d+\.\d+\.\d+)@(\d+)\.(\d+)$/);
  if (at) return `${at[1]}-${at[2]}-${at[3]}`;
  return trimmed;
}

export function hashscanTransactionUrl(
  network: 'testnet' | 'mainnet',
  opts: { txId?: string | null; consensusTimestamp?: string | null },
): string | null {
  const hyphenId = opts.txId ? mirrorTransactionId(opts.txId) : null;
  const ts = opts.consensusTimestamp?.trim();

  if (ts && hyphenId) {
    return `https://hashscan.io/${network}/transaction/${ts}?tid=${encodeURIComponent(hyphenId)}`;
  }
  if (ts) return `https://hashscan.io/${network}/transaction/${ts}`;
  if (hyphenId) return `https://hashscan.io/${network}/transaction/${hyphenId}`;
  return null;
}
