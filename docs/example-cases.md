# NextBeat — example treasury cases

These are the kinds of questions a **finance operator** opens after **World authorization**. The **agent wallet** pays for each beat on Hedera testnet (x402). Each answer fuses **live The Graph** data (Compound + Uniswap) with **Hedera mirror** activity for the treasury account you specify.

Sample beat text below matches the format returned by `reasonAboutBeats()` — **TVL figures are illustrative**; a live buy uses current subgraph data at query time.

---

## Case 1 — Pause outbound during market stress

**Question:** Should we pause outbound HBAR from this treasury while lending and DEX markets are under stress?

**Treasury account:** `0.0.3` (Hedera testnet)

**Sample beat (structure):**

```
Case: “Should we pause outbound HBAR from this treasury while lending and DEX markets are under stress?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.3 on Hedera testnet: 12 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

**Why it matters:** Operator gets a one-screen brief before letting an agent continue automated payouts.

---

## Case 2 — Unusual outflow vs market depth

**Question:** Is this treasury sending more HBAR than usual while lending pools are shrinking?

**Treasury account:** `0.0.10449882`

**Sample beat (structure):**

```
Case: “Is this treasury sending more HBAR than usual while lending pools are shrinking?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.10449882 on Hedera testnet: 8 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

**Why it matters:** Flags mismatch between macro DeFi liquidity and micro treasury behavior.

---

## Case 3 — Approve agent’s next spend batch

**Question:** Before the agent pays vendors this week, is DeFi market stress high enough to cap the spend budget?

**Treasury account:** `0.0.10456496`

**Sample beat (structure):**

```
Case: “Before the agent pays vendors this week, is DeFi market stress high enough to cap the spend budget?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.10456496 on Hedera testnet: 5 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

**Why it matters:** Human-in-the-loop gate (World) + agent spend (x402) — beat informs the approval decision.

---

## Case 4 — Board / audit prep

**Question:** Summarize DeFi lending and DEX liquidity versus this account’s recent Hedera activity for a risk memo.

**Treasury account:** `0.0.3`

**Sample beat (structure):**

```
Case: “Summarize DeFi lending and DEX liquidity versus this account’s recent Hedera activity for a risk memo.”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.3 on Hedera testnet: 12 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

**Why it matters:** Metered pay-per-beat replaces a manual analyst pulling Graph + mirror separately.

---

## Case 5 — Counterparty / protocol exposure check

**Question:** Are we still comfortable with treasury outflows when Compound and Uniswap TVL diverge sharply?

**Treasury account:** `0.0.98`

**Sample beat (structure):**

```
Case: “Are we still comfortable with treasury outflows when Compound and Uniswap TVL diverge sharply?”

Market snapshot:
• compound-v2: TVL ≈ $1,842,000,000 (The Graph)
• uniswap-v2: TVL ≈ $2,156,000,000 (The Graph)

Treasury account 0.0.98 on Hedera testnet: 3 recent transactions.

Takeaway for the operator: compare overall DeFi market size (Graph) with this account’s recent activity (Hedera). They measure different things — use both before pausing or approving outbound transfers.
```

**Why it matters:** Multi-protocol standardized Graph query (Messari-style) in one paid beat — not raw GraphQL export.

---

## Try live

1. https://nextbeat.vercel.app  
2. Authorize (World Selfie) → pick a case above in the desk → **Buy next beat**  
3. HashScan: payment from agent wallet → service account (~1000 tinybars)
