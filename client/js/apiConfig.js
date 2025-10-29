// js/apiConfig.js
const DEVICE_IP = "192.168.1.142:80";

const API_ENDPOINTS = {
  // Auth
  login: "/cgi-bin/api/login.cgi",            // POST ?user={username}
  loginToken: "/cgi-bin/api/login_token.cgi", // POST ?credit={md5}

  // Others (sample)
  timezone: "/cgi-bin/api/timezone.cgi",
  ntp: "/cgi-bin/api/ntp_time.cgi",
  localTime: "/cgi-bin/api/local_time.cgi",
  reboot: "/cgi-bin/api/reboot.cgi",
  systemInfo: "/cgi-bin/api/system_info.cgi",
};

function getFullUrl(endpoint) {
  return `http://${DEVICE_IP}${endpoint}`;
}

function isAuthPath(pathname) {
  return pathname.includes("/login.cgi") || pathname.includes("/login_token.cgi");
}

/**
 * Inject token as querystring for all non-auth endpoints (if token exists).
 */
function getAuthorizedUrl(endpoint) {
  const url = new URL(getFullUrl(endpoint));
  if (!isAuthPath(url.pathname)) {
    const token = window.Auth?.getToken?.();
    if (token) {
      url.searchParams.set("token", token);
    }
  }
  return url.toString();
}
