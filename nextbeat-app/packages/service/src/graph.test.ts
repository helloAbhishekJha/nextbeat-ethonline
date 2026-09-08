import { describe, expect, it } from 'vitest';
import { reasonAboutBeats } from './graph.js';

describe('reasonAboutBeats', () => {
  it('explains missing Graph config', () => {
    const text = reasonAboutBeats('risk', [], 2, '0.0.3');
    expect(text).toContain('GRAPH_QUERY_URLS');
    expect(text).toContain('0.0.3');
  });

  it('compares live protocols without dumping raw graphql', () => {
    const text = reasonAboutBeats('risk', [
      { endpoint: 'https://example.test/a', ok: true, protocolName: 'Aave', tvlUsd: '1', extra: {} },
      { endpoint: 'https://example.test/b', ok: true, protocolName: 'Compound', tvlUsd: '2', extra: {} },
    ], 4, '0.0.98');
    expect(text).toContain('Aave');
    expect(text).toContain('Compound');
    expect(text).toContain('2 protocol');
  });
});
