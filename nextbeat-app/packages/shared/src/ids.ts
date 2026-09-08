export const TINYBARS_PER_HBAR = 100_000_000n;

export function tinybarsToHbar(tinybars: bigint): number {
  return Number(tinybars) / Number(TINYBARS_PER_HBAR);
}

export function parsePositiveInt(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

export const HEDERA_ACCOUNT_RE = /^0\.0\.\d+$/;

export function assertHederaAccountId(id: string): string {
  const trimmed = id.trim();
  if (!HEDERA_ACCOUNT_RE.test(trimmed)) {
    throw new Error(`Invalid Hedera account id: ${id}`);
  }
  return trimmed;
}
