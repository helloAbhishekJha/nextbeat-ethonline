/**
 * World Selfie Check — desktop desk → World App on phone (IDKit invite-code flow).
 */
(function (global) {
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

  function showConnector(statusEl, uri) {
    statusEl.innerHTML =
      "<strong>Open World App on your phone</strong> and complete the selfie check. " +
      'If the app did not open automatically, <a href="' +
      uri +
      '" target="_blank" rel="noreferrer">tap this World link</a> on your phone. ' +
      "<em>(waiting for approval…)</em>";
  }

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
      "Connect World App on your phone — the link appears below in a few seconds. Keep this tab open.";

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

    if (request.connectorURI) {
      showConnector(statusEl, request.connectorURI);
    } else {
      statusEl.textContent = "Open World App on your phone to complete the selfie check…";
    }

    const completion = await request.pollUntilCompletion({
      pollInterval: 2000,
      timeout: 120000,
    });

    if (!completion.success) {
      const code = completion.error ?? "unknown";
      if (code === "timeout") {
        throw new Error("World Selfie timed out. Open World App on your phone and try again.");
      }
      if (code === "cancelled") {
        throw new Error("World Selfie was cancelled. Try again when ready.");
      }
      throw new Error("Selfie check did not complete. Open World App on your phone and try again.");
    }

    const verified = await fetch("/api/world/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(completion.result),
    }).then((r) => r.json());

    if (!verified.ok) {
      throw new Error("World could not verify the selfie. Try again.");
    }

    await onVerified();
  }

  global.WorldGateClient = { startWorldSelfie, formatWorldError };
})(window);
