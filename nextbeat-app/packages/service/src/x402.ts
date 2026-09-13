import { HTTPFacilitatorClient, x402ResourceServer } from '@x402/core/server';
import { ExactHederaScheme } from '@x402/hedera/exact/server';

export function createTestnetResourceServer(facilitatorUrl: string, timeoutMs = 55_000) {
  const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl, timeoutMs });
  return new x402ResourceServer(facilitatorClient).register('hedera:*', new ExactHederaScheme({}));
}
