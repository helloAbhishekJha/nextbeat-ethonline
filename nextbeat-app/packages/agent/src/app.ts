import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { decodePaymentResponseHeader } from '@x402/core/http';
import {
  assertHederaAccountId,
  hashscanTransactionUrl,
  TREASURY_AGENT_FRAMEWORK,
  tinybarsToHbar,
  type AgentEnv,
} from '@nextbeat/shared';
import type { Logger } from 'pino';
import { facilitatorFromTxId, fetchWalletBalances } from './balances.js';
import { fetchPaymentProof } from './payment-proof.js';
import { createInternalAppFetch } from './internal-fetch.js';
import { createPayingFetch, type PaymentStage } from './x402-client.js';
import {
  createRpSignature,
  hasValidHumanCookie,
  isWorldConfigured,
  isWorldGateActive,
  clearHumanCookie,
  isSecureRequest,
  issueHumanCookie,
  verifyWithWorld,
} from './world-gate.js';

const LABELS: Record<PaymentStage, string> = {
  connecting: 'Preparing treasury risk beat…',
  payment_required: 'Agent signing testnet HBAR payment…',
  sending: 'Settling on Hedera testnet…',
  accepted: 'Beat ready',
};

function sse(res: express.Response, event: string, data: unknown) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function paymentTxFromResponse(response: Response): string | null {
  const header =
    response.headers.get('payment-response') ?? response.headers.get('x-payment-response');
  if (!header) return null;
  try {
    const settled = decodePaymentResponseHeader(header);
    return settled.transaction ? String(settled.transaction) : null;
  } catch {
    return null;
  }
}

function resolveDeskDir(env: AgentEnv, variant: 'classic' | 'simple'): string {
  const tail = variant === 'simple' ? ['packages', 'agent', 'public', 'simple'] : ['packages', 'agent', 'public'];
  const candidates = [
    join(process.cwd(), ...tail),
    join(workspaceRoot(), ...tail),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, 'index.html'))) return dir;
  }
  return join(process.cwd(), ...tail);
}

export type AgentAppOptions = {
  /** When bundled with the service (Vercel / site), pay via in-process HTTP instead of SERVICE_PUBLIC_URL. */
  serviceApp?: express.Express;
};

