// ===== MJPEG player (IMG-based) =====
const STREAM_URL = "http://192.168.1.142/mjpeg";

const img = document.getElementById("mjpegStream");
const playPauseBtn = document.getElementById("playPauseBtn");   // may exist elsewhere
const fullscreenBtn = document.getElementById("fullscreenBtn"); // may exist elsewhere
const container = document.getElementById("videoContainer");

// Fallback + modal elements
const fallbackBox = document.getElementById("streamFallback");
const btnOpenFixModal = document.getElementById("btnOpenFixModal");
const fixModalEl = document.getElementById("streamFixModal");
let fixBsModal = null;
if (fixModalEl) fixBsModal = new bootstrap.Modal(fixModalEl, { backdrop: true, keyboard: true });

const btnEnableJpeg = document.getElementById("btnEnableJpeg");
const btnDisableSub = document.getElementById("btnDisableSub");
const btnFixClose   = document.getElementById("btnFixClose");

let isPlaying = true;
let showedFallback = false;

function bustCacheUrl(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_t=${Date.now()}`;
}

function showFallback() {
  if (showedFallback) return;
  showedFallback = true;
  try { pauseStream(); } catch {}
  if (img) img.classList.add("d-none");
  if (fallbackBox) fallbackBox.classList.remove("d-none");
}

function hideFallback() {
  showedFallback = false;
  if (fallbackBox) fallbackBox.classList.add("d-none");
  if (img) img.classList.remove("d-none");
}

function playStream() {
  if (isPlaying) return;
  if (!img) return;
  img.src = bustCacheUrl(STREAM_URL);
  isPlaying = true;
  if (playPauseBtn) playPauseBtn.textContent = "Pause";
}

function pauseStream() {
  if (!isPlaying) return;
  if (!img) return;
  img.src = ""; // drop MJPEG connection
  isPlaying = false;
  if (playPauseBtn) playPauseBtn.textContent = "Play";
}

playPauseBtn?.addEventListener("click", () => {
  isPlaying ? pauseStream() : playStream();
});

// Fullscreen on container
fullscreenBtn?.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    container?.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

// Error handling: on first error, stop retry loop and show fallback UI
img?.addEventListener("error", () => {
  // Stop the auto-retry; show the fixer UI
  showFallback();
});

// Optional: on load, ensure fallback is hidden (when 200 OK)
img?.addEventListener("load", () => {
  hideFallback();
});

// Initial start (anti-cache)
window.addEventListener("load", () => {
  if (img) img.src = bustCacheUrl(STREAM_URL);
});

// ===== تنظیمات اسلایدرها (بدون تغییر) =====
const allGroups = [...new Set(
  Array.from(document.querySelectorAll('.adjustment-group'))
    .map(g => g.dataset.group)
)];

allGroups.forEach(groupName => {
  const rangeInputs = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .rangeSlider`);
  const stepInputs = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .stepInput`);
  const increaseBtns = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .increaseBtn`);
  const decreaseBtns = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .decreaseBtn`);

  const syncRange = (value) => {
    value = Math.max(1, Math.min(4000, parseInt(value)));
    rangeInputs.forEach(r => r.value = value);
    updateSliderBackground();
  };

  const updateSliderBackground = () => {
    rangeInputs.forEach(slider => {
      const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.setProperty('--val', `${percentage}%`);
    });
  };

  rangeInputs.forEach(slider => {
    slider.addEventListener('input', () => {
      syncRange(slider.value);
    });
    updateSliderBackground();
  });

  increaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentVal = parseInt(rangeInputs[0].value);
      const step = parseInt(stepInputs[0].value) || 1;
      syncRange(currentVal + step);
    });
  });

  decreaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentVal = parseInt(rangeInputs[0].value);
      const step = parseInt(stepInputs[0].value) || 1;
      syncRange(currentVal - step);
    });
  });
});


// ===== Stream Fix modal logic =====
(function initStreamFix() {
  if (!fixModalEl || !btnOpenFixModal || !btnEnableJpeg || !btnDisableSub) return;

  // Helpers to build endpoints
  function buildProtocolEndpoint(proto) {
    const base = API_ENDPOINTS.video; // e.g. "/cgi-bin/api/appConfig_video.cgi"
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}protocol=${encodeURIComponent(proto)}`;
  }
  function buildChannelEndpoint(ch) {
    const base = API_ENDPOINTS.video;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}channel=${encodeURIComponent(ch)}`;
  }

  // Button color helpers: green = OK, red = needs action
  function setBtnOk(btn, ok) {
    btn.classList.remove("btn-outline-secondary", "btn-outline-danger", "btn-success");
    btn.classList.add(ok ? "btn-success" : "btn-outline-danger");
  }

  // Read current states on modal show
  async function loadStatesAndPaint() {
    try {
      // JPEG state (expected: enabled === true)
      const jpegRes = await apiGet(buildProtocolEndpoint("jpeg"));
      const jpegEnabled = !!jpegRes?.jpeg?.enabled;
      setBtnOk(btnEnableJpeg, jpegEnabled);

      // Sub stream state (expected: disabled, i.e. video1.enabled === false for MJPEG preview)
      const ch1Res = await apiGet(buildChannelEndpoint(1));
      const subEnabled = !!ch1Res?.video1?.enabled;
      setBtnOk(btnDisableSub, !subEnabled);
    } catch (e) {
      console.error("[viewController] loadStates failed:", e);
      toast?.error?.("Failed to check current stream settings");
    }
  }

  // Prefer flat + string payloads for CGI; fallback to nested if needed
  async function postWithFallback(endpoint, flatPayload, nestedPayload) {
    // First try flat (e.g., { enabled: "true" })
    try {
      return await apiPost(endpoint, flatPayload);
    } catch (e1) {
      // Then try nested (e.g., { jpeg: { enabled: "true" } })
      try {
        return await apiPost(endpoint, nestedPayload);
      } catch (e2) {
        throw e2;
      }
    }
  }

  // Enable JPEG protocol (flat string payload)
  btnEnableJpeg.addEventListener("click", async () => {
    btnEnableJpeg.disabled = true;
    try {
      toast?.info?.("Enabling JPEG protocol…");
      await postWithFallback(
        buildProtocolEndpoint("jpeg"),
        { enabled: "true" },             // flat, string
        { jpeg: { enabled: "true" } }    // nested, string
      );
      await apiPost(API_ENDPOINTS.appConfigApply, {});
      setBtnOk(btnEnableJpeg, true);
      toast?.success?.("JPEG protocol enabled & applied");
    } catch (e) {
      console.error("[viewController] enable JPEG failed:", e);
      setBtnOk(btnEnableJpeg, false);
      toast?.error?.("Enabling JPEG failed");
    } finally {
      btnEnableJpeg.disabled = false;
    }
  });

  // Disable Sub Stream (Channel 1) for MJPEG preview (flat string payload)
  btnDisableSub.addEventListener("click", async () => {
    btnDisableSub.disabled = true;
    try {
      toast?.info?.("Disabling Sub Stream (Channel 1) …");
      await postWithFallback(
        buildChannelEndpoint(1),
        { enabled: "false" },              // flat, string
        { video1: { enabled: "false" } }   // nested, string
      );
      await apiPost(API_ENDPOINTS.appConfigApply, {});
      setBtnOk(btnDisableSub, true);
      toast?.success?.("Sub Stream disabled & applied");
    } catch (e) {
      console.error("[viewController] disable Sub Stream failed:", e);
      setBtnOk(btnDisableSub, false);
      toast?.error?.("Disabling Sub Stream failed");
    } finally {
      btnDisableSub.disabled = false;
    }
  });

  // Open modal
  btnOpenFixModal.addEventListener("click", () => {
    try { fixBsModal?.show(); } catch {}
  });

  // Load states when modal is shown
  fixModalEl.addEventListener("shown.bs.modal", loadStatesAndPaint);

  // Refresh page on any modal close path
  const reload = () => setTimeout(() => window.location.reload(), 50);
  fixModalEl.addEventListener("hidden.bs.modal", reload);
  btnFixClose?.addEventListener("click", () => {
    try { fixBsModal?.hide(); } catch {}
    reload();
  });
})();
