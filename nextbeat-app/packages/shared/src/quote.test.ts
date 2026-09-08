import { describe, expect, it } from 'vitest';
import { quoteBeat } from './quote.js';

describe('quoteBeat', () => {
  it('charges base only when there is no depth', () => {
    const q = quoteBeat({
      baseTinybars: 1000n,
      capTinybars: 100000n,
      transactionCount: 0,
      graphRowCount: 0,
    });
    expect(q.tinybars).toBe(1000n);
    expect(q.components.capped).toBe(false);
  });

  it('adds per-tx and per-row metering', () => {
    const q = quoteBeat({
      baseTinybars: 1000n,
      capTinybars: 100000n,
      transactionCount: 3,
      graphRowCount: 2,
    });
    expect(q.tinybars).toBe(1000n + 300n + 100n);
  });

  it('never exceeds the cap', () => {
    const q = quoteBeat({
      baseTinybars: 1000n,
      capTinybars: 1500n,
      transactionCount: 100,
      graphRowCount: 100,
    });
    expect(q.tinybars).toBe(1500n);
    expect(q.components.capped).toBe(true);
  });
});
