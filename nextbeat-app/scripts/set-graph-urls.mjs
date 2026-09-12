import { readFileSync, writeFileSync } from 'node:fs';

const COMPOUND = '4TbqVA8p2DoBd5qDbPMwmDZv3CsJjWtxo8nVSqF2tA9a';
const UNISWAP_V2 = '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV';

const envPath = new URL('../.env', import.meta.url);
const raw = readFileSync(envPath, 'utf8');
const key = raw
  .split('\n')
  .find((line) => line.startsWith('GRAPH_API_KEY='))
  ?.slice('GRAPH_API_KEY='.length)
  .trim();
if (!key) throw new Error('GRAPH_API_KEY missing in .env');

const urls = [
  `https://gateway.thegraph.com/api/${key}/subgraphs/id/${COMPOUND}`,
  `https://gateway.thegraph.com/api/${key}/subgraphs/id/${UNISWAP_V2}`,
].join(',');

for (const [name, id, query] of [
  ['Compound V2', COMPOUND, '{ protocols(first: 1) { name totalValueLockedUSD } }'],
  ['Uniswap V2', UNISWAP_V2, '{ factories(first: 1) { id totalValueLockedUSD poolCount } }'],
]) {
  const response = await fetch(`https://gateway.thegraph.com/api/${key}/subgraphs/id/${id}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ query }),
  });
  const body = await response.json();
  if (body.errors?.length) throw new Error(`${name}: ${body.errors[0].message}`);
  console.log(`${name}: OK`);
}

const lines = raw.split('\n').filter(
  (line) => !line.startsWith('GRAPH_QUERY_URLS=') && !line.startsWith('# GRAPH_QUERY_URLS='),
);
const graphIdx = lines.findIndex((line) => line.startsWith('# The Graph'));
if (graphIdx >= 0) {
  lines.splice(graphIdx + 1, 0, `GRAPH_QUERY_URLS=${urls}`);
} else {
  lines.push(`GRAPH_QUERY_URLS=${urls}`);
}
writeFileSync(envPath, lines.join('\n').replace(/\n?$/, '\n'));
console.log('GRAPH_QUERY_URLS saved to .env');
