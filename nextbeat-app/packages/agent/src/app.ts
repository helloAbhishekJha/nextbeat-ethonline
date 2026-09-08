import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { assertHederaAccountId, tinybarsToHbar, type AgentEnv } from '@nextbeat/shared';
import type { Logger } from 'pino';
import { createPayingFetch, type PaymentStage } from './x402-client.js';

const LABELS: Record<PaymentStage, string> = {
  connecting: 'Requesting the next beat…',
  payment_required: 'HTTP 402 — signing dust testnet HBAR…',
  sending: 'Blocky402 settling on hedera:testnet…',
  accepted: 'Payment settled',
};

function sse(res: express.Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export function createAgentApp(env: AgentEnv, logger: Logger) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));
  const publicDir = join(process.cwd(), 'packages/agent/public');
  app.use(express.static(publicDir, { index: 'index.html', maxAge: 0 }));

  let spent = 0n;
  const payerReady = Boolean(env.HEDERA_AGENT_ACCOUNT_ID && env.HEDERA_AGENT_PRIVATE_KEY);

  app.get('/api/config', (_req, res) => {
    const payTo = env.HEDERA_SERVICE_ACCOUNT_ID;
    res.json({
      network: 'hedera:testnet',
      settleHbar: tinybarsToHbar(env.PAYCALL_PRICE_TINYBARS),
      settleTinybars: env.PAYCALL_PRICE_TINYBARS.toString(),
      budgetTinybars: env.PAYCALL_BUDGET_TINYBARS.toString(),
      spentTinybars: spent.toString(),
      agentAccountId: env.HEDERA_AGENT_ACCOUNT_ID ?? null,
      serviceAccountId: payTo ?? null,
      walletReady: payerReady,
      hashscanService: payTo ? `https://hashscan.io/testnet/account/${payTo}` : null,
    });
  });

  app.post('/api/buy', async (req, res) => {
    if (!payerReady || !env.HEDERA_AGENT_ACCOUNT_ID || !env.HEDERA_AGENT_PRIVATE_KEY) {
      res.status(503).json({ error: 'Agent wallet not configured' });
      return;
    }
    let accountId: string;
    try {
      accountId = assertHederaAccountId(String(req.body?.accountId ?? ''));
    } catch {
      res.status(400).json({ error: 'accountId must look like 0.0.12345' });
      return;
    }
    if (spent + env.PAYCALL_PRICE_TINYBARS > env.PAYCALL_BUDGET_TINYBARS) {
      res.status(429).json({ error: 'Agent budget exceeded (PAYCALL_BUDGET_TINYBARS)' });
      return;
    }

    const assignment = String(req.body?.assignment ?? 'treasury vs protocol risk').slice(0, 280);
    const limit = req.body?.limit ?? 3;

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const paying = createPayingFetch(env.HEDERA_AGENT_ACCOUNT_ID, env.HEDERA_AGENT_PRIVATE_KEY);
    paying.onStatus((stage) => sse(res, 'status', { stage, message: LABELS[stage] }));

    try {
      const response = await paying.fetchWithPayment(`${env.SERVICE_PUBLIC_URL}/v1/brief`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ accountId, assignment, limit }),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        sse(res, 'error', { error: 'beat_failed', status: response.status, payload });
      } else {
        spent += env.PAYCALL_PRICE_TINYBARS;
        sse(res, 'done', {
          payload,
          spentTinybars: spent.toString(),
          hashscan: env.HEDERA_SERVICE_ACCOUNT_ID
            ? `https://hashscan.io/testnet/account/${env.HEDERA_SERVICE_ACCOUNT_ID}`
            : null,
        });
      }
    } catch (err) {
      logger.error({ err }, 'buy failed');
      sse(res, 'error', { error: err instanceof Error ? err.message : String(err) });
    }
    res.end();
  });

  return app;
}

export function workspaceRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
}
