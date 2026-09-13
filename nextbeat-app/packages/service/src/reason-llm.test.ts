import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ServiceEnv } from '@nextbeat/shared';
import { buildReasoningFacts, llmConfigured, reasonWithLlm } from './reason-llm.js';
import type { Logger } from './logger.js';

const logger: Logger = {
  info: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
  fatal: vi.fn(),
  trace: vi.fn(),
  child: () => logger,
};

const baseEnv = {
  NODE_ENV: 'test',
  HOST: '127.0.0.1',
  PORT: 4021,
  LOG_LEVEL: 'error',
  HEDERA_SERVICE_ACCOUNT_ID: '0.0.10449882',
  HEDERA_AGENT_ACCOUNT_ID: '0.0.10456496',
  PAYCALL_PRICE_TINYBARS: 1000n,
  PAYCALL_PRICE_CAP_TINYBARS: 100000n,
  X402_TESTNET_FACILITATOR_URL: 'https://api.testnet.blocky402.com',
  X402_FACILITATOR_TIMEOUT_MS: 55_000,
  HEDERA_MIRROR_URL: 'https://testnet.mirrornode.hedera.com',
  LLM_TIMEOUT_MS: 25_000,
} as ServiceEnv;

const hedera = {
  accountId: '0.0.10449882',
  balanceTinybars: '5000000000',
  evmAddress: null,
  transactions: [{ transactionId: '0.0.1-1-1', name: 'CRYPTOTRANSFER', result: 'SUCCESS', consensusTimestamp: '1.2' }],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reason-llm', () => {
  it('detects openai config', () => {
    expect(llmConfigured({ ...baseEnv, OPENAI_API_KEY: 'sk-test' })).toBe(true);
    expect(llmConfigured(baseEnv)).toBe(false);
  });

  it('builds facts payload', () => {
    const facts = buildReasoningFacts({
      assignment: 'What is Compound TVL?',
      accountId: '0.0.10449882',
      intent: 'general',
      quotedAt: '2026-09-13T12:00:00.000Z',
      hedera,
      graph: [{ endpoint: 'x', ok: true, protocolName: 'Compound v2', tvlUsd: '100', extra: {} }],
    });
    expect(facts.question).toContain('Compound TVL');
    expect(facts.graphFromTheGraph).toHaveLength(1);
    expect(facts.dataAsOf).toBe('2026-09-13T12:00:00.000Z');
  });

  it('calls groq openai-compatible endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Compound TVL is about $100 from live Graph data.' } }],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await reasonWithLlm(
      { ...baseEnv, OPENAI_API_KEY: 'test-key' },
      {
        assignment: 'What is the current Compound TVL?',
        accountId: '0.0.10449882',
        intent: 'general',
        quotedAt: '2026-09-13T12:00:00.000Z',
        hedera,
        graph: [{ endpoint: 'x', ok: true, protocolName: 'Compound v2', tvlUsd: '100', extra: {} }],
      },
      logger,
    );

    expect(result?.provider).toBe('openai');
    expect(result?.model).toBe('gpt-4o-mini');
    expect(result?.text).toContain('Compound TVL');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.openai.com/v1/chat/completions',
      expect.objectContaining({ method: 'POST' }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.model).toBe('gpt-4o-mini');
  });
});