export function createAgentApp(env: AgentEnv, logger: Logger, options: AgentAppOptions = {}) {
  const app = express();
  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));
  const publicDir = resolveDeskDir(env, env.DESK_UI === 'simple' ? 'simple' : 'classic');
  const classicPublic = resolveDeskDir(env, 'classic');
  app.get('/desk-tts.js', (_req, res) => {
    res.sendFile(join(classicPublic, 'desk-tts.js'));
  });
  app.get('/world-gate-client.js', (_req, res) => {
    res.sendFile(join(classicPublic, 'world-gate-client.js'));
  });
  app.get('/desk-results.js', (_req, res) => {
    res.sendFile(join(classicPublic, 'desk-results.js'));
  });
  app.use(express.static(publicDir, { index: 'index.html', maxAge: 0 }));
  if (env.DESK_UI !== 'simple') {
    app.use(
      '/simple',
      express.static(resolveDeskDir(env, 'simple'), { index: 'index.html', maxAge: 0 }),
    );
  }

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
      blocky402FacilitatorAccountId: env.BLOCKY402_FACILITATOR_ACCOUNT_ID ?? null,
      mirrorUrl: env.HEDERA_MIRROR_URL,
      agent: TREASURY_AGENT_FRAMEWORK,
    });
  });

  app.get('/api/agent', (_req, res) => {
    res.json({
      agent: TREASURY_AGENT_FRAMEWORK,
      wallet: {
        accountId: env.HEDERA_AGENT_ACCOUNT_ID ?? null,
        ready: payerReady,
        budgetTinybars: env.PAYCALL_BUDGET_TINYBARS.toString(),
        spentTinybars: spent.toString(),
      },
      sponsors: {
        hedera: 'Agent wallet + x402 (Blocky402) — Hedera AI & Agentic Payments pattern',
        graph: 'Subgraph queries via The Graph Studio gateway',
        world: worldGate ? 'Selfie Check gate before POST /api/buy' : 'disabled',
      },
      endpoints: {
        buy: 'POST /api/buy (SSE) — autonomous agent pays service',
        brief: 'POST /v1/brief (x402-gated)',
        quote: 'GET /v1/quote',
      },
    });
  });

  app.get('/api/balances', async (_req, res) => {
    const ids = [env.HEDERA_AGENT_ACCOUNT_ID, env.HEDERA_SERVICE_ACCOUNT_ID].filter(
      (id): id is string => Boolean(id),
    );
    if (ids.length === 0) {
      res.json({ wallets: [] });
      return;
    }
    const wallets = await fetchWalletBalances(env.HEDERA_MIRROR_URL, ids);
    res.json({ wallets });
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
      issueHumanCookie(res, env, isSecureRequest(req));
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
    issueHumanCookie(res, env, isSecureRequest(req));
    res.json({ ok: true, demo: true, sponsor: 'world' });
  });

  app.post('/api/world/logout', (req, res) => {
    if (!worldGate) {
      res.status(404).json({ error: 'world_gate_disabled' });
      return;
    }
    clearHumanCookie(res, isSecureRequest(req));
    res.json({ ok: true });
  });

  app.post('/api/buy', async (req, res) => {
    if (worldGate && !hasValidHumanCookie(req, env)) {
      res.status(403).json({
        error: 'human_gate_required',
        message: 'Complete World Selfie Check before the agent can buy a beat.',
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

    const internalFetch = options.serviceApp ? createInternalAppFetch(options.serviceApp) : null;
    const paying = createPayingFetch(
      env.HEDERA_AGENT_ACCOUNT_ID,
      env.HEDERA_AGENT_PRIVATE_KEY,
      internalFetch?.fetch ?? globalThis.fetch,
    );
    paying.onStatus((stage) => sse(res, 'status', { stage, message: LABELS[stage] }));

    // x402 fetch wraps `new Request(url)` — relative paths throw in Node; internal fetch routes by pathname.
    const briefUrl = options.serviceApp
      ? 'http://127.0.0.1/v1/brief'
      : `${env.SERVICE_PUBLIC_URL}/v1/brief`;
    const briefBody = {
      method: 'POST' as const,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accountId, assignment, limit }),
    };

    try {
      let response = await paying.fetchWithPayment(briefUrl, briefBody);
      const facilitatorTimedOut = async (res: Response) => {
        if (res.status !== 502) return false;
        try {
          const body = (await res.clone().json()) as { error?: string };
          return Boolean(body.error?.includes('Facilitator') && body.error?.includes('timed out'));
        } catch {
          return false;
        }
      };
      if (await facilitatorTimedOut(response)) {
        sse(res, 'status', { stage: 'connecting', message: 'Blocky402 slow — retrying payment…' });
        response = await paying.fetchWithPayment(briefUrl, briefBody);
      }

      const payload: unknown = await response.json();
      if (!response.ok) {
        sse(res, 'error', { error: 'clue_failed', status: response.status, payload });
      } else {
        spent += env.PAYCALL_PRICE_TINYBARS;
        const paymentTxId = paymentTxFromResponse(response);
        const facilitatorId =
          facilitatorFromTxId(paymentTxId) ?? env.BLOCKY402_FACILITATOR_ACCOUNT_ID ?? null;
        const paymentProof =
          paymentTxId
            ? await fetchPaymentProof(env.HEDERA_MIRROR_URL, paymentTxId, {
                agentAccountId: env.HEDERA_AGENT_ACCOUNT_ID,
                serviceAccountId: env.HEDERA_SERVICE_ACCOUNT_ID,
                facilitatorId,
              })
            : null;
        sse(res, 'done', {
          payload,
          spentTinybars: spent.toString(),
          paymentTxId,
          blocky402FacilitatorAccountId: facilitatorId,
          paymentProof,
          hashscan:
            paymentProof?.hashscan ??
            (paymentTxId ? hashscanTransactionUrl('testnet', { txId: paymentTxId }) : null),
        });
      }
    } catch (err) {
      logger.error({ err }, 'buy failed');
      sse(res, 'error', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      await internalFetch?.close();
    }
    res.end();
  });

  return app;
}

export function workspaceRoot(): string {
  try {
    const url = import.meta.url;
    if (typeof url === 'string' && url.startsWith('file:')) {
      return resolve(dirname(fileURLToPath(url)), '../../..');
    }
  } catch {
    // esbuild CJS bundle — skip file URL resolution
  }
  return process.cwd();
}
