// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const usernameInput = document.getElementById("User Name");
  const passwordInput = document.getElementById("password");
  const submitBtn = form.querySelector('button[type="submit"]');

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

  function computeMd5(str) {
    if (typeof window.md5 === "function") return window.md5(str);
    if (window.CryptoJS?.MD5) return window.CryptoJS.MD5(str).toString();
    if (typeof window.hex_md5 === "function") return window.hex_md5(str);
    throw new Error("MD5 library not found. Please load md5.min.js before login.js.");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = (usernameInput.value || "").trim();
    const password = passwordInput.value || "";

    if (!user || !password) {
      toast.warning("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      toast.info("Requesting random challenge...");

      // 1) Get random
      const loginResp = await apiPost(`${API_ENDPOINTS.login}?user=${encodeURIComponent(user)}`);
      const random = (typeof loginResp === "string" ? JSON.parse(loginResp) : loginResp)?.random;

      if (random === undefined || random === null) {
        throw new Error("Server did not return 'random'.");
      }

      // 2) Build MD5(user:random:password)
      const credit = computeMd5(`${user}:${random}:${password}`);

      // 3) Request token
      toast.info("Verifying credentials...");
      const tokenResp = await apiPost(`${API_ENDPOINTS.loginToken}?credit=${encodeURIComponent(credit)}`);
      const token = (typeof tokenResp === "string" ? JSON.parse(tokenResp) : tokenResp)?.token;

      if (!token) {
        throw new Error("Server did not return 'token'.");
      }

      // 4) Save token (auth.js handles cookie + sessionStorage + in-page timeout)
      window.Auth.setToken(token);
      
      toast.success("Logged in successfully. Redirecting...");
      // redirect to viewControl (after a short delay so toast is visible)
      setTimeout(() => {
        window.location.href = "./html/viewControll.html"; // adjust path as needed
      }, 600);

    } catch (err) {
      console.error(err);
      toast.error(`Login failed: ${err.message || "Unexpected error."}`);
    } finally {
      setLoading(false);
      passwordInput.value = "";
    }
  });
});
