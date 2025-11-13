"use strict";

/*!
 * Audio settings
 * - Endpoint: API_ENDPOINTS.audio (GET/POST)
 * - Fields (CGI):
 *   enabled:boolean, volume:0..100, srate:choice(8000/16000/32000/48000),
 *   codec:choice(opus/mp3/aac/pcm/alaw/ulaw),
 *   outputEnabled:boolean, outputVolume:0..100, dual:boolean
 * - After successful POST, call API_ENDPOINTS.appConfigApply
 * - English-only comments
 */

document.addEventListener("DOMContentLoaded", () => {
  const box = document.querySelector('[data-tab-content="audio"]');
  if (!box) return;

  // Elements ---------------------------------------------------------------
  const enabledEl        = document.getElementById("audioEnabled");
  const volumeEl         = document.getElementById("audioVolume");
  const srateEl          = document.getElementById("audioSrate");
  const codecEl          = document.getElementById("audioCodec");

  const outEnabledEl     = document.getElementById("audioOutputEnabled");
  const outVolumeEl      = document.getElementById("audioOutputVolume");

  const dualEl           = document.getElementById("audioDual");

  const btnSave          = document.getElementById("btnAudioSave");

  // Constants --------------------------------------------------------------
  const SRATE_OPTIONS = ["8000", "16000", "32000", "48000"];
  const CODEC_OPTIONS = ["opus", "mp3", "aac", "pcm", "alaw", "ulaw"];

  const DEFAULTS = {
    enabled: true,
    volume: 40,
    srate: "8000",
    codec: "opus",
    outputEnabled: true,
    outputVolume: 30,
    dual: false,
  };

  // Helpers ----------------------------------------------------------------
  function fillSelect(sel, values, labeller = (v) => v) {
    sel.innerHTML = values.map(v => `<option value="${v}">${labeller(v)}</option>`).join("");
  }

  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }

  function setSavingState(isSaving) {
    btnSave.disabled = isSaving;
    btnSave.classList.toggle("disabled", isSaving);
    btnSave.style.opacity = isSaving ? 0.75 : 1;
  }

  function validate() {
    const vol  = Number(volumeEl.value);
    const oVol = Number(outVolumeEl.value);

    if (!Number.isInteger(vol) || vol < 0 || vol > 100) {
      toast?.warning?.("Input volume must be 0–100");
      return false;
    }
    if (outEnabledEl.checked) {
      if (!Number.isInteger(oVol) || oVol < 0 || oVol > 100) {
        toast?.warning?.("Output volume must be 0–100");
        return false;
      }
    }
    if (!SRATE_OPTIONS.includes(String(srateEl.value))) {
      toast?.warning?.("Invalid sample rate");
      return false;
    }
    if (!CODEC_OPTIONS.includes(String(codecEl.value))) {
      toast?.warning?.("Invalid codec");
      return false;
    }
    return true;
  }

  function applyOutputDisabledState() {
    const dis = !outEnabledEl.checked;
    outVolumeEl.disabled = dis;
  }

  // Load -------------------------------------------------------------------
  async function loadAudio() {
    try {
      const res = await apiGet(API_ENDPOINTS.audio);
      const d = res || {};

      enabledEl.checked    = toBool(d.enabled ?? DEFAULTS.enabled);
      volumeEl.value       = String(d.volume ?? DEFAULTS.volume);
      srateEl.value        = String(d.srate ?? DEFAULTS.srate);
      codecEl.value        = String(d.codec ?? DEFAULTS.codec);

      outEnabledEl.checked = toBool(d.outputEnabled ?? DEFAULTS.outputEnabled);
      outVolumeEl.value    = String(d.outputVolume ?? DEFAULTS.outputVolume);

      dualEl.checked       = toBool(d.dual ?? DEFAULTS.dual);

      applyOutputDisabledState();
    } catch (e) {
      console.error("[audio] load failed:", e);
      toast?.error?.("Failed to load audio settings");
    }
  }

  // Save -------------------------------------------------------------------
  async function saveAudio() {
    if (!validate()) return;

    const body = {
      enabled: enabledEl.checked,
      volume: Number(volumeEl.value),
      srate: String(srateEl.value),       // keep as string (matches backend sample)
      codec: String(codecEl.value),

      outputEnabled: outEnabledEl.checked,
      outputVolume: Number(outVolumeEl.value),

      dual: dualEl.checked,
    };

    setSavingState(true);
    try {
      // 1) Save pending config
      await apiPost(API_ENDPOINTS.audio, body);

      // 2) Apply to take effect
      await apiPost(API_ENDPOINTS.appConfigApply, {});

      toast?.success?.("Audio settings saved & applied");
      await loadAudio();
    } catch (e) {
      console.error("[audio] save/apply failed:", e);
      toast?.error?.("Saving or applying audio settings failed");
    } finally {
      setSavingState(false);
    }
  }

  // Events -----------------------------------------------------------------
  outEnabledEl.addEventListener("change", applyOutputDisabledState);
  btnSave.addEventListener("click", saveAudio);

  // Init -------------------------------------------------------------------
  (function init() {
    fillSelect(srateEl, SRATE_OPTIONS);
    fillSelect(codecEl, CODEC_OPTIONS, (v) => v.toUpperCase());
    loadAudio();
  })();
});
