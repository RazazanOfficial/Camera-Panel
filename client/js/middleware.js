document.addEventListener("DOMContentLoaded", () => {
  if (!window.Auth.requireAuth("./login.html")) return;
  initPage();
});
