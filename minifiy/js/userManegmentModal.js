"use strict";

/*!
 * User Management Modals (Bootstrap 5)
 * - Provides: openAdd, openEdit, openDelete
 * - Emits values via callbacks; does not call APIs itself.
 */

(function () {
  const MODAL_IDS = {
    form: "userMngFormModal",
    delete: "userMngDeleteModal",
  };

  function ensureModals() {
    // Add/Edit form modal
    if (!document.getElementById(MODAL_IDS.form)) {
      const m = document.createElement("div");
      m.id = MODAL_IDS.form;
      m.className = "modal fade";
      m.tabIndex = -1;
      m.innerHTML = `
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${MODAL_IDS.form}-title">User</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="${MODAL_IDS.form}-form" novalidate>
                <div class="mb-3">
                  <label for="${MODAL_IDS.form}-username" class="form-label">Username</label>
                  <input type="text" class="form-control" id="${MODAL_IDS.form}-username" required />
                  <div class="invalid-feedback">Please enter a username.</div>
                </div>

                <div class="mb-3">
                  <label for="${MODAL_IDS.form}-password" class="form-label">Password</label>
                  <input type="password" class="form-control" id="${MODAL_IDS.form}-password" required />
                  <div class="invalid-feedback">Please enter a password.</div>
                </div>

                <div class="mb-3">
                  <label for="${MODAL_IDS.form}-level" class="form-label">Level</label>
                  <select class="form-select" id="${MODAL_IDS.form}-level" required>
                    <option value="2">Shahaab</option>
                    <option value="1">Administrator</option>
                    <option value="0">User</option>
                  </select>
                  <div class="invalid-feedback">Please select a level.</div>
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
      document.body.appendChild(m);
    }

    // Delete confirm modal
    if (!document.getElementById(MODAL_IDS.delete)) {
      const dm = document.createElement("div");
      dm.id = MODAL_IDS.delete;
      dm.className = "modal fade";
      dm.tabIndex = -1;
      dm.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Delete User</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p id="${MODAL_IDS.delete}-text" class="mb-0">Are you sure you want to delete this user?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" id="${MODAL_IDS.delete}-confirm" class="btn btn-danger">Delete</button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(dm);
    }
  }

  // Normalize: accepts "0/1/2" or "admin/user/shahaab"
  function normalizeLevelToValue(lv) {
    const s = String(lv ?? "")
      .trim()
      .toLowerCase();

    // 2 => Shahaab (superadmin)
    if (
      s === "2" ||
      s === "shahaab" ||
      s === "root" ||
      s === "super" ||
      s === "superuser"
    )
      return "2";

    // 1 => Administrator
    if (
      s === "1" ||
      s === "admin" ||
      s === "administrator" ||
      s === "adminstrator"
    )
      return "1";

    // 0 => User
    if (s === "0" || s === "user" || s === "operator") return "0";

    // پیش‌فرض: User
    return "0";
  }


  function openForm({
    title,
    username = "",
    level = "0",
    number_line = "",
    onSubmit,
  }) {
    ensureModals();

    const modalEl = document.getElementById(MODAL_IDS.form);
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
      backdrop: true,
      keyboard: true,
    });

    const titleEl = document.getElementById(`${MODAL_IDS.form}-title`);
    const userEl = document.getElementById(`${MODAL_IDS.form}-username`);
    const passEl = document.getElementById(`${MODAL_IDS.form}-password`);
    const levelEl = document.getElementById(`${MODAL_IDS.form}-level`);
    const lineEl = document.getElementById(`${MODAL_IDS.form}-line`);
    const formEl = document.getElementById(`${MODAL_IDS.form}-form`);
    const saveBtn = document.getElementById(`${MODAL_IDS.form}-save`);

    titleEl.textContent = title || "User";
    userEl.value = username;
    passEl.value = "";
    levelEl.value = normalizeLevelToValue(level);
    lineEl.value = number_line || "";

    formEl.classList.remove("was-validated");

    const onSave = () => {
      const un = userEl.value.trim();
      const pw = passEl.value;
      const lv = levelEl.value;
      const ln = lineEl.value ? Number(lineEl.value) : null;

      let valid = true;
      if (!un) valid = false;
      if (!pw) valid = false; // both Add & Modify require password per API contract
      if (!lv) valid = false;

      if (!valid) {
        formEl.classList.add("was-validated");
        return;
      }

      if (typeof onSubmit === "function") {
        onSubmit({ username: un, password: pw, level: lv, number_line: ln });
      }

      modal.hide();
    };

    saveBtn.onclick = onSave;
    modal.show();
  }

  function openDelete({ number_line, username, onConfirm }) {
    ensureModals();

    const modalEl = document.getElementById(MODAL_IDS.delete);
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl, {
      backdrop: true,
      keyboard: true,
    });

    const txt = document.getElementById(`${MODAL_IDS.delete}-text`);
    const btn = document.getElementById(`${MODAL_IDS.delete}-confirm`);

    txt.textContent = `Are you sure you want to delete user "${username}" (line #${number_line})?`;

    btn.onclick = () => {
      if (typeof onConfirm === "function") onConfirm({ number_line });
      modal.hide();
    };

    modal.show();
  }

  // Public API
  window.UserManegmentModal = {
    openAdd(onSubmit) {
      openForm({ title: "Add User", onSubmit });
    },
    openEdit(data, onSubmit) {
      openForm({ title: "Modify User", ...data, onSubmit });
    },
    openDelete(data, onConfirm) {
      openDelete({ ...data, onConfirm });
    },
  };
})();
