const DEVICE_IP = "192.168.1.142:80";

const API_ENDPOINTS = {
  // Auth
  login: "/cgi-bin/api/login.cgi",            // POST ?user={username}
  loginToken: "/cgi-bin/api/login_token.cgi", // POST ?credit={md5}

  // Others (sample)
  systemInfo: "/cgi-bin/api/system_info.cgi",
  systemInfoGet: "/cgi-bin/api/system_info.cgi?system_name=&system_serial=&system_num=&system_model=",

  timezone: "/cgi-bin/api/system_timezone.cgi",
  ntp: "/cgi-bin/api/system_ntp.cgi",
  localTime: "/cgi-bin/api/system_time.cgi",

  reboot: "/cgi-bin/api/system_reboot.cgi",
  resetKeepIpUser: "/cgi-bin/api/system_confRst.cgi?noChange=ip_user",
  resetAll: "/cgi-bin/api/system_confRst.cgi",

  // Firewall / IP filter
  firewallList:   "/cgi-bin/api/firewall.cgi",
  firewallAdd:    "/cgi-bin/api/firewall.cgi",
  firewallModify: "/cgi-bin/api/firewall_modify.cgi",
  firewallDelete: "/cgi-bin/api/firewall_delete.cgi",

  // User management
  userList:   "/cgi-bin/api/user_list.cgi",   // GET (list) / POST (add)
  userModify: "/cgi-bin/api/user_modify.cgi", // POST { username, password, level, number_line }
  userDelete: "/cgi-bin/api/user_delete.cgi", // POST { number_line }
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
