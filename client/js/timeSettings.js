/***** 1) لیست تایم‌زون‌ها (بر اساس نام‌هایی که دادی) *****/
const timezones = [
  { value: "Asia/Tehran", text: "Asia/Tehran  (UTC+03:30)" },
  { value: "Asia/Dubai", text: "Asia/Dubai  (UTC+04:00)" },
  { value: "Asia/Riyadh", text: "Asia/Riyadh  (UTC+03:00)" },
  { value: "Asia/Jerusalem", text: "Asia/Jerusalem  (UTC+02:00)" },
  { value: "Asia/Karachi", text: "Asia/Karachi  (UTC+05:00)" },
  { value: "Asia/Kolkata", text: "Asia/Kolkata  (UTC+05:30)" },
  { value: "Asia/Dhaka", text: "Asia/Dhaka  (UTC+06:00)" },
  { value: "Asia/Bangkok", text: "Asia/Bangkok  (UTC+07:00)" },
  { value: "Asia/Singapore", text: "Asia/Singapore  (UTC+08:00)" },
  { value: "Asia/Hong_Kong", text: "Asia/Hong_Kong  (UTC+08:00)" },
  { value: "Asia/Shanghai", text: "Asia/Shanghai  (UTC+08:00)" },
  { value: "Asia/Tokyo", text: "Asia/Tokyo  (UTC+09:00)" },
  { value: "Asia/Seoul", text: "Asia/Seoul  (UTC+09:00)" },
  { value: "Asia/Jakarta", text: "Asia/Jakarta  (UTC+07:00)" },
  { value: "Australia/Sydney", text: "Australia/Sydney  (UTC+10:00)" },
  { value: "Pacific/Auckland", text: "Pacific/Auckland  (UTC+12:00)" },
  { value: "America/St_Johns", text: "America/St_Johns  (UTC-03:30)" },
  { value: "America/Halifax", text: "America/Halifax  (UTC-04:00)" },
  { value: "America/New_York", text: "America/New_York  (UTC-05:00)" },
  { value: "America/Chicago", text: "America/Chicago  (UTC-06:00)" },
  { value: "America/Denver", text: "America/Denver  (UTC-07:00)" },
  { value: "America/Los_Angeles", text: "America/Los_Angeles  (UTC-08:00)" },
  { value: "America/Phoenix", text: "America/Phoenix  (UTC-07:00)" },
  { value: "America/Anchorage", text: "America/Anchorage  (UTC-09:00)" },
  { value: "Pacific/Honolulu", text: "Pacific/Honolulu  (UTC-10:00)" },
  { value: "America/Mexico_City", text: "America/Mexico_City  (UTC-06:00)" },
  { value: "America/Bogota", text: "America/Bogota  (UTC-05:00)" },
  { value: "America/Lima", text: "America/Lima  (UTC-05:00)" },
  { value: "America/Santiago", text: "America/Santiago  (UTC-03:00)" },
  { value: "America/Sao_Paulo", text: "America/Sao_Paulo  (UTC-03:00)" },
  {
    value: "America/Argentina/Buenos_Aires",
    text: "America/Argentina/Buenos_Aires  (UTC-03:00)",
  },
  { value: "Africa/Cairo", text: "Africa/Cairo  (UTC+02:00)" },
  { value: "Africa/Nairobi", text: "Africa/Nairobi  (UTC+03:00)" },
  { value: "Africa/Johannesburg", text: "Africa/Johannesburg  (UTC+02:00)" },
  { value: "Africa/Lagos", text: "Africa/Lagos  (UTC+01:00)" },
  { value: "Africa/Casablanca", text: "Africa/Casablanca  (UTC+00:00)" },
  { value: "Asia/Kuala_Lumpur", text: "Asia/Kuala_Lumpur  (UTC+08:00)" },
  { value: "Asia/Manila", text: "Asia/Manila  (UTC+08:00)" },
  { value: "America/Toronto", text: "America/Toronto  (UTC-05:00)" },
  { value: "America/Vancouver", text: "America/Vancouver  (UTC-08:00)" },
  { value: "Asia/Tbilisi", text: "Asia/Tbilisi  (UTC+04:00)" },
  { value: "Asia/Yerevan", text: "Asia/Yerevan  (UTC+04:00)" },
  { value: "Asia/Baku", text: "Asia/Baku  (UTC+04:00)" },
  { value: "Asia/Ashgabat", text: "Asia/Ashgabat  (UTC+05:00)" },
  { value: "Asia/Dushanbe", text: "Asia/Dushanbe  (UTC+05:00)" },
  { value: "Asia/Kabul", text: "Asia/Kabul  (UTC+04:30)" },
  { value: "Asia/Almaty", text: "Asia/Almaty  (UTC+06:00)" },
  { value: "Asia/Tashkent", text: "Asia/Tashkent  (UTC+05:00)" },
  { value: "Asia/Baghdad", text: "Asia/Baghdad  (UTC+03:00)" },
  { value: "Asia/Kuwait", text: "Asia/Kuwait  (UTC+03:00)" },
  { value: "Asia/Doha", text: "Asia/Doha  (UTC+03:00)" },
  { value: "Asia/Manama", text: "Asia/Manama  (UTC+03:00)" },
  { value: "Asia/Muscat", text: "Asia/Muscat  (UTC+04:00)" },
  { value: "Asia/Aden", text: "Asia/Aden  (UTC+03:00)" },
  { value: "Asia/Beirut", text: "Asia/Beirut  (UTC+02:00)" },
  { value: "Asia/Damascus", text: "Asia/Damascus  (UTC+03:00)" },
  { value: "Asia/Amman", text: "Asia/Amman  (UTC+02:00)" },
  { value: "Asia/Sanaa", text: "Asia/Sanaa  (UTC+03:00)" },
  { value: "Asia/Pyongyang", text: "Asia/Pyongyang  (UTC+09:00)" },
];

