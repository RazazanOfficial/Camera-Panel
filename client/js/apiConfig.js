// ===== apiConfig.js =====
function readMeta(name) {
  const el = document.querySelector(`meta[name="${name}"]`);
  return el?.getAttribute("content") || null;
}

function getHashParam(key) {
  const h = location.hash.startsWith("#") ? location.hash.slice(1) : location.hash;
  const sp = new URLSearchParams(h);
  return sp.get(key);
}

function resolveDeviceHost() {
  const { protocol, host } = window.location;

  // اگر روی خود دوربین یا هر وب‌سرور عادی هستیم
  if (protocol === "http:" || protocol === "https:") {
    return host; // شامل پورت هم هست
  }

  // در حالت file:// از منابع جایگزین
  let candidate =
    getHashParam("device_host") ||
    getHashParam("host") ||
    localStorage.getItem("device_host") ||
    readMeta("device-host")
  // نرمال‌سازی ساده
  candidate = String(candidate).trim().replace(/^https?:\/\//, "");
  // ذخیره برای دفعات بعد
  try { localStorage.setItem("device_host", candidate); } catch {}

  return candidate;
}

const DEVICE_HOST = resolveDeviceHost();
const DEVICE_ORIGIN =
  (location.protocol === "http:" || location.protocol === "https:")
    ? location.origin
    : `http://${DEVICE_HOST}`;

const DEVICE_IP = DEVICE_HOST; // سازگاری با کدهای قبلی

// Endpoints همون قبلی…
const API_ENDPOINTS = {
  login: "/cgi-bin/api/login.cgi",
  loginToken: "/cgi-bin/api/login_token.cgi",
  systemInfo: "/cgi-bin/api/system_info.cgi",
  systemInfoGet: "/cgi-bin/api/system_info.cgi?system_name=&system_serial=&system_num=&system_model=",
  timezone: "/cgi-bin/api/system_timezone.cgi",
  ntp: "/cgi-bin/api/system_ntp.cgi",
  localTime: "/cgi-bin/api/system_time.cgi",
  reboot: "/cgi-bin/api/system_reboot.cgi",
  resetKeepIpUser: "/cgi-bin/api/system_confRst.cgi?noChange=ip_user",
  resetAll: "/cgi-bin/api/system_confRst.cgi",
  firewallList: "/cgi-bin/api/firewall.cgi",
  firewallAdd: "/cgi-bin/api/firewall.cgi",
  firewallModify: "/cgi-bin/api/firewall_modify.cgi",
  firewallDelete: "/cgi-bin/api/firewall_delete.cgi",
  userList: "/cgi-bin/api/user_list.cgi",
  userModify: "/cgi-bin/api/user_modify.cgi",
  userDelete: "/cgi-bin/api/user_delete.cgi",
  netIPv4: "/cgi-bin/api/net_ipv4.cgi",
  netMac: "/cgi-bin/api/net_mac.cgi",
  netMtu: "/cgi-bin/api/net_mtu.cgi",
  netPorts: "/cgi-bin/api/appConfig_port.cgi",
  video: "/cgi-bin/api/appConfig_video.cgi",
  audio: "/cgi-bin/api/appConfig_audio.cgi",
  image: "/cgi-bin/api/appConfig_image.cgi",
  night: "/cgi-bin/api/appConfig_night.cgi",
  osd: "/cgi-bin/api/appConfig_osd.cgi",
  appConfigApply: "/cgi-bin/api/appConfig_apply.cgi",
};

function getFullUrl(endpoint) {
  return new URL(endpoint, DEVICE_ORIGIN).toString();
}

function isAuthPath(pathname) {
  return pathname.includes("/login.cgi") || pathname.includes("/login_token.cgi");
}

function getAuthorizedUrl(endpoint) {
  const url = new URL(getFullUrl(endpoint));
  if (!isAuthPath(url.pathname)) {
    const token = window.Auth?.getToken?.();
    if (token) url.searchParams.set("token", token);
  }
  return url.toString();
}

// لاگ برای اطمینان
console.log("DEVICE_IP:", DEVICE_IP);
console.log("DEVICE_HOST:", DEVICE_HOST);
console.log("DEVICE_ORIGIN:", DEVICE_ORIGIN);
