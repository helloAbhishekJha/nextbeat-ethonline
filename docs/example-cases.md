# NextBeat — example treasury cases

NextBeat uses **two Hedera testnet accounts** only (from portal.hedera.com):

| Account | Role in NextBeat |
|---|---|
| `0.0.10449882` | **Service treasury** — receives x402 beat payments |
| `0.0.10456496` | **Agent wallet** — pays for each beat after World authorization |

A finance operator authorizes with **World Selfie Check**. The **agent wallet** (`0.0.10456496`) pays the service (`0.0.10449882`) per beat via **Blocky402 x402**. Each answer fuses **live The Graph** (Compound V2 + Uniswap V2) with **Hedera mirror** activity for whichever account you put in the form.

**Sample beats below are real outputs** from a live query (13 Sep 2026). TVL and transaction counts **update every time** someone buys a beat.

---

## Case 1 — Approve this week’s vendor batch

**Who:** Accounts payable / treasury ops  
**Goal:** Sign off on recurring agent payouts before invoices go out.

**Question:** Our payment agent is about to settle this week’s vendor invoices from the treasury — should I approve the batch given current lending pool depth and this account’s recent transfers?

**Account to review:** `0.0.10449882` (service treasury)

**Sample beat (live query):**

```
Case: “Our payment agent is about to settle this week's vendor invoices from the treasury — should I approve the batch given current lending pool depth and this account's recent transfers?”

Market snapshot:
• Compound v2: TVL ≈ $115841820.1152804509988066577686744 (The Graph)
• factory:0x1F98431c8aD98523631AE4a59f267346ea31F984: TVL ≈ $2075145401042.190240673477879296609 (The Graph)

Treasury account 0.0.10449882 on Hedera testnet: 2 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

[HashScan — service account](https://hashscan.io/testnet/account/0.0.10449882)

---

## Case 2 — Month-end close reconciliation

**Who:** Controller / finance close team  
**Goal:** Confirm on-chain activity is explainable before locking the books.

**Question:** For month-end close, does this treasury account’s transfer volume look normal relative to current Compound and Uniswap market size?

**Account to review:** `0.0.10449882` (service treasury)

**Sample beat (live query):**

```
Case: “For month-end close, does this treasury account's transfer volume look normal relative to current Compound and Uniswap market size?”

Market snapshot:
• Compound v2: TVL ≈ $115841820.1152804509988066577686744 (The Graph)
• factory:0x1F98431c8aD98523631AE4a59f267346ea31F984: TVL ≈ $2075145401042.190240673477879296609 (The Graph)

Treasury account 0.0.10449882 on Hedera testnet: 2 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

---

## Case 3 — Deploy idle treasury HBAR

**Who:** Treasury manager  
**Goal:** Decide whether idle HBAR is worth moving into yield strategies.

**Question:** We are holding surplus HBAR in the treasury — are lending pools large enough that deploying idle balance into yield is worth evaluating now?

**Account to review:** `0.0.10449882` (service treasury)

**Sample beat (live query):**

```
Case: “We are holding surplus HBAR in the treasury — are lending pools large enough that deploying idle balance into yield is worth evaluating now?”

Market snapshot:
• Compound v2: TVL ≈ $115841820.1152804509988066577686744 (The Graph)
• factory:0x1F98431c8aD98523631AE4a59f267346ea31F984: TVL ≈ $2075145401042.190240673477879296609 (The Graph)

Treasury account 0.0.10449882 on Hedera testnet: 2 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

---

## Case 4 — Triage an outflow alert

**Who:** Security / ops on-call  
**Goal:** Decide whether to escalate an alert or dismiss it as market noise.

**Question:** We got an alert on unusual Hedera outflows — does today’s DeFi liquidity picture point to external market stress, or should we investigate this treasury account specifically?

**Account to review:** `0.0.10456496` (agent wallet — the account that pays for beats)

**Sample beat (live query):**

```
Case: “We got an alert on unusual Hedera outflows — does today's DeFi liquidity picture point to external market stress, or should we investigate this treasury account specifically?”

Market snapshot:
• Compound v2: TVL ≈ $115841820.1152804509988066577686744 (The Graph)
• factory:0x1F98431c8aD98523631AE4a59f267346ea31F984: TVL ≈ $2075145401042.190240673477879296609 (The Graph)

Treasury account 0.0.10456496 on Hedera testnet: 2 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

[HashScan — agent account](https://hashscan.io/testnet/account/0.0.10456496)

---

## Case 5 — Board / governance briefing

**Who:** CFO / board liaison  
**Goal:** One screen linking treasury operations to DeFi market conditions.

**Question:** The board asked how our treasury activity relates to current DeFi market conditions — summarize Graph lending and DEX liquidity versus this account’s recent Hedera transfers for a one-page brief.

**Account to review:** `0.0.10456496` (agent wallet — shows outbound beat payments)

**Sample beat (live query):**

```
Case: “The board asked how our treasury activity relates to current DeFi market conditions — summarize Graph lending and DEX liquidity versus this account's recent Hedera transfers for a one-page brief.”

Market snapshot:
• Compound v2: TVL ≈ $115841820.1152804509988066577686744 (The Graph)
• factory:0x1F98431c8aD98523631AE4a59f267346ea31F984: TVL ≈ $2075145401042.190240673477879296609 (The Graph)

Treasury account 0.0.10456496 on Hedera testnet: 2 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

---

## Try live

1. https://nextbeat.vercel.app  
2. Authorize (World Selfie) → click a case chip → **Buy next beat**  
3. Agent `0.0.10456496` pays service `0.0.10449882` (~1000 tinybars) — receipt on [HashScan](https://hashscan.io/testnet)
