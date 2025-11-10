const DEVICE_IP = "192.168.1.142:80";

const API_ENDPOINTS = {
  // Auth
  login: "/cgi-bin/api/login.cgi",
  loginToken: "/cgi-bin/api/login_token.cgi",

  // Others (sample)
  systemInfo: "/cgi-bin/api/system_info.cgi",
  systemInfoGet:
    "/cgi-bin/api/system_info.cgi?system_name=&system_serial=&system_num=&system_model=",

  timezone: "/cgi-bin/api/system_timezone.cgi",
  ntp: "/cgi-bin/api/system_ntp.cgi",
  localTime: "/cgi-bin/api/system_time.cgi",

  reboot: "/cgi-bin/api/system_reboot.cgi",
  resetKeepIpUser: "/cgi-bin/api/system_confRst.cgi?noChange=ip_user",
  resetAll: "/cgi-bin/api/system_confRst.cgi",

  // Firewall / IP filter
  firewallList: "/cgi-bin/api/firewall.cgi",
  firewallAdd: "/cgi-bin/api/firewall.cgi",
  firewallModify: "/cgi-bin/api/firewall_modify.cgi",
  firewallDelete: "/cgi-bin/api/firewall_delete.cgi",

  // User management
  userList: "/cgi-bin/api/user_list.cgi",
  userModify: "/cgi-bin/api/user_modify.cgi",
  userDelete: "/cgi-bin/api/user_delete.cgi",

  // Network
  netIPv4: "/cgi-bin/api/net_ipv4.cgi",
  netMac: "/cgi-bin/api/net_mac.cgi",
  netMtu: "/cgi-bin/api/net_mtu.cgi",

  // Ports (appConfig)
  netPorts: "/cgi-bin/api/appConfig_port.cgi",

  // Video (appConfig) - both channel & protocol live on this endpoint
  video: "/cgi-bin/api/appConfig_video.cgi",
  // Audio (appConfig)
  audio: "/cgi-bin/api/appConfig_audio.cgi",

  // Image
  image: "/cgi-bin/api/appConfig_image.cgi",
  // Day/Night (appConfig)
  night: "/cgi-bin/api/appConfig_night.cgi",
  // OSD (appConfig)
  osd: "/cgi-bin/api/appConfig_osd.cgi",
  
  // Apply for appConfig_* endpoints
  appConfigApply: "/cgi-bin/api/appConfig_apply.cgi",
};

function getFullUrl(endpoint) {
  return `http://${DEVICE_IP}${endpoint}`;
}

function isAuthPath(pathname) {
  return (
    pathname.includes("/login.cgi") || pathname.includes("/login_token.cgi")
  );
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
