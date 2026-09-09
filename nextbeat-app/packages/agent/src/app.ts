import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { assertHederaAccountId, tinybarsToHbar, type AgentEnv } from '@nextbeat/shared';
import type { Logger } from 'pino';
import { createPayingFetch, type PaymentStage } from './x402-client.js';
import {
  createRpSignature,
  hasValidHumanCookie,
  isWorldConfigured,
  isWorldGateActive,
  issueHumanCookie,
  verifyWithWorld,
} from './world-gate.js';

const LABELS: Record<PaymentStage, string> = {
  connecting: 'Opening the dossier…',
  payment_required: 'Clue locked — signing dust testnet HBAR…',
  sending: 'Settling clue on hedera:testnet…',
  accepted: 'Clue unlocked',
};

function sse(res: express.Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export function createAgentApp(env: AgentEnv, logger: Logger) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));
  const publicDir = join(process.cwd(), 'packages/agent/public');
  app.use(express.static(publicDir, { index: 'index.html', maxAge: 0 }));

  let spent = 0n;
  const payerReady = Boolean(env.HEDERA_AGENT_ACCOUNT_ID && env.HEDERA_AGENT_PRIVATE_KEY);
  const worldGate = isWorldGateActive(env);

  app.get('/api/config', (req, res) => {
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
      slot3Sponsor: env.SLOT_3_SPONSOR,
      worldGate,
      worldConfigured: isWorldConfigured(env),
      worldDemoGate: env.WORLD_DEMO_GATE,
      humanVerified: !worldGate || hasValidHumanCookie(req, env),
      worldAppId: env.WORLD_APP_ID ?? null,
      worldRpId: env.WORLD_RP_ID ?? null,
      worldAction: env.WORLD_ACTION,
    });
  });

  app.get('/api/world/sign', async (_req, res) => {
    if (!worldGate) {
      res.status(404).json({ error: 'world_gate_disabled' });
      return;
    }
    if (!isWorldConfigured(env)) {
      res.status(503).json({ error: 'world_not_configured', demoGate: env.WORLD_DEMO_GATE });
      return;
    }
    try {
      res.json(await createRpSignature(env));
    } catch (err) {
      logger.error({ err }, 'world sign failed');
      res.status(500).json({ error: 'world_sign_failed' });
    }
  });

  app.post('/api/world/verify', async (req, res) => {
    if (!worldGate) {
      res.status(404).json({ error: 'world_gate_disabled' });
      return;
    }
    if (!isWorldConfigured(env)) {
      res.status(503).json({ error: 'world_not_configured' });
      return;
    }
    try {
      const ok = await verifyWithWorld(env, req.body);
      if (!ok) {
        res.status(401).json({ ok: false, error: 'world_verify_failed' });
        return;
      }
      issueHumanCookie(res, env);
      res.json({ ok: true, sponsor: 'world' });
    } catch (err) {
      logger.error({ err }, 'world verify failed');
      res.status(502).json({ ok: false, error: 'world_verify_unreachable' });
    }
  });

  app.post('/api/world/demo-verify', (req, res) => {
    if (!worldGate || !env.WORLD_DEMO_GATE) {
      res.status(404).json({ error: 'demo_gate_disabled' });
      return;
    }
    issueHumanCookie(res, env);
    res.json({ ok: true, demo: true, sponsor: 'world' });
  });

  app.post('/api/buy', async (req, res) => {
    if (worldGate && !hasValidHumanCookie(req, env)) {
      res.status(403).json({
        error: 'human_gate_required',
        message: 'Pass World Selfie Check before buying a clue.',
        slot3Sponsor: env.SLOT_3_SPONSOR,
      });
      return;
    }
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
        sse(res, 'error', { error: 'clue_failed', status: response.status, payload });
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
