# NextBeat

**Author:** Abhishek Jha  

ETHOnline 2026 · **Hedera** · **The Graph** · **World** (slot 3 pilot — swap to ENS/Bazantic if needed)

**NextBeat is a treasury risk desk for agentic payments on Hedera testnet.**

A **finance operator** authorizes the session with **World Selfie Check** (bots must not trigger agent spend). The **agent wallet** then pays for each **risk beat** over **x402** (Blocky402). Each beat fuses live DeFi market data from **The Graph** (Compound + Uniswap) with recent activity on a **Hedera treasury account** you specify.

**Example case:** *Should we pause outbound HBAR from this treasury while lending and DEX markets are under stress?*

Everything runs on **Hedera testnet only** for the hackathon demo. Default price is **1,000 tinybars** (0.00001 HBAR) per beat.

## Live demo

| What | URL |
|---|---|
| Desk + API (one deployment) | **https://nextbeat.vercel.app** |
| Health | https://nextbeat.vercel.app/health |

Desk and service share that host. The desk calls `/v1/brief` on the same origin (`SERVICE_PUBLIC_URL=https://nextbeat.vercel.app`).

Paid buys need Hedera testnet keys in the Vercel project env (agent + service accounts). Without keys, health and the desk UI still load; `/api/buy` stays unavailable.

## Demo video

[`video/nextbeat-demo.mp4`](./video/nextbeat-demo.mp4) — ~2 min, **1280×720**, spoken English narration, **no music**, 1× real time.

## Submission images

| File | Size | Use |
|---|---|---|
| [`images/logo-512.png`](./images/logo-512.png) | 512×512 | Project logo |
| [`images/cover-640x360.png`](./images/cover-640x360.png) | 640×360 | Cover |
| [`images/screenshot-01-desk.png`](./images/screenshot-01-desk.png) | 1280×720 | Desk |
| [`images/screenshot-02-assignment.png`](./images/screenshot-02-assignment.png) | 1280×720 | Assignment form |
| [`images/screenshot-03-beat.png`](./images/screenshot-03-beat.png) | 1280×720 | Settled beat |

## How it works

```mermaid
flowchart LR
  A[Desk UI<br/>port 3001] -->|quote / brief| B[NextBeat service<br/>port 4021]
  B -->|live queries| C[The Graph]
  B -->|account / mirror| D[Hedera testnet]
  A -->|pay HBAR via x402| E[Blocky402]
  E -->|settle| D
  B -->|optional receipt| F[HCS topic]
```

1. **Authorize** — treasury operator passes World Selfie Check.  
2. **Open case** — risk question + Hedera treasury account under review.  
3. **Quote** (free) — `GET /v1/quote` shows the metered price for this depth.  
4. **Buy beat** — `POST /v1/brief` returns `402 Payment Required`; the **agent wallet** pays dust HBAR via Blocky402.  
5. **Read beat** — reasoning text compares Graph market snapshot with treasury activity; verify payment on [HashScan testnet](https://hashscan.io/testnet). Optional: HCS receipt hash.

| Role | Who |
|---|---|
| Treasury operator | Human — World selfie authorizes the desk |
| Agent wallet | Backend — pays each beat automatically (x402) |
| Treasury account | The `accountId` in the case — what you are reviewing, not who pays |

World feedback: [`docs/world-selfie-feedback.md`](./docs/world-selfie-feedback.md). Checklist: [`docs/submission-checklist.md`](./docs/submission-checklist.md).

## Repo layout

| Path | Role |
|---|---|
| `nextbeat-app/packages/service` | HTTP API: health, quote, paid brief |
| `nextbeat-app/packages/agent` | Desk UI that quotes, pays, and shows the beat |
| `nextbeat-app/packages/shared` | Shared types, env, quote math |

## How to run

**Need:** Node **20.19+**, two Hedera **testnet ECDSA** accounts from [portal.hedera.com](https://portal.hedera.com) (faucet ~1000 HBAR / 24h).

```bash
cd nextbeat-app
cp .env.example .env
# Edit .env: agent + service account IDs and private keys
# Optional: GRAPH_QUERY_URLS=url1,url2  (two live Studio/gateway endpoints)

npm install
npm test
npm run typecheck
npm run dev
```

| What | URL |
|---|---|
| Service health | http://127.0.0.1:4021/health |
| Desk UI | http://127.0.0.1:3001 |

Check that unpaid brief returns 402:

```bash
npm run smoke
```

## API

| Method | Path | Payment |
|---|---|---|
| `GET` | `/health` | none |
| `GET` | `/v1/quote?accountId=…&limit=3` | none (price preview) |
| `POST` | `/v1/brief` | x402 HBAR on testnet |

Body for brief: `{ "accountId", "assignment", "limit" }`.

## Notes

- Never commit `.env` or private keys.  
- Never use mainnet.  
- For The Graph track, set two live `GRAPH_QUERY_URLS`; the beat reasons over them instead of dumping raw GraphQL.  
- Git cadence and milestones: [`nextbeat-app/GIT.md`](./nextbeat-app/GIT.md).
