"use strict";

/*!
 * Endpoints UI
 * - Builds endpoint strings using DEVICE_IP if available; otherwise falls back to location.host.
 * - Click any row or its "Copy" button to copy endpoint to clipboard.
 * - Uses toasti: toast.success / toast.error
 * - English-only comments
 */

document.addEventListener("DOMContentLoaded", () => {
  const videoTbody = document.getElementById("videoEndpoints");
  const imageTbody = document.getElementById("imageEndpoints");

  if (!videoTbody || !imageTbody) return;

  // ---- Host/URL helpers ---------------------------------------------------
  function getHostFromDeviceIp() {
    try {
      // DEVICE_IP might include :80; for http default we strip :80 for clean URLs
      const raw = (typeof DEVICE_IP === "string" && DEVICE_IP) ? DEVICE_IP : window.location.host;
      return raw.replace(/:80$/i, "");
    } catch {
      return window.location.host;
    }
  }

  const HOST = getHostFromDeviceIp();

  // Build endpoints (credentials for RTSP as provided)
  const endpoints = {
    videos: [
      { label: "RTSP main stream", value: `rtsp://${HOST}/stream=0` },
      { label: "RTSP sub stream",  value: `rtsp://${HOST}/stream=1` },
      { label: "RTSP JPEG stream", value: `rtsp://${HOST}/stream=2` },
      { label: "MJPEG video stream", value: `http://${HOST}/mjpeg` },
      { label: "MP4 video stream",   value: `http://${HOST}/video.mp4` },
      { label: "HLS (web browser live)", value: `http://${HOST}/hls` },
    ],
    images: [
      { label: "Snapshot (JPEG)", value: `http://${HOST}/image.jpg` },
    ],
  };

  // ---- Render helpers -----------------------------------------------------
  function makeRow({ label, value }) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-copy", value); // clicking the row copies too

    const tdLabel = document.createElement("td");
    tdLabel.className = "fw-semibold";
    tdLabel.textContent = label;

    const tdValue = document.createElement("td");
    const code = document.createElement("code");
    code.textContent = value;
    tdValue.appendChild(code);

    const tdCopy = document.createElement("td");
    tdCopy.className = "text-end";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm btn-outline-light";
    btn.textContent = "Copy";
    btn.setAttribute("data-copy", value);
    tdCopy.appendChild(btn);

    tr.appendChild(tdLabel);
    tr.appendChild(tdValue);
    tr.appendChild(tdCopy);
    return tr;
  }

  function renderList(tbody, list) {
    tbody.innerHTML = "";
    list.forEach(item => tbody.appendChild(makeRow(item)));
  }

  // ---- Copy handling ------------------------------------------------------
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      window.toast?.success?.("Copied to clipboard");
    } catch (e) {
      // Fallback for older browsers
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        window.toast?.success?.("Copied to clipboard");
      } catch (err) {
        console.error("[endpoints] copy failed:", err);
        window.toast?.error?.("Copy failed");
      }
    }
  }

  function delegateCopy(container) {
    container.addEventListener("click", (ev) => {
      const node = ev.target.closest("[data-copy]");
      if (!node) return;
      const text = node.getAttribute("data-copy") || node.textContent || "";
      if (!text.trim()) return;
      ev.preventDefault();
      copyToClipboard(text.trim());
    });
  }

  // ---- Init ---------------------------------------------------------------
  renderList(videoTbody, endpoints.videos);
  renderList(imageTbody, endpoints.images);

  // Both row and "Copy" button are clickable
  delegateCopy(videoTbody);
  delegateCopy(imageTbody);
});
