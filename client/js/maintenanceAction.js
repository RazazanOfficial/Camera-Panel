document.addEventListener("DOMContentLoaded", () => {
  // --- Reboot (existing) ---
  const btnReboot = document.getElementById("btnReboot");
  if (btnReboot && window.RebootModal) {
    btnReboot.addEventListener("click", () => {
      RebootModal.confirmAndReboot({
        message: "This change will <b>reboot the camera</b>. Are you sure?",
        seconds: 15,
        onConfirm: async () => {
          await apiPost(API_ENDPOINTS.reboot, {});
          // Clear auth after successful request
          window.Auth?.clearToken?.();
        },
        lockTitle: "Rebooting…",
        lockMessage: "Please do not refresh the page; the camera is rebooting…",
      });
    });
  }

  // --- Helper to bind reset buttons with confirm modal ---
  function bindResetButton(
    button,
    { endpoint, title, confirmHtml, seconds = 30 }
  ) {
    if (!button || !window.RebootModal) return;
    button.addEventListener("click", (ev) => {
      ev.preventDefault(); // prevent default form reset
      RebootModal.confirmAndReboot({
        title,
        message: confirmHtml,
        seconds,
        onConfirm: async () => {
          // Call the reset endpoint; token should be appended by api layer
          await apiPost(endpoint, {});
          // After a successful reset request, clear auth to force re-login
          window.Auth?.clearToken?.();
        },
        lockTitle: "Applying settings…",
        lockMessage: "Camera is resetting and will reboot. Please wait…",
      });
    });
  }

  // --- Restore (keep IP & user) ---
  const btnRestore = document.getElementById("btnRestore");
  bindResetButton(btnRestore, {
    endpoint: API_ENDPOINTS.resetKeepIpUser,
    title: "Restore (Keep IP & Users)",
    confirmHtml:
      "This will reset all parameters <b>except IP parameters and user information</b>. " +
      "The camera will reboot. Continue?",
    seconds: 15,
  });

  // --- Default (full reset) ---
  const btnDefault = document.getElementById("btnDefault");
  bindResetButton(btnDefault, {
    endpoint: API_ENDPOINTS.resetAll,
    title: "Factory Default (Full Reset)",
    confirmHtml:
      "This will restore <b>all parameters to default</b>. The camera will reboot. Continue?",
    seconds: 15,
  });
});
