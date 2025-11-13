"use strict";

/*!
 * Day-Night settings (appConfig_night)
 * - GET/POST: API_ENDPOINTS.night
 * - Apply after POST: API_ENDPOINTS.appConfigApply
 * - This module is fully independent (own Apply button: #btnDayNightApply)
 *
 * UI fields:
 *   switchThreshold (0..65536)
 *   switchMargin    (0..10000)
 * Mapping to API:
 *   minThreshold = switchThreshold
 *   maxThreshold = clamp(switchThreshold + switchMargin, 0..65536)
 *
 * Flat fields:
 *   colorToGray:boolean
 *   overrideDrc:0..65536
 *   lightMonitor:boolean
 *   monitorDelay:0..60
 *   minThreshold:0..65536
 *   maxThreshold:0..65536
 *   projectorEnabled:boolean
 *   projectorLevel:1..100
 */

document.addEventListener("DOMContentLoaded", () => {
  // Scope to this tab (optional; using IDs directly for speed)
  const el = {
    colorToGray:      document.getElementById("dn-colorToGray"),
    overrideDrc:      document.getElementById("dn-overrideDrc"),
    lightMonitor:     document.getElementById("dn-lightMonitor"),
    monitorDelay:     document.getElementById("dn-monitorDelay"),
    switchThreshold:  document.getElementById("dn-switchThreshold"),
    switchMargin:     document.getElementById("dn-switchMargin"),
    projectorEnabled: document.getElementById("dn-projectorEnabled"),
    projectorLevel:   document.getElementById("dn-projectorLevel"),
    btnApply:         document.getElementById("btnDayNightApply"),
  };

  if (!el.btnApply) return;

  // ---------- Helpers ----------
  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }
  function clampNum(x, min, max) {
    const n = Number(x);
    if (!Number.isFinite(n)) return min;
    return Math.max(min, Math.min(max, n));
  }
  function setSavingState(saving) {
    el.btnApply.disabled = saving;
    el.btnApply.classList.toggle("disabled", saving);
    el.btnApply.style.opacity = saving ? 0.75 : 1;
  }

  // ---------- Load ----------
  async function loadDayNight() {
    try {
      const d = await apiGet(API_ENDPOINTS.night);

      // Image Properties
      if (el.colorToGray) el.colorToGray.checked = toBool(d?.colorToGray);
      if (el.overrideDrc) el.overrideDrc.value   = String(clampNum(d?.overrideDrc ?? 0, 0, 65536));

      // Switch Parameters
      if (el.lightMonitor) el.lightMonitor.checked = toBool(d?.lightMonitor);
      if (el.monitorDelay) el.monitorDelay.value   = String(clampNum(d?.monitorDelay ?? 0, 0, 60));

      const minThr = clampNum(d?.minThreshold ?? 0, 0, 65536);
      const maxThr = clampNum(d?.maxThreshold ?? minThr, 0, 65536);
      const margin = clampNum(maxThr - minThr, 0, 10000);

      if (el.switchThreshold) el.switchThreshold.value = String(minThr);
      if (el.switchMargin)    el.switchMargin.value    = String(margin);

      // Projector
      if (el.projectorEnabled) el.projectorEnabled.checked = toBool(d?.projectorEnabled ?? d?.enabled);
      if (el.projectorLevel)   el.projectorLevel.value     = String(clampNum(d?.projectorLevel ?? d?.level ?? 50, 1, 100));
    } catch (e) {
      console.error("[dayNight] load failed:", e);
      toast?.error?.("Failed to load Day/Night settings");
    }
  }

  // ---------- Validate ----------
  function validate() {
    const rules = [
      { node: el.overrideDrc,     min: 0, max: 65536, name: "Override DRC" },
      { node: el.monitorDelay,    min: 0, max: 60,    name: "Monitor Delay" },
      { node: el.switchThreshold, min: 0, max: 65536, name: "Switch Threshold" },
      { node: el.switchMargin,    min: 0, max: 10000, name: "Switch Margin" },
      { node: el.projectorLevel,  min: 1, max: 100,   name: "Projector Level" },
    ];
    for (const { node, min, max, name } of rules) {
      if (!node) continue;
      const v = Number(node.value);
      if (!Number.isFinite(v) || v < min || v > max) {
        toast?.warning?.(`${name} out of range (${min}-${max})`);
        return false;
      }
    }
    // Ensure min+margin within 65536
    const base   = Number(el.switchThreshold.value || 0);
    const margin = Number(el.switchMargin.value || 0);
    if (base + margin > 65536) {
      toast?.warning?.("Switch Threshold + Margin must be ≤ 65536");
      return false;
    }
    return true;
  }

  // ---------- Build body ----------
  function buildBody() {
    const base   = clampNum(el.switchThreshold?.value ?? 0, 0, 65536);
    const margin = clampNum(el.switchMargin?.value ?? 0, 0, 10000);
    const maxThr = clampNum(base + margin, 0, 65536);

    return {
      colorToGray:      !!el.colorToGray?.checked,
      overrideDrc:      clampNum(el.overrideDrc?.value ?? 0, 0, 65536),

      lightMonitor:     !!el.lightMonitor?.checked,
      monitorDelay:     clampNum(el.monitorDelay?.value ?? 0, 0, 60),

      minThreshold:     base,
      maxThreshold:     maxThr,

      projectorEnabled: !!el.projectorEnabled?.checked,
      projectorLevel:   clampNum(el.projectorLevel?.value ?? 50, 1, 100),
    };
  }

  // ---------- Save + Apply ----------
  async function saveAndApply() {
    if (!validate()) return;
    const body = buildBody();

    setSavingState(true);
    try {
      await apiPost(API_ENDPOINTS.night, body);
      await apiPost(API_ENDPOINTS.appConfigApply, {});
      // Refresh preview is optional here; enable if you want instant visual change:
      if (typeof refreshMjpegStream === "function") refreshMjpegStream();
      toast?.success?.("Day/Night settings saved & applied");
      await loadDayNight(); // reflect normalized values from backend
    } catch (e) {
      console.error("[dayNight] save/apply failed:", e);
      toast?.error?.("Saving or applying Day/Night settings failed");
    } finally {
      setSavingState(false);
    }
  }

  // ---------- Events ----------
  el.btnApply.addEventListener("click", saveAndApply);

  // ---------- Init ----------
  loadDayNight();
});
