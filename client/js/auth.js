// js/auth.js
(function () {
  // ---------- Config ----------
  const TOKEN_COOKIE_NAME = "auth.token";

  // Dev TTL: 30m; Prod: 5m  (برای UX درون تب؛ امنیت حقیقی سمت سروره)
  const DEV_TTL_MS = 30 * 60 * 1000;
  const PROD_TTL_MS = 5 * 60 * 1000;
  const TOKEN_TTL_MS = PROD_TTL_MS; // در محصول نهایی بگذارید PROD_TTL_MS

  // ---------- Cookie helpers ----------
  function setCookie(name, value, maxAgeSeconds, path = "/") {
    // اگر HTTPS دارید، Secure رو هم اضافه کنید
    document.cookie =
      `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ` +
      `Max-Age=${maxAgeSeconds}; Path=${path}; SameSite=Lax`;
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
    // حذف قطعی با Max-Age=0
    document.cookie =
      `${encodeURIComponent(name)}=; Max-Age=0; Path=${path}; SameSite=Lax`;
  }

  // ---------- Token API ----------
  function setToken(token, ttlMs = TOKEN_TTL_MS) {
    const maxAgeSeconds = Math.floor(ttlMs / 1000);
    setCookie(TOKEN_COOKIE_NAME, token, maxAgeSeconds);
    setupExpiryTimeout(ttlMs); // فقط برای UX (اتو-لاگ‌اوت درون تب)
  }
  function getToken() {
    return getCookie(TOKEN_COOKIE_NAME);
  }
  function clearToken() {
    removeCookie(TOKEN_COOKIE_NAME);
    clearExpiryTimeout();
  }

  // ---------- In-tab UX auto-logout ----------
  let expiryTimeoutId = null;
  function setupExpiryTimeout(ttlMs) {
    clearExpiryTimeout();
    expiryTimeoutId = setTimeout(() => {
      // در زمان انقضا: توکن رو پاک کن، پیام بده و ببر لاگین
      clearToken();
      if (window.toast?.warning) {
        toast.warning("Session expired. Please log in again.");
      }
      window.location.replace("./login.html");
    }, ttlMs);
  }
  function clearExpiryTimeout() {
    if (expiryTimeoutId) {
      clearTimeout(expiryTimeoutId);
      expiryTimeoutId = null;
    }
  }

  // ---------- Route guard برای صفحات محافظت‌شده ----------
  function requireAuth(redirectLogin = "./login.html") {
    const token = getToken();
    if (!token) {
      if (window.toast?.warning) {
        toast.warning("Authentication required. Redirecting to login.");
      }
      window.location.replace(redirectLogin);
      return false;
    }
    // چون expiry کوکی رو از JS نمی‌خونیم، تایمر UX رو مجدد مسلح می‌کنیم
    setupExpiryTimeout(TOKEN_TTL_MS);
    return true;
  }

  // ---------- Helper: پاک‌کردن توکن بعد از موفقیت یک API ----------
  /**
   * یک Promise مربوط به فراخوانی API بگیر؛ اگر resolve شد، توکن را پاک کن
   * و (اختیاری) هدایت به صفحه لاگین.
   *
   * مثال:
   *   await Auth.clearTokenAfter(apiPost(API_ENDPOINTS.reboot));
   */
  async function clearTokenAfter(apiCallPromise, { redirectToLogin = true } = {}) {
    const result = await apiCallPromise; // اگر throw کند، پاک نمی‌کنیم
    try {
      clearToken();
    } finally {
      if (redirectToLogin) {
        // معمولاً بعد از کارهایی مثل تغییر timezone یا reboot، ورود مجدد منطقی است
        window.location.replace("./login.html");
      }
    }
    return result;
  }

  // ---------- Logout استاندارد ----------
  async function logout() {
    try {
      // اگر endpoint لاگ‌اوت داری، صداش کن (اختیاری)
      if (window.API_ENDPOINTS?.logout) {
        await apiPost(API_ENDPOINTS.logout);
      }
    } catch (e) {
      console.warn("logout endpoint failed:", e);
    } finally {
      clearToken();
      window.location.replace("./login.html");
    }
  }

  // ---------- Public API ----------
  window.Auth = {
    // token
    setToken,
    getToken,
    clearToken,

    // guards & UX
    requireAuth,
    TOKEN_TTL_MS,

    // flows
    clearTokenAfter,
    logout,
  };
})();
