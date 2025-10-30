// js/auth.js
(function () {
  // Dev TTL: 30m; Prod: 5m
  const DEV_TTL_MS = 30 * 60 * 1000;
  const PROD_TTL_MS = 5 * 60 * 1000;
  const TOKEN_TTL_MS = DEV_TTL_MS; // change to PROD_TTL_MS in production

  // Cookie helpers
  function setCookie(name, value, maxAgeSeconds, path = "/") {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; max-age=${maxAgeSeconds}; path=${path}; SameSite=Lax`;
  }
  function getCookie(name) {
    const cookies = document.cookie ? document.cookie.split("; ") : [];
    for (let i = 0; i < cookies.length; i++) {
      const parts = cookies[i].split("=");
      const k = decodeURIComponent(parts.shift());
      const v = parts.join("=");
      if (k === name) return decodeURIComponent(v);
    }
    return null;
  }
  function removeCookie(name, path = "/") {
    document.cookie = `${encodeURIComponent(name)}=; max-age=0; path=${path}; SameSite=Lax`;
  }

  // Single source of truth: cookie only
  function setToken(token, ttlMs = TOKEN_TTL_MS) {
    const maxAgeSeconds = Math.floor(ttlMs / 1000);
    setCookie("auth.token", token, maxAgeSeconds);
    setupExpiryTimeout(ttlMs); // UX only
  }
  function getToken() {
    return getCookie("auth.token");
  }
  function clearToken() {
    removeCookie("auth.token");
    clearExpiryTimeout();
  }

  // In-tab UX timeout (doesn't guarantee security; server is authoritative)
  let expiryTimeoutId = null;
  function setupExpiryTimeout(ttlMs) {
    clearExpiryTimeout();
    expiryTimeoutId = setTimeout(() => {
      clearToken();
      if (window.toast?.warning) toast.warning("Session expired. Please log in again.");
      window.location.href = "./login.html";
    }, ttlMs);
  }
  function clearExpiryTimeout() {
    if (expiryTimeoutId) {
      clearTimeout(expiryTimeoutId);
      expiryTimeoutId = null;
    }
  }

  // Middleware for protected pages
  function requireAuth(redirectLogin = "./login.html") {
    const token = getToken();
    if (!token) {
      if (window.toast?.warning) toast.warning("Authentication required. Redirecting to login.");
      window.location.href = redirectLogin;
      return false;
    }
    // We cannot read cookie expiry via JS; re-arm UX timeout with default TTL
    // This keeps the in-tab auto-logout behavior consistent
    setupExpiryTimeout(TOKEN_TTL_MS);
    return true;
  }

  window.Auth = {
    setToken,
    getToken,
    clearToken,
    requireAuth,
    TOKEN_TTL_MS,
  };
})();
