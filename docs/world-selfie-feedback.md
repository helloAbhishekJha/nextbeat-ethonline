# World Selfie Check — builder feedback (ETHOnline 2026)

**Project:** NextBeat · **Track:** Selfie Check ($3,500 pool)  
**Integration:** World ID gates the desk before dust HBAR x402 spend (abuse / bot prevention).

Fill in sections marked **(you)** after testing with the World App. Submit link or PDF per World prize rules.

---

## 1. What we built

- Gamified desk: **Step 1 — Prove human** (World Selfie Check) → **Step 2 — Open case** → **Step 3 — Buy clue** (Hedera x402).
- Backend: RP signature (`GET /api/world/sign`), proof verify (`POST /api/world/verify` → `developer.world.org/api/v4/verify/{rp_id}`).
- Gate blocks `POST /api/buy` until a signed human cookie is set (1h TTL).

---

## 2. Docs and integration flow

| Topic | Notes |
|---|---|
| IDKit v4 + `selfieCheckLegacy` preset | (you) |
| RP signing (`@worldcoin/idkit-core/signing`) | Worked locally once portal keys configured |
| Verify endpoint v4 | (you) — any field renames or errors? |
| Sandbox vs production | (you) |

---

## 3. Developer Portal

| Topic | Notes |
|---|---|
| Finding app_id / rp_id / signing key | (you) |
| Search / navigation | (you) |
| Debugging failed verify | (you) |

---

## 4. Sandbox App / proof flows

| Topic | Notes |
|---|---|
| QR / deep link on desktop | (you) |
| Selfie completion time | (you) |
| Error states seen | (you) |
| Test users / edge cases | (you) |

---

## 5. What was confusing, missing, or broken

- (you — bullet list)

---

## 6. Demo evidence

- Live URL: https://nextbeat.vercel.app (after Vercel env deploy)
- Local: http://127.0.0.1:3001
- Video: `video/nextbeat-demo.mp4` (Selfie step visible)
