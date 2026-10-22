# Git protocol — auditable, not theatrical

Judges can `git log` and `git blame`. **Do not backdate.** `--date`, `GIT_AUTHOR_DATE`, empty commits, or squashing 8 days into one commit will fail an audit.

**Kartik (kickoff) overrides Pascal** on conflicts. Pascal’s walkthrough still defines the **dashboard uploader** (video 2–4 min, 720p, no music).

**Submit 24h early every time** so encode/upload cannot fail at the official cutoff.

Public GitHub: [helloAbhishekJha/nextbeat-ethonline](https://github.com/helloAbhishekJha/nextbeat-ethonline). `main` only. No force-push after the repo is public. Do not commit `nextbeat/` or `paycall/`. Do not commit local tooling config.

**Daily push:** every **ET** calendar day (America/New_York) with real work gets a commit **and** `git push origin main` the same ET day. Do not save a week of diffs for one dump. Never backdate. Skip a day only if nothing changed (no empty commits). Dashboard and ETHOnline cutoffs are also **ET** (our submit **Sat 12 Sep 12:00 ET**; official lock **Sun 13 Sep 12:00 ET**).

---

## Milestones (ETHOnline 2026)

| When | Gate | What lands in git | ETHGlobal dashboard |
|---|---|---|---|
| **Fri 5 Sep** | Gate (no commits) | — | — |
| **Sun 7 Sep** | **Start this tree** | First commit(s) in **`nextbeat-app/`**: monorepo, health/quote/402 brief, tests, README. Agent UI in same day’s commits if it builds. | Create project; **Check-in 1** (24h early) |
| **Mon 8 Sep** | Code gate | Working **paid** testnet beat (HashScan in README). Tag `checkin-1`. | Already submitted |
| **Tue 9 Sep** | Build | Metering + HCS if keys exist. | **Check-in 2 filed Tue 9** (24h before Wed 10) |
| **Wed 10 Sep** | Code gate | **Live Graph** (≥2 subgraphs), reasoning in the beat. Tag `checkin-2`. | Already submitted |
| **Thu 11–Fri 12 Sep** | Freeze + submit | Bazantic A/B; polish. **Freeze Fri 12.** Tag `v0.1.0-ethonline`. Encode **2–4 min** 720p 1× no-music demo. | **Submit Sat 12 12:00 ET** (24h before Sun 13 noon ET) |
| **Sun 13 Sep 12:00 ET** | Official deadline | No work planned. Resubmit only if something is broken. | Official lock |
| **Mon 14 Sep 12:00–14:00 ET** | Finalist (optional) | Kartik: 7 min Zoom. Must join. | Finalist call |

---

## Commit rules

1. Message = **why** (`feat: quote scales with tx count and live Graph rows`).
2. Each commit **builds** (`npm test` + `npm run typecheck` on Node 20).
3. Never commit `.env`, keys, `paycall/`, or `nextbeat/` (pre-7-Sep sketches).
4. Do not `git rebase -i` / squash the week before submit.
5. Optional annotated tags: `checkin-1`, `checkin-2`, `final-2026-09-13`.
6. End a productive session with **push to `origin/main`** so the public log matches the work day.

## What “production” means in this log

Reviewers should see, in order: types/env → 402 gate → real settle → Graph live → HCS/recipe → freeze. That story is the audit.
