import { z } from 'zod';

const accountId = z
  .string()
  .trim()
  .regex(
    /^0\.0\.\d+$/,
    'Hedera account id must be digits only (e.g. 0.0.6154321 from portal.hedera.com — not 0.0.XXXXX)',
  );

const tinybars = z.coerce.bigint().refine((n) => n >= 1n, 'tinybars must be >= 1');

export const serviceEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4021),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  HEDERA_SERVICE_ACCOUNT_ID: accountId.default('0.0.3'),
  /** Agent payer — filters mirror txs to beat payments only when set with service account. */
  HEDERA_AGENT_ACCOUNT_ID: accountId.optional(),
  HEDERA_SERVICE_PRIVATE_KEY: z.string().optional(),
  PAYCALL_PRICE_TINYBARS: tinybars.default(1000n),
  PAYCALL_PRICE_CAP_TINYBARS: tinybars.default(100000n),
  X402_TESTNET_FACILITATOR_URL: z.string().url().default('https://api.testnet.blocky402.com'),
  /** Blocky402 verify/settle/supported HTTP timeout (ms). Keep under Vercel maxDuration. */
  X402_FACILITATOR_TIMEOUT_MS: z.coerce.number().int().min(5000).max(120_000).default(55_000),
  HEDERA_MIRROR_URL: z.string().url().default('https://testnet.mirrornode.hedera.com'),
  GRAPH_QUERY_URLS: z.string().optional(),
  GRAPH_API_KEY: z.string().optional(),
  HCS_TOPIC_ID: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z
      .string()
      .regex(/^0\.0\.\d+$/)
      .optional(),
  ),
  /** Groq (fast fallback) — OpenAI-compatible chat/completions */
  GROQ_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  /** Hedera x402 inference PoC pattern — LM Studio or other OpenAI-compatible host */
  LLM_BASE_URL: z.string().url().optional(),
  LLM_API_KEY: z.string().optional(),
  LLM_MODEL: z.string().optional(),
  LLM_TIMEOUT_MS: z.coerce.number().int().min(3000).max(60_000).default(25_000),
  BLOCKY402_FACILITATOR_ACCOUNT_ID: accountId.optional(),
});

const boolFromEnv = z.preprocess(
  (v) => v === 'true' || v === '1' || v === true,
  z.boolean().default(false),
);

export const agentEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'),
  AGENT_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  HEDERA_AGENT_ACCOUNT_ID: accountId.optional(),
  HEDERA_AGENT_PRIVATE_KEY: z.string().optional(),
  HEDERA_SERVICE_ACCOUNT_ID: accountId.optional(),
  PAYCALL_PRICE_TINYBARS: tinybars.default(1000n),
  PAYCALL_BUDGET_TINYBARS: tinybars.default(5_000_000n),
  SERVICE_PUBLIC_URL: z.string().url().default('http://127.0.0.1:4021'),
  SLOT_3_SPONSOR: z.enum(['none', 'world', 'ens', 'bazantic']).default('world'),
  WORLD_APP_ID: z.string().optional(),
  WORLD_RP_ID: z.string().optional(),
  WORLD_ACTION: z.string().default('nextbeat-desk'),
  WORLD_SIGNING_KEY_HEX: z.string().optional(),
  WORLD_DEMO_GATE: boolFromEnv,
  /** classic = submission desk UI; simple = plain-language beta UI */
  DESK_UI: z.enum(['classic', 'simple']).default('classic'),
  HEDERA_MIRROR_URL: z.string().url().default('https://testnet.mirrornode.hedera.com'),
  /** Blocky402 x402 facilitator — pays network fees on HashScan (not our agent/treasury). */
  BLOCKY402_FACILITATOR_ACCOUNT_ID: accountId.optional(),
});

export type ServiceEnv = z.infer<typeof serviceEnvSchema>;
export type AgentEnv = z.infer<typeof agentEnvSchema>;

export function loadServiceEnv(source: NodeJS.ProcessEnv = process.env): ServiceEnv {
  return serviceEnvSchema.parse(source);
}

export function loadAgentEnv(source: NodeJS.ProcessEnv = process.env): AgentEnv {
  return agentEnvSchema.parse(source);
}

export function parseGraphUrls(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.startsWith('http'));
}
