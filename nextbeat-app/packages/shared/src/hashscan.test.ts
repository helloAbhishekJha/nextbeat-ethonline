import { describe, expect, it } from 'vitest';
import { hashscanTransactionUrl, mirrorTransactionId, normalizeHederaTxId } from './hashscan.js';

describe('normalizeHederaTxId', () => {
  it('converts mirror hyphen form', () => {
    expect(normalizeHederaTxId('0.0.7162784-1789310127-159311069')).toBe(
      '0.0.7162784@1789310127.159311069',
    );
  });
});

describe('mirrorTransactionId', () => {
  it('converts at form to hyphen', () => {
    expect(mirrorTransactionId('0.0.7162784@1789316799.254727691')).toBe(
      '0.0.7162784-1789316799-254727691',
    );
  });
});

describe('hashscanTransactionUrl', () => {
  it('uses consensus timestamp with tid query', () => {
    expect(
      hashscanTransactionUrl('testnet', {
        txId: '0.0.7162784-1789316799-254727691',
        consensusTimestamp: '1789316805.391572804',
      }),
    ).toBe(
      'https://hashscan.io/testnet/transaction/1789316805.391572804?tid=0.0.7162784-1789316799-254727691',
    );
  });

  it('falls back to hyphen transaction path', () => {
    expect(
      hashscanTransactionUrl('testnet', { txId: '0.0.7162784-1789316799-254727691' }),
    ).toBe('https://hashscan.io/testnet/transaction/0.0.7162784-1789316799-254727691');
  });
});
