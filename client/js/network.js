"use strict";

/*!
 * Network page logic (IPv4 + Mac/MTU + Ports)
 * - Loads current IPv4, MAC, MTU, and Ports on init
 * - DHCP toggle disables/enables IPv4 inputs
 * - Standalone Save button for Ports tab (separate from IPv4/MTU Save)
 */

document.addEventListener("DOMContentLoaded", () => {
  // -------------------- IPv4 / MAC / MTU (existing) --------------------
  const ipv4DhcpEl = document.getElementById("ipv4Dhcp");
  const ipv4AddrEl = document.getElementById("ipv4Address");
  const ipv4MaskEl = document.getElementById("ipv4SubnetMask");
  const ipv4GwEl   = document.getElementById("ipv4DefaultGetWay");
  const ipv4DnsEl  = document.getElementById("preferredDnsServer");

  const macEl = document.getElementById("macAddress");
  const mtuEl = document.getElementById("mtu");
  const btnSaveNetwork = document.getElementById("btnNetworkSave");

  function toBool(v) {
    if (typeof v === "boolean") return v;
    const s = String(v ?? "").trim().toLowerCase();
    return s === "true" || s === "1" || s === "yes";
  }

  function applyDhcpDisabled(disabled) {
    if (!ipv4AddrEl) return;
    ipv4AddrEl.disabled = disabled;
    ipv4MaskEl.disabled = disabled;
    ipv4GwEl.disabled   = disabled;
    ipv4DnsEl.disabled  = disabled;
  }

  function isValidIPv4(s) {
    const m = String(s || "").trim().match(/^(\d{1,3}\.){3}\d{1,3}$/);
    if (!m) return false;
    return s.split(".").map(Number).every(n => n >= 0 && n <= 255);
  }

  function isValidIPv4Mask(s) { return isValidIPv4(s); }

  function validateIPv4Form() {
    if (!ipv4DhcpEl || ipv4DhcpEl.checked) return true;
    const ip   = ipv4AddrEl.value.trim();
    const mask = ipv4MaskEl.value.trim();
    const gw   = ipv4GwEl.value.trim();
    const dns  = ipv4DnsEl.value.trim();
    if (!isValidIPv4(ip))  { toast?.warning?.("Invalid IPv4 Address"); return false; }
    if (!isValidIPv4Mask(mask)) { toast?.warning?.("Invalid IPv4 Subnet Mask"); return false; }
    if (gw && !isValidIPv4(gw)) { toast?.warning?.("Invalid IPv4 Gateway"); return false; }
    if (dns && !isValidIPv4(dns)) { toast?.warning?.("Invalid IPv4 DNS"); return false; }
    return true;
  }

  function validateMtu() {
    if (!mtuEl) return true;
    const v = Number(mtuEl.value);
    if (!Number.isFinite(v)) { toast?.warning?.("MTU must be a number"); return false; }
    if (v < 500 || v > 10000) { toast?.warning?.("MTU out of range (500-10000)"); return false; }
    return true;
  }

  function setSavingState(btn, isSaving) {
    if (!btn) return;
    btn.disabled = isSaving;
    btn.classList.toggle("disabled", isSaving);
    btn.style.opacity = isSaving ? 0.75 : 1;
  }

  async function loadIPv4() {
    if (!ipv4AddrEl) return;
    try {
      const res = await apiGet(API_ENDPOINTS.netIPv4);
      const dhcp = toBool(res?.dhcp);
      if (ipv4DhcpEl) ipv4DhcpEl.checked = dhcp;
      ipv4AddrEl.value = res?.ipv4_address || "";
      ipv4MaskEl.value = res?.ipv4_netmask || "";
      ipv4GwEl.value   = res?.ipv4_gateway || "";
      ipv4DnsEl.value  = res?.ipv4_dns     || "";
      applyDhcpDisabled(dhcp);
    } catch (e) {
      console.error("[network] loadIPv4 failed:", e);
      toast?.error?.("Failed to load IPv4 settings");
    }
  }

  async function loadMac() {
    if (!macEl) return;
    try {
      const res = await apiGet(API_ENDPOINTS.netMac);
      const mac = res?.mac || res?.mac_address || res?.macAddr || "";
      macEl.value = mac;
    } catch (e) {
      console.error("[network] loadMac failed:", e);
      toast?.error?.("Failed to load MAC address");
    }
  }

  async function loadMtu() {
    if (!mtuEl) return;
    try {
      const res = await apiGet(API_ENDPOINTS.netMtu);
      const mtu = res?.mtu || res?.MTU || res?.value || "";
      if (mtu) mtuEl.value = String(mtu);
    } catch (e) {
      console.error("[network] loadMtu failed:", e);
      toast?.error?.("Failed to load MTU");
    }
  }

  ipv4DhcpEl?.addEventListener("change", () => {
    applyDhcpDisabled(ipv4DhcpEl.checked);
  });

  btnSaveNetwork?.addEventListener("click", async () => {
    if (!validateMtu()) return;
    if (!validateIPv4Form()) return;

    const dhcp = ipv4DhcpEl?.checked ?? false;
    const ipv4Body = dhcp
      ? { dhcp: true }
      : {
          ipv4_address: ipv4AddrEl.value.trim(),
          ipv4_netmask: ipv4MaskEl.value.trim(),
          ipv4_gateway: ipv4GwEl.value.trim(),
          ipv4_dns:     ipv4DnsEl.value.trim(),
          dhcp: false,
        };
    const mtuBody = mtuEl ? { mtu: String(Number(mtuEl.value)) } : null;

    setSavingState(btnSaveNetwork, true);
    try {
      const calls = [ apiPost(API_ENDPOINTS.netIPv4, ipv4Body) ];
      if (mtuBody) calls.push(apiPost(API_ENDPOINTS.netMtu, mtuBody));
      await Promise.all(calls);
      toast?.success?.("Network settings saved");
      await Promise.all([loadIPv4(), loadMtu()]);
    } catch (e) {
      console.error("[network] save IPv4/MTU failed:", e);
      toast?.error?.("Saving network settings failed");
    } finally {
      setSavingState(btnSaveNetwork, false);
    }
  });

  // -------------------- Ports (new) --------------------
  const httpPortEl  = document.getElementById("httpPort");
  const rtspPortEl  = document.getElementById("rtspPort");
  const httpsPortEl = document.getElementById("httpsPort");
  const btnPortSave = document.getElementById("btnPortSave");

  function isValidPort(n) {
    const v = Number(n);
    return Number.isInteger(v) && v >= 1 && v <= 65535;
  }

  function validatePorts() {
    if (!httpPortEl || !rtspPortEl || !httpsPortEl) return true; // not on this tab
    const http  = Number(httpPortEl.value);
    const rtsp  = Number(rtspPortEl.value);
    const https = Number(httpsPortEl.value);

    if (!isValidPort(http))  { toast?.warning?.("Invalid HTTP port (1-65535)");  return false; }
    if (!isValidPort(rtsp))  { toast?.warning?.("Invalid RTSP port (1-65535)");  return false; }
    if (!isValidPort(https)) { toast?.warning?.("Invalid HTTPS port (1-65535)"); return false; }

    return true;
  }

  async function loadPorts() {
    if (!httpPortEl || !rtspPortEl || !httpsPortEl) return;
    try {
      const res = await apiGet(API_ENDPOINTS.netPorts);
      if (res?.http_port)  httpPortEl.value  = String(res.http_port);
      if (res?.rtsp_port)  rtspPortEl.value  = String(res.rtsp_port);
      if (res?.https_port) httpsPortEl.value = String(res.https_port);
    } catch (e) {
      console.error("[network] loadPorts failed:", e);
      toast?.error?.("Failed to load port settings");
    }
  }

  btnPortSave?.addEventListener("click", async () => {
    if (!validatePorts()) return;

    const body = {
      http_port:  String(Number(httpPortEl.value)),
      https_port: String(Number(httpsPortEl.value)),
      rtsp_port:  String(Number(rtspPortEl.value)),
    };

    setSavingState(btnPortSave, true);
    try {
      await apiPost(API_ENDPOINTS.netPorts, body);
      toast?.success?.("Ports saved");
      // Caution: changing HTTP/HTTPS ports may affect current access path.
      // We do NOT auto-reload here; consider informing the user:
      toast?.info?.("If you changed HTTP/HTTPS ports, reconnect using the new port.");
      await loadPorts();
    } catch (e) {
      console.error("[network] save Ports failed:", e);
      toast?.error?.("Saving ports failed");
    } finally {
      setSavingState(btnPortSave, false);
    }
  });

  // -------------------- Init --------------------
  (async function init() {
    // Load what exists on the page
    await Promise.all([
      loadIPv4(),
      loadMac(),
      loadMtu(),
      loadPorts(),
    ]);
  })();
});
