"use strict";

/*!
 * IP Filter feature
 * - Fetch list (GET) and render table
 * - Add / Modify / Delete with Bootstrap modals (via IpModal)
 * - Uses apiGet / apiPost and API_ENDPOINTS.* (token assumed to be appended by middleware)
 */

document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(
    '[data-tab-content="ipAddressFilter"]'
  );
  if (!container) return; // not on this page/section

  const tbody = container.querySelector("#ipFilterTbody");
  const btnAdd = container.querySelector("#btnIpAdd");

  // Utilities ----------------------------------------------------------------

  function capitalize(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  function renderEmptyRow() {
    tbody.innerHTML = `
      <tr>
        <td class="border-2 text-center" colspan="4">No data</td>
      </tr>
    `;
  }

  function renderRows(list) {
    if (!Array.isArray(list) || list.length === 0) {
      renderEmptyRow();
      return;
    }
    const rowsHtml = list
      .map((item, idx) => {
        const line = idx + 1; // line_number starts from 1
        const ip = item.ip || "";
        const status = item.status || "";
        return `
          <tr data-line="${line}">
            <th scope="row" class="border-2">${line}</th>
            <td class="border-2">${ip}</td>
            <td class="border-2">${capitalize(status)}</td>
            <td class="border-2">
              <button
                type="button"
                class="btn btn-link p-0 me-3"
                data-action="modify"
                title="Modify"
                aria-label="Modify"
              >
                Modify
              </button>
              <button
                type="button"
                class="btn btn-link text-danger p-0"
                data-action="delete"
                title="Delete"
                aria-label="Delete"
              >
                Delete
              </button>
            </td>
          </tr>
        `;
      })
      .join("");
    tbody.innerHTML = rowsHtml;
  }

  async function loadList() {
    try {
      const res = await apiGet(API_ENDPOINTS.firewallList);
      const list = res?.ip_list || [];
      renderRows(list);
    } catch (e) {
      console.error("[ipFilter] GET list failed:", e);
      renderEmptyRow();
      window.toast?.error?.("Failed to load IP filter list");
    }
  }

  // API calls ----------------------------------------------------------------
  async function applyFirewall() {
    // بعد از هر تغییری روی IP Filter، این رو صدا می‌زنیم
    try {
      return await apiPost(API_ENDPOINTS.firewallApply, {});
    } catch (e) {
      console.error("[ipFilter] firewall apply failed:", e);
      throw e; // بذار کالر (add/modify/delete) خطا رو بگیره
    }
  }

  async function addEntry({ ip, status }) {
    // Backend doc provided: POST { ip_filter, status }
    const body = { ip_filter: ip, status };
    const res = await apiPost(API_ENDPOINTS.firewallAdd, body);
    await applyFirewall();
    return res;
  }

  async function modifyEntry({ line_number, ip, status }) {
    const body = { line_number, ip, status };
    const res = await apiPost(API_ENDPOINTS.firewallModify, body);
    await applyFirewall();
    return res;
  }

  async function deleteEntry({ line_number }) {
    const body = { line_number };
    const res = await apiPost(API_ENDPOINTS.firewallDelete, body);
    await applyFirewall();
    return res;
  }

  // Events -------------------------------------------------------------------

  // Add
  if (btnAdd) {
    btnAdd.addEventListener("click", () => {
      if (!window.IpModal) return;
      IpModal.openAdd(async ({ ip, status }) => {
        try {
          await addEntry({ ip, status });
          window.toast?.success?.("Entry added");
          await loadList();
        } catch (e) {
          console.error("[ipFilter] add failed:", e);
          window.toast?.error?.("Add failed");
        }
      });
    });
  }

  // Modify/Delete (per-row via delegation)
  tbody.addEventListener("click", (ev) => {
    const btn = ev.target.closest("button[data-action]");
    if (!btn) return;

    const tr = btn.closest("tr");
    const line = Number(tr?.dataset?.line);
    const ip = tr?.children?.[1]?.textContent?.trim() || "";
    const statusText =
      tr?.children?.[2]?.textContent?.trim().toLowerCase() || "allowed";

    if (btn.dataset.action === "modify") {
      if (!window.IpModal) return;
      IpModal.openEdit(
        { ip, status: statusText, line_number: line },
        async ({ line_number, ip, status }) => {
          try {
            await modifyEntry({ line_number, ip, status });
            window.toast?.success?.("Entry updated");
            await loadList();
          } catch (e) {
            console.error("[ipFilter] modify failed:", e);
            window.toast?.error?.("Update failed");
          }
        }
      );
    }

    if (btn.dataset.action === "delete") {
      if (!window.IpModal) return;
      IpModal.openDelete({ line_number: line, ip }, async ({ line_number }) => {
        try {
          await deleteEntry({ line_number });
          window.toast?.success?.("Entry deleted");
          await loadList();
        } catch (e) {
          console.error("[ipFilter] delete failed:", e);
          window.toast?.error?.("Delete failed");
        }
      });
    }
  });

  // Initial load
  loadList();
});
