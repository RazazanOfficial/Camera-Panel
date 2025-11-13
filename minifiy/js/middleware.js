document.addEventListener("DOMContentLoaded", () => {
  if (!window.Auth.requireAuth("../index.html")) return;
  initPage();
});
