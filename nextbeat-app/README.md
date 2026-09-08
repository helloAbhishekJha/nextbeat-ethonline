# NextBeat (PayCall)

**From Scratch tree:** this folder (`nextbeat-app/`) is the ETHOnline 2026 app. Do not submit `nextbeat/` or `paycall/` (earlier sketches).

Production-quality app for ETHOnline 2026. An agent buys the **next beat** of an onchain investigation: live Graph snapshots fused with Hedera testnet state, paid with dust HBAR via **x402 + Blocky402**.

**Sponsors (max 3):** Hedera · The Graph · Bazantic  

**Network:** `hedera:testnet` only. Default settle **1,000 tinybars (0.00001 HBAR)**.

Use [Hedera Docs MCP](https://docs.hedera.com/learn/getting-started/mcp-setup) and [hedera-skills](https://github.com/hedera-dev/hedera-skills) while building. Do **not** replace this repo with [Scaffold HBAR](https://docs.hedera.com/solutions/tools/scaffold-hbar) (`npm create scaffold-hbar@latest`) — that is Next.js/Solidity dApp scaffolding; the `x402-pay-per-use` template is a file marketplace, not NextBeat.

## Quality bar

- TypeScript `strict` + `noUncheckedIndexedAccess`
- Zod-validated env (no implicit `any` config)
- Metered **quote** (tx count + live Graph rows), cap so quotes cannot drain a wallet
- 8s timeouts on Mirror/Graph HTTP
- Structured logs with secret redaction
- Graceful `SIGTERM`/`SIGINT`
- Unit tests (`quoteBeat`, Graph reasoning) and `npm run smoke` (expects HTTP 402)
- CI: `npm test` + `npm run typecheck`

Pre-5-Sep sketches in `../nextbeat` and `../paycall` are **not** this submission.

## Run (Node 20+)

```bash
cd nextbeat-app
cp .env.example .env   # two ECDSA testnet accounts from portal.hedera.com; faucet ~1000 HBAR/24h, max 5 accounts
npm install
npm test
npm run typecheck
npm run dev
```

- Service: http://127.0.0.1:4021/health  
- Desk UI: http://127.0.0.1:3001  

```bash
npm run smoke
```

## API

| Method | Path | Auth |
|---|---|---|
| `GET` | `/health` | none |
| `GET` | `/v1/quote?accountId=0.0.3&limit=3` | none (metered preview) |
| `POST` | `/v1/brief` `{ accountId, assignment, limit }` | **x402** HBAR |

Settlement amount is the dust floor (`PAYCALL_PRICE_TINYBARS`) so demo spend stays tiny. The quote response shows **metered** components (Hedera extra: not a blind flat chat fee).

## The Graph

Set `GRAPH_QUERY_URLS` to **two** live Studio/gateway query URLs (Messari standardized or DEX factories). The beat **reasons** across protocols; it does not paste raw GraphQL. Without URLs, Hedera still pays; Graph prize needs live endpoints.

## Demo video

720p, **1× speed**, **no music**, **2–4 min** (Pascal uploader; Kartik: speed-up = DQ). Real testnet 402 → settle → HashScan. **Dashboard submit Sat 12 12:00 ET** (24h before official).

## Git

See [GIT.md](./GIT.md). Check-in 1 dashboard: **Sun 7**. Code freeze: **Fri 12**. Dashboard submit: **Sat 12 12:00 ET**. No backdated history.
