import {
  assertHederaAccountId,
  parseGraphUrls,
  parsePositiveInt,
  quoteBeat,
  type ServiceEnv,
} from '@nextbeat/shared';
import { loadHederaBrief } from './hedera-mirror.js';
import { buildTreasuryAgentRun } from './agent-pipeline.js';
import { isPresetCase } from './cases.js';
import { analyzeBeat, loadGraphSnapshots } from './graph.js';
import { hashPayload, publishHcsReceipt } from './hcs.js';
import type { Logger } from './logger.js';
import { llmConfigured, reasonWithLlm } from './reason-llm.js';

export async function composeQuote(env: ServiceEnv, accountIdRaw: string, limitRaw: unknown) {
  const accountId = assertHederaAccountId(accountIdRaw);
  const limit = parsePositiveInt(limitRaw, 3, 1, 10);
  const graphUrls = parseGraphUrls(env.GRAPH_QUERY_URLS);
  const [hedera, graph] = await Promise.all([
    loadHederaBrief(env.HEDERA_MIRROR_URL, accountId, limit, {
      agentAccountId: env.HEDERA_AGENT_ACCOUNT_ID,
      serviceAccountId: env.HEDERA_SERVICE_ACCOUNT_ID,
    }),
    loadGraphSnapshots(graphUrls, env.GRAPH_API_KEY),
  ]);
  const graphRowCount = graph.filter((g) => g.ok).length;
  const quote = quoteBeat({
    baseTinybars: env.PAYCALL_PRICE_TINYBARS,
    capTinybars: env.PAYCALL_PRICE_CAP_TINYBARS,
    transactionCount: hedera.transactions.length,
    graphRowCount,
  });
  return { accountId, limit, hedera, graph, quote, graphRowCount };
}

export async function composeBeat(
  env: ServiceEnv,
  logger: Logger,
  assignment: string,
  accountIdRaw: string,
  limitRaw: unknown,
) {
  const q = await composeQuote(env, accountIdRaw, limitRaw);
  const quotedAt = new Date().toISOString();
  const analysis = analyzeBeat(
    assignment,
    q.graph,
    q.hedera.transactions.length,
    q.accountId,
    quotedAt,
  );

  let reasoning = analysis.reasoning;
  let reasoningSource: 'llm' | 'template' = 'template';
  let llmProvider: string | undefined;
  let llmModel: string | undefined;
  const preset = isPresetCase(assignment);

  if (preset) {
    logger.debug({ intent: analysis.intent }, 'beat reasoning via preset template');
  } else if (llmConfigured(env)) {
    const llm = await reasonWithLlm(
      env,
      {
        assignment,
        accountId: q.accountId,
        intent: analysis.intent,
        quotedAt,
        hedera: q.hedera,
        graph: q.graph,
        agentAccountId: env.HEDERA_AGENT_ACCOUNT_ID,
        serviceAccountId: env.HEDERA_SERVICE_ACCOUNT_ID,
        blocky402FacilitatorAccountId: env.BLOCKY402_FACILITATOR_ACCOUNT_ID,
      },
      logger,
    );
    if (llm) {
      reasoning = llm.text;
      reasoningSource = 'llm';
      llmProvider = llm.provider;
      llmModel = llm.model;
      logger.info({ provider: llm.provider, model: llm.model }, 'beat reasoning via LLM');
    } else {
      logger.warn('LLM failed — using template fallback for custom question');
    }
  }

  const beat = {
    assignment,
    network: 'hedera:testnet' as const,
    quotedAt,
    priceTinybars: q.quote.tinybars.toString(),
    hedera: q.hedera,
    graph: q.graph,
    chartGraph: analysis.chartGraph,
    chartTitle: analysis.chartTitle,
    caseIntent: analysis.intent,
    reasoning,
    reasoningSource,
    ...(llmProvider ? { llmProvider } : {}),
    ...(llmModel ? { llmModel } : {}),
    agentRun: buildTreasuryAgentRun({
      graph: q.graph,
      graphRowCount: q.graphRowCount,
      txCount: q.hedera.transactions.length,
      accountId: q.accountId,
      reasoningSource,
      llmProvider,
      llmModel,
      presetCase: preset,
      hcsPublished: false,
    }),
  };

  let hcs: { topicId: string; status: string } | undefined;
  if (env.HCS_TOPIC_ID && env.HEDERA_SERVICE_PRIVATE_KEY) {
    const status = await publishHcsReceipt({
      logger,
      accountId: env.HEDERA_SERVICE_ACCOUNT_ID,
      privateKey: env.HEDERA_SERVICE_PRIVATE_KEY,
      topicId: env.HCS_TOPIC_ID,
      body: {
        priceTinybars: beat.priceTinybars,
        accountId: q.accountId,
        graphQueryHash: hashPayload(q.graph),
        briefHash: hashPayload(beat.reasoning),
      },
    });
    hcs = { topicId: env.HCS_TOPIC_ID, status };
    if (beat.agentRun) {
      beat.agentRun = buildTreasuryAgentRun({
        graph: q.graph,
        graphRowCount: q.graphRowCount,
        txCount: q.hedera.transactions.length,
        accountId: q.accountId,
        reasoningSource,
        llmProvider,
        llmModel,
        presetCase: preset,
        hcsPublished: true,
      });
    }
  }

  return { ...beat, ...(hcs ? { hcs } : {}) };
}
