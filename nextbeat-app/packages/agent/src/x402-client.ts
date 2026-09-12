import { wrapFetchWithPayment, x402Client } from '@x402/fetch';
import { ExactHederaScheme, createClientHederaSigner, PrivateKey } from '@x402/hedera';

export type PaymentStage = 'connecting' | 'payment_required' | 'sending' | 'accepted';

export function createPayingFetch(accountId: string, ecdsaPrivateKey: string): {
  fetchWithPayment: typeof fetch;
  onStatus: (handler: (stage: PaymentStage) => void) => void;
} {
  const signer = createClientHederaSigner(accountId, PrivateKey.fromStringECDSA(ecdsaPrivateKey), {
    network: 'hedera:testnet',
  });
  // Hedera native HBAR is not a default USD-pegged asset in x402 spendControls.
  const client = new x402Client()
    .setSpendControls(false)
    .register('hedera:testnet', new ExactHederaScheme(signer));

  let handler: ((stage: PaymentStage) => void) | undefined;
  const statusFetch: typeof fetch = async (input, init) => {
    const req = input instanceof Request ? input : new Request(String(input), init);
    const retry = req.headers.has('PAYMENT-SIGNATURE') || req.headers.has('X-PAYMENT');
    if (!retry) {
      handler?.('connecting');
      const res = await globalThis.fetch(input, init);
      if (res.status === 402) handler?.('payment_required');
      return res;
    }
    handler?.('sending');
    const res = await globalThis.fetch(input, init);
    if (res.ok) handler?.('accepted');
    return res;
  };

  return {
    fetchWithPayment: wrapFetchWithPayment(statusFetch, client),
    onStatus: (h) => {
      handler = h;
    },
  };
}
