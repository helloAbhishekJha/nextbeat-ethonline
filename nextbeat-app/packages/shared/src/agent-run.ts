/** Sponsor-aligned agent run record — judges see tool use, not a static API. */

export type AgentSponsor = 'hedera' | 'graph' | 'world' | 'nextbeat';

export type AgentRunStep = {
  id: string;
  sponsor: AgentSponsor;
  /** Sponsor tool or protocol surface */
  tool: string;
  status: 'ok' | 'skipped' | 'failed';
  summary: string;
};

export type AgentFramework = {
  name: 'TreasuryRiskAgent';
  pattern: 'human-gate → autonomous x402 payer → Graph + mirror tools → reasoning';
  hedera: string;
  graph: string;
  world: string;
  reasoning: string;
};

export type AgentRun = {
  framework: AgentFramework;
  steps: AgentRunStep[];
};

export const TREASURY_AGENT_FRAMEWORK: AgentFramework = {
  name: 'TreasuryRiskAgent',
  pattern: 'human-gate → autonomous x402 payer → Graph + mirror tools → reasoning',
  hedera:
    'Hedera testnet agent wallet + x402 exact scheme (Blocky402 facilitator) — same stack as Hedera Agent Kit x402 inference PoC',
  graph: 'The Graph Studio gateway — live subgraph queries (Compound V2 + Uniswap V2)',
  world: 'World Selfie Check (IDKit v4) — human operator gate before agent spend',
  reasoning: 'Graph-grounded synthesis (OpenAI gpt-4o-mini) or preset treasury templates',
};
