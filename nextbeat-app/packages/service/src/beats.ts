import {
  assertHederaAccountId,
  parseGraphUrls,
  parsePositiveInt,
  quoteBeat,
  type ServiceEnv,
} from '@nextbeat/shared';
import { loadHederaBrief } from './hedera-mirror.js';
import { loadGraphSnapshots, reasonAboutBeats } from './graph.js';
import { hashPayload, publishHcsReceipt } from './hcs.js';
import type { Logger } from './logger.js';

export async function composeQuote(env: ServiceEnv, accountIdRaw: string, limitRaw: unknown) {
  const accountId = assertHederaAccountId(accountIdRaw);
  const limit = parsePositiveInt(limitRaw, 3, 1, 10);
  const graphUrls = parseGraphUrls(env.GRAPH_QUERY_URLS);
  const [hedera, graph] = await Promise.all([
    loadHederaBrief(env.HEDERA_MIRROR_URL, accountId, limit),
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
  const reasoning = reasonAboutBeats(assignment, q.graph, q.hedera.transactions.length, q.accountId);
  const beat = {
    assignment,
    network: 'hedera:testnet' as const,
    quotedAt: new Date().toISOString(),
    priceTinybars: q.quote.tinybars.toString(),
    hedera: q.hedera,
    graph: q.graph,
    reasoning,
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
  }

  return { ...beat, ...(hcs ? { hcs } : {}) };
}
