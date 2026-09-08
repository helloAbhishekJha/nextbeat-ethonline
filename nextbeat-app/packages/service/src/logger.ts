import pino from 'pino';

export function createLogger(level: string) {
  return pino({
    level,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        '*.privateKey',
        '*.HEDERA_AGENT_PRIVATE_KEY',
        '*.HEDERA_SERVICE_PRIVATE_KEY',
        '*.GRAPH_API_KEY',
      ],
      remove: true,
    },
    base: { service: 'nextbeat-service', network: 'hedera:testnet' },
  });
}

export type Logger = ReturnType<typeof createLogger>;
