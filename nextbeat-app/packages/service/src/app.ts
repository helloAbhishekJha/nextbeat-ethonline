import express, { type NextFunction, type Request, type Response } from 'express';
import { paymentMiddleware } from '@x402/express';
import { NextBeatError, parsePositiveInt, tinybarsToHbar, type ServiceEnv } from '@nextbeat/shared';
import { composeBeat, composeQuote } from './beats.js';
import type { Logger } from './logger.js';
import { createTestnetResourceServer } from './x402.js';

function asyncRoute(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res).catch(next);
  };
}

export function createApp(env: ServiceEnv, logger: Logger) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req, res) => {
    res.json({
      ok: true,
      service: 'nextbeat',
      network: 'hedera:testnet',
      facilitator: env.X402_TESTNET_FACILITATOR_URL,
      payTo: env.HEDERA_SERVICE_ACCOUNT_ID,
      priceTinybars: env.PAYCALL_PRICE_TINYBARS.toString(),
      priceHbar: tinybarsToHbar(env.PAYCALL_PRICE_TINYBARS),
      capTinybars: env.PAYCALL_PRICE_CAP_TINYBARS.toString(),
      graphConfigured: Boolean(env.GRAPH_QUERY_URLS?.trim()),
      hcsTopic: env.HCS_TOPIC_ID ?? null,
    });
  });

  app.get(
    '/v1/quote',
    asyncRoute(async (req, res) => {
      const accountId = String(req.query.accountId ?? '');
      const assignment = String(req.query.assignment ?? 'treasury vs protocol risk');
      const quoted = await composeQuote(env, accountId, req.query.limit);
      res.json({
        assignment,
        network: 'hedera:testnet',
        settleTinybars: env.PAYCALL_PRICE_TINYBARS.toString(),
        meteredTinybars: quoted.quote.tinybars.toString(),
        meteredHbar: tinybarsToHbar(quoted.quote.tinybars),
        components: {
          base: quoted.quote.components.base.toString(),
          transactions: quoted.quote.components.transactions.toString(),
          graphRows: quoted.quote.components.graphRows.toString(),
          capped: quoted.quote.components.capped,
        },
        preview: {
          txCount: quoted.hedera.transactions.length,
          liveGraphProtocols: quoted.graphRowCount,
        },
      });
    }),
  );

  app.use(
    paymentMiddleware(
      {
        'POST /v1/brief': {
          accepts: [
            {
              scheme: 'exact',
              price: { asset: '0.0.0', amount: env.PAYCALL_PRICE_TINYBARS.toString() },
              network: 'hedera:testnet',
              payTo: env.HEDERA_SERVICE_ACCOUNT_ID,
            },
          ],
          description: 'NextBeat — next investigation paragraph (Hedera testnet HBAR)',
          mimeType: 'application/json',
        },
      },
      createTestnetResourceServer(env.X402_TESTNET_FACILITATOR_URL),
    ),
  );

  app.post(
    '/v1/brief',
    asyncRoute(async (req, res) => {
      const accountId = String(req.body?.accountId ?? '');
      const assignment = String(req.body?.assignment ?? 'treasury vs protocol risk').slice(0, 280);
      const limit = parsePositiveInt(req.body?.limit, 3, 1, 10);
      const beat = await composeBeat(env, logger, assignment, accountId, limit);
      res.json({
        paid: true,
        settleTinybars: env.PAYCALL_PRICE_TINYBARS.toString(),
        beat,
      });
    }),
  );

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof NextBeatError) {
      res.status(err.status).json({ error: err.message, code: err.code });
      return;
    }
    const message = err instanceof Error ? err.message : 'internal_error';
    if (message.startsWith('Invalid Hedera account')) {
      res.status(400).json({ error: message, code: 'bad_account' });
      return;
    }
    logger.error({ err }, 'unhandled');
    res.status(500).json({ error: 'internal_error', code: 'internal' });
  });

  return app;
}
