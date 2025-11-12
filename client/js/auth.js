// js/auth.js
(function () {
  // ---------- Config ----------
  const TOKEN_COOKIE_NAME = "auth.token";

  // Dev TTL: 30m; Prod: 5m  (برای UX درون تب؛ امنیت حقیقی سمت سروره)
  const DEV_TTL_MS = 30 * 60 * 1000;
  const PROD_TTL_MS = 5 * 60 * 1000;
  const TOKEN_TTL_MS = PROD_TTL_MS; // در محصول نهایی بگذارید PROD_TTL_MS

  // ---------- Storage adapter: Cookie OR localStorage (for file://) ----------
  function shouldUseLocalStorage() {
    // روی file:// یا وقتی کوکی‌ها بلاک هستند، از localStorage استفاده کن
    if (location.protocol === "file:") return true;
    try {
      document.cookie = "ck.test=1; Max-Age=1; Path=/; SameSite=Lax";
      const ok = document.cookie.includes("ck.test=1");
      // cleanup
      document.cookie = "ck.test=; Max-Age=0; Path=/; SameSite=Lax";
      return !ok;
    } catch {
      return true;
    }
  }

  const cookieStore = {
    set(name, value, maxAgeSeconds, path = "/") {
      // اگر HTTPS داری، Secure رو هم اضافه کن
      document.cookie =
        `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ` +
        `Max-Age=${maxAgeSeconds}; Path=${path}; SameSite=Lax`;
    },
    get(name) {
      const cookies = document.cookie ? document.cookie.split("; ") : [];
      for (let i = 0; i < cookies.length; i++) {
        const parts = cookies[i].split("=");
        const k = decodeURIComponent(parts.shift());
        const v = parts.join("=");
        if (k === name) return decodeURIComponent(v);
      }
      return null;
    },
    remove(name, path = "/") {
      document.cookie =
        `${encodeURIComponent(name)}=; Max-Age=0; Path=${path}; SameSite=Lax`;
    },
  };

  // localStorage با تاریخ انقضا
  const lsStore = {
    set(name, value, maxAgeSeconds) {
      const e = Date.now() + maxAgeSeconds * 1000;
      localStorage.setItem(name, JSON.stringify({ v: value, e }));
    },
    get(name) {
      const raw = localStorage.getItem(name);
      if (!raw) return null;
      try {
        const { v, e } = JSON.parse(raw);
        if (e && Date.now() > e) {
          localStorage.removeItem(name);
          return null;
        }
        return v ?? null;
      } catch {
        localStorage.removeItem(name);
        return null;
      }
    },
    remove(name) {
      localStorage.removeItem(name);
    },
  };

  const store = shouldUseLocalStorage() ? lsStore : cookieStore;

  // ---------- Token API ----------
  function setToken(token, ttlMs = TOKEN_TTL_MS) {
    const maxAgeSeconds = Math.floor(ttlMs / 1000);
    store.set(TOKEN_COOKIE_NAME, token, maxAgeSeconds);
    setupExpiryTimeout(ttlMs); // فقط برای UX (اتو-لاگ‌اوت درون تب)
  }

  function getToken() {
    return store.get(TOKEN_COOKIE_NAME);
  }

  function clearToken() {
    store.remove(TOKEN_COOKIE_NAME);
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
      // از همون روتی که صفحات protected انتظار دارن
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
    // چون expiry از روی storage می‌آد، تایمر UX رو مجدد مسلح می‌کنیم
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