/***** 2) Dropdown تایم‌زون *****/
function loadTimezones() {
  const timezoneSelect = document.getElementById("streamType");
  if (!timezoneSelect) return;

  timezoneSelect.innerHTML = "";
  timezones.forEach((tz) => {
    const option = document.createElement("option");
    option.value = tz.value;
    option.textContent = tz.text;
    timezoneSelect.appendChild(option);
  });
}

// همگام‌سازی مقدار انتخاب‌شده با پاسخ دستگاه
function normalizeTimezoneResponse(raw) {
  if (!raw) return "";
  const txt = String(raw).trim();
  const line = (txt.split(/\r?\n/).find((l) => l.includes("/")) || txt).trim();
  const matchIana = line.match(/[A-Za-z_]+\/[A-Za-z_\/]+/);
  if (matchIana) return matchIana[0];
  return line.split(/\s+/)[0];
}

async function getTimezoneSettings() {
  try {
    const response = await apiGet(API_ENDPOINTS.timezone);
    const iana = normalizeTimezoneResponse(response);

    const timezoneSelect = document.getElementById("streamType");
    if (timezoneSelect) {
      const exists = timezones.some((t) => t.value === iana);
      timezoneSelect.value = exists ? iana : "Asia/Tehran";
    }
  } catch (error) {
    console.error("Failed to get timezone settings:", error);
  }
}

async function saveTimezoneSettings() {
  const timezoneSelect = document.getElementById("streamType");
  if (!timezoneSelect) return;
  const timezoneValue = timezoneSelect.value || "";
  // timezone همچنان با فرم‌-یواَر‌ال‌انکودد ارسال می‌شود
  return apiPost(API_ENDPOINTS.timezone, { timezone: timezoneValue });
}

/***** 3) NTP: فقط server address *****/
function normalizeNtpResponse(raw) {
  if (!raw) return "";
  const txt = String(raw).trim();

  // اگر فرمت "ntp_server: pool.ntp.org" بود
  const line = (
    txt.split(/\r?\n/).find((l) => /ntp|server/i.test(l)) || txt
  ).trim();

  // hostname یا IP را استخراج کن
  const match = line.match(/((\d{1,3}\.){3}\d{1,3})|([a-z0-9-]+\.)+[a-z]{2,}/i);

  if (match) return match[0];

  // fallback: اولین کلمه غیر خالی
  return line.split(/\s+/).find(Boolean) || "";
}

async function getNtpSettings() {
  try {
    const res = await apiGet(API_ENDPOINTS.ntp);
    const server = normalizeNtpResponse(res);
    const input = document.getElementById("serverAddress");
    if (input && server) input.value = server;
  } catch (e) {
    console.error("Failed to get NTP settings:", e);
  }
}

async function saveNtpSettings() {
  const input = document.getElementById("serverAddress");
  const server = (input?.value || "").trim();
  if (!server) return;
  // بدنه باید form-urlencoded باشد: ntp_server=...
  return apiPost(API_ENDPOINTS.ntp, { ntp_server: server });
}

/***** 4) Manual Time Sync + Device Time polling *****/
const DEVICE_TIME_POLL_MS = 1000;
let deviceTimeTimer = null;
let simulatedDeviceDate = null; // زمان دستگاه که محلی تیک می‌خورد

function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}
function formatYMDHMS(d) {
  return (
    `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ` +
    `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`
  );
}
function parseYMDHMS(str) {
  const m = String(str).match(
    /(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})/
  );
  if (!m) return null;
  const y = +m[1],
    mo = +m[2],
    d = +m[3],
    h = +m[4],
    mi = +m[5],
    s = +m[6];
  // ساخت Date به‌صورت محلی (سازگار با همه مرورگرها)
  return new Date(y, mo - 1, d, h, mi, s);
}

