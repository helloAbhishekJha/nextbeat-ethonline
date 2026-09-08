import { HTTPFacilitatorClient, x402ResourceServer } from '@x402/core/server';
import { ExactHederaScheme } from '@x402/hedera/exact/server';

export function createTestnetResourceServer(facilitatorUrl: string) {
  const facilitatorClient = new HTTPFacilitatorClient({ url: facilitatorUrl });
  return new x402ResourceServer(facilitatorClient).register('hedera:*', new ExactHederaScheme({}));
}
