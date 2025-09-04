// آدرس دستگاه
const DEVICE_IP = "192.168.1.142:80";

// endpointهای API
const API_ENDPOINTS = {
  timezone: "/cgi-bin/api/timezone.cgi",
  ntp: "/cgi-bin/api/ntp_time.cgi",
  localTime: "/cgi-bin/api/local_time.cgi",
};

// تابع کمکی برای ساخت URL کامل
function getFullUrl(endpoint) {
  return `http://${DEVICE_IP}${endpoint}`;
}
