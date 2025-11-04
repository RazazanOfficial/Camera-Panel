"use strict";

/*! Basic Info module — aligned with timeSettings style
 *  - English-only comments
 *  - Accepts string/number/boolean from API
 *  - Does not overwrite inputs with empty values
 */

//! 1) Helpers ---------------------------------------------------------------

// Convert anything to a non-empty string; otherwise return ""
function toNonEmptyString(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v.trim();
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}

// Pick the first non-empty value by trying multiple keys
function firstValue(obj, keys) {
  const o = obj || {};
  for (const k of keys) {
    const s = toNonEmptyString(o[k]);
    if (s) return s;
  }
  return "";
}

//! 2) Normalize API response ------------------------------------------------
function normalizeSystemInfoResponse(raw) {
  const out = { system_name: "", system_num: "", system_model: "", system_serial: "" };
  if (!raw) return out;

  // support common wrappers
  const inner = (raw && (raw.data || raw.payload || raw.result)) || raw;

  out.system_name = firstValue(inner, [
    "system_name", "systemName", "name", "device_name", "deviceName"
  ]);

  // cover many possible key names for the number/id
  out.system_num = firstValue(inner, [
    "system_num", "systemNum", "system_number", "systemNumber",
    "num", "device_num", "deviceNum", "device_number", "deviceNo", "deviceID", "deviceId"
  ]);

  out.system_model = firstValue(inner, [
    "system_model", "systemModel", "model", "device_model", "deviceModel"
  ]);

  out.system_serial = firstValue(inner, [
    "system_serial", "systemSerial", "serial", "serialNo", "serialNumber"
  ]);

  return out;
}

//! 3) Build GET endpoint safely (works whether base has query or not) ------
function buildUrlWithParams(base, params) {
  const hasQuery = base.includes("?");
  const prefix = hasQuery ? "&" : "?";
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return `${base}${prefix}${qs}`;
}

function getSystemInfoGetEndpoint() {
  if (typeof API_ENDPOINTS !== "object") {
    throw new Error("API_ENDPOINTS is not available. Ensure apiConfig.js loads first.");
  }
  if (API_ENDPOINTS.systemInfoGet) return API_ENDPOINTS.systemInfoGet;

  if (!API_ENDPOINTS.systemInfo) {
    throw new Error("API_ENDPOINTS.systemInfo is missing.");
  }
  // use empty query placeholders to mirror timeSettings pattern
  return buildUrlWithParams(API_ENDPOINTS.systemInfo, {
    system_name: "",
    system_serial: "",
    system_num: "",
    system_model: ""
  });
}

//! 4) GET -------------------------------------------------------------------
async function getBasicInfo() {
  try {
    const endpoint = getSystemInfoGetEndpoint();
    console.debug("[basicInfo] GET ->", endpoint);
    const res = await apiGet(endpoint);
    const info = normalizeSystemInfoResponse(res);
    console.debug("[basicInfo] normalized ->", info, "raw:", res);

    const nameInput   = document.getElementById("diviceName");
    const numInput    = document.getElementById("diviceNo");   // note: 'diviceNo' id is intentional per HTML
    const modelInput  = document.getElementById("model");
    const serialInput = document.getElementById("serialNo");

    // Only overwrite when server returned a non-empty value
    if (nameInput  && info.system_name  !== "") nameInput.value   = info.system_name;
    if (numInput   && info.system_num   !== "") numInput.value    = info.system_num;
    if (modelInput && info.system_model !== "") modelInput.value  = info.system_model;
    if (serialInput&& info.system_serial!== "") serialInput.value = info.system_serial;
  } catch (e) {
    console.error("Failed to GET basic info:", e);
    if (window.toast?.error) toast.error("Failed to get basic info");
  }
}

//! 5) POST ------------------------------------------------------------------
async function saveBasicInfo() {
  const name = toNonEmptyString(document.getElementById("diviceName")?.value);
  const num  = toNonEmptyString(document.getElementById("diviceNo")?.value);

  if (!API_ENDPOINTS?.systemInfo) {
    throw new Error("API_ENDPOINTS.systemInfo is not configured.");
  }
  // Send only the fields the API expects (adjust keys if your backend differs)
  return apiPost(API_ENDPOINTS.systemInfo, {
    system_name: name,
    system_num: num
  });
}

//! 6) DOM wiring ------------------------------------------------------------
function initBasicInfo() {
  try {
    // auto load
    getBasicInfo();

    // find the Save button inside the basicInformation tab if no explicit id is present
    const container = document.querySelector('[data-tab-content="basicInformation"]');
    const saveBtn =
      document.getElementById("saveBasicInfo") ||
      container?.querySelector("button");

    if (saveBtn) {
      saveBtn.addEventListener("click", async () => {
        try {
          await saveBasicInfo();
          if (window.toast?.success) toast.success("Basic info saved");
        } catch (e) {
          console.error("Failed to save basic info:", e);
          if (window.toast?.error) toast.error("Saving basic info failed");
        }
      });
    } else {
      console.warn("[basicInfo] Save button not found.");
    }
  } catch (e) {
    console.error("[basicInfo] init failed:", e);
  }
}

// Ensure init runs regardless of when the script is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBasicInfo);
} else {
  initBasicInfo();
}

// 172.29.176.1
// 127.0.0.1