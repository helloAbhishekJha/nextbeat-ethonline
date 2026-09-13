/**
 * Beat visuals + on-chain verify links + powered-by tech buttons.
 */
(function (global) {
  const TECH_STACK = [
    { label: "Hedera", href: "https://hedera.com", when: () => true },
    { label: "The Graph", href: "https://thegraph.com", when: () => true },
    { label: "Blocky402", href: "https://blocky402.com", when: () => true },
    { label: "World", href: "https://world.org", when: (c) => c?.worldGate },
  ];

  function extractBeat(data) {
    const payload = data?.payload ?? data ?? {};
    const beat = payload.beat ?? payload;
    const reasoning =
      typeof beat?.reasoning === "string"
        ? beat.reasoning
        : typeof payload?.reasoning === "string"
          ? payload.reasoning
          : "";
    return { payload, beat, reasoning };
  }

  function normalizeHederaTxId(txId) {
    const trimmed = String(txId).trim();
    const brokenAt = trimmed.match(/^(\d+\.\d+\.\d+)@(\d+)-(\d+)$/);
    if (brokenAt) return `${brokenAt[1]}@${brokenAt[2]}.${brokenAt[3]}`;
    if (trimmed.includes("@")) return trimmed;
    const hyphen = trimmed.match(/^(\d+\.\d+\.\d+)-(\d+)-(\d+)$/);
    if (hyphen) return `${hyphen[1]}@${hyphen[2]}.${hyphen[3]}`;
    return trimmed;
  }

  function mirrorTransactionId(txId) {
    const trimmed = String(txId).trim();
    if (/^\d+\.\d+\.\d+-\d+-\d+$/.test(trimmed)) return trimmed;
    const normalized = normalizeHederaTxId(trimmed);
    const at = normalized.match(/^(\d+\.\d+\.\d+)@(\d+)\.(\d+)$/);
    if (at) return `${at[1]}-${at[2]}-${at[3]}`;
    return trimmed;
  }

  function hashscanTxUrl(tx) {
    const consensus =
      typeof tx === "object" && tx
        ? tx.consensusTimestamp ?? tx.consensus_timestamp
        : null;
    const txId =
      typeof tx === "object" && tx
        ? tx.transactionId ?? tx.txId
        : tx;
    const hyphenId = txId ? mirrorTransactionId(txId) : null;
    if (consensus && hyphenId) {
      return `https://hashscan.io/testnet/transaction/${consensus}?tid=${encodeURIComponent(hyphenId)}`;
    }
    if (consensus) {
      return `https://hashscan.io/testnet/transaction/${consensus}`;
    }
    if (hyphenId) {
      return `https://hashscan.io/testnet/transaction/${hyphenId}`;
    }
    return null;
  }

  const TINYBARS_PER_HBAR = 100_000_000;

  function tinybarsToHbarDisplay(tinybars) {
    const n = Number(tinybars);
    if (!Number.isFinite(n)) return "—";
    const hbar = n / TINYBARS_PER_HBAR;
    if (hbar >= 1) return `${hbar.toFixed(4)} ℏ`;
    if (hbar >= 0.0001) return `${hbar.toFixed(6)} ℏ`;
    return `${n} tinybars`;
  }

  function facilitatorFromTxId(txId) {
    if (!txId) return null;
    const m = String(txId).match(/^(\d+\.\d+\.\d+)/);
    return m ? m[1] : null;
  }

  function balanceMap(wallets) {
    const map = {};
    for (const w of wallets ?? []) {
      if (w?.accountId) map[w.accountId] = w.tinybars;
    }
    return map;
  }

  function formatUsdCompact(raw) {
    const n = Number.parseFloat(String(raw ?? ""));
    if (!Number.isFinite(n)) return "n/a";
    const abs = Math.abs(n);
    if (abs >= 1e12) return (n / 1e12).toFixed(2) + "T";
    if (abs >= 1e9) return (n / 1e9).toFixed(2) + "B";
    if (abs >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (abs >= 1e3) return (n / 1e3).toFixed(2) + "K";
    return n.toFixed(2);
  }

  function protocolLabel(snapshot) {
    if (!snapshot) return "Protocol";
    if (snapshot.protocolName) return snapshot.protocolName;
    return "Protocol";
  }

  function chartSeries(beat) {
    const focused = Array.isArray(beat?.chartGraph) ? beat.chartGraph : [];
    const all = Array.isArray(beat?.graph) ? beat.graph : [];
    const source = focused.length > 0 ? focused : all;
    return source.filter((g) => g.ok && g.tvlUsd != null);
  }

  function renderCharts(beat, root) {
    if (!root) return;
    root.innerHTML = "";
    const live = chartSeries(beat);
    const allGraph = Array.isArray(beat?.graph) ? beat.graph : [];

    if (live.length === 0) {
      root.hidden = true;
      return;
    }
    root.hidden = false;

    if (live.length > 0) {
      const title = document.createElement("h3");
      title.className = "viz-title";
      title.textContent = beat?.chartTitle || "Relevant market data";
      root.appendChild(title);
    }

    if (live.length > 0) {
      const chartWrap = document.createElement("div");
      chartWrap.className = "viz-chart-wrap";
      const canvas = document.createElement("canvas");
      canvas.className = "viz-canvas";
      canvas.width = 640;
      canvas.height = 180;
      chartWrap.appendChild(canvas);
      root.appendChild(chartWrap);

      const legend = document.createElement("div");
      legend.className = "viz-legend";
      const values = live.map((g) => Number.parseFloat(String(g.tvlUsd)));
      const max = Math.max(...values.filter(Number.isFinite), 1);
      const ctx = canvas.getContext("2d");
      const pad = { l: 12, r: 12, t: 16, b: 36 };
      const barH = 28;
      const gap = 14;
      const innerW = canvas.width - pad.l - pad.r;
      live.forEach((g, i) => {
        const val = Number.parseFloat(String(g.tvlUsd));
        const frac = Number.isFinite(val) ? Math.min(val / max, 1) : 0;
        const y = pad.t + i * (barH + gap);
        const w = Math.max(4, innerW * frac);
        const colors = ["#7c9cff", "#3dd68c", "#f5c451"];
        ctx.fillStyle = "#1a2233";
        ctx.fillRect(pad.l, y, innerW, barH);
        ctx.fillStyle = colors[i % colors.length];
        ctx.fillRect(pad.l, y, w, barH);
        ctx.fillStyle = "#eef2ff";
        ctx.font = "12px system-ui, sans-serif";
        const name = protocolLabel(g);
        const pools = g.extra?.poolCount != null ? ` · ${g.extra.poolCount} pools` : "";
        ctx.fillText(name, pad.l + 8, y + 18);
        ctx.textAlign = "right";
        ctx.fillText(`$${formatUsdCompact(g.tvlUsd)}${pools}`, pad.l + innerW - 8, y + 18);
        ctx.textAlign = "left";

        const row = document.createElement("div");
        row.className = "viz-legend-row";
        row.innerHTML =
          `<span class="viz-dot" style="background:${colors[i % colors.length]}"></span>` +
          `<span>${name}</span><span class="viz-val">$${formatUsdCompact(g.tvlUsd)}</span>`;
        legend.appendChild(row);
      });
      root.appendChild(legend);
    }

    const failed = allGraph.filter((g) => !g.ok);
    if (failed.length > 0) {
      const failEl = document.createElement("p");
      failEl.className = "viz-fail";
      failEl.textContent =
        "Graph sources not returned: " + failed.map((g) => protocolLabel(g)).join(", ");
      root.appendChild(failEl);
    }
  }

  function walletRowHtml({ role, accountId, tinybars, deltaTinybars, phase }) {
    const bal = tinybarsToHbarDisplay(tinybars);
    let deltaHtml = "";
    if (phase === "after" && deltaTinybars != null && deltaTinybars !== 0) {
      const abs = Math.abs(deltaTinybars);
      const label = tinybarsToHbarDisplay(String(abs));
      if (deltaTinybars < 0) {
        deltaHtml = `<span class="wallet-delta delta-down" title="Deducted">↓ −${label}</span>`;
      } else {
        deltaHtml = `<span class="wallet-delta delta-up" title="Added">+${label}</span>`;
      }
    }
    return (
      `<div class="wallet-row">` +
      `<div class="wallet-role">${role}</div>` +
      `<div class="wallet-id">${accountId}</div>` +
      `<div class="wallet-bal-col">` +
      `<span class="wallet-bal">${bal}</span>${deltaHtml}` +
      `</div></div>`
    );
  }

  function renderWalletPanel(root, opts) {
    if (!root) return;
    const {
      config,
      wallets,
      phase = "idle",
      before = {},
      facilitatorId = null,
    } = opts;
    const agentId = config?.agentAccountId;
    const serviceId = config?.serviceAccountId;
    if (!agentId && !serviceId) {
      root.hidden = true;
      return;
    }
    const map = balanceMap(wallets);
    const phaseLabel =
      phase === "before"
        ? "Before settlement"
        : phase === "after"
          ? "After settlement"
          : "Current balances";

    const rows = [];
    if (agentId) {
      const tb = map[agentId] ?? null;
      const beforeTb = before[agentId] != null ? Number(before[agentId]) : null;
      const delta =
        phase === "after" && beforeTb != null && tb != null ? Number(tb) - beforeTb : null;
      rows.push(
        walletRowHtml({
          role: "Agent payer",
          accountId: agentId,
          tinybars: tb,
          deltaTinybars: delta,
          phase,
        }),
      );
    }
    if (serviceId) {
      const tb = map[serviceId] ?? null;
      const beforeTb = before[serviceId] != null ? Number(before[serviceId]) : null;
      const delta =
        phase === "after" && beforeTb != null && tb != null ? Number(tb) - beforeTb : null;
      rows.push(
        walletRowHtml({
          role: "Service treasury",
          accountId: serviceId,
          tinybars: tb,
          deltaTinybars: delta,
          phase,
        }),
      );
    }

    const blocky = facilitatorId || config?.blocky402FacilitatorAccountId;
    const blockyNote = blocky
      ? `<p class="wallet-blocky-note"><strong>Blocky402 facilitator</strong> <code>${blocky}</code> pays Hedera network fees on HashScan — not your agent or treasury. The beat moves HBAR agent → treasury.</p>`
      : `<p class="wallet-blocky-note"><strong>Blocky402</strong> settles x402 on Hedera — HashScan may show a facilitator account as tx payer (network fees only).</p>`;

    root.hidden = false;
    root.innerHTML =
      `<h3 class="wallet-title">Testnet wallet balances</h3>` +
      `<p class="wallet-phase">${phaseLabel}</p>` +
      `<div class="wallet-grid">${rows.join("")}</div>` +
      blockyNote;
  }

  async function fetchBalances() {
    const res = await fetch("/api/balances");
    if (!res.ok) return [];
    const data = await res.json();
    return data.wallets ?? [];
  }

  function txLinkRow(label, href, meta) {
    if (!href) return null;
    const metaHtml = meta ? `<span class="verify-meta">${meta}</span>` : "";
    return `<li><a href="${href}" target="_blank" rel="noreferrer">${label}</a>${metaHtml}</li>`;
  }

  function formatTransferLines(proof, config) {
    if (!proof?.transfers?.length) return "";
    const agentId = config?.agentAccountId;
    const serviceId = config?.serviceAccountId;
    const walletLines = proof.transfers
      .filter((t) => t.role === "agent" || t.role === "treasury")
      .map((t) => {
        const sign = t.amountTinybars > 0 ? "+" : "";
        const label = t.role === "agent" ? "Agent payer" : "Service treasury";
        return `<li class="verify-transfer"><code>${t.accountId}</code> (${label}): ${sign}${t.amountTinybars} tinybars</li>`;
      });
    if (walletLines.length === 0 && agentId && serviceId && proof.agentToTreasuryTinybars) {
      return (
        `<ul class="verify-transfers">` +
        `<li class="verify-transfer"><code>${agentId}</code> → <code>${serviceId}</code>: ${proof.agentToTreasuryTinybars} tinybars</li>` +
        `</ul>`
      );
    }
    if (walletLines.length === 0) return "";
    return `<ul class="verify-transfers">${walletLines.join("")}</ul>`;
  }

  /** Single payment link at page bottom — no duplicates elsewhere. */
  function renderVerifyPanel({ paymentTxId, paymentHashscan, paymentProof, facilitatorId, config }) {
    const proof = paymentProof ?? null;
    const paymentUrl =
      proof?.hashscan ||
      paymentHashscan ||
      (paymentTxId
        ? hashscanTxUrl({
            txId: paymentTxId,
            consensusTimestamp: proof?.consensusTimestamp,
          })
        : null);
    if (!paymentUrl) {
      return '<p class="verify-empty">Buy a beat to see the HashScan transaction link here.</p>';
    }

    const blocky =
      facilitatorId ||
      facilitatorFromTxId(paymentTxId) ||
      config?.blocky402FacilitatorAccountId;
    const agentId = config?.agentAccountId ?? "agent";
    const serviceId = config?.serviceAccountId ?? "treasury";
    const blockyHtml = blocky
      ? `<p class="verify-blocky-note">HashScan lists <code>${blocky}</code> as the transaction payer (Blocky402 network fees). The beat transfer is <code>${agentId}</code> → <code>${serviceId}</code> — see transfers below and on HashScan.</p>`
      : `<p class="verify-blocky-note">Beat transfer: agent → treasury. Open HashScan and check the <strong>Transfers</strong> tab.</p>`;

    const transferHtml = formatTransferLines(proof, config);
    const meta = [
      proof?.consensusTimestamp ? `consensus ${proof.consensusTimestamp}` : "",
      paymentTxId ? mirrorTransactionId(paymentTxId) : "",
      proof?.result ?? "",
    ]
      .filter(Boolean)
      .join(" · ");
    const items = [txLinkRow("Beat payment — view transfers on HashScan", paymentUrl, meta)];
    return blockyHtml + transferHtml + `<ul class="verify-list">${items.join("")}</ul>`;
  }

  function syncVerifyCard(root) {
    const card = root?.closest("#verifyCard");
    if (!card) return;
    const hasLinks = Boolean(root?.querySelector(".verify-list a"));
    card.hidden = !hasLinks;
  }

  function renderPoweredBy(config) {
    const buttons = TECH_STACK
      .filter((t) => t.when(config))
      .map(
        (t) =>
          `<a class="tech-btn" href="${t.href}" target="_blank" rel="noreferrer">${t.label}</a>`,
      )
      .join("");
    return `<span class="powered-label">Powered by</span><div class="tech-btns">${buttons}</div>`;
  }

  function mountPoweredBy(config, root) {
    if (!root) return;
    root.innerHTML = renderPoweredBy(config);
  }

  function mountVerifyFooter(root) {
    if (!root) return;
    root.innerHTML = renderVerifyPanel({});
    syncVerifyCard(root);
  }

  function renderAgentRun(beat, root) {
    if (!root) return;
    const run = beat?.agentRun;
    if (!run?.steps?.length) {
      root.hidden = true;
      return;
    }
    root.hidden = false;
    const fw = run.framework ?? {};
    const steps = run.steps
      .map(
        (s) =>
          `<li class="agent-step agent-${s.status}">` +
          `<span class="agent-sponsor">${s.sponsor}</span> ` +
          `<strong>${s.tool}</strong> — ${s.summary}` +
          `</li>`,
      )
      .join("");
    root.innerHTML =
      `<h3 class="agent-title">Treasury Risk Agent run</h3>` +
      `<p class="agent-pattern">${fw.pattern ?? ""}</p>` +
      `<ul class="agent-steps">${steps}</ul>`;
  }

  function updateAfterBeat({ data, paymentTxId, paymentHashscan, vizRoot, verifyRoot, agentRoot, config }) {
    const { beat, reasoning } = extractBeat(data);
    if (vizRoot) renderCharts(beat, vizRoot);
    if (agentRoot) renderAgentRun(beat, agentRoot);
    if (verifyRoot) {
      verifyRoot.innerHTML = renderVerifyPanel({
        paymentTxId: paymentTxId ?? data?.paymentTxId ?? null,
        paymentHashscan: paymentHashscan ?? data?.hashscan ?? null,
        paymentProof: data?.paymentProof ?? null,
        facilitatorId: data?.blocky402FacilitatorAccountId ?? null,
        config,
      });
      syncVerifyCard(verifyRoot);
    }
    return { beat, reasoning };
  }

  global.DeskResults = {
    extractBeat,
    renderCharts,
    renderVerifyPanel,
    renderPoweredBy,
    mountPoweredBy,
    mountVerifyFooter,
    renderWalletPanel,
    renderAgentRun,
    fetchBalances,
    balanceMap,
    updateAfterBeat,
    hashscanTxUrl,
    normalizeHederaTxId,
    tinybarsToHbarDisplay,
  };
})(window);
