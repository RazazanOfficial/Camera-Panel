"use strict";

/*! =-=-=-=-=-= Aside Section =-=-=-=-=-= !*/
// Handle main-link clicks
document.querySelectorAll(".main-link").forEach((link) => {
  link.addEventListener("click", () => {
    const target = link.dataset.target;
    const submenu = document.querySelector(`[data-submenu="${target}"]`);

    // Hide other submenus
    document.querySelectorAll(".submenu").forEach((s) => {
      if (s !== submenu) s.classList.add("d-none");
    });

    // Toggle current submenu
    submenu.classList.toggle("d-none");

    // Active state for main links
    document
      .querySelectorAll(".main-link")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    // Auto-activate the first sub-link of this submenu (if any)
    const firstSubLink = submenu?.querySelector(".sub-link");
    if (firstSubLink) firstSubLink.click();
  });
});

/*! Helper: Activate first global-tab (menu bar) within a given container */
function activateFirstGlobalTabIn(container) {
  // Try to click the first tab button in this container
  const firstBtn = container.querySelector(".global-tab-btn");
  if (firstBtn) {
    firstBtn.click();
    return;
  }
  // Fallback: if there is no tab button, show the first tab content
  const contents = container.querySelectorAll(".global-tab-content");
  if (contents.length) {
    contents.forEach((c) => c.classList.remove("active"));
    contents[0].classList.add("active");
  }
}

/*! =-=-=-=-=-= Handle sub-link clicks =-=-=-=-=-= !*/
document.querySelectorAll(".sub-link").forEach((link) => {
  link.addEventListener("click", () => {
    const targetId = link.dataset.content;

    // Hide all content boxes
    document.querySelectorAll(".content-box").forEach((box) => {
      box.classList.remove("active");
    });

    // Show selected content box
    const selected = document.getElementById(targetId);
    if (selected) {
      selected.classList.add("active");

      // Auto-activate the first tab inside this selected content box
      activateFirstGlobalTabIn(selected);
    }

    // Mark active sub-link (only within the same submenu group)
    const submenu = link.closest(".submenu");
    submenu
      ?.querySelectorAll(".sub-link")
      .forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

/*! =-=-=-=-=-= Image/Inner Tab Section (scoped) =-=-=-=-=-= !*/
// Use event delegation to keep logic scoped to the nearest content-box
document.addEventListener("click", (e) => {
  const button = e.target.closest(".global-tab-btn");
  if (!button) return;

  const tab = button.dataset.tab;
  // Scope to the nearest content-box to avoid affecting tabs elsewhere
  const container = button.closest(".content-box") || document;

  // Activate button (scoped)
  container
    .querySelectorAll(".global-tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");

  // Show related content (scoped)
  container.querySelectorAll(".global-tab-content").forEach((content) => {
    if (content.dataset.tabContent === tab) {
      content.classList.add("active");
    } else {
      content.classList.remove("active");
    }
  });
});

/*! =-=-=-=-=-= Dropdown toggles =-=-=-=-=-= !*/
document.querySelectorAll(".dropdown-toggle-box").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    toggle.parentElement.classList.toggle("open");
  });
});

/*! =-=-=-=-=-= Switch between Scheduled and Auto sections =-=-=-=-=-= !*/
const switchTypeEl = document.getElementById("switchType");
if (switchTypeEl) {
  switchTypeEl.addEventListener("change", function () {
    const isScheduled = this.value === "scheduled";
    document
      .querySelector(".scheduled-section")
      ?.classList.toggle("d-none", !isScheduled);
    document
      .querySelector(".auto-section")
      ?.classList.toggle("d-none", isScheduled);
  });
}

/*! =-=-=-=-=-= Toggle mode buttons =-=-=-=-=-= !*/
document.querySelectorAll(".mode-toggle .btn").forEach((button) => {
  button.addEventListener("click", () => {
    const wrap = button.closest(".mode-toggle") || document;
    wrap
      .querySelectorAll(".btn")
      .forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
  });
});

/*! =-=-=-=-=-= Ranges sync =-=-=-=-=-= !*/
document.querySelectorAll(".iris-range").forEach((range, i) => {
  const number = document.querySelectorAll(".iris-number")[i];
  range.addEventListener("input", () => (number.value = range.value));
  number.addEventListener("input", () => {
    const val = Math.min(100, Math.max(0, Number(number.value) || 0));
    number.value = val;
    range.value = val;
  });
});

document.querySelectorAll(".auto-range").forEach((range, i) => {
  const number = document.querySelectorAll(".auto-number")[i];
  range.addEventListener("input", () => (number.value = range.value));
  number.addEventListener("input", () => {
    const val = Math.min(100, Math.max(0, Number(number.value) || 0));
    number.value = val;
    range.value = val;
  });
});

/*! =-=-=-=-=-= Safe defaults on first load =-=-=-=-=-= !*/
// If nothing is active on load, auto-open the first available path:
// 1) first main-link -> 2) its first sub-link -> 3) first global-tab inside selected content
(function ensureInitialActive() {
  // If any content-box is already active, also ensure its first tab is active.
  const activeBox = document.querySelector(".content-box.active");
  if (activeBox) {
    // If no tab content is visible, activate the first one
    const anyActiveTabContent = activeBox.querySelector(
      ".global-tab-content.active"
    );
    const anyActiveBtn = activeBox.querySelector(".global-tab-btn.active");
    if (!anyActiveTabContent && !anyActiveBtn) {
      activateFirstGlobalTabIn(activeBox);
    }
    return;
  }

  // Otherwise simulate the full path from the left menu
  const firstMainLink = document.querySelector(".main-link");
  if (firstMainLink) {
    firstMainLink.click();
    // The main-link click will auto-click the first sub-link via code above
  } else {
    // No main-link/sub-link; try page-level fallback: show the first content box and its tab
    const firstBox = document.querySelector(".content-box");
    if (firstBox) {
      firstBox.classList.add("active");
      activateFirstGlobalTabIn(firstBox);
    }
  }
})();
