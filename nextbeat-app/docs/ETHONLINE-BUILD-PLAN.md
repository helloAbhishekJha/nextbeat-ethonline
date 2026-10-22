# PayCall — build plan

**Interview Drill Pro (RevenueCat Shipaton), added Sun Sep 27, 2026:** Play Console will not open Production until a closed test has 12 testers opted in for 14 days. That Play wait is longer than the time left before the RevenueCat deadline (Wed Sep 30, 2026, 11:45 PM PDT). The app stays on internal testing. Details: `interview-drill-app/USER-SUBMIT-CHECKLIST-DRILL.md`. Devpost **submitted** Sep 28, 2026.

**Upcoming hackathons (system calendar):** [`HACKATHONS-TODO.md`](./HACKATHONS-TODO.md) — [Amazon Developer 2026](https://amazonappdev2026.devpost.com/) **Oct 23 @ 12:00 PM PDT** · [Nebius × NVIDIA Global AI](https://nebiusglobalaihackathon.devpost.com/) **Oct 30 @ 10:00 AM PDT**.



**Hackathon:** ETHOnline 2026. Kickoff: [Kartik](https://www.youtube.com/live/u8mFqPN09TA). Official lock **Sun 13 Sep 12:00 ET**. **We submit Sat 12 Sep 12:00 ET.**

## Official clock (do not skip)

| Rule | Detail |
|---|---|
| **Hacking start** | **Friday 4 Sep 2026, 12:00 PM America/New_York (EDT, UTC−4)** |
| **Submit (official)** | **Sunday 13 Sep 2026, 12:00 PM ET** (Kartik). Dashboard is source of truth. |
| **Our submit** | **Always 24h early.** Check-in 1 dashboard **Sun 7**; check-in 2 **Tue 9**; final form **Sat 12 Sep 12:00 ET**. No last-minute video encode. |
| **Kartik > Pascal** | Kickoff ([u8mFqPN09TA](https://www.youtube.com/live/u8mFqPN09TA)) beats Pascal’s walkthrough on conflicts. Pascal still owns the **upload checker**: video **2–4 min**, 720p, spoken audio, **no music**. |
| **Track** | **From Scratch** (binary vs Continuity). Continuity prizes do not apply. |
| **Demo** | **2–4 min** (Pascal uploader). Kartik: **no speed-up** = DQ. Aim ~3.5 min demo, not slides. |
| **AI** | Assistants OK if you verify every integration. Fake integrations = **full DQ**. Know the code. **Commit plans** in the repo. Explain AI use on the form. |
| **3 sponsors max** | **Hedera + The Graph** (fixed) + **one** of World / ENS / Bazantic (see below). |
| **This repo** | Planning docs are research. Official app: **`nextbeat-app/`** (created **7 Sep**, after the 5 Sep gate). Ignore `nextbeat/` and `paycall/` (earlier sketches). |

**Build freeze:** no PayCall implementation until **12:00 PM ET on 4 Sep 2026**. After that, Phase 0 wallets + Phase 1 MVP.

### Demo video (submission)

Hedera asks ≤5 min; Graph asks 2–4 min; **Kartik: 4 min cap, speed-up = DQ.** Pascal’s dashboard: **2–4 min** or the upload fails. **One video, 2–4 min (aim ~3.5)**, all three sponsors.

| Must | Must not |
|---|---|
| **720p** (1280×720) or higher, landscape | Vertical-only phone video |
| **1× real time** — talk and click at normal speed | Sped-up, time-lapse, or jump-cut through the payment (**DQ**) |
| **No music**, no copyrighted soundtrack | Background tracks, TikTok audio |
| Voiceover or on-screen captions OK | |
| Show **one real testnet paid request** (402 → pay → brief) | Mocked payments |
| Show **live Graph** reasoning (not a screenshot of JSON only) | |
| Show **slot-3 sponsor** in demo: World Selfie gate, ENS live resolve, or Bazantic recipe — whichever shipped | |
| End on HashScan / HCS topic | |

Record the screen at native resolution, export 720p. Leave 2 seconds of silence at start/end. File: `demo.mp4` in the repo or unlisted YouTube/Loom linked from README.

### Git history (auditable)

Full protocol: [`nextbeat/GIT.md`](./nextbeat/GIT.md). **Never backdate commits.**

| Date | Milestone |
|---|---|
| **5 Sep** | **Start** — first real commit(s). Repo goes public. |
| **7 Sep** | **Check-in 1 on dashboard** (24h early). Git HashScan can land 8 Sep. |
| **9 Sep** | **Check-in 2 on dashboard** (24h early). Live Graph in git by 10 Sep. |
| **12 Sep 12:00 ET** | **Submit** (24h before official noon-ET 13 Sep). Video + README + **3 sponsors**. |
| **13 Sep 12:00 ET** | Official deadline (buffer only). Do not plan to use it. |
| **14 Sep 12:00–14:00 ET** | **Finalist Zoom if opted in** — Kartik: 7 min live. Must attend. |

Until **5 Sep**: no `git commit` of `nextbeat/`. Today (4 Sep) is ETHOnline clock, but this project’s **logged start is the 5th**.

### Discord and workshop notes

Join **[ETHGlobal Discord](https://ethglobal.com/discord)** with the **same email as the hacker dashboard**. Live event page: **ethglobal.tv**. Hedera **`#testnet-faucet`** if the portal faucet fails.

Do not rely on watching [youtube.com/@ETHGlobal](https://www.youtube.com/@ETHGlobal). Run an **AI note-taker** (YouTube transcript, Whisper, Granola, Otter, Fireflies, tl;dv) and keep **short bullets** in `uniqueness.md` / this file: submission rules, sponsor gotchas, demo tropes. No full transcripts in git.

---

**Sponsor cap:** ETHOnline allows **at most 3 sponsors** on the submission form. Never list four.

### Locked (slots 1–2)

| # | Sponsor | Track | Status |
|---|---|---|---|
| 1 | **Hedera** | AI & Agentic Payments (up to 3 × $2,000) | Core product — x402 + Blocky402 testnet. Finish **one real paid** request on deploy. |
| 2 | **The Graph** | Best AI use case — from scratch ($5,000; 1st $2,500) | Live `GRAPH_QUERY_URLS` + reasoning in the beat (not raw GraphQL dump). |

**Do not swap slot 2** unless Graph is blocked (no Studio API key after a real attempt). Only then consider replacing Graph with another sponsor — unlikely.

### Slot 3 — pick **one** before submit (priority order)

Bazantic is **not finalized**. Try integrations in this order; **list only the one that ships** on the dashboard.

| Priority | Sponsor | Track | Bolt-on to NextBeat | Est. hours | Ship criteria |
|---|---|---|---|---|---|
| **1** | **World** | Selfie Check ($3,500) | Human must pass **Selfie Check** before desk can pay / unlock a beat (anti-bot gate). | 4–8 h | Sandbox works; selfie used for **eligibility / spend**, not decoration; **feedback doc** filed per World rules. |
| **2** | **Bazantic** | Best recipe using sponsor APIs ($1,000) | **Fallback** if World doesn’t qualify: gateway on `/v1/brief` + recipe Graph → paid brief + before/after clip. Reference their integration code only — not a clone of their UI. | 6–12 h | Account + gateway + recipe + A/B screen recording. |
| **3** | **ENS** | Best use of ENSv2 ($4,500) | **Only if time + distinct gamified hook:** live Sepolia resolve for a **named case dossier** (e.g. `case-7.nextbeat.eth` holds assignment text). Reference ENS docs/code for resolve/subnames — **do not** ship an ENS MCP server, Claude Code pack, or CLI (that is a different product). | 6–12 h | One live resolve in *our* desk; permissioned subname story in README. |

**Never submit** Ledger, Privy, Arc, Uniswap, 1inch, or Chainlink — not in the three slots.

**Slot 3 decision tree:** World sandbox works by Fri → World on form. Else → Bazantic recipe. ENS only if we have a native “named case” gate — not a workshop MCP/CLI fork.

**Prize target (revised):** qualify **Hedera** first, then **Graph**. Slot 3 is upside: World ($3.5k pool) or ENS ($1.5k 1st) or Bazantic ($500 1st). Realistic floor: **Hedera $2k** + Graph shot; ceiling with World slot 3 ≈ **$2k + $2.5k + $3.5k** (lottery on Selfie Check).

**Spend rule:** **testnet only. Never mainnet.** Price is the smallest HBAR amount the facilitator will accept. Default **1,000 tinybars = 0.00001 HBAR** (~$0 even on mainnet; on testnet it is faucet play money). If Blocky402 rejects that as dust, bump to **100,000 tinybars = 0.001 HBAR** (their own example). **Do not use USDC** for MVP so we do not need Circle’s faucet.

**If the faucet fails:** create two ECDSA accounts at [portal.hedera.com](https://portal.hedera.com), then try [faucet.hedera.com](https://faucet.hedera.com). Alternatives: HashPack testnet faucet, Hedera Discord `#testnet-faucet`. You never send real mainnet HBAR.

### Testnet faucet (portal)

[portal.hedera.com](https://portal.hedera.com) — same login as Playground / Agent Lab.

| Limit | Detail |
|---|---|
| **~1000 testnet HBAR** (UI may say **credits**) | New portal account funded at creation. Manual refill **once per 24h**. Refill **tops the balance back up to 1000**, it does not add 1000 on top of what you already have |
| **Up to 5 accounts** per portal profile | NextBeat needs **two ECDSA** only: agent (payer) + service (payTo / HCS). Leave the other slots unused |
| Key type | **ECDSA** for x402 / EVM-style tools. Do not use ED25519 for the NextBeat keys |

Anonymous [faucet.hedera.com](https://faucet.hedera.com): **100 HBAR / 24h** per destination — backup, not the primary. Faucet API (PAT): also **100 HBAR / 24h** ([docs](https://docs.hedera.com/learn/getting-started/faucet-api)). Dust x402 (1000 tinybars) + fees (~0.0001 HBAR) means **one 1000 HBAR drop lasts the whole hackathon**.

---

## Money and networks (locked)

| Setting | Value |
|---|---|
| Network | `hedera:testnet` only |
| Asset | Native **HBAR** (`0.0.0`) — no token association |
| Facilitator | `https://api.testnet.blocky402.com` (prize: Blocky402) |
| Price | `PAYCALL_PRICE_TINYBARS` default `1000` |
| Seller account | receives micropayments |
| Buyer (agent) account | pays; needs testnet HBAR for amount + tiny network fee |

Hedera testnet fees are on the order of **~0.0001 HBAR** per transfer. A faucet drop covers the whole hackathon.

---

## Product (what we are actually building)

**Creative hook (sponsor topics, not a 402 wrapper):** the agent is a **wire reporter**. It does not buy “an API.” It **buys the next beat** of a live investigation.

Hedera’s page asks for a **metered data feed** and extra credit for **HCS audit trails**. The Graph’s page asks for **one standardized query across many protocols** and an agent that **reasons** on live data. **Slot 3** (World / ENS / Bazantic) adds either a **human gate**, **onchain agent identity**, or a **multi-API recipe** — only one lands on the form.

**NextBeat (shipped as PayCall)** — Due-diligence as a serial:

1. **Assignment (free):** “Is this Hedera treasury over-exposed to DeFi lending risk?”
2. **Beat 1 — The Graph (live):** one **Messari-style** query against **≥2 protocol subgraphs** (same schema, many venues). Output is a *comparison*, not a raw dump — Graph prize language: standards leverage.
3. **Beat 2 — Hedera x402 (paid, metered):** the reporter **pays dust HBAR** (Blocky402 testnet) for the next paragraph: fuse beat 1 with Hedera mirror/HCS, **quote first** (`GET /v1/quote`), price rises with `limit` / row count (metered feed, not flat $0.001 chat).
4. **Morgue — HCS:** hash of Graph query + brief stamped on a topic (audit trail judges read on HashScan).
5. **Slot 3 (one of):** World Selfie before pay · ENS-named desk/agent on Sepolia · Bazantic recipe Graph → paid brief (fallback).

That is **not** LM Studio chat, **not** an inference marketplace, **not** “Uniswap GraphQL for 0.02 HBAR.”

| Sponsor topic on the prizes page | How NextBeat uses it |
|---|---|
| Hedera: metered data / pay-per-call / x402 + Blocky402 | Each beat is a paid request; quote scales with depth |
| Hedera: HCS audit | Topic receipt after settle |
| Graph: standardized subgraphs / AI use case | Multi-protocol live query + reasoning |
| World / ENS / Bazantic (slot 3) | Human gate · agent namespace · or sponsor-API recipe (whichever shipped) |

**Do not ship a clone.** Showcase already has Hedera x402 **inference** ([AgentRouter](https://ethglobal.com/showcase/agentrouter-deqhv), official LM Studio PoC) and a **generic API paywall** that resells Uniswap GraphQL ([Glassbox402](https://ethglobal.com/showcase/glassbox402-qyepd)). Full comparison: [`uniqueness.md`](./uniqueness.md).

PayCall uniqueness (still only 3 sponsors):

| Sponsor | We do (unlike them) |
|---|---|
| Hedera | Metered quote (`GET /v1/quote` free) + paid brief; HCS receipt with hashes; buyer budget cap |
| The Graph | Messari **standardized** query across **≥2 protocols** + **reason** with Hedera state — not raw Uniswap GraphQL as a SKU |
| Slot 3 | World Selfie gate, Bazantic recipe, or ENS named-case resolve — **one** on the form |

---

## Steps — todo by creator

Action list as of **13 Sep 2026**. Production: https://nextbeat.vercel.app — `walletReady` + `graphConfigured` ✅ on deploy. **You:** selfie test, video, dashboard submit.

### Phase A — Today (blockers)

**1. Hedera wallets + local `.env`**

1. [portal.hedera.com](https://portal.hedera.com) → create **two ECDSA testnet** accounts (agent payer + service payTo).
2. Faucet both (~1000 HBAR / 24h each).
3. `cd nextbeat-app && cp .env.example .env`
4. Fill: `HEDERA_AGENT_*`, `HEDERA_SERVICE_*`, `SERVICE_PUBLIC_URL=http://127.0.0.1:4021`, `WORLD_DEMO_GATE=true` (until World portal keys work).

**2. Prove Hedera locally (do not skip)**

```bash
cd nextbeat-app
npm install && npm test && npm run typecheck && npm run dev
```

1. Open http://127.0.0.1:3001  
2. **Dev bypass** (World demo gate) → **Buy next clue**  
3. Confirm real beat JSON (not simulated).  
4. [HashScan testnet](https://hashscan.io/testnet) → **~1000 tinybar** transfer agent → service.  

**Stop until HashScan shows that tx.** Phase 4 depends on it.

**3. Vercel env + redeploy** ✅ **Done 13 Sep** — CLI push + `vercel --prod`; https://nextbeat.vercel.app/health → `graphConfigured: true`, `/api/config` → `walletReady: true`.

### Phase B — Sponsor 2: The Graph (Thu–Fri)

**4. Live Graph endpoints**

1. [The Graph Studio](https://thegraph.com/studio/) → API key.  
2. Two gateway/subgraph URLs (e.g. lending + DEX).  
3. `.env` + Vercel:
   ```bash
   GRAPH_QUERY_URLS=https://gateway.thegraph.com/api/.../AAA,https://gateway.thegraph.com/api/.../BBB
   GRAPH_API_KEY=...
   ```
4. Redeploy → `/health` shows `graphConfigured: true`.  
5. Buy a clue; beat must **reason** over live data (not empty / generic).

### Phase C — Sponsor 3: World (decide by Fri)

**Path A — World Selfie Check (preferred, code already in desk)**

1. Request sandbox if needed: [developers@toolsforhumanity.com](mailto:developers@toolsforhumanity.com) · [Selfie Check testing](https://docs.world.org/world-id/sandbox/testing-selfie-check).  
2. [Developer Portal](https://developer.world.org) → `WORLD_APP_ID`, `WORLD_RP_ID`, `WORLD_SIGNING_KEY_HEX`.  
3. Env: `SLOT_3_SPONSOR=world`, `WORLD_DEMO_GATE=false`, plus World keys.  
4. Test: desk → **Scan Selfie Check** → World App → case unlocks → buy clue.  
5. File **World feedback doc** (prize requirement).

**Path B — World fails → Bazantic (not ENS MCP clone)**

1. Bazantic account + gateway on `/v1/brief` flow.  
2. Recipe: Graph → paid brief; record before/after for video.  
3. Form lists **Bazantic** as sponsor 3.

**Path C — ENS (only if distinct gamified hook + time)**

- Step 1 becomes **prove case identity** via live Sepolia resolve (`case-N.nextbeat.eth`), not Selfie.  
- Use ENS docs/SDK for resolve only — **not** their MCP + Claude Code + CLI product.  
- Skip entirely if it reads as a workshop clone.

### Phase D — Demo video (Fri–Sat morning ET)

**5. Re-record** (`video/nextbeat-demo.mp4`): **2–4 min**, **720p**, **no music**, **1× speed**.

| # | Show |
|---|---|
| 1 | Gamified desk — 3 steps (human → case → clue) |
| 2 | World Selfie or dev bypass (say “dev bypass” if no sandbox) |
| 3 | Assignment + Hedera account |
| 4 | Buy clue — SSE status (402 → settle) |
| 5 | Beat with Graph reasoning visible |
| 6 | HashScan transfer |
| 7 | Optional: HCS topic |

### Phase E — Submit (by Sat 12 Sep 12:00 ET)

**6. ETHGlobal dashboard**

- Check-in 2 if not filed (was due Tue 9 ET).  
- Final: repo, live URL, video, **exactly 3 sponsors** (Hedera, The Graph, + one of World / Bazantic / ENS), AI usage blurb.

**7. README** — third sponsor matches what shipped; testnet-only; env vars; architecture.

**8. Git** — one real commit per ET day you change code; never commit `.env` or `.cursor/`.

### Design & qualification (12 Sep)

**Verdict:** Design is **qualifiable**. Gamification is **not** the blocker — missing sponsor proof in the video is.

| Question | Answer |
|---|---|
| Too gamified for judges? | **No** — case / clue / 3-step desk is thin UX on a real stack (x402 + live Graph + World gate). Comparable showcase projects use narrative framing. |
| What hurts qualification? | Looks like a **402 wrapper with RPG skin** if video never says x402, Graph reasoning, or World abuse gate. **Dev bypass** only in submitted video. Mocked pay or raw JSON dump. |
| What helps? | “Agent wire desk for onchain due diligence” — pay per **beat** of investigation. Gamification makes the 3-min flow memorable if you end on **HashScan + reasoning text**. |

**Per sponsor (gamification helps / neutral / hurts):**

| Sponsor | Effect | What judges need in video |
|---|---|---|
| **Hedera** | Helps | Real 402 → Blocky402 → testnet HBAR; HashScan link; say “metered pay-per-call” |
| **The Graph** | Neutral | Beat text names Compound vs Uniswap TVL — **reasoning**, not step badges or JSON only |
| **World** | Helps | Step 1 “Prove human” before spend matches Selfie Check prize language |

**vs competition** (see [`uniqueness.md`](./uniqueness.md)): not inference chat (Hedera PoC), not generic API wrapper (Glassbox402), not raw GraphQL SKU — **metered research brief** with Messari multi-protocol query + Hedera settle.

**Realistic prize odds:** Strong shot at **Hedera** ($2k tier). Graph and World depend on polish + complete proof. Ceiling if top in all three ≈ **$5,666** — not guaranteed.

**Optional UI tweak for recording:** hero button can say **“Buy next beat (dust HBAR)”** instead of only “Buy clue” — not required.

**60s video script (narration):**

> NextBeat is a treasury risk desk for agentic payments. A finance operator passes World Selfie Check to authorize the session. The agent then pays **dust testnet HBAR** over x402 for the next risk beat — live Compound and Uniswap data from The Graph, fused with this Hedera treasury account. Here’s the HashScan transfer.

---

### Product positioning (locked — 13 Sep)

**One product, one story.** Do not mix “DAO,” “wallet checker,” and “human does research” in the same sentence.

| Role | Who | What they do |
|---|---|---|
| **Treasury operator** | Finance / ops person (you in the demo) | World Selfie → **authorizes** the desk for this session |
| **Agent wallet** | NextBeat backend (`HEDERA_AGENT_*`) | **Pays** each beat automatically via x402 (no manual sign per click) |
| **Risk service** | `/v1/brief` on Hedera testnet | Returns one **beat**: Graph market context + Hedera account activity |

**Primary use case (demo default):** Treasury stress check — *“Should we pause outbound HBAR while lending and DEX markets are under stress?”*

**One-line pitch:** *Treasury operator authorizes; agent pays per beat; live Graph + Hedera; bots blocked by World.*

**UI tone:** Professional **case file** (authorize → case → beat). Not a wallet toy. Not cartoon RPG. Use **https://nextbeat.vercel.app** for submit.

### Payment rules (prizes + Kartik/Pascal)

| Sponsor | Real payment? | Mainnet? | Source |
|---|---|---|---|
| **Hedera** | **Yes** — one real x402 paid request (Blocky402) | **No** — prize says **testnet or mainnet** | [Hedera prize page](https://ethglobal.com/events/ethonline2026/prizes/hedera) |
| **The Graph** | No — live Studio data + reasoning | No | [Prizes page](https://ethglobal.com/events/ethonline2026/prizes) |
| **World** | No — Selfie + feedback doc | No | [Prizes page](https://ethglobal.com/events/ethonline2026/prizes) |
| **Arc** (not on our form) | USDC on Arc | Extra $ only if mainnet by 30 Sep | N/A for NextBeat |

**Kartik:** fake integrations = DQ. **Real** = verifiable tx + live Graph + real Selfie. **Testnet HashScan counts.**

**Submit on testnet only today.** Mainnet is **not** required for Hedera / Graph / World. App is testnet-only in code; mainnet would need env flag + facilitator swap (skip before submit).

### Past winners — testnet vs mainnet (research, 13 Sep)

**Pattern for Hedera / x402 / agent tracks:** winners demo **testnet with real HashScan txs**, not mainnet.

| Project | Event | Network |
|---|---|---|
| [AgentRouter](https://ethglobal.com/showcase/agentrouter-deqhv) | Lisbon 2026 | **`hedera:testnet`** x402 (explicit in showcase) |
| [Glassbox402](https://ethglobal.com/showcase/glassbox402-qyepd) | Lisbon 2026 · Hedera AI & Agentic Payments | Blocky402 on Hedera (+ other chains); real facilitator flow |
| [MilFi](https://ethglobal.com/showcase/milfi-nizoj) | Lisbon 2026 | **Hedera testnet** payouts on HashScan |
| [Wafer](https://github.com/gamween/Wafer) | NYC 2026 · Hedera tokenization | **Hedera testnet** (prize required it) |
| [CoverVault](https://ethglobal.com/showcase/covervault-psqcd) | Hedera overall | Flow / Hedera / Mantle **testnets** |

**Mainnet-heavy prizes** (not our form): **Arc / Circle** — partial award only if deployed to Arc mainnet by 30 Sep.

**Judges accept:** real 402 → pay → HashScan **testnet** + live Graph + real World Selfie. **Reject:** mocked payments with no chain proof.

### If you ever need mainnet HBAR (optional, not for this submit)

| Item | Estimate |
|---|---|
| Agent account (pays beats) | **2–5 HBAR** (~$0.50–2) — hundreds of demo txs |
| Service account (receives) | **~1 HBAR** |
| Per beat | **0.00001 HBAR** + ~0.0001 HBAR network fee |

**Where to buy HBAR (mainnet):**

1. **Centralized exchange** — Coinbase, Binance, Kraken, etc. → withdraw to your Hedera account ID (`0.0.xxxxx`)
2. **HashPack** — [hashpack.app](https://www.hashpack.app) wallet → buy/swap inside app (region-dependent)
3. **On-ramp in wallet** — MoonPay / Banxa links inside HashPack or portal (fees higher; fine for small demo amount)

Create **mainnet** ECDSA accounts at [portal.hedera.com](https://portal.hedera.com) (separate from testnet keys). Never reuse testnet private keys on mainnet.

**Video block explorer links:**

- Testnet account: `https://hashscan.io/testnet/account/0.0.10449882`
- Testnet tx (after buy): open latest transfer on that account, or `https://hashscan.io/testnet/transaction/<txId>`

### World Selfie — browser vs phone (13 Sep)

| Where | What happens |
|---|---|
| **Desktop browser** | Operator opens https://nextbeat.vercel.app and clicks **Authorize with World selfie**. IDKit runs in the browser and returns a **deep link** (`connectorURI`) — “Open World App”. |
| **Phone (required for real verify)** | Selfie Check completes inside the **World App** (camera / liveness). Our integration uses `selfieCheckLegacy` — **not** an in-browser webcam selfie on production (`WORLD_DEMO_GATE=false`). |
| **Back to browser** | Desk polls until proof is done → `POST /api/world/verify` → human cookie → **Buy beat** unlocks. |

**For demo video:** show **both** — browser desk waiting + phone completing World App selfie. Phone is **required** for a real sponsor-compliant Selfie; desktop alone is only the **start** of the flow.

**Local dev only:** `WORLD_DEMO_GATE=true` adds “Skip for local testing” — **not** on Vercel production.

### World Selfie troubleshooting (13 Sep evening)

| Symptom | Likely cause | Fix |
|---|---|---|
| “Something went wrong” (old UI) | Generic catch hid WASM / IDKit error | **Fixed** — redeploy with `world-gate-client.js` shows real message |
| Expected “connect phone” message | Old flow used `IDKit.request` only | **Fixed** — now `requestWithInviteCode` + explicit phone copy + link |
| IDKit WASM fail | Ad blocker, VPN, strict browser | Try Chrome; disable blockers; refresh |
| Selfie times out | World App not opened on phone | Tap the World link **on the phone**; keep desk tab open |
| Verify fails after selfie | Portal `rp_id` / signing key mismatch | Check Vercel `WORLD_*` env matches Developer Portal |

**World App downloads:** https://world.org/?download · [iOS](https://apps.apple.com/app/world-app-real-human-network/id1560859847) · [Android](https://play.google.com/store/apps/details?id=com.worldcoin)

### Time left — your tasks (13 Sep evening IST)

Official lock **Sun 13 Sep 12:00 ET** ≈ **9:30 PM IST**.

| # | Task | Est. time |
|---|---|---|
| 1 | Live test: Selfie (phone) → case chip → buy beat → TTS + HashScan | **15–30 min** |
| 2 | Fill `docs/world-selfie-feedback.md` from real Selfie session | **20–30 min** |
| 3 | Record + export `video/nextbeat-demo.mp4` (2–4 min, 720p, voice, no music, 1×) | **45–90 min** |
| 4 | Push video to GitHub; ETHGlobal dashboard final submit (Hedera + Graph + World) | **20–30 min** |
| | **Total** | **~2–3 hours** |

---

### Remaining steps (13 Sep — updated evening)

**Already done:**

| Item | Status |
|---|---|
| Gamified desk UI (human → case → beat) | ✅ |
| World gate + `/api/world/*` | ✅ |
| Hedera + Graph on Vercel (`walletReady`, `graphConfigured`) | ✅ |
| `WORLD_DEMO_GATE=false` on production | ✅ |
| Treasury risk desk story + README **example cases inline** (no separate file) | ✅ |
| Real testnet accounts only (`0.0.10449882`, `0.0.10456496`) + sample beats | ✅ |
| **TTS** — auto-read beat (Web Speech API) + Stop/Replay | ✅ |
| **Vercel redeploy** with TTS — https://nextbeat.vercel.app (`dpl_85qB1Rce2EbcSWBrJmyyrN5Jp8j5`) | ✅ **13 Sep evening** |
| **World gate UX fix** — invite-code flow, pinned IDKit 4.2.4, clear phone instructions | ✅ **13 Sep evening** (redeploy after push) |
| README **Mermaid** — World + Graph + Hedera mirror + x402 in one diagram | ✅ **13 Sep evening** |
| Submission images in `images/` | ✅ |
| `docs/submission-checklist.md` + World feedback template | ✅ |

**Steps left — only you:**

| # | Task | Why only you |
|---|---|---|
| 1 | **Live test** on phone + desktop (see recording script below) | World App + real buy |
| 2 | Fill [`docs/world-selfie-feedback.md`](./docs/world-selfie-feedback.md) | World prize feedback |
| 3 | **Record** `video/nextbeat-demo.mp4` — file **does not exist yet**; README links to it | Screen + voice + phone |
| 4 | **Push video** to GitHub `main` | Judges + dashboard link |
| 5 | **ETHGlobal dashboard** — 3 sponsors: Hedera, The Graph, World; From Scratch; live URL + repo + video | Login |
| 6 | Confirm agent `0.0.10456496` has testnet HBAR ([portal faucet](https://portal.hedera.com)) | Pays fail if empty |
| 7 | Check-in 2 on dashboard if not filed | ETHGlobal |
| 8 | Optional: HCS in video | Low priority |

---

### 🎬 Recording script — read this when you hit Record

**URL:** https://nextbeat.vercel.app · **Accounts:** service `0.0.10449882`, agent `0.0.10456496`

| Step | On screen | Say (short) |
|---|---|---|
| 1 | Desk loads — Treasury Risk Desk | “NextBeat is a treasury risk desk for agentic payments on Hedera testnet.” |
| 2 | Click **Authorize with World selfie**; show phone / World App completing selfie | “Finance operators pass World Selfie Check before any agent spend.” |
| 3 | Case unlocks — click **1 · Vendor batch** (or any chip) | “They open a real treasury case — here, approving this week’s vendor batch.” |
| 4 | Account `0.0.10449882` visible — click **Buy next beat** | “The agent wallet pays each beat over x402 — about a thousand tinybars.” |
| 5 | Beat appears — **Compound + Uniswap TVL** + Hedera tx count; let **TTS read** a sentence or two | “Each beat fuses live Graph market data with Hedera mirror activity for this account.” |
| 6 | Open **HashScan** link — payment from agent to service | “Payment settles on Hedera testnet — verifiable on HashScan.” |
| 7 | Optional: README Mermaid or GitHub repo tab | “Three sponsors: Hedera x402, The Graph reasoning, World human gate.” |

**Video rules (DQ if broken):** 2–4 min · **1280×720** landscape · **1× speed** · **no music** · real testnet tx · real Selfie (not demo bypass).

**After recording:** export → `video/nextbeat-demo.mp4` → `git add` → push → paste link on ETHGlobal form.

**Agent can still help:** debug logs you paste, README tweaks, commit/push — not selfie, feedback bullets from your experience, or dashboard login.

### Live deploy backups (13 Sep)

Keep **both** URLs. Do **not** redeploy the stable copy unless the submission demo is locked.

| Copy | URL | UI | Vercel project | Env notes |
|---|---|---|---|---|
| **Stable (submission)** | https://nextbeat.vercel.app | Treasury Risk Desk (authorize → case → beat) | `nextbeat` | `DESK_UI=classic` (default), `SERVICE_PUBLIC_URL=https://nextbeat.vercel.app` |
| **Beta (plain language)** | https://nextbeat-simple.vercel.app | Simple wallet-check copy | `nextbeat-simple` | `DESK_UI=simple`, `SERVICE_PUBLIC_URL=https://nextbeat-simple.vercel.app` |

**Local dev (classic restored):**

| URL | What |
|---|---|
| http://127.0.0.1:3001/ | Classic desk (same as stable Vercel) |
| http://127.0.0.1:3001/simple/ | Simple beta UI without redeploying Vercel |

**If beta breaks:** use stable URL for demo/submit. **If stable breaks:** do not overwrite `nextbeat` — fix forward or roll back that project only in Vercel dashboard.

**CLI default:** `.vercel/project.json` → `nextbeat` (main). Deploy beta: `vercel link --project nextbeat-simple --yes && vercel --prod --yes` then restore main link from `.vercel/project-main.json`.

---

## Sponsor prize alignment (ETHOnline 2026)

Source: [ethglobal.com/events/ethonline2026/prizes](https://ethglobal.com/events/ethonline2026/prizes). **List exactly 3 sponsors** on the form: **Hedera + The Graph + World**. Track: **From Scratch**. Amounts are **competitive maxima**, not guaranteed.

### Sponsor 1 — Hedera · AI & Agentic Payments ($6,000 pool)

| | |
|---|---|
| **They ask** | *“Stand up a real x402-gated service on Hedera and build the platform that consumes it… meter data or compute… agent paying without an API key.”* Qualify: live x402 via **Blocky402**, **≥1 real paid request**, public repo, demo ≤5 min. |
| **We built** | `POST /v1/brief` → 402 → Blocky402 settle; gamified desk `/api/buy`; `GET /v1/quote` metering; optional HCS receipt. |
| **Gaps** | HashScan tx in video (demo still pending). Vercel live pay ✅. |
| **Prize** | Up to **3 × $2,000** (best odds of the three tracks). |

### Sponsor 2 — The Graph · Best AI Use Case (From Scratch) ($5,000 pool)

| | |
|---|---|
| **They ask** | *“Agent/app uses The Graph as live source of blockchain data… meaningful work with the data: reasoning, not just printing raw query results.”* Live Studio/Market data only. |
| **We built** | `GRAPH_QUERY_URLS` — **Compound V2 Messari** (`4TbqVA8p2DoBd5qDbPMwmDZv3CsJjWtxo8nVSqF2tA9a`) + **Uniswap V2** (`5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`); `reasonAboutBeats()` fuses TVL + Hedera mirror into clue text. |
| **Alt track (do not double-list)** | Composable/Messari ($5k) — we partially fit; **prefer AI From Scratch** on the form. |
| **Gaps** | Restart dev after Graph env; show reasoning in demo video (not JSON dump). |
| **Prize** | 1st **$2,500** · 2nd $1,500 · 3rd $1,000. |

### Sponsor 3 — World · Selfie Check ($3,500 pool)

| | |
|---|---|
| **They ask** | *“Realistic Selfie Check… risk, eligibility, fairness, continuity, or abuse prevention.”* Plus **feedback document** on docs/portal/sandbox. |
| **We built** | Step 1 gate before `/api/buy`; IDKit + `/api/world/sign` + `/api/world/verify`; anti-bot before agent spends HBAR. |
| **Gaps** | `WORLD_DEMO_GATE=false` on Vercel ✅; real phone selfie in video; **feedback doc** (`docs/world-selfie-feedback.md`). |
| **Prize** | Up to **3 × $1,166**. |

### Prize ceiling (if top in all three)

**$2,000 + $2,500 + $1,166 ≈ $5,666** — realistic floor if you qualify Hedera only: **$2,000**.

### Do not claim on form

ENS MCP clone, Bazantic (unless World fails), fourth sponsor, mocked Graph, simulated payments, World AgentKit continuity track.

---

## Hedera tooling — Hiero Local Node → Solo

Source: [Hedera blog, Mar 2026 — Hiero Local Node deprecation](https://hedera.com/blog/hiero-local-node-deprecation-6-month-transition-to-solo/).

| What | Detail |
|---|---|
| **Deprecating** | **Hiero Local Node** — no updates/bugfixes after **Sep 2026** |
| **Replacement** | **Solo** (alpha) — future local Hedera dev tool |
| **Breakage (~May 15, 2026)** | Local Node with **unpinned** consensus node breaks when Release 74 defaults to **Blockstreams** (Local Node does not support them) |
| **Not affected** | Apps on **testnet/mainnet**, Mirror Node APIs, JSON-RPC relay, Hedera SDKs against remote networks |

**NextBeat:** we pay on **hedera:testnet** via Blocky402 + portal faucet. We do **not** depend on Hiero Local Node for the hackathon. **No migration work required** for submit.

| If you… | Do this |
|---|---|
| Only use testnet (NextBeat default) | Keep using portal + HashScan — ignore Local Node |
| Run a local Hedera node for CI/dev | Plan move to **Solo** before Sep 2026; do not start new Local Node workflows |
| Already on Local Node (unpinned) | Pin pre–Release 74 or switch to Recordstream mode / Solo |

Solo alpha needs Docker, 12 GB RAM, 6 CPU cores, Node ≥ 22 — overkill for our x402 desk; **testnet is correct** for ETHOnline demo.

---

## Phases vs calendar

| Phase | When | Goal | Prize gate |
|---|---|---|---|
| **0 — Setup** | **4 Sep after 12:00 ET** | Fresh repo, first commit, wallets, faucet | Git clock starts |
| **1 — MVP** | **4–6 Sep** | Paid beat (x402 brief) + daily commits | Hedera |
| **2 — Wire UI** | **7–8 Sep** | Quote → pay → beat on screen; 720p dry-run (no music, 1×) | Video-ready |
| **3 — Meter + HCS** | **9–11 Sep** | Metering, HCS morgue | Hedera extras |
| **4 — Graph + slot 3** | **10–12 Sep** | Live Graph in beat; try **World** → else **ENS** → else **Bazantic** | Sponsors 2 & 3 |
| **5 — Submit** | **by 12 Sep 12:00 ET** (24h early) | 2–4 min 720p video, README, **exactly 3 sponsors** on form | Deadline |

Do **not** start Phase 4 until one paid testnet request is on HashScan.

---

## Phase 0 — Setup (few hours)

1. Keep this repo (`ethglobal2026/paycall`).
2. Create **two ECDSA** Hedera testnet accounts (agent = payer, service = payTo). Save account IDs + private keys in `.env` (never commit).
3. Fund **both** with testnet HBAR via **portal faucet** (1000 HBAR / 24h, max 5 accounts on the profile). Service needs a little for HCS.
4. Confirm balances on [HashScan testnet](https://hashscan.io/testnet).
5. Copy `nextbeat-app/.env.example` → `nextbeat-app/.env`.

**Faucet fallback order:** portal (1000/24h) → [faucet.hedera.com](https://faucet.hedera.com) (100/24h) → HashPack → Discord `#testnet-faucet`. If all fail, stop and do not switch to mainnet.

---

## Phase 1 — MVP (Hedera $2k qualification)

Must ship:

1. Resource server with `@x402/express` + `@x402/hedera`, facilitator **Blocky402 testnet**.
2. Unpaid `POST /v1/brief` → **HTTP 402**.
3. Agent retries with payment; **HTTP 200** + briefing JSON.
4. `GET /health` (no payment).
5. Scripts: `npm run dev` (service + agent), `npm run smoke` (assert 402).

Done when: HashScan shows a **testnet** transfer of ~0.00001 HBAR (or 0.001 if bumped) from agent → service.

---

## Phase 2 — Demo polish

- Chat-like or form UI: account ID in, briefing out, live status (`connecting` → `402` → `signing` → `settled`).
- Link to service account on HashScan testnet.
- README: architecture diagram, payment flow, env vars, “testnet only / tiny HBAR”.
- Record a first-pass screen capture (can re-record in Phase 5).

---

## Phase 3 — Hedera extra points + uniqueness (if time)

Priority order (see `uniqueness.md`):

1. **Metering + free quote:** `GET /v1/quote` then 402 amount = f(tx count / subgraph rows).
2. **HCS:** after settle, topic message `{payer, tinybars, settleTx, graphQueryHash, briefHash}`.
3. **Budget cap** on the agent session.
4. Skip A2A / ERC-8004 unless it costs almost nothing (still Hedera, not a 4th sponsor).

---

## Phase 4 — Graph + sponsor slot 3

Do **not** start until one paid testnet request is on HashScan.

### Hedera Docs MCP and Skills (build-time only — not a sponsor)

| Tool | URL / install | In NextBeat |
|---|---|---|
| **Docs MCP** | `https://docs.hedera.com/mcp` — `SearchHedera` | Search docs instead of guessing SDK names. |
| **Hosted Agent Kit MCP** | `https://agentic-testnet-mcp.hedera.com/mcp` + `x-hedera-account-id` | Optional read-only checks. Do not replace `/v1/brief`. |
| **Skills** | `npx skills@latest add hedera-dev/hedera-skills` | `native-services-js` for HCS; `hackathon-helper` before submit. |

### Work order

| Step | Work | Sponsor |
|---|---|---|
| 1 | **Live Graph** in beat — ≥2 protocol endpoints, reasoning text, no raw dump in UI/video | The Graph |
| 2a | **World:** Selfie Check gates `#buy` / pay; document abuse/eligibility story + World feedback | World (preferred slot 3) |
| 2b | **Else Bazantic:** gateway + recipe + before/after demo (reference their code, our desk) | Bazantic |
| 2c | **Else ENS:** live Sepolia resolve for **named case dossier** only — reference ENS integration, not MCP/CLI clone | ENS (last resort) |

Workshop refs: [World](https://www.youtube.com/live/8AGxKIS9Jw4) · [ENS](https://www.youtube.com/live/CTpZBTFtiow) · [Bazantic](https://www.youtube.com/live/MoF7FuwWeas) · [Hedera](https://www.youtube.com/watch?v=-nkd3aorELM).

---

## Phase 5 — Submit

- Public GitHub with **week-long commit history**.
- README + architecture.
- **One demo:** 720p, **normal speed**, **no music**, **2–4 min**, real paid testnet tx + live Graph + slot-3 proof (Selfie / ENS resolve / Bazantic A/B).
- Form: **exactly three** — Hedera, The Graph, and **one** of World / ENS / Bazantic (whichever actually shipped).

---

## Out of scope

LM Studio, mainnet, USDC, listing **four sponsors** on the form, and building slot 3 for more than one partner at once (pick one). Ledger, Privy, Arc, Uniswap, 1inch, Chainlink remain out of scope.

---

## Build order (this session)

Planning/docs only until **12:00 PM ET, 4 Sep**. No new `paycall/` implementation before kickoff. After kickoff: empty git history, daily commits, NextBeat MVP.
