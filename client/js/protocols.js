"use strict";

/*!
 * Protocols (RTSP / HLS / JPEG) — single-protocol view like "Video"
 * - UI shows one protocol at a time via a selector.
 * - GET:  /appConfig_video.cgi?protocol=rtsp|hls|jpeg
 * - POST: same endpoint with a FLAT body (no nesting), e.g.:
 *     protocol=rtsp -> { enabled, port }
 *     protocol=hls  -> { enabled }
 *     protocol=jpeg -> { enabled, qfactor, fps, rtsp }
 * - After POST, call /appConfig_apply.cgi
 * - English-only comments
 */

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector('[data-tab-content="protocols"]');
  if (!box) return;

  // Elements ----------------------------------------------------------------
  const protocolSel = document.getElementById("protocolType");

  const rtspSec     = document.getElementById("rtspSection");
  const rtspEnabled = document.getElementById("rtspEnabled");
  const rtspPort    = document.getElementById("rtspPort");

  const hlsSec      = document.getElementById("hlsSection");
  const hlsEnabled  = document.getElementById("hlsEnabled");

  const jpegSec     = document.getElementById("jpegSection");
  const jpegEnabled = document.getElementById("jpegEnabled");
  const jpegQ       = document.getElementById("jpegQfactor");
  const jpegFps     = document.getElementById("jpegFps");
  const jpegRtsp    = document.getElementById("jpegRtsp");

  const btnSave     = document.getElementById("btnProtocolSave");

  // Helpers -----------------------------------------------------------------
  function buildProtocolEndpoint(proto) {
    const base = API_ENDPOINTS.video;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}protocol=${encodeURIComponent(proto)}`;
  }

  function setVisible(el, on) {
    el.style.display = on ? "" : "none";
  }

  function setSavingState(isSaving) {
    btnSave.disabled = isSaving;
    btnSave.classList.toggle("disabled", isSaving);
    btnSave.style.opacity = isSaving ? 0.75 : 1;
  }

  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }

  function isValidPort(n) {
    const v = Number(n);
    return Number.isInteger(v) && v >= 1 && v <= 65536;
  }

  function fillJpegFps() {
    const list = Array.from({ length: 20 }, (_, i) => i + 1);
    jpegFps.innerHTML = list.map(n => `<option value="${n}">${n}</option>`).join("");
  }

  function showProtocol(proto) {
    setVisible(rtspSec, proto === "rtsp");
    setVisible(hlsSec,  proto === "hls");
    setVisible(jpegSec, proto === "jpeg");
  }

  // Loaders -----------------------------------------------------------------
  async function loadRtsp() {
    try {
      const res = await apiGet(buildProtocolEndpoint("rtsp"));
      const data = res?.rtsp || {};
      rtspEnabled.checked = toBool(data.enabled);
      rtspPort.value = data.port != null ? String(data.port) : "";
    } catch (e) {
      console.error("[protocols] load rtsp failed:", e);
      toast?.error?.("Failed to load RTSP settings");
    }
  }

  async function loadHls() {
    try {
      const res = await apiGet(buildProtocolEndpoint("hls"));
      const data = res?.hls || {};
      hlsEnabled.checked = toBool(data.enabled);
    } catch (e) {
      console.error("[protocols] load hls failed:", e);
      toast?.error?.("Failed to load HLS settings");
    }
  }

  async function loadJpeg() {
    try {
      const res = await apiGet(buildProtocolEndpoint("jpeg"));
      const data = res?.jpeg || {};
      jpegEnabled.checked = toBool(data.enabled);
      if (data.qfactor != null) jpegQ.value = String(data.qfactor);
      if (data.fps != null)     jpegFps.value = String(data.fps);
      jpegRtsp.checked = toBool(data.rtsp);
    } catch (e) {
      console.error("[protocols] load jpeg failed:", e);
      toast?.error?.("Failed to load JPEG settings");
    }
  }

  async function loadCurrent(proto) {
    if (proto === "rtsp") return loadRtsp();
    if (proto === "hls")  return loadHls();
    if (proto === "jpeg") return loadJpeg();
  }

  // Validate & Build body (FLAT) -------------------------------------------
  function validate(proto) {
    if (proto === "rtsp" && rtspEnabled.checked) {
      if (!isValidPort(rtspPort.value)) {
        toast?.warning?.("Invalid RTSP port (1–65536)");
        return false;
      }
    }
    if (proto === "jpeg" && jpegEnabled.checked) {
      const q = Number(jpegQ.value || 0);
      const f = Number(jpegFps.value || 0);
      if (!Number.isInteger(q) || q < 1 || q > 100) {
        toast?.warning?.("JPEG QFactor must be 1–100");
        return false;
      }
      if (!Number.isInteger(f) || f < 1 || f > 20) {
        toast?.warning?.("JPEG FPS must be 1–20");
        return false;
      }
    }
    return true;
  }

  function buildFlatBody(proto) {
    if (proto === "rtsp") {
      return {
        enabled: rtspEnabled.checked,
        port: Number(rtspPort.value || 554),
      };
    }
    if (proto === "hls") {
      return {
        enabled: hlsEnabled.checked,
      };
    }
    // jpeg
    return {
      enabled: jpegEnabled.checked,
      qfactor: Number(jpegQ.value || 50),
      fps: Number(jpegFps.value || 5),
      rtsp: jpegRtsp.checked,
    };
  }

  // Events ------------------------------------------------------------------
  protocolSel.addEventListener("change", async () => {
    const proto = protocolSel.value;
    showProtocol(proto);
    await loadCurrent(proto);
  });

  btnSave.addEventListener("click", async () => {
    const proto = protocolSel.value;
    if (!validate(proto)) return;

    const endpoint = buildProtocolEndpoint(proto);
    const body = buildFlatBody(proto);

    setSavingState(true);
    try {
      // POST only the visible/selected protocol, with FLAT body
      await apiPost(endpoint, body);

      // Apply the pending appConfig changes
      await apiPost(API_ENDPOINTS.appConfigApply, {});

      toast?.success?.(`${proto.toUpperCase()} saved & applied`);
      await loadCurrent(proto);
    } catch (e) {
      console.error("[protocols] save/apply failed:", e);
      toast?.error?.("Saving or applying protocol settings failed");
    } finally {
      setSavingState(false);
    }
  });

  // Init --------------------------------------------------------------------
  (async function init() {
    fillJpegFps();
    protocolSel.value = "rtsp";  // default view
    showProtocol("rtsp");
    await loadRtsp();
  })();
});
