import { describe, expect, it } from 'vitest';
import {
  analyzeBeat,
  classifyAssignment,
  reasonAboutBeats,
  selectChartGraph,
} from './graph.js';

const compound = {
  endpoint: 'https://example.test/a',
  ok: true,
  protocolName: 'Compound v2',
  tvlUsd: '500000000',
  extra: {},
};

const uniswap = {
  endpoint: 'https://example.test/b',
  ok: true,
  protocolName: 'Uniswap V2 (DEX)',
  tvlUsd: '2000000000',
  extra: { poolCount: '42' },
};

describe('classifyAssignment', () => {
  it('maps sample cases to distinct intents', () => {
    expect(classifyAssignment('approve vendor invoice batch')).toBe('vendor_approval');
    expect(classifyAssignment('month-end close volume normal')).toBe('volume_normality');
    expect(classifyAssignment('idle surplus yield deploy')).toBe('yield_deploy');
    expect(classifyAssignment('alert unusual outflow stress')).toBe('stress_triage');
    expect(classifyAssignment('board brief summarize')).toBe('board_brief');
  });
});

describe('selectChartGraph', () => {
  it('shows lending only for yield questions', () => {
    const chart = selectChartGraph([compound, uniswap], 'yield_deploy');
    expect(chart).toHaveLength(1);
    expect(chart[0].protocolName).toContain('Compound');
  });

  it('shows DEX only for stress triage', () => {
    const chart = selectChartGraph([compound, uniswap], 'stress_triage');
    expect(chart).toHaveLength(1);
    expect(chart[0].protocolName).toContain('Uniswap');
  });

  it('shows both for board brief', () => {
    expect(selectChartGraph([compound, uniswap], 'board_brief')).toHaveLength(2);
  });
});

describe('analyzeBeat', () => {
  it('gives a direct approval answer for vendor cases', () => {
    const { reasoning, intent } = analyzeBeat(
      'approve vendor batch given lending pool depth',
      [compound, uniswap],
      2,
      '0.0.10449882',
    );
    expect(intent).toBe('vendor_approval');
    expect(reasoning).toMatch(/Approve the vendor batch/i);
    expect(reasoning).not.toMatch(/operator should compare/i);
  });

  it('gives a direct yield answer for idle capital', () => {
    const { reasoning, chartGraph } = analyzeBeat(
      'holding surplus HBAR — worth deploying to yield?',
      [compound, uniswap],
      1,
      '0.0.10449882',
    );
    expect(reasoning).toMatch(/deploy idle treasury/i);
    expect(chartGraph).toHaveLength(1);
  });

  it('explains missing Graph config', () => {
    const text = reasonAboutBeats('risk', [], 2, '0.0.3');
    expect(text).toContain('Graph not configured');
    expect(text).toContain('0.0.3');
  });

  it('surfaces failed subgraph without generic compare language', () => {
    const text = reasonAboutBeats('alert unusual outflows', [
      compound,
      {
        endpoint: 'https://gateway.test/api/***/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
        ok: false,
        protocolName: 'Uniswap V2 (DEX)',
        tvlUsd: null,
        extra: {},
        error: 'auth',
      },
    ], 2, '0.0.10449882');
    expect(text).toMatch(/account-specific/i);
    expect(text).not.toMatch(/compare that market depth/i);
  });
});
