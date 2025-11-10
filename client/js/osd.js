"use strict";

/*!
 * OSD settings (appConfig_osd)
 * - GET/POST: API_ENDPOINTS.osd
 * - Apply after POST: API_ENDPOINTS.appConfigApply
 * - Local Apply button: #btnOsdApply
 * - Uses global refreshMjpegStream() from apiService.js
 *
 * Backend fields:
 *   enabled:boolean
 *   template:string (<=200)
 *   size:1..60
 *   posX:1..65536
 *   posY:1..65536
 *
 * UI template = base text + [date tokens joined with "."] + [time tokens joined with ":"]
 * Tokens: %d, %m, %Y, %H, %M, %S
 */

document.addEventListener("DOMContentLoaded", () => {
  const el = {
    enabled:  document.getElementById("osdEnabled"),
    baseText: document.getElementById("osdBaseText"),

    tDay:   document.getElementById("osdTokenDay"),
    tMonth: document.getElementById("osdTokenMonth"),
    tYear:  document.getElementById("osdTokenYear"),
    tHour:  document.getElementById("osdTokenHour"),
    tMin:   document.getElementById("osdTokenMinute"),
    tSec:   document.getElementById("osdTokenSecond"),

    preview: document.getElementById("osdPreviewTemplate"),

    size: document.getElementById("osdSize"),
    posX: document.getElementById("osdPosX"),
    posY: document.getElementById("osdPosY"),

    btnApply: document.getElementById("btnOsdApply"),
  };

  if (!el.btnApply) return; // nothing to do if button is missing

  // ---------- Helpers ----------
  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }
  function clampNum(n, min, max) {
    const v = Number(n);
    if (!Number.isFinite(v)) return min;
    return Math.max(min, Math.min(max, v));
  }
  function setControlsDisabled(disabled) {
    [
      el.baseText, el.tDay, el.tMonth, el.tYear, el.tHour, el.tMin, el.tSec,
      el.size, el.posX, el.posY
    ].forEach(node => { if (node) node.disabled = disabled; });
  }
  function setSavingState(saving) {
    el.btnApply.disabled = saving;
    el.btnApply.classList.toggle("disabled", saving);
    el.btnApply.style.opacity = saving ? 0.75 : 1;
  }

  // ---------- Template build/parse ----------
  function tokensFromUI() {
    const date = [];
    if (el.tDay?.checked)   date.push("%d");
    if (el.tMonth?.checked) date.push("%m");
    if (el.tYear?.checked)  date.push("%Y");

    const time = [];
    if (el.tHour?.checked) time.push("%H");
    if (el.tMin?.checked)  time.push("%M");
    if (el.tSec?.checked)  time.push("%S");

    return { date, time };
  }

  function buildTemplate() {
    const base = String(el.baseText?.value ?? "").trim();
    const { date, time } = tokensFromUI();

    const parts = [];
    if (base) parts.push(base);
    if (date.length) parts.push(date.join("."));
    if (time.length) parts.push(time.join(":"));
    return parts.join(" ").trim();
  }

  function updatePreview() {
    if (!el.preview) return;
    el.preview.value = buildTemplate();
  }

  function parseTemplateToUI(template) {
    const tokenRe  = /%(d|m|Y|H|M|S)/g;
    const firstIdx = template.search(tokenRe);
    let base = template;
    let tail = "";

    if (firstIdx >= 0) {
      base = template.slice(0, firstIdx);
      tail = template.slice(firstIdx);
    }

    const has = (t) => tail.includes(t);
    if (el.baseText) el.baseText.value = base;
    if (el.tDay)   el.tDay.checked   = has("%d");
    if (el.tMonth) el.tMonth.checked = has("%m");
    if (el.tYear)  el.tYear.checked  = has("%Y");
    if (el.tHour)  el.tHour.checked  = has("%H");
    if (el.tMin)   el.tMin.checked   = has("%M");
    if (el.tSec)   el.tSec.checked   = has("%S");

    updatePreview();
  }

  // ---------- Load ----------
  async function loadOSD() {
    try {
      const d = await apiGet(API_ENDPOINTS.osd);

      if (el.enabled) el.enabled.checked = toBool(d?.enabled);
      parseTemplateToUI(String(d?.template ?? ""));

      if (el.size) el.size.value = String(clampNum(d?.size ?? 20, 1, 60));
      if (el.posX) el.posX.value = String(clampNum(d?.posX ?? 10, 1, 65536));
      if (el.posY) el.posY.value = String(clampNum(d?.posY ?? 10, 1, 65536));

      setControlsDisabled(!el.enabled?.checked);
    } catch (e) {
      console.error("[osd] load failed:", e);
      toast?.error?.("Failed to load OSD settings");
    }
  }

  // ---------- Validate ----------
  function validate() {
    const size = Number(el.size?.value);
    const x    = Number(el.posX?.value);
    const y    = Number(el.posY?.value);

    if (!Number.isInteger(size) || size < 1 || size > 60) {
      toast?.warning?.("Size must be 1–60");
      return false;
    }
    if (!Number.isInteger(x) || x < 1 || x > 65536) {
      toast?.warning?.("Position X must be 1–65536");
      return false;
    }
    if (!Number.isInteger(y) || y < 1 || y > 65536) {
      toast?.warning?.("Position Y must be 1–65536");
      return false;
    }

    const tpl = buildTemplate();
    if (tpl.length > 200) {
      toast?.warning?.("Template is too long (max 200)");
      return false;
    }
    return true;
  }

  // ---------- Build body ----------
  function buildBody() {
    return {
      enabled:  !!el.enabled?.checked,
      template: buildTemplate(),
      size:     Number(el.size?.value),
      posX:     Number(el.posX?.value),
      posY:     Number(el.posY?.value),
    };
  }

  // ---------- Save + Apply ----------
  async function saveAndApply() {
    if (!validate()) return;

    setSavingState(true);
    try {
      await apiPost(API_ENDPOINTS.osd, buildBody());
      await apiPost(API_ENDPOINTS.appConfigApply, {});
      if (typeof refreshMjpegStream === "function") refreshMjpegStream();
      toast?.success?.("OSD settings saved & applied");
      await loadOSD(); // in case backend normalizes values
    } catch (e) {
      console.error("[osd] save/apply failed:", e);
      toast?.error?.("Saving or applying OSD settings failed");
    } finally {
      setSavingState(false);
    }
  }

  // ---------- Events ----------
  // Live preview for template
  [el.baseText, el.tDay, el.tMonth, el.tYear, el.tHour, el.tMin, el.tSec]
    .filter(Boolean)
    .forEach(node => node.addEventListener("input", updatePreview));

  // Enable/disable sub-controls based on Enabled switch
  el.enabled?.addEventListener("change", () => {
    setControlsDisabled(!el.enabled.checked);
  });

  // Apply action
  el.btnApply.addEventListener("click", saveAndApply);

  // ---------- Init ----------
  updatePreview();
  loadOSD();
});
