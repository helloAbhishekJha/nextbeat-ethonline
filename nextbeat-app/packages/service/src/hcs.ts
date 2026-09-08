import { Client, PrivateKey, TopicMessageSubmitTransaction } from '@hiero-ledger/sdk';
import { createHash } from 'node:crypto';
import type { Logger } from './logger.js';

export function hashPayload(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export async function publishHcsReceipt(opts: {
  logger: Logger;
  accountId: string;
  privateKey: string;
  topicId: string;
  body: Record<string, string>;
}): Promise<'submitted' | 'skipped' | 'failed'> {
  let client: Client | undefined;
  try {
    client = Client.forTestnet().setOperator(opts.accountId, PrivateKey.fromStringECDSA(opts.privateKey));
    await new TopicMessageSubmitTransaction()
      .setTopicId(opts.topicId)
      .setMessage(JSON.stringify({ network: 'hedera:testnet', ...opts.body }))
      .execute(client);
    return 'submitted';
  } catch (err) {
    opts.logger.warn({ err }, 'HCS receipt failed');
    return 'failed';
  } finally {
    client?.close();
  }
}
