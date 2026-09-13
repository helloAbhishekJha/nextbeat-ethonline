import { config } from 'dotenv';
import { resolve } from 'node:path';
import express from 'express';
import pino from 'pino';
import { loadAgentEnv, loadServiceEnv } from '@nextbeat/shared';
import { createAgentApp } from '@nextbeat/agent';
import { createApp, createLogger } from '@nextbeat/service';

config({ path: resolve(process.cwd(), '.env') });

const serviceEnv = loadServiceEnv();
const agentEnv = loadAgentEnv();

const serviceApp = createApp(serviceEnv, createLogger(serviceEnv.LOG_LEVEL));
const agentApp = createAgentApp(
  agentEnv,
  pino({
    level: agentEnv.LOG_LEVEL,
    redact: { paths: ['*.privateKey', '*.HEDERA_AGENT_PRIVATE_KEY'], remove: true },
    base: { service: 'nextbeat-agent' },
  }),
  { serviceApp },
);

const app = express();
app.disable('x-powered-by');
app.use(serviceApp);
app.use(agentApp);

export default app;
