"use strict";

/*!
 * Video settings (channel-based)
 * - Channel 0 = Main Stream, Channel 1 = Sub Stream
 * - GET/POST to API_ENDPOINTS.video with ?channel={0|1}
 * - Fields are strictly aligned with the backend CGI:
 *   Common: enabled, codec, fps, bitrate, rcMode, profile, gopSize, crop, size
 *   Channel 0 only: gopMode, sliceUnits
 * - English-only comments
 */

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector('[data-tab-content="video"]');
  if (!box) return;

  // ---- Elements -----------------------------------------------------------
  const streamSel     = document.getElementById("streamType");
  const enabledEl     = document.getElementById("videoEnabled");
  const codecSel      = document.getElementById("videoCodec");
  const sizeSel       = document.getElementById("videoSize");
  const fpsSel        = document.getElementById("videoFps");
  const rcModeSel     = document.getElementById("videoRcMode");
  const bitrateEl     = document.getElementById("videoBitrate");
  const profileSel    = document.getElementById("videoProfile");
  const gopSizeEl     = document.getElementById("videoGopSize");
  const cropEl        = document.getElementById("videoCrop");

  const ch0ExtrasWrap = document.getElementById("videoCh0Extras");
  const gopModeSel    = document.getElementById("videoGopMode");
  const sliceUnitsEl  = document.getElementById("videoSliceUnits");

  const btnSave       = document.getElementById("btnVideoSave");

  // ---- Constants / options ------------------------------------------------
  const SIZE_OPTIONS = {
    // Channel 0
    "0": ["1920x1080", "1280x960", "1280x720", "800x488", "704x576"],
    // Channel 1
    "1": ["1280x960", "1280x720", "800x488", "704x576", "640x480"],
  };

  const DEFAULTS = {
    enabled: true,
    codec: "h264",
    fps: 25,
    bitrate: 2048,
    rcMode: "cbr",
    profile: "main",
    gopSize: 50,
    crop: "",
    gopMode: "normal",
    sliceUnits: 0,
  };

  // ---- Helpers ------------------------------------------------------------
  function buildVideoEndpoint(channel) {
    const base = API_ENDPOINTS.video;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}channel=${encodeURIComponent(channel)}`;
  }

  function fillSelect(selectEl, values, valueToText = (v) => v) {
    selectEl.innerHTML = values.map(v => `<option value="${v}">${valueToText(v)}</option>`).join("");
  }

  function setSelectValue(selectEl, value, fallbackFirst = true) {
    const val = String(value ?? "");
    const opt = Array.from(selectEl.options).find(o => o.value === val);
    if (opt) {
      selectEl.value = val;
    } else if (fallbackFirst && selectEl.options.length) {
      selectEl.selectedIndex = 0;
    }
  }

  function setSavingState(isSaving) {
    btnSave.disabled = isSaving;
    btnSave.classList.toggle("disabled", isSaving);
    btnSave.style.opacity = isSaving ? 0.75 : 1;
  }

  function showChannelExtras(channel) {
    // Only channel 0 shows gopMode / sliceUnits
    ch0ExtrasWrap.style.display = (String(channel) === "0") ? "" : "none";
  }

  function validateForm(channel) {
    // fps 1..60
    const fps = Number(fpsSel.value);
    if (!Number.isInteger(fps) || fps < 1 || fps > 60) {
      toast?.warning?.("FPS must be between 1 and 60");
      return false;
    }
    // bitrate 128..10000
    const br = Number(bitrateEl.value);
    if (!Number.isInteger(br) || br < 128 || br > 10000) {
      toast?.warning?.("Bitrate (Kbps) must be between 128 and 10000");
      return false;
    }
    // gopSize 1..200
    const gop = Number(gopSizeEl.value);
    if (!Number.isInteger(gop) || gop < 1 || gop > 200) {
      toast?.warning?.("GOP size must be between 1 and 200");
      return false;
    }
    // sliceUnits 0..32 (only channel 0, but harmless to check conditionally)
    if (String(channel) === "0") {
      const su = Number(sliceUnitsEl.value || 0);
      if (!Number.isInteger(su) || su < 0 || su > 32) {
        toast?.warning?.("Slice Units must be between 0 and 32");
        return false;
      }
    }
    // size must be one of allowed
    const size = sizeSel.value;
    if (!SIZE_OPTIONS[String(channel)]?.includes(size)) {
      toast?.warning?.("Invalid resolution for the selected stream");
      return false;
    }
    return true;
  }

  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }

  function titleizeProfile(p) {
    if (p === "base") return "Baseline";
    if (p === "main") return "Main";
    if (p === "high") return "High";
    return p;
  }

  // ---- Load / Render ------------------------------------------------------
  function populateStaticOptions(channel) {
    // Resolution options depend on channel
    const sizes = SIZE_OPTIONS[String(channel)] || [];
    fillSelect(sizeSel, sizes, (s) => s.replace("x", "×"));

    // FPS 1..60
    const fpsList = Array.from({ length: 60 }, (_, i) => String(i + 1));
    fillSelect(fpsSel, fpsList, (v) => v);

    // Codec, rcMode, profile are already in HTML; keep as-is (just ensure value exist)
  }

  async function loadChannel(channel) {
    try {
      showChannelExtras(channel);
      populateStaticOptions(channel);

      const res = await apiGet(buildVideoEndpoint(channel));
      const key = String(channel) === "0" ? "video0" : "video1";
      const data = res?.[key] || {};

      // Apply normalized values with defaults
      enabledEl.checked = toBool(data.enabled ?? DEFAULTS.enabled);

      setSelectValue(codecSel,   data.codec ?? DEFAULTS.codec);
      setSelectValue(sizeSel,    data.size ?? SIZE_OPTIONS[String(channel)]?.[0] ?? "");
      setSelectValue(fpsSel,     String(data.fps ?? DEFAULTS.fps));
      setSelectValue(rcModeSel,  data.rcMode ?? DEFAULTS.rcMode);
      setSelectValue(profileSel, data.profile ?? DEFAULTS.profile);

      bitrateEl.value  = String(data.bitrate  ?? DEFAULTS.bitrate);
      gopSizeEl.value  = String(data.gopSize  ?? DEFAULTS.gopSize);
      cropEl.value     = String(data.crop     ?? DEFAULTS.crop);

      if (String(channel) === "0") {
        setSelectValue(gopModeSel, data.gopMode ?? DEFAULTS.gopMode);
        sliceUnitsEl.value = String(data.sliceUnits ?? DEFAULTS.sliceUnits);
      }
    } catch (e) {
      console.error("[video] loadChannel failed:", e);
      toast?.error?.("Failed to load video settings");
    }
  }

  // ---- Save ---------------------------------------------------------------
  async function saveChannel(channel) {
    if (!validateForm(channel)) return;

    const body = {
      enabled: enabledEl.checked,
      codec: codecSel.value,
      fps: Number(fpsSel.value),
      bitrate: Number(bitrateEl.value),
      rcMode: rcModeSel.value,
      profile: profileSel.value,
      gopSize: Number(gopSizeEl.value),
      crop: String(cropEl.value || ""),
      size: sizeSel.value,
    };

    if (String(channel) === "0") {
      body.gopMode = gopModeSel.value;
      body.sliceUnits = Number(sliceUnitsEl.value || 0);
    }

    setSavingState(true);
    try {
      await apiPost(buildVideoEndpoint(channel), body);
      toast?.success?.("Video settings saved");
      await loadChannel(channel); // reload to reflect backend-normalized values
    } catch (e) {
      console.error("[video] saveChannel failed:", e);
      toast?.error?.("Saving video settings failed");
    } finally {
      setSavingState(false);
    }
  }

  // ---- Events -------------------------------------------------------------
  streamSel.addEventListener("change", () => {
    const ch = streamSel.value; // "0" | "1"
    loadChannel(ch);
  });

  btnSave.addEventListener("click", () => {
    const ch = streamSel.value;
    saveChannel(ch);
  });

  // ---- Init ---------------------------------------------------------------
  (function init() {
    // Ensure initial state for channel 0
    streamSel.value = "0";
    loadChannel("0");
  })();
});
