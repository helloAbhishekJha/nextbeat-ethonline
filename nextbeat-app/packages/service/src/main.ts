import { config } from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Server } from 'node:http';
import { loadServiceEnv } from '@nextbeat/shared';
import { createApp } from './app.js';
import { createLogger } from './logger.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
config({ path: resolve(root, '.env') });

const env = loadServiceEnv();
const logger = createLogger(env.LOG_LEVEL);
const app = createApp(env, logger);

const server: Server = app.listen(env.PORT, env.HOST, () => {
  logger.info({ host: env.HOST, port: env.PORT, payTo: env.HEDERA_SERVICE_ACCOUNT_ID }, 'nextbeat service listening');
});

server.timeout = 30_000;

function shutdown(signal: string) {
  logger.info({ signal }, 'shutting down');
  server.close((err) => {
    if (err) {
      logger.error({ err }, 'close failed');
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
