# NextBeat — submission checklist (ETHOnline 2026)

Prizes: [ethglobal.com/events/ethonline2026/prizes](https://ethglobal.com/events/ethonline2026/prizes)  
**Form sponsors (exactly 3):** Hedera · The Graph · World · **From Scratch** track

## Sponsor alignment

### Hedera — AI & Agentic Payments ($6,000 · up to 3 × $2,000)

| They ask | We built | Status |
|---|---|---|
| Live x402 service via Blocky402 | `POST /v1/brief` → 402 → settle | ✅ |
| Agent completes real paid request | Desk `/api/buy` + x402 client | ✅ local |
| Metered feed (extra) | `GET /v1/quote` | ✅ |
| Demo + public repo | README + video pending | ⚠️ |

### The Graph — Best AI Use Case From Scratch ($5,000 · 1st $2,500)

| They ask | We built | Status |
|---|---|---|
| Live Studio subgraph data | Compound V2 Messari + Uniswap V2 gateway URLs | ✅ |
| Reasoning, not raw GraphQL dump | `reasonAboutBeats()` in paid clue | ✅ |
| 2–4 min demo | Re-record pending | ⚠️ |

Subgraph IDs: `4TbqVA8p2DoBd5qDbPMwmDZv3CsJjWtxo8nVSqF2tA9a` (Compound), `5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV` (Uniswap V2).

### World — Selfie Check ($3,500 · up to 3 × $1,166)

| They ask | We built | Status |
|---|---|---|
| Abuse/eligibility gate before action | World gate on `/api/buy` | ✅ |
| Feedback document | [`world-selfie-feedback.md`](./world-selfie-feedback.md) | ⚠️ fill sandbox notes |
| Real Selfie in demo | Set `WORLD_DEMO_GATE=false`, test phone | ⚠️ |

**Prize ceiling (if 1st in all three): ~$5,666** — not guaranteed.

## Next steps

| # | Task | Who |
|---|---|---|
| 1 | Vercel env: Hedera + Graph + World keys → redeploy | **You** |
| 2 | `WORLD_DEMO_GATE=false` → Selfie Check on phone | **You** |
| 3 | Fill World feedback doc | **You** (template ready) |
| 4 | Re-record demo video (2–4 min, no music): Selfie → pay → Graph → HashScan | **You** |
| 5 | ETHGlobal dashboard submit by **Sat 12 Sep 12:00 ET** | **You** |

Local dev: `cd nextbeat-app && npm run dev` → http://127.0.0.1:3001
