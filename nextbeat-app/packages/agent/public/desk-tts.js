/**
 * Browser text-to-speech for beat reports (Web Speech API — Chrome, Edge, Safari).
 */
(function (global) {
  const supports =
    typeof global.speechSynthesis !== "undefined" &&
    typeof SpeechSynthesisUtterance !== "undefined";

  let chunks = [];
  let chunkIndex = 0;
  let cancelled = false;
  let lastText = "";
  let lastEl = null;
  const ui = { bar: null, status: null, stopBtn: null, replayBtn: null };

  function pickVoice() {
    const voices = global.speechSynthesis.getVoices();
    return (
      voices.find((v) => v.lang.startsWith("en") && v.localService) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0] ||
      null
    );
  }

  function speakable(text) {
    return text
      .replace(/≈/g, " approximately ")
      .replace(/•/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function splitBlocks(text) {
    const blocks = text.split(/\n\n+/).map((b) => b.trim()).filter(Boolean);
    return blocks.length ? blocks : [text.trim()];
  }

  function sentencesIn(block) {
    const sentences = block.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
    if (!sentences) return [block];
    return sentences.map((s) => s.trim()).filter(Boolean);
  }

  function clearHighlight() {
    for (const span of chunks) span.classList.remove("tts-active");
  }

  function wrapChunks(el, text) {
    el.textContent = "";
    chunks = [];
    const blocks = splitBlocks(text);
    blocks.forEach((block, blockIndex) => {
      const sentences = sentencesIn(block);
      sentences.forEach((part, sentenceIndex) => {
        const span = document.createElement("span");
        span.className = "tts-chunk";
        span.textContent = part;
        el.appendChild(span);
        chunks.push(span);
        if (sentenceIndex < sentences.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });
      if (blockIndex < blocks.length - 1) {
        el.appendChild(document.createElement("br"));
        el.appendChild(document.createElement("br"));
      }
    });
  }

  function ensureUi(anchor) {
    if (ui.bar) return;
    const bar = document.createElement("div");
    bar.className = "tts-bar";
    bar.hidden = true;
    bar.innerHTML =
      '<span class="tts-status" aria-live="polite"></span>' +
      '<button type="button" class="tts-btn" data-action="stop">Stop</button>' +
      '<button type="button" class="tts-btn" data-action="replay" hidden>Replay</button>';
    anchor.insertAdjacentElement("afterend", bar);
    ui.bar = bar;
    ui.status = bar.querySelector(".tts-status");
    ui.stopBtn = bar.querySelector('[data-action="stop"]');
    ui.replayBtn = bar.querySelector('[data-action="replay"]');
    ui.stopBtn.addEventListener("click", () => stop());
    ui.replayBtn.addEventListener("click", () => {
      if (lastText && lastEl) speak(lastText, lastEl);
    });
  }

  function setUi(state) {
    if (!ui.bar) return;
    if (state === "idle") {
      ui.bar.hidden = true;
      return;
    }
    ui.bar.hidden = false;
    if (state === "speaking") {
      ui.status.textContent = "Reading beat aloud…";
      ui.stopBtn.hidden = false;
      ui.replayBtn.hidden = true;
    } else if (state === "done") {
      ui.status.textContent = "Finished reading.";
      ui.stopBtn.hidden = true;
      ui.replayBtn.hidden = false;
    } else if (state === "unsupported") {
      ui.status.textContent = "Text-to-speech is not available in this browser.";
      ui.stopBtn.hidden = true;
      ui.replayBtn.hidden = true;
    }
  }

  function stop() {
    cancelled = true;
    if (supports) global.speechSynthesis.cancel();
    clearHighlight();
    if (lastEl) lastEl.classList.remove("speaking");
    setUi("idle");
  }

  function speakChunk(voice) {
    if (cancelled || chunkIndex >= chunks.length) {
      clearHighlight();
      if (lastEl) lastEl.classList.remove("speaking");
      setUi(cancelled ? "idle" : "done");
      return;
    }
    const span = chunks[chunkIndex];
    span.classList.add("tts-active");
    span.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const utterance = new SpeechSynthesisUtterance(speakable(span.textContent));
    utterance.rate = 1;
    utterance.pitch = 1;
    if (voice) utterance.voice = voice;
    utterance.onend = () => {
      span.classList.remove("tts-active");
      chunkIndex += 1;
      speakChunk(voice);
    };
    utterance.onerror = () => {
      span.classList.remove("tts-active");
      chunkIndex += 1;
      speakChunk(voice);
    };
    global.speechSynthesis.speak(utterance);
  }

  function speak(text, el) {
    if (!text || !el) return;
    stop();
    lastText = text;
    lastEl = el;
    ensureUi(el);

    if (!supports) {
      el.textContent = text;
      setUi("unsupported");
      return;
    }

    cancelled = false;
    chunkIndex = 0;
    wrapChunks(el, text);
    el.classList.add("speaking");
    setUi("speaking");

    const start = () => speakChunk(pickVoice());
    const voices = global.speechSynthesis.getVoices();
    if (voices.length === 0) {
      global.speechSynthesis.onvoiceschanged = () => {
        global.speechSynthesis.onvoiceschanged = null;
        start();
      };
      setTimeout(start, 300);
    } else {
      start();
    }
  }

  global.DeskTTS = { speak, stop, supports };
})(window);
