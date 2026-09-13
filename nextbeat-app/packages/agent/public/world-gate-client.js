/**
 * World Selfie Check — desktop desk → World App on phone (IDKit invite-code flow).
 */
(function (global) {
  const POLL_MS = 600000; // 10 min — phone + WhatsApp handoff can take a while
  const RECHECK_MS = 180000;

  /** @type {{ request: object, onVerified: () => Promise<void>, statusEl: HTMLElement } | null} */
  let pending = null;

  function formatWorldError(err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Failed to initialize IDKit WASM")) {
      return "World sign-in could not load (network, VPN, or ad blocker). Refresh or try Chrome/Edge/Safari.";
    }
    if (msg.includes("allow_legacy_proofs is required")) {
      return "World SDK version mismatch. Refresh the page.";
    }
    if (msg.includes("rp_context is required")) {
      return "Server could not prepare World session. Refresh and try again.";
    }
    return msg || "Could not start World Selfie Check.";
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    document.body.removeChild(area);
  }

  function showConnector(statusEl, uri, opts = {}) {
    const timedOut = Boolean(opts.timedOut);
    statusEl.innerHTML =
      '<div class="world-connect">' +
      "<p><strong>Open World App on your phone</strong> and complete the selfie check.</p>" +
      '<div class="world-link-row">' +
      '<input class="world-link-input" type="text" readonly value="' +
      uri.replace(/"/g, "&quot;") +
      '" aria-label="World App link" />' +
      '<button type="button" class="world-copy-btn" data-copy-world>Copy link</button>' +
      "</div>" +
      '<p class="world-hint">Paste into WhatsApp (or any chat), open on your phone, then return here. ' +
      "<strong>Keep this browser tab open.</strong></p>" +
      (timedOut
        ? '<p class="world-wait world-wait-timeout">Timed out waiting — if World App already succeeded, click <strong>Check again</strong>.</p>'
        : '<p class="world-wait"><em>Waiting for World App…</em></p>') +
      '<button type="button" class="world-recheck-btn" data-retry-world>Check again</button>' +
      "</div>";

    const copyBtn = statusEl.querySelector("[data-copy-world]");
    copyBtn.addEventListener("click", async () => {
      try {
        await copyText(uri);
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy link";
        }, 2000);
      } catch {
        copyBtn.textContent = "Copy failed";
      }
    });

    const retryBtn = statusEl.querySelector("[data-retry-world]");
    retryBtn.addEventListener("click", () => {
      void recheckPending().catch((err) => {
        statusEl.appendChild(document.createElement("p")).textContent = formatWorldError(err);
      });
    });
  }

  async function finishVerify(completion, onVerified) {
    const verified = await fetch("/api/world/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(completion.result),
    }).then((r) => r.json());

    if (!verified.ok) {
      throw new Error("World could not verify the selfie. Try again.");
    }

    pending = null;
    await onVerified();
  }

  async function recheckPending() {
    const session = pending;
    if (!session) {
      throw new Error("No active World session. Click Authorize again.");
    }
    const retryBtn = session.statusEl.querySelector("[data-retry-world]");
    if (retryBtn) {
      retryBtn.disabled = true;
      retryBtn.textContent = "Checking…";
    }
    const waitEl = session.statusEl.querySelector(".world-wait");
    if (waitEl) {
      waitEl.innerHTML = "<em>Checking if World App finished on your phone…</em>";
    }

    const completion = await session.request.pollUntilCompletion({
      pollInterval: 2000,
      timeout: RECHECK_MS,
    });

    if (!completion.success) {
      if (retryBtn) {
        retryBtn.disabled = false;
        retryBtn.textContent = "Check again";
      }
      if (waitEl) {
        waitEl.innerHTML =
          "<em>Still waiting.</em> Finish the selfie in World App on your phone, then click Check again.";
      }
      const code = completion.error ?? "unknown";
      if (code === "timeout") {
        throw new Error("Still waiting for World App. Complete the selfie on your phone, then Check again.");
      }
      throw new Error("Selfie check did not complete. Open World App on your phone and try again.");
    }

    await finishVerify(completion, session.onVerified);
  }

  /**
   * @returns {Promise<{ status: "verified" } | { status: "pending" }>}
   */
  async function startWorldSelfie({ config, statusEl, onVerified }) {
    if (!global.IDKit) {
      throw new Error("World IDKit did not load. Refresh the page.");
    }
    if (!config?.worldAppId || !config?.worldRpId) {
      throw new Error("Desk config is still loading. Wait a moment and try again.");
    }
    if (typeof global.IDKit.selfieCheckLegacy !== "function") {
      throw new Error("World Selfie preset is unavailable. Refresh the page.");
    }
    if (typeof global.IDKit.requestWithInviteCode !== "function") {
      throw new Error("World invite flow is unavailable. Refresh the page.");
    }

    pending = null;
    statusEl.textContent = "Preparing World connection…";
    const sig = await fetch("/api/world/sign").then((r) => r.json());
    if (sig.error) {
      throw new Error(
        sig.demoGate
          ? "World is not configured on the server — use skip for local testing."
          : "Could not start World selfie on the server. Try again.",
      );
    }

    statusEl.textContent =
      "Connect World App on your phone — copy the link below or open it on your phone. Keep this tab open.";

    const request = await global.IDKit.requestWithInviteCode({
      app_id: config.worldAppId,
      action: config.worldAction,
      rp_context: {
        rp_id: config.worldRpId,
        nonce: sig.nonce,
        created_at: sig.created_at,
        expires_at: sig.expires_at,
        signature: sig.sig,
      },
      allow_legacy_proofs: true,
      environment: "production",
    }).preset(global.IDKit.selfieCheckLegacy({ signal: sig.nonce }));

    const uri = request.connectorURI;
    if (!uri) {
      throw new Error("World did not return a phone link. Refresh and try again.");
    }

    pending = { request, onVerified, statusEl };
    showConnector(statusEl, uri);

    const completion = await request.pollUntilCompletion({
      pollInterval: 2500,
      timeout: POLL_MS,
    });

    if (!completion.success) {
      if (completion.error === "timeout") {
        showConnector(statusEl, uri, { timedOut: true });
        return { status: "pending" };
      }
      pending = null;
      const code = completion.error ?? "unknown";
      if (code === "cancelled") {
        throw new Error("World Selfie was cancelled. Try again when ready.");
      }
      throw new Error("Selfie check did not complete. Open World App on your phone and try again.");
    }

    await finishVerify(completion, onVerified);
    return { status: "verified" };
  }

  global.WorldGateClient = { startWorldSelfie, recheckPending, formatWorldError };
})(window);
