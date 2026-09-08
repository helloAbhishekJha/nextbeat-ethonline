const base = process.env.SERVICE_PUBLIC_URL ?? 'http://127.0.0.1:4021';

const health = await fetch(`${base}/health`);
if (!health.ok) {
  console.error('health failed', health.status);
  process.exit(1);
}
console.log('health', await health.json());

const quote = await fetch(`${base}/v1/quote?accountId=0.0.3&limit=2`);
console.log('quote', quote.status, await quote.json());

const unpaid = await fetch(`${base}/v1/brief`, {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ accountId: '0.0.3', assignment: 'smoke', limit: 2 }),
});
console.log('brief', unpaid.status);
if (unpaid.status !== 402) {
  console.error('expected 402');
  process.exit(1);
}
console.log('smoke ok — HTTP 402 on POST /v1/brief');
