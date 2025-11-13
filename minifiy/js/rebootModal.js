(() => {
  const el = {
    modal: document.getElementById("rebootModal"),
    title: document.getElementById("rebootTitle"),
    confirmText: document.getElementById("rebootConfirmText"),
    actions: document.getElementById("rebootActions"),
    warning: document.getElementById("rebootWarning"),
    countdown: document.getElementById("rebootCountdown"),
    btnCancel: document.getElementById("rebootCancel"),
    btnConfirm: document.getElementById("rebootConfirm"),
  };

  if (!el.modal) return;

  let bsModal = new bootstrap.Modal(el.modal, { backdrop: true, keyboard: true });
  let rebootGuards = { enabled: false, removeKeydown: null, removeBeforeUnload: null };
  let countdownTimer = null;
  let rebootInProgress = false;

  el.modal.addEventListener("hide.bs.modal", (ev) => {
    if (rebootInProgress) ev.preventDefault();
  });

  function enableRebootGuards() {
    if (rebootGuards.enabled) return;
    rebootGuards.enabled = true;

    const beforeUnloadHandler = (e) => { e.preventDefault(); e.returnValue = ""; return ""; };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    rebootGuards.removeBeforeUnload = () => window.removeEventListener("beforeunload", beforeUnloadHandler);

    const keyHandler = (ev) => {
      const isF5 = ev.key === "F5" || ev.keyCode === 116;
      const isCtrlR = (ev.ctrlKey || ev.metaKey) && ev.key?.toLowerCase?.() === "r";
      if (isF5 || isCtrlR) { ev.preventDefault(); ev.stopPropagation(); }
    };
    document.addEventListener("keydown", keyHandler, true);
    rebootGuards.removeKeydown = () => document.removeEventListener("keydown", keyHandler, true);
  }

  function disableRebootGuards() {
    rebootGuards.enabled = false;
    if (rebootGuards.removeKeydown) rebootGuards.removeKeydown();
    if (rebootGuards.removeBeforeUnload) rebootGuards.removeBeforeUnload();
  }

  function resetToConfirmView(defaults) {
    el.title.textContent = defaults.title || "Confirm Action";
    el.confirmText.innerHTML = defaults.message || 'This change will <b>reboot the camera</b>. Are you sure?';
    el.actions.style.display = "";
    el.warning.style.display = "none";
    el.countdown.textContent = String(defaults.seconds || 15);
    el.btnConfirm.disabled = false;
    el.btnCancel.disabled = false;
  }

  function showLockView(seconds, lockTitle, lockMessage) {
    el.title.textContent = lockTitle || "Rebooting…";
    el.confirmText.innerHTML = lockMessage || "Camera is Rebooting, Please wait!";
    el.actions.style.display = "none";
    el.warning.style.display = "";
    el.modal.setAttribute("data-bs-backdrop", "static");
    el.modal.setAttribute("data-bs-keyboard", "false");
    try { bsModal.show(); } catch {}

    startCountdown(seconds ?? 15, () => {
      disableRebootGuards();
      setTimeout(() => window.location.reload(), 50);
    });
  }

  function startCountdown(seconds, onDone) {
    if (countdownTimer) clearInterval(countdownTimer);
    let remain = seconds;
    el.countdown.textContent = String(remain);
    countdownTimer = setInterval(() => {
      remain -= 1;
      el.countdown.textContent = String(remain);
      if (remain <= 0) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        if (typeof onDone === "function") onDone();
      }
    }, 1000);
  }

  async function confirmAndReboot(opts = {}) {
    if (rebootInProgress) {
      showLockView(opts.seconds, opts.lockTitle, opts.lockMessage);
      return Promise.resolve();
    }

    resetToConfirmView(opts);
    bsModal.show();

    return new Promise((resolve, reject) => {
      const handleCancel = () => {
        cleanup();
        if (typeof opts.onCancel === "function") opts.onCancel();
        reject(new Error("cancelled"));
      };

      const handleConfirm = async () => {
        el.btnConfirm.disabled = true;
        el.btnCancel.disabled = true;
        try {
          if (typeof opts.onConfirm === "function") {
            await opts.onConfirm();
          }
          rebootInProgress = true;
          enableRebootGuards();
          showLockView(opts.seconds, opts.lockTitle, opts.lockMessage);
          cleanup();
          resolve();
        } catch (e) {
          if (window.toast?.error) toast.error("Operation failed.");
          el.btnConfirm.disabled = false;
          el.btnCancel.disabled = false;
          reject(e);
        }
      };

      const cleanup = () => {
        el.btnCancel.removeEventListener("click", handleCancel);
        el.modal.removeEventListener("hide.bs.modal", onHide);
        el.btnConfirm.removeEventListener("click", handleConfirm);
      };

      const onHide = () => {
        if (!rebootInProgress) handleCancel();
      };

      el.btnCancel.addEventListener("click", handleCancel);
      el.modal.addEventListener("hide.bs.modal", onHide);
      el.btnConfirm.addEventListener("click", handleConfirm);
    });
  }

  window.RebootModal = { confirmAndReboot };
})();
