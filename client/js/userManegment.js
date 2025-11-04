"use strict";

/*!
 * User Management
 * - Fetch list (GET) and render table
 * - Add / Modify / Delete via UserManegmentModal
 * - Uses apiGet / apiPost and API_ENDPOINTS.* (token assumed to be appended by middleware)
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(
    '[data-tab-content="userManagement"]'
  );
  if (!container) return;

  const tbody = container.querySelector("#userTbody");
  const btnAdd = container.querySelector("#btnUserAdd");

  // ---------- Utilities -----------------------------------------------------

  function levelLabelFromValue(val) {
    const s = String(val ?? "")
      .trim()
      .toLowerCase();
    if (
      s === "0" ||
      s === "shahaab" ||
      s === "root" ||
      s === "super" ||
      s === "superuser"
    )
      return "Shahaab";
    if (
      s === "1" ||
      s === "admin" ||
      s === "administrator" ||
      s === "adminstrator"
    )
      return "Administrator";
    if (s === "2" || s === "user" || s === "operator") return "User";
    const n = Number(val);
    if (!Number.isNaN(n)) {
      if (n === 0) return "Shahaab";
      if (n === 1) return "Administrator";
      if (n === 2) return "User";
    }
    return "User";
  }

  function normalizeLevelValue(val) {
    const s = String(val ?? "")
      .trim()
      .toLowerCase();
    if (
      s === "0" ||
      s === "shahaab" ||
      s === "root" ||
      s === "super" ||
      s === "superuser"
    )
      return "0";
    if (
      s === "1" ||
      s === "admin" ||
      s === "administrator" ||
      s === "adminstrator"
    )
      return "1";
    if (s === "2" || s === "user" || s === "operator") return "2";
    const n = Number(val);
    if (!Number.isNaN(n) && (n === 0 || n === 1 || n === 2)) return String(n);
    return "2";
  }

  function renderEmptyRow() {
    tbody.innerHTML = `
      <tr>
        <td class="border-2 text-center" colspan="4">No data</td>
      </tr>
    `;
  }

  function renderRows(users) {
    if (!Array.isArray(users) || users.length === 0) {
      renderEmptyRow();
      return;
    }
    const html = users
      .map((u, idx) => {
        const line = idx + 1; // number_line starts from 1
        const username = u?.username ?? "";
        const levelLbl = levelLabelFromValue(u?.level);

        return `
          <tr data-line="${line}">
            <th scope="row" class="border-2">${line}</th>
            <td class="border-2">${username}</td>
            <td class="border-2">${levelLbl}</td>
            <td class="border-2">
              <button
                type="button"
                class="btn btn-link p-0 me-3"
                data-action="modify"
                title="Modify"
                aria-label="Modify"
              >Modify</button>
              <button
                type="button"
                class="btn btn-link text-danger p-0"
                data-action="delete"
                title="Delete"
                aria-label="Delete"
              >Delete</button>
            </td>
          </tr>
        `;
      })
      .join("");
    tbody.innerHTML = html;
  }

  // ---------- API calls -----------------------------------------------------

  async function loadList() {
    try {
      const res = await apiGet(API_ENDPOINTS.userList);
      const users = res?.users || [];
      renderRows(users);
    } catch (e) {
      console.error("[userMng] GET list failed:", e);
      renderEmptyRow();
      window.toast?.error?.("Failed to load users");
    }
  }

  async function addUser({ username, password, level }) {
    const body = { username, password, level: normalizeLevelValue(level) };
    return apiPost(API_ENDPOINTS.userList, body);
  }

  async function modifyUser({ number_line, username, password, level }) {
    const body = {
      number_line,
      username,
      password,
      level: normalizeLevelValue(level),
    };
    return apiPost(API_ENDPOINTS.userModify, body);
  }

  async function deleteUser({ number_line }) {
    const body = { number_line };
    return apiPost(API_ENDPOINTS.userDelete, body);
  }

  // ---------- Events --------------------------------------------------------

  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      if (!window.UserManegmentModal) return;
      UserManegmentModal.openAdd(async ({ username, password, level }) => {
        try {
          await addUser({ username, password, level });
          window.toast?.success?.("User added");
          await loadList();
        } catch (e) {
          console.error("[userMng] add failed:", e);
          window.toast?.error?.("Add failed");
        }
      });
    });
  }

  tbody.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-action]");
    if (!btn) return;

    const tr = btn.closest("tr");
    const number_line = Number(tr?.dataset?.line);
    const username = tr?.children?.[1]?.textContent?.trim() || "";
    const currentLevelLabel = tr?.children?.[2]?.textContent?.trim() || "User";
    const currentLevelVal =
      currentLevelLabel === "Shahaab"
        ? "0"
        : currentLevelLabel === "Administrator"
        ? "1"
        : "2";

    if (btn.dataset.action === "modify") {
      if (!window.UserManegmentModal) return;
      UserManegmentModal.openEdit(
        { username, level: currentLevelVal, number_line },
        async ({ number_line, username, password, level }) => {
          try {
            await modifyUser({ number_line, username, password, level });
            window.toast?.success?.("User updated");
            await loadList();
          } catch (e) {
            console.error("[userMng] modify failed:", e);
            window.toast?.error?.("Update failed");
          }
        }
      );
    }

    if (btn.dataset.action === "delete") {
      if (!window.UserManegmentModal) return;
      UserManegmentModal.openDelete(
        { number_line, username },
        async ({ number_line }) => {
          try {
            await deleteUser({ number_line });
            window.toast?.success?.("User deleted");
            await loadList();
          } catch (e) {
            console.error("[userMng] delete failed:", e);
            window.toast?.error?.("Delete failed");
          }
        }
      );
    }
  });

  // ---------- Initial -------------------------------------------------------
  loadList();
});
