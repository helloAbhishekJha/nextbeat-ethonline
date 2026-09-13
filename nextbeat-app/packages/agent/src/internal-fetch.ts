import type { Express } from 'express';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

/**
 * Same-process HTTP fetch for bundled agent+service (e.g. Vercel).
 * Avoids a second serverless cold start when the agent pays the service.
 */
export function createInternalAppFetch(app: Express): {
  fetch: typeof globalThis.fetch;
  close: () => Promise<void>;
} {
  let server: Server | null = null;
  let port: number | null = null;

  const ensurePort = async (): Promise<number> => {
    if (server && port) return port;
    server = await listenEphemeral(app);
    port = (server.address() as AddressInfo).port;
    return port;
  };

  const fetchFn: typeof globalThis.fetch = async (input, init) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const listenPort = await ensurePort();
    const { pathname, search } = new URL(request.url);
    const target = `http://127.0.0.1:${listenPort}${pathname}${search}`;
    const headers = new Headers(request.headers);
    const outbound: RequestInit = { method: request.method, headers };
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      outbound.body = await request.text();
    }
    return fetch(target, outbound);
  };

  return {
    fetch: fetchFn,
    close: async () => {
      if (!server) return;
      await closeServer(server);
      server = null;
      port = null;
    },
  };
}

function listenEphemeral(app: Express): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}
