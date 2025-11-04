"use strict";

/*!
 * IP Filter Modals (Bootstrap 5)
 * - Provides three entry points: openAdd, openEdit, openDelete
 * - Emits values to provided callbacks; it does NOT call APIs itself.
 * - Closes on outside click (default Bootstrap backdrop behavior).
 */

(function () {
  const MODAL_IDS = {
    form: "ipFilterModal",
    delete: "ipFilterDeleteModal",
  };

  // Create (or return existing) modal elements
  function ensureModals() {
    // Form modal (Add/Edit)
    if (!document.getElementById(MODAL_IDS.form)) {
      const formModal = document.createElement("div");
      formModal.id = MODAL_IDS.form;
      formModal.className = "modal fade";
      formModal.tabIndex = -1;
      formModal.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${MODAL_IDS.form}-title">IP Filter</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="${MODAL_IDS.form}-form" novalidate>
                <div class="mb-3">
                  <label for="${MODAL_IDS.form}-ip" class="form-label">IP / CIDR</label>
                  <input type="text" class="form-control" id="${MODAL_IDS.form}-ip" placeholder="e.g. 192.168.1.10 or 192.168.1.0/24" required />
                  <div class="invalid-feedback">Please enter a valid IPv4 or CIDR.</div>
                </div>
                <div class="mb-3">
                  <label for="${MODAL_IDS.form}-status" class="form-label">Status</label>
                  <select class="form-select" id="${MODAL_IDS.form}-status" required>
                    <option value="allowed">Allowed</option>
                    <option value="forbidden">Forbidden</option>
                  </select>
                  <div class="invalid-feedback">Please select a status.</div>
                </div>
                <input type="hidden" id="${MODAL_IDS.form}-line" value="" />
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" id="${MODAL_IDS.form}-save" class="btn btn-primary">Save</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(formModal);
    }

    // Delete confirm modal
    if (!document.getElementById(MODAL_IDS.delete)) {
      const delModal = document.createElement("div");
      delModal.id = MODAL_IDS.delete;
      delModal.className = "modal fade";
      delModal.tabIndex = -1;
      delModal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Delete Entry</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p id="${MODAL_IDS.delete}-text" class="mb-0">Are you sure you want to delete this entry?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" id="${MODAL_IDS.delete}-confirm" class="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(delModal);
    }
  }

  // Simple IPv4/CIDR validator (soft validation)
  function isValidIPv4OrCIDR(value) {
    const v = String(value || "").trim();
    const m = v.match(/^(\d{1,3}\.){3}\d{1,3}(\/(\d|[12]\d|3[0-2]))?$/);
    if (!m) return false;
    // ensure each octet <= 255
    const octets = v.split("/")[0].split(".").map(Number);
    return octets.every(n => n >= 0 && n <= 255);
  }

  function openForm({ title, ip = "", status = "allowed", line_number = "", onSubmit }) {
    ensureModals();

    const modalEl = document.getElementById(MODAL_IDS.form);
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, keyboard: true });

    const titleEl = document.getElementById(`${MODAL_IDS.form}-title`);
    const ipEl = document.getElementById(`${MODAL_IDS.form}-ip`);
    const statusEl = document.getElementById(`${MODAL_IDS.form}-status`);
    const lineEl = document.getElementById(`${MODAL_IDS.form}-line`);
    const formEl = document.getElementById(`${MODAL_IDS.form}-form`);
    const saveBtn = document.getElementById(`${MODAL_IDS.form}-save`);

    titleEl.textContent = title || "IP Filter";
    ipEl.value = ip || "";
    statusEl.value = status || "allowed";
    lineEl.value = line_number || "";

    // reset validation state
    formEl.classList.remove("was-validated");

    // wire save
    const onSave = () => {
      const ipVal = ipEl.value.trim();
      const statusVal = statusEl.value;
      const ln = lineEl.value ? Number(lineEl.value) : null;

      let valid = true;
      if (!isValidIPv4OrCIDR(ipVal)) valid = false;
      if (!statusVal) valid = false;

      if (!valid) {
        formEl.classList.add("was-validated");
        return;
      }

      try {
        if (typeof onSubmit === "function") {
          onSubmit({ ip: ipVal, status: statusVal, line_number: ln });
        }
        modal.hide();
      } catch (e) {
        console.error("[ipModal] submit error:", e);
      }
    };

    saveBtn.onclick = onSave;

    modal.show();
  }

  function openDelete({ line_number, ip, onConfirm }) {
    ensureModals();

    const modalEl = document.getElementById(MODAL_IDS.delete);
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, { backdrop: true, keyboard: true });

    const txt = document.getElementById(`${MODAL_IDS.delete}-text`);
    const btn = document.getElementById(`${MODAL_IDS.delete}-confirm`);

    txt.textContent = `Are you sure you want to delete line #${line_number} (${ip})?`;

    btn.onclick = () => {
      try {
        if (typeof onConfirm === "function") onConfirm({ line_number });
        modal.hide();
      } catch (e) {
        console.error("[ipModal] delete confirm error:", e);
      }
    };

    modal.show();
  }

  // Public API
  window.IpModal = {
    openAdd(onSubmit) {
      openForm({ title: "Add IP Filter", onSubmit });
    },
    openEdit(data, onSubmit) {
      openForm({ title: "Modify IP Filter", ...data, onSubmit });
    },
    openDelete(data, onConfirm) {
      openDelete({ ...data, onConfirm });
    },
  };
})();
