import type { GraphProtocolSnapshot, HederaAccountBrief, ServiceEnv } from '@nextbeat/shared';
import { displayProtocolName } from './graph.js';
import type { Logger } from './logger.js';

/** Only cheap models — never gpt-5 / o1 / full gpt-4o on metered beats. */
const OPENAI_MODEL = 'gpt-4o-mini';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export type LlmReasonInput = {
  assignment: string;
  accountId: string;
  intent: string;
  quotedAt: string;
  hedera: HederaAccountBrief;
  graph: GraphProtocolSnapshot[];
  agentAccountId?: string | null;
  serviceAccountId?: string | null;
  blocky402FacilitatorAccountId?: string | null;
};

export type LlmReasonResult = {
  text: string;
  provider: 'groq' | 'openai' | 'openai_compatible';
  model: string;
};

type LlmConfig = {
  provider: LlmReasonResult['provider'];
  baseUrl: string;
  apiKey: string;
  model: string;
};

function safeOpenAiModel(raw: string | undefined): string {
  const m = (raw ?? '').trim().toLowerCase();
  if (!m || m.includes('gpt-5') || m.includes('o1') || m === 'gpt-4o' || m.startsWith('gpt-4-turbo')) {
    return OPENAI_MODEL;
  }
  if (m === OPENAI_MODEL) return OPENAI_MODEL;
  return OPENAI_MODEL;
}

function resolveLlmConfig(env: ServiceEnv): LlmConfig | null {
  if (env.OPENAI_API_KEY?.trim()) {
    return {
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      apiKey: env.OPENAI_API_KEY.trim(),
      model: safeOpenAiModel(env.LLM_MODEL),
    };
  }
  if (env.GROQ_API_KEY?.trim()) {
    return {
      provider: 'groq',
      baseUrl: 'https://api.groq.com/openai/v1',
      apiKey: env.GROQ_API_KEY.trim(),
      model: env.LLM_MODEL?.trim() || GROQ_MODEL,
    };
  }
  if (env.LLM_BASE_URL?.trim()) {
    const base = env.LLM_BASE_URL.trim().replace(/\/$/, '');
    return {
      provider: 'openai_compatible',
      baseUrl: base.endsWith('/v1') ? base : `${base}/v1`,
      apiKey: env.LLM_API_KEY?.trim() || 'lm-studio',
      model: env.LLM_MODEL?.trim() || 'local-model',
    };
  }
  return null;
}

export function llmConfigured(env: ServiceEnv): boolean {
  return resolveLlmConfig(env) != null;
}

function formatUsd(raw: string | null | undefined): string | null {
  const n = Number.parseFloat(String(raw ?? ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function graphFacts(graph: GraphProtocolSnapshot[]) {
  return graph.map((g) => ({
    protocol: displayProtocolName(g),
    ok: g.ok,
    tvlUsd: g.tvlUsd,
    tvlFormatted: formatUsd(g.tvlUsd),
    poolCount: g.extra.poolCount ?? null,
    error: g.error ?? null,
  }));
}

export function buildReasoningFacts(input: LlmReasonInput): Record<string, unknown> {
  return {
    dataAsOf: input.quotedAt,
    network: 'hedera:testnet',
    question: input.assignment,
    treasuryAccountId: input.accountId,
    agentAccountId: input.agentAccountId ?? null,
    serviceAccountId: input.serviceAccountId ?? null,
    blocky402FacilitatorAccountId: input.blocky402FacilitatorAccountId ?? null,
    treasuryBalanceTinybars: input.hedera.balanceTinybars,
    recentBeatPaymentCount: input.hedera.transactions.length,
    recentBeatPayments: input.hedera.transactions.map((t) => ({
      label: t.label ?? t.name,
      result: t.result,
      transactionId: t.transactionId,
      consensusTimestamp: t.consensusTimestamp,
    })),
    graphFromTheGraph: graphFacts(input.graph),
  };
}

const SYSTEM_PROMPT = `You are NextBeat, a treasury risk analyst. The operator already paid for this beat.

Write a detailed answer in 5–8 sentences as flowing prose (no bullet lists unless asked).
You MUST:
- Answer the question directly with a clear conclusion (yes/no, approve/hold/wait, or the specific fact requested).
- Weave in concrete numbers from graphFromTheGraph (TVL, pool counts) and Hedera facts (balance tinybars, transfer count).
- State the data timestamp using dataAsOf (e.g. "As of … UTC").
- Perform any comparisons yourself (treasury activity vs market depth) and state the outcome — never tell the operator to "compare", "check manually", or "investigate further" without also giving your conclusion.
- Use only provided facts; if something is missing, say what is missing and answer with what you have.

Do not mention OpenAI or model names.`;

export async function reasonWithLlm(
  env: ServiceEnv,
  input: LlmReasonInput,
  logger: Logger,
): Promise<LlmReasonResult | null> {
  const cfg = resolveLlmConfig(env);
  if (!cfg) return null;

  const facts = buildReasoningFacts(input);
  const userContent = `Question: ${input.assignment}\n\nLive facts JSON:\n${JSON.stringify(facts, null, 2)}`;

  const timeoutMs = env.LLM_TIMEOUT_MS ?? 25_000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${cfg.apiKey}`,
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0.3,
        max_tokens: 550,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      logger.warn({ status: res.status, provider: cfg.provider, errText }, 'LLM request failed');
      return null;
    }

    const body = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = body.choices?.[0]?.message?.content?.trim();
    if (!text) {
      logger.warn({ provider: cfg.provider }, 'LLM returned empty content');
      return null;
    }

    return { text, provider: cfg.provider, model: cfg.model };
  } catch (err) {
    logger.warn({ err, provider: cfg.provider }, 'LLM reason failed');
    return null;
  } finally {
    clearTimeout(timer);
  }
}
