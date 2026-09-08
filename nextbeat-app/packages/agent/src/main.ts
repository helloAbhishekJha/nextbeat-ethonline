import { config } from 'dotenv';
import { resolve } from 'node:path';
import { loadAgentEnv } from '@nextbeat/shared';
import pino from 'pino';
import { createAgentApp, workspaceRoot } from './app.js';

config({ path: resolve(workspaceRoot(), '.env') });
const env = loadAgentEnv();
const logger = pino({
  level: env.LOG_LEVEL,
  redact: { paths: ['*.privateKey', '*.HEDERA_AGENT_PRIVATE_KEY'], remove: true },
  base: { service: 'nextbeat-agent' },
});

const app = createAgentApp(env, logger);
const server = app.listen(env.AGENT_PORT, env.HOST, () => {
  logger.info({ url: `http://${env.HOST}:${env.AGENT_PORT}` }, 'desk UI');
});
server.timeout = 60_000;

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
