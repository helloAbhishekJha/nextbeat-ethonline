# World Selfie Check — builder feedback (ETHOnline 2026)

**Project:** NextBeat — Treasury Risk Agent · **Track:** Selfie Check ($3,500 pool)  
**Integration:** Finance operator must pass World Selfie Check before the **Hedera agent wallet** can buy a risk beat (abuse / bot prevention before x402 spend).

**Live demo:** https://nextbeat.vercel.app  
**Repo:** https://github.com/helloAbhishekJha/nextbeat-ethonline

---

## 1. What we built

- **Treasury Risk Agent** desk flow:
  - **Step 1 — Authorize** (World Selfie Check on desktop → complete in World App on phone)
  - **Step 2 — Open treasury case** (preset or custom question)
  - **Step 3 — Buy beat** (autonomous agent wallet pays via Hedera x402 / Blocky402)
- Backend:
  - RP signature: `GET /api/world/sign` (`@worldcoin/idkit-core/signing`)
  - Proof verify: `POST /api/world/verify` → `https://developer.world.org/api/v4/verify/{rp_id}`
  - Session cookie (1h TTL, `Secure` on HTTPS) gates `POST /api/buy`
  - **Re-authorize** button clears cookie + logs out for demo retakes
- Local dev bypass: `WORLD_DEMO_GATE=true` + “Skip for local testing” (not used on production Vercel)

---

## 2. Docs and integration flow

| Topic | Notes |
|---|---|
| IDKit v4 + `selfieCheckLegacy` preset | Works on desktop via **invite-code / deep-link** flow — user copies link or scans QR, opens **World App on phone**, completes selfie there. IDKit WASM must load (blocked by some ad blockers). |
| RP signing (`@worldcoin/idkit-core/signing`) | Straightforward once `WORLD_APP_ID`, `WORLD_RP_ID`, and `WORLD_SIGNING_KEY_HEX` are set from Developer Portal. Server returns signed payload for client. |
| Verify endpoint v4 | `POST /api/world/verify` forwards proof to World; on success we set httpOnly cookie. No field renames needed vs docs we followed. |
| Sandbox vs production | Tested on **World sandbox** credentials tied to ETHOnline desk app. Production Vercel uses same sandbox app for hackathon (`WORLD_DEMO_GATE=false`). |

---

## 3. Developer Portal

| Topic | Notes |
|---|---|
| Finding app_id / rp_id / signing key | Under World Developer Portal → app → **Selfie Check** / RP settings. Copy `app_id`, `rp_id`, and export signing key hex into Vercel env. |
| Search / navigation | Portal is usable; signing key rotation UI could be more prominent for first-time setup. |
| Debugging failed verify | Check server logs for `world_verify_failed` vs `world_verify_unreachable`. Most common: wrong `WORLD_RP_ID`, clock skew, or proof expired if user waited too long on phone. |

---

## 4. Sandbox App / proof flows

| Topic | Notes |
|---|---|
| QR / deep link on desktop | We show **copyable World App link** + instructions (“Open World App on your phone”). Desktop-only selfie in-browser was not our path — phone handoff is expected. |
| Selfie completion time | Typically **30–90 seconds** after opening link on phone (network dependent). |
| Error states seen | (1) IDKit WASM failed to load — refresh / disable blocker. (2) Facilitator timeout on Hedera beat **after** selfie — unrelated to World but confused testers. (3) Stale session — fixed with **Re-authorize World selfie** button. |
| Test users / edge cases | Re-auth + hard refresh clears gate. Private window useful when cookie stuck. Demo bypass only for local `WORLD_DEMO_GATE=true`. |

---

## 5. What was confusing, missing, or broken

**Worked well**
- Clear separation: **human gate (World)** vs **autonomous spend (Hedera agent)** — matches World’s “continuity / abuse prevention” story.
- v4 verify API stable for our flow.
- Cookie gate on `/api/buy` is simple to explain to judges.

**Friction**
- Desktop UX assumes phone nearby; a one-line “install World App” link in IDKit modal would help first-time hackers.
- Long wait on phone with no server-side “proof received” push — we poll client-side; a webhook or shorter status copy would reduce anxiety.
- Distinguishing World failures from x402/Blocky402 timeouts in the **same** buy button — we added clearer status strings but a sponsor-labeled error code would help.

**Suggestions for World**
- Hackathon quickstart: single page “desk + agent spend” example with cookie gate snippet.
- Document **re-verify / logout** pattern for demo recordings (we implemented manually).

---

## 6. Demo evidence

- **Live URL:** https://nextbeat.vercel.app — Treasury Risk Desk → World selfie → case → buy beat → agent run trace + HashScan proof
- **Local:** `cd nextbeat-app && npm run dev` → http://127.0.0.1:3001
- **Video:** `video/nextbeat-demo.mp4` — Step 1 World selfie visible on phone, then agent beat purchase (uploaded on ETHGlobal dashboard)
- **Screenshots:** [`images/screenshot-01-desk.png`](../images/screenshot-01-desk.png) (World gate + desk), [`screenshot-02-assignment.png`](../images/screenshot-02-assignment.png) (treasury case), [`screenshot-03-beat.png`](../images/screenshot-03-beat.png) (agent run + HashScan proof)
- **Agent manifest:** `GET https://nextbeat.vercel.app/api/agent` — lists World + Hedera + Graph sponsor tools

---

## 7. ETHGlobal dashboard — World prize (copy/paste)

Use these if the hacker dashboard asks for World Selfie Check details:

| Field | Answer |
|---|---|
| **Project name** | NextBeat |
| **Live demo URL** | https://nextbeat.vercel.app |
| **GitHub** | https://github.com/helloAbhishekJha/nextbeat-ethonline |
| **How Selfie Check is used** | Human treasury operator must pass World Selfie Check (IDKit v4, phone handoff) before the autonomous Hedera agent wallet can buy a metered risk beat via x402. Prevents bots from triggering agent spend. |
| **Integration stack** | `GET /api/world/sign` → IDKit invite flow → `POST /api/world/verify` → httpOnly session cookie gates `POST /api/buy` |
| **Sandbox vs production** | World sandbox credentials on Vercel; `WORLD_DEMO_GATE=false` in production (real selfie required) |
| **Builder feedback doc** | This file: `docs/world-selfie-feedback.md` in the public repo |
| **What worked** | Clear human-vs-agent split; v4 verify API; cookie gate easy to demo to judges |
| **Friction** | Desktop needs phone nearby; hard to distinguish World errors from Hedera x402 timeouts in one button |
| **Suggestion for World** | Hackathon quickstart: desk + agent spend with re-verify/logout for demo recordings |

---

## 8. Submission checklist (World prize)

| Requirement | Status |
|---|---|
| Selfie Check integrated in real product flow | ✅ Before agent x402 spend |
| Feedback document (this file) | ✅ |
| Demo shows real Selfie (not demo bypass) | ✅ Production `WORLD_DEMO_GATE=false` |
| Public repo + live URL | ✅ |

**Submitted by:** Abhishek Jha · ETHOnline 2026