function updateDeviceTimeInputFromSim() {
  const devInput = document.getElementById("diviceTime");
  if (!devInput || !simulatedDeviceDate) return;
  devInput.value = formatYMDHMS(simulatedDeviceDate);
}

// همون تابع موجودت رو نگه دار، فقط برای seed اولیه استفاده می‌کنیم
function normalizeLocalTimeString(raw) {
  if (!raw) return "";
  const m = String(raw).match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
  return m ? m[0] : String(raw).trim();
}

// فقط یک بار GET: زمان دستگاه را می‌گیریم و seed می‌کنیم
async function refreshDeviceTimeOnce() {
  try {
    const res = await apiGet(API_ENDPOINTS.localTime);
    const nowStr = normalizeLocalTimeString(res);
    const dt = parseYMDHMS(nowStr);
    if (dt) {
      simulatedDeviceDate = dt;
      updateDeviceTimeInputFromSim();
    }
  } catch (e) {
    console.error("Failed to seed device time:", e);
  }
}

// هر ثانیه فقط لوکال تیک بزن (بدون هیچ GET)
function tickDeviceTime() {
  if (!simulatedDeviceDate) return;
  simulatedDeviceDate = new Date(simulatedDeviceDate.getTime() + 1000);
  updateDeviceTimeInputFromSim();
}

// شروع: یک‌بار seed از دستگاه، بعد interval لوکال
async function startDeviceTimePolling() {
  stopDeviceTimePolling();
  await refreshDeviceTimeOnce(); // فقط همین یک GET
  deviceTimeTimer = setInterval(tickDeviceTime, DEVICE_TIME_POLL_MS);
}

function stopDeviceTimePolling() {
  if (deviceTimeTimer) {
    clearInterval(deviceTimeTimer);
    deviceTimeTimer = null;
  }
}

function setManualInputsEnabled(enabled) {
  const dateEl = document.getElementById("setDate");
  const timeEl = document.getElementById("setTime");
  if (dateEl) dateEl.disabled = !enabled;
  if (timeEl) timeEl.disabled = !enabled;
}

function buildLocalTimePayload() {
  const dateEl = document.getElementById("setDate");
  const timeEl = document.getElementById("setTime");
  const date = (dateEl?.value || "").trim(); // YYYY-MM-DD
  let time = (timeEl?.value || "").trim(); // HH:MM[:SS]

  if (!date || !time) {
    throw new Error("لطفاً تاریخ و زمان را کامل وارد کنید.");
  }

  // اگر ثانیه وارد نشده بود، :00 اضافه کن
  if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    if (/^\d{2}:\d{2}$/.test(time)) time = `${time}:00`;
    else throw new Error("زمان نامعتبر است. مثال صحیح: 10:35:51");
  }

  return `${date} ${time}`; // دقیقا فرمت موردنیاز بک‌اند
}

async function saveManualTimeIfEnabled() {
  const toggle = document.getElementById("manualTimeToggle");
  if (!toggle || !toggle.checked) return;

  const payload = buildLocalTimePayload(); // "YYYY-MM-DD HH:MM:SS"
  // بدنه باید form-urlencoded باشد: local_time=YYYY-MM-DD HH:MM:SS
  return apiPost(API_ENDPOINTS.localTime, { local_time: payload });
}

/***** 5) Save واحد برای همه تنظیمات *****/
async function saveAllSettings() {
  const btn = document.getElementById("saveAll");
  try {
    btn && (btn.disabled = true);

    // همزمان ولی مستقل ذخیره کنیم
    const tasks = [
      saveTimezoneSettings(),
      saveNtpSettings(),
      saveManualTimeIfEnabled(),
    ];

    await Promise.all(tasks);
    alert("Settings saved successfully.");
  } catch (e) {
    console.error(e);
    alert(e?.message || "Failed to save settings.");
  } finally {
    btn && (btn.disabled = false);
  }
}

/***** 6) Init *****/
document.addEventListener("DOMContentLoaded", function () {
  // 6.1 timezones
  loadTimezones();
  getTimezoneSettings();

  // 6.2 NTP
  getNtpSettings();

  // 6.3 manual toggle wiring
  const manualToggle = document.getElementById("manualTimeToggle");
  if (manualToggle) {
    manualToggle.addEventListener("change", (e) => {
      setManualInputsEnabled(e.target.checked);
    });
    // اول کار غیرفعال باشد
    setManualInputsEnabled(false);
  }

  // 6.4 device time polling
  startDeviceTimePolling();

  // 6.5 single Save button
  const saveBtn = document.getElementById("saveAll");
  if (saveBtn) {
    saveBtn.addEventListener("click", saveAllSettings);
  }
});
