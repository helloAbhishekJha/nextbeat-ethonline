# NextBeat — example treasury cases

Real questions finance teams ask when **agents pay from a Hedera treasury**. After **World authorization**, the **agent wallet** buys each beat via x402 (Blocky402). Each answer fuses **live The Graph** data (Compound + Uniswap) with **Hedera mirror** activity for the account you specify.

Sample beats below match the live report format. **TVL and transaction counts are illustrative** — a paid beat uses current subgraph + mirror data at query time.

---

## Case 1 — Approve this week’s vendor batch

**Who:** Accounts payable / treasury ops  
**Goal:** Sign off on recurring agent payouts (APIs, contractors) without pulling data from three dashboards.

**Question:** Our payment agent is about to settle this week’s vendor invoices from the treasury — should I approve the batch given current lending pool depth and this account’s recent transfers?

**Treasury account:** `0.0.3` (Hedera testnet)

**Sample beat:**

```
Case: “Our payment agent is about to settle this week’s vendor invoices from the treasury — should I approve the batch given current lending pool depth and this account’s recent transfers?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.3 on Hedera testnet: 12 recent transactions.

Takeaway for the operator: lending and DEX liquidity look deep enough that routine vendor batches are unlikely to face market-wide settlement stress. Cross-check the 12 recent transfers against your approved vendor list before you sign — this beat does not replace invoice matching.
```

---

## Case 2 — Month-end close reconciliation

**Who:** Controller / finance close team  
**Goal:** Confirm on-chain treasury activity is explainable before locking the books.

**Question:** For month-end close, does this treasury account’s transfer volume look normal relative to current Compound and Uniswap market size?

**Treasury account:** `0.0.10449882`

**Sample beat:**

```
Case: “For month-end close, does this treasury account’s transfer volume look normal relative to current Compound and Uniswap market size?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.10449882 on Hedera testnet: 8 recent transactions.

Takeaway for the operator: macro DeFi TVL is a sanity check, not a ledger. Eight recent Hedera transfers should map to your close checklist (invoices, payroll, agent settlements). Flag anything that does not tie to a documented line item before you post.
```

---

## Case 3 — Deploy idle treasury HBAR

**Who:** Treasury manager / investment committee  
**Goal:** Decide whether idle HBAR is worth moving into yield strategies this quarter.

**Question:** We are holding surplus HBAR in the treasury — are lending pools large enough that deploying idle balance into yield is worth evaluating now?

**Treasury account:** `0.0.3`

**Sample beat:**

```
Case: “We are holding surplus HBAR in the treasury — are lending pools large enough that deploying idle balance into yield is worth evaluating now?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.3 on Hedera testnet: 12 recent transactions.

Takeaway for the operator: Compound-scale TVL suggests the lending market can absorb institutional-sized flows, but this beat does not price yield or gas. Use it as a “market is open” signal, then run your normal policy limits and custodian workflow before moving surplus HBAR.
```

---

## Case 4 — Triage an outflow alert

**Who:** Security / ops on-call  
**Goal:** Decide fast whether to escalate an alert or dismiss it as market noise.

**Question:** We got an alert on unusual Hedera outflows — does today’s DeFi liquidity picture point to external market stress, or should we investigate this treasury account specifically?

**Treasury account:** `0.0.98`

**Sample beat:**

```
Case: “We got an alert on unusual Hedera outflows — does today’s DeFi liquidity picture point to external market stress, or should we investigate this treasury account specifically?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.98 on Hedera testnet: 3 recent transactions.

Takeaway for the operator: stable aggregate TVL usually means the alert is account-specific, not a protocol-wide liquidity event. Pull HashScan for the three recent transfers, verify signers and destinations, and rotate agent keys if anything is off-policy.
```

---

## Case 5 — Board / governance briefing

**Who:** CFO / general counsel preparing a board packet  
**Goal:** One screen of context linking treasury operations to DeFi market conditions.

**Question:** The board asked how our treasury activity relates to current DeFi market conditions — summarize Graph lending and DEX liquidity versus this account’s recent Hedera transfers for a one-page brief.

**Treasury account:** `0.0.10456496`

**Sample beat:**

```
Case: “The board asked how our treasury activity relates to current DeFi market conditions — summarize Graph lending and DEX liquidity versus this account’s recent Hedera transfers for a one-page brief.”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.10456496 on Hedera testnet: 5 recent transactions.

Takeaway for the operator: paste the market snapshot into your memo as “external liquidity context,” then narrate the five recent transfers as “internal activity.” You paid for this beat with the agent wallet — attach the HashScan receipt as proof of metered, human-authorized research.
```

---

## Try live

1. https://nextbeat.vercel.app  
2. Authorize (World Selfie) → click a case chip → **Buy next beat**  
3. HashScan: payment from agent wallet → service account (~1000 tinybars)
