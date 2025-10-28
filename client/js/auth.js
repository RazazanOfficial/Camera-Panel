// js/auth.js
(function () {
  const TOKEN_KEY = "auth.token";
  const EXPIRES_KEY = "auth.expiresAt";

  // توسعه: 30 دقیقه — تولید: 5 دقیقه (در صورت نیاز تغییر بده)
  const TOKEN_TTL_MS = 30 * 60 * 1000; // پیشنهاد تولید: 5 * 60 * 1000

  function setToken(token, ttlMs = TOKEN_TTL_MS) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(EXPIRES_KEY, String(Date.now() + ttlMs));
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function isTokenValid() {
    const t = getToken();
    const exp = Number(sessionStorage.getItem(EXPIRES_KEY) || 0);
    return Boolean(t) && Date.now() < exp;
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRES_KEY);
  }

  window.Auth = {
    setToken,
    getToken,
    isTokenValid,
    clearToken,
    TOKEN_TTL_MS,
  };
})();
