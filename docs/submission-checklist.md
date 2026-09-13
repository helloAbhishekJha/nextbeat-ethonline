# NextBeat — submission checklist (ETHOnline 2026)

**Product:** Treasury Risk **Agent** — human operator authorizes (World); **agent wallet** pays per beat (Hedera x402); each beat fuses The Graph + Hedera mirror + reasoning.

Prizes: [ethglobal.com/events/ethonline2026/prizes](https://ethglobal.com/events/ethonline2026/prizes)  
**Form sponsors (exactly 3):** Hedera · The Graph · World · **From Scratch** track  
**Live demo:** https://nextbeat.vercel.app  
**Agent manifest:** https://nextbeat.vercel.app/api/agent  
**Example cases:** [README — Example cases](../README.md#example-cases-real-treasury-workflows)

## Agent architecture (not “just an API”)

| Step | Sponsor | Tool |
|---|---|---|
| 1 | **World** | Selfie Check (IDKit v4) — human gate |
| 2 | **The Graph** | Studio gateway subgraph queries (Compound V2 + Uniswap V2) |
| 3 | **Hedera** | Mirror Node — treasury balance + transfers |
| 4 | **NextBeat** | Reasoning (gpt-4o-mini on custom Qs; templates on presets) |
| 5 | **Hedera** | x402 exact payment — agent wallet → service (Blocky402) |

Visible in each beat JSON: `agentRun.steps` and in UI: **Treasury Risk Agent run**.

## Sponsor alignment

### Hedera — AI & Agentic Payments ($6,000 · up to 3 × $2,000)

| They ask | We built | Status |
|---|---|---|
| Live x402 service via Blocky402 | `POST /v1/brief` → 402 → settle | ✅ |
| **Agent** completes real paid request | Desk `POST /api/buy` + x402 client wallet | ✅ |
| Metered feed (extra) | `GET /v1/quote` | ✅ |
| Demo + public repo | README + video | ⚠️ video on dashboard (you) |

### The Graph — Best AI Use Case From Scratch ($5,000 · 1st $2,500)

| They ask | We built | Status |
|---|---|---|
| Live Studio subgraph data | Compound V2 + Uniswap V2 gateway URLs | ✅ |
| AI reasoning on Graph data | gpt-4o-mini + Graph facts JSON; templates for presets | ✅ |
| 2–4 min demo | ~4:48 on dashboard (you) | ⚠️ |

Subgraph IDs: `4TbqVA8p2DoBd5qDbPMwmDZv3CsJjWtxo8nVSqF2tA9a` (Compound), `5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV` (Uniswap V2).

### World — Selfie Check ($3,500 · up to 3 × $1,166)

| They ask | We built | Status |
|---|---|---|
| Abuse gate before agent spend | World gate on `/api/buy` | ✅ |
| Feedback document | [`world-selfie-feedback.md`](./world-selfie-feedback.md) | ✅ |
| Real Selfie in demo | `WORLD_DEMO_GATE=false` on Vercel | ✅ |

## Your remaining tasks

| # | Task | Status |
|---|---|---|
| 1 | Upload demo video on dashboard (World selfie → case → agent run → HashScan) | **You** |
| 2 | ETHGlobal dashboard — sponsors: **Hedera, The Graph, World**; World fields: [`world-selfie-feedback.md` §7](./world-selfie-feedback.md#7-ethglobal-dashboard--world-prize-copypaste) | **You** |
| 3 | Screenshots in `images/screenshot-*.png` (refreshed) | ✅ |
| 4 | Optional: tag repo `v0.1.0-ethonline` | **You** |

Local dev: `cd nextbeat-app && npm run dev` → http://127.0.0.1:3001
