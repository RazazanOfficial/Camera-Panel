// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const usernameInput = document.getElementById("User Name"); // همون id فعلی با فاصله
  const passwordInput = document.getElementById("password");
  const submitBtn = form.querySelector('button[type="submit"]');

  let alertEl = null;

  const showAlert = (type, message) => {
    if (alertEl) alertEl.remove();
    alertEl = document.createElement("div");
    alertEl.className = `alert alert-${type}`;
    alertEl.role = "alert";
    alertEl.textContent = message;
    form.prepend(alertEl);
  };

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    if (loading) {
      submitBtn.dataset.prevText = submitBtn.textContent;
      submitBtn.innerHTML =
        '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Logging in...';
    } else if (submitBtn.dataset.prevText) {
      submitBtn.textContent = submitBtn.dataset.prevText;
      delete submitBtn.dataset.prevText;
    }
  };

  // Helper برای سازگاری با انواع کتابخانه‌های MD5
  function computeMd5(str) {
    if (typeof window.md5 === "function") return window.md5(str); // md5.min.js شما
    if (window.CryptoJS?.MD5) return window.CryptoJS.MD5(str).toString();
    if (typeof window.hex_md5 === "function") return window.hex_md5(str);
    throw new Error("کتابخانه‌ی MD5 در دسترس نیست. لطفاً md5.min.js را قبل از login.js لود کنید.");
    // توجه: ترتیب لود در login.html رعایت شده است.
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = (usernameInput.value || "").trim();
    const password = passwordInput.value || "";

    if (!user || !password) {
      showAlert("warning", "لطفاً نام کاربری و گذرواژه را وارد کنید.");
      return;
    }

    try {
      setLoading(true);
      showAlert("info", "در حال دریافت کد تصادفی (random) ...");

      // 1) دریافت random: POST به /login.cgi?user={user}
      const loginResp = await apiPost(`${API_ENDPOINTS.login}?user=${encodeURIComponent(user)}`);
      const random = (typeof loginResp === "string" ? JSON.parse(loginResp) : loginResp)?.random;

      if (random === undefined || random === null) {
        throw new Error("random از سرور دریافت نشد.");
      }

      // 2) ساخت md5(user:random:password)
      const credit = computeMd5(`${user}:${random}:${password}`);

      // 3) دریافت token: POST به /login_token.cgi?credit={md5}
      showAlert("info", "در حال تأیید اعتبار و دریافت توکن ...");
      const tokenResp = await apiPost(`${API_ENDPOINTS.loginToken}?credit=${encodeURIComponent(credit)}`);
      const token = (typeof tokenResp === "string" ? JSON.parse(tokenResp) : tokenResp)?.token;

      if (!token) {
        throw new Error("token از سرور دریافت نشد.");
      }

      // 4) ذخیره‌ی توکن (TTL در auth.js)
      window.Auth.setToken(token);
      sessionStorage.setItem("auth.username", user); // پسورد ذخیره نمی‌شود

      showAlert("success", "ورود با موفقیت انجام شد.");
      // Optional: ریدایرکت به داشبورد
      // window.location.href = "../index.html";
    } catch (err) {
      console.error(err);
      showAlert("danger", err.message || "خطا در فرآیند ورود.");
    } finally {
      setLoading(false);
      passwordInput.value = ""; // پاک‌سازی برای امنیت
    }
  });
});
