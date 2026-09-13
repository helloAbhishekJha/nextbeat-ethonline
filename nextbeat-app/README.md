# NextBeat app

Treasury risk desk for agentic payments — **authorize (World) → open case → agent buys beat (Hedera x402 + The Graph)**.

Full story, architecture, and run instructions: **[repo root README](../README.md)**.

```bash
cp .env.example .env   # two ECDSA testnet accounts from portal.hedera.com
npm install
npm test
npm run typecheck
npm run dev
```

| What | URL |
|---|---|
| Desk (local) | http://127.0.0.1:3001 |
| Service health | http://127.0.0.1:4021/health |
| Live demo | https://nextbeat.vercel.app |

Smoke (expects HTTP 402): `npm run smoke`

**Env:** `SLOT_3_SPONSOR=world` + World portal keys; `WORLD_DEMO_GATE=true` only for local bypass. `GRAPH_QUERY_URLS` + `GRAPH_API_KEY` for live Graph beats.

Git protocol: [GIT.md](./GIT.md).
