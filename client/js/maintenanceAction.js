document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnReboot");
  if (!btn || !window.RebootModal) return;

  btn.addEventListener("click", () => {
    RebootModal.confirmAndReboot({
      message: "This change will <b>reboot the camera</b>. Are you sure?",
      seconds: 15,
      onConfirm: async () => {
        await apiPost(API_ENDPOINTS.reboot, {});
      },
      lockTitle: "Rebooting…",
      lockMessage: "Please do not refresh the page; the camera is rebooting…",
    });
  });
});
