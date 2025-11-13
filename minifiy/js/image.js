"use strict";

/*!
 * Image settings (appConfig_image)
 * - GET/POST: API_ENDPOINTS.image
 * - Apply after POST: API_ENDPOINTS.appConfigApply
 * - Apply button is local to Display tab: #btnImageApply
 * - Uses global refreshMjpegStream() from apiService.js
 *
 * Fields per backend:
 *   mirror:boolean, flip:boolean,
 *   contrast:0..100, hue:0..100, saturation:0..100, luminance:0..100,
 *   rotate: "0"|"90"|"270",
 *   tuning:boolean, antiFlicker:boolean, dis:boolean,
 *   drc:0..65536,
 *   slowShutter: "disabled"|"low"|"medium"|"high",
 *   rawMode: "none"|"slow"|"fast",
 *   exposure:1..1000, aGain:0..65536, dGain:0..65536, ispGain:0..65536
 */

document.addEventListener("DOMContentLoaded", () => {
  const scope = document.querySelector('[data-tab-content="display"]');
  if (!scope) return;

  // ----- Elements ----------------------------------------------------------
  const ids = {
    // Image Adjustment
    contrastRange:  "img-contrast-range",
    contrastNumber: "img-contrast-number",
    hueRange:       "img-hue-range",
    hueNumber:      "img-hue-number",
    satRange:       "img-saturation-range",
    satNumber:      "img-saturation-number",
    lumRange:       "img-luminance-range",
    lumNumber:      "img-luminance-number",

    // Video Adjustment
    mirror:  "vid-mirror",
    flip:    "vid-flip",
    rotate:  "vid-rotate",

    // Enhancement
    tuning:       "enh-tuning",
    antiFlicker:  "enh-antiFlicker",
    dis:          "enh-dis",

    // Backlight
    drc: "bl-drc",

    // Exposure
    slowShutter: "exp-slowShutter",
    rawMode:     "exp-rawMode",
    exposure:    "exp-exposure",
    aGain:       "exp-aGain",
    dGain:       "exp-dGain",
    ispGain:     "exp-ispGain",

    // Apply
    btnApply: "btnImageApply",
  };

  const el = Object.fromEntries(
    Object.entries(ids).map(([k, id]) => [k, document.getElementById(id)])
  );
  if (!el.btnApply) return;

  // ----- Defaults / helpers ------------------------------------------------
  const DEFAULTS = {
    mirror: false,
    flip: false,
    contrast: 50,
    hue: 50,
    saturation: 50,
    luminance: 50,
    rotate: "0",
    tuning: false,
    antiFlicker: false,
    dis: false,
    drc: 0,
    slowShutter: "disabled",
    rawMode: "none",
    exposure: 50,
    aGain: 0,
    dGain: 0,
    ispGain: 0,
  };

  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }

  function clamp(n, min, max) {
    n = Number(n);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }

  function setSavingState(isSaving) {
    el.btnApply.disabled = isSaving;
    el.btnApply.classList.toggle("disabled", isSaving);
    el.btnApply.style.opacity = isSaving ? 0.75 : 1;
  }

  function bindRangeNumber(rangeEl, numberEl, min, max) {
    if (!rangeEl || !numberEl) return;
    const apply = (val) => {
      const v = clamp(val, min, max);
      rangeEl.value = String(v);
      numberEl.value = String(v);
    };
    rangeEl.addEventListener("input", () => apply(rangeEl.value));
    numberEl.addEventListener("input", () => apply(numberEl.value));
  }

  bindRangeNumber(el.contrastRange, el.contrastNumber, 0, 100);
  bindRangeNumber(el.hueRange,      el.hueNumber,      0, 100);
  bindRangeNumber(el.satRange,      el.satNumber,      0, 100);
  bindRangeNumber(el.lumRange,      el.lumNumber,      0, 100);

  // ----- Load --------------------------------------------------------------
  async function loadImageSettings() {
    try {
      const data = await apiGet(API_ENDPOINTS.image);

      // Image Adjustment
      const contrast = clamp(data?.contrast ?? DEFAULTS.contrast, 0, 100);
      el.contrastRange && (el.contrastRange.value = String(contrast));
      el.contrastNumber && (el.contrastNumber.value = String(contrast));

      const hue = clamp(data?.hue ?? DEFAULTS.hue, 0, 100);
      el.hueRange && (el.hueRange.value = String(hue));
      el.hueNumber && (el.hueNumber.value = String(hue));

      const sat = clamp(data?.saturation ?? DEFAULTS.saturation, 0, 100);
      el.satRange && (el.satRange.value = String(sat));
      el.satNumber && (el.satNumber.value = String(sat));

      const lum = clamp(data?.luminance ?? DEFAULTS.luminance, 0, 100);
      el.lumRange && (el.lumRange.value = String(lum));
      el.lumNumber && (el.lumNumber.value = String(lum));

      // Video Adjustment
      if (el.mirror) el.mirror.checked = toBool(data?.mirror ?? DEFAULTS.mirror);
      if (el.flip)   el.flip.checked   = toBool(data?.flip   ?? DEFAULTS.flip);
      if (el.rotate) el.rotate.value   = String(data?.rotate ?? DEFAULTS.rotate);

      // Enhancement
      if (el.tuning)      el.tuning.checked      = toBool(data?.tuning ?? DEFAULTS.tuning);
      if (el.antiFlicker) el.antiFlicker.checked = toBool(data?.antiFlicker ?? DEFAULTS.antiFlicker);
      if (el.dis)         el.dis.checked         = toBool(data?.dis ?? DEFAULTS.dis);

      // Backlight
      if (el.drc) el.drc.value = String(clamp(data?.drc ?? DEFAULTS.drc, 0, 65536));

      // Exposure
      if (el.slowShutter) el.slowShutter.value = String(data?.slowShutter ?? DEFAULTS.slowShutter);
      if (el.rawMode)     el.rawMode.value     = String(data?.rawMode ?? DEFAULTS.rawMode);
      if (el.exposure) el.exposure.value = String(clamp(data?.exposure ?? DEFAULTS.exposure, 1, 1000));
      if (el.aGain)    el.aGain.value    = String(clamp(data?.aGain ?? DEFAULTS.aGain, 0, 65536));
      if (el.dGain)    el.dGain.value    = String(clamp(data?.dGain ?? DEFAULTS.dGain, 0, 65536));
      if (el.ispGain)  el.ispGain.value  = String(clamp(data?.ispGain ?? DEFAULTS.ispGain, 0, 65536));
    } catch (e) {
      console.error("[image] load failed:", e);
      toast?.error?.("Failed to load image settings");
    }
  }

  // ----- Validate ----------------------------------------------------------
  function validate() {
    const nums = [
      { el: el.contrastNumber, min: 0, max: 100,   name: "Contrast" },
      { el: el.hueNumber,      min: 0, max: 100,   name: "Hue" },
      { el: el.satNumber,      min: 0, max: 100,   name: "Saturation" },
      { el: el.lumNumber,      min: 0, max: 100,   name: "Luminance" },
      { el: el.drc,            min: 0, max: 65536, name: "DRC" },
      { el: el.exposure,       min: 1, max: 1000,  name: "Exposure" },
      { el: el.aGain,          min: 0, max: 65536, name: "A-Gain" },
      { el: el.dGain,          min: 0, max: 65536, name: "D-Gain" },
      { el: el.ispGain,        min: 0, max: 65536, name: "ISP-Gain" },
    ];
    for (const { el: node, min, max, name } of nums) {
      if (!node) continue;
      const v = Number(node.value);
      if (!Number.isFinite(v) || v < min || v > max) {
        toast?.warning?.(`${name} out of range (${min}-${max})`);
        return false;
      }
    }
    if (el.rotate) {
      const r = String(el.rotate.value);
      if (!["0", "90", "270"].includes(r)) {
        toast?.warning?.("Rotate must be 0, 90 or 270");
        return false;
      }
    }
    return true;
  }

  // ----- Build body --------------------------------------------------------
  function buildBody() {
    return {
      // Video Adjustment
      mirror: !!(el.mirror && el.mirror.checked),
      flip:   !!(el.flip   && el.flip.checked),

      // Image Adjustment
      contrast:   Number(el.contrastNumber?.value ?? 50),
      hue:        Number(el.hueNumber?.value ?? 50),
      saturation: Number(el.satNumber?.value ?? 50),
      luminance:  Number(el.lumNumber?.value ?? 50),

      // Rotation / enhancement
      rotate:      String(el.rotate?.value ?? "0"),
      tuning:      !!(el.tuning && el.tuning.checked),
      antiFlicker: !!(el.antiFlicker && el.antiFlicker.checked),
      dis:         !!(el.dis && el.dis.checked),

      // Backlight
      drc: Number(el.drc?.value ?? 0),

      // Exposure
      slowShutter: String(el.slowShutter?.value ?? "disabled"),
      rawMode:     String(el.rawMode?.value ?? "none"),
      exposure:    Number(el.exposure?.value ?? 50),
      aGain:       Number(el.aGain?.value ?? 0),
      dGain:       Number(el.dGain?.value ?? 0),
      ispGain:     Number(el.ispGain?.value ?? 0),
    };
  }

  // ----- Save (POST + Apply) ----------------------------------------------
  async function saveAndApply() {
    if (!validate()) return;

    const body = buildBody();

    setSavingState(true);
    try {
      await apiPost(API_ENDPOINTS.image, body);
      await apiPost(API_ENDPOINTS.appConfigApply, {});
      // Global helper from apiService.js
      if (typeof refreshMjpegStream === "function") refreshMjpegStream();
      toast?.success?.("Image settings saved & applied");
      await loadImageSettings();
    } catch (e) {
      console.error("[image] save/apply failed:", e);
      toast?.error?.("Saving or applying image settings failed");
    } finally {
      setSavingState(false);
    }
  }

  // ----- Events ------------------------------------------------------------
  el.btnApply.addEventListener("click", saveAndApply);

  // ----- Init --------------------------------------------------------------
  loadImageSettings();
});
