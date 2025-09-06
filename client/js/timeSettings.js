//! 1) =-=-=-=-=-= Timezones List =-=-=-=-=-= !///
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

//! 2) =-=-=-=-=-= Timezones Dropdown =-=-=-=-=-= !///
function loadTimezones() {
  const timezoneSelect = document.getElementById("timeZone");
  if (!timezoneSelect) return;

  timezoneSelect.innerHTML = "";
  timezones.forEach((tz) => {
    const option = document.createElement("option");
    option.value = tz.value;
    option.textContent = tz.text;
    timezoneSelect.appendChild(option);
  });
}

//! 3) =-=-=-=-=-= Normalize Timezone Response =-=-=-=-=-= !///
function normalizeTimezoneResponse(raw) {
  if (!raw) return "";
  const txt = String(raw).trim();
  const line = (txt.split(/\r?\n/).find((l) => l.includes("/")) || txt).trim();
  const matchIana = line.match(/[A-Za-z_]+\/[A-Za-z_\/]+/);
  if (matchIana) return matchIana[0];
  return line.split(/\s+/)[0];
}

//! 4) =-=-=-=-=-= GET Timezone =-=-=-=-=-= !///
async function getTimezoneSettings() {
  try {
    const response = await apiGet(API_ENDPOINTS.timezone);
    const iana = normalizeTimezoneResponse(response);

    const timezoneSelect = document.getElementById("timeZone");
    if (timezoneSelect) {
      const exists = timezones.some((t) => t.value === iana);
      timezoneSelect.value = exists ? iana : "Asia/Tehran";
    }
  } catch (error) {
    toast.error(`Failed to get timezone settings`);
    console.error("Failed to get timezone settings:", error);
  }
}

//! 5) =-=-=-=-=-= POST Timezone =-=-=-=-=-= !///
async function saveTimezoneSettings() {
  const timezoneSelect = document.getElementById("timeZone");
  if (!timezoneSelect) return;
  const timezoneValue = timezoneSelect.value || "";
  return apiPost(API_ENDPOINTS.timezone, { timezone: timezoneValue });
}

//! 6) =-=-=-=-=-= Normalize NTP Response =-=-=-=-=-= !///
function normalizeNtpResponse(raw) {
  if (!raw) return "";
  const txt = String(raw).trim();

  const line = (
    txt.split(/\r?\n/).find((l) => /ntp|server/i.test(l)) || txt
  ).trim();

  const match = line.match(/((\d{1,3}\.){3}\d{1,3})|([a-z0-9-]+\.)+[a-z]{2,}/i);

  if (match) return match[0];

  return line.split(/\s+/).find(Boolean) || "";
}

//! 7) =-=-=-=-=-= GET NTP =-=-=-=-=-= !///
async function getNtpSettings() {
  try {
    const res = await apiGet(API_ENDPOINTS.ntp);
    const server = normalizeNtpResponse(res);
    const input = document.getElementById("serverAddress");
    if (input && server) input.value = server;
  } catch (e) {
    toast.error("Failed to get NTP settings");
    console.error("Failed to get NTP settings:", e);
  }
}

//! 8) =-=-=-=-=-= POST NTP =-=-=-=-=-= !///
async function saveNtpSettings() {
  const input = document.getElementById("serverAddress");
  const server = (input?.value || "").trim();
  if (!server) return;
  return apiPost(API_ENDPOINTS.ntp, { ntp_server: server });
}

//! 9) =-=-=-=-=-= Manual Time Sync + Device Time polling =-=-=-=-=-= !///
const DEVICE_TIME_POLL_MS = 1000;
let deviceTimeTimer = null;
let simulatedDeviceDate = null;

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
  return new Date(y, mo - 1, d, h, mi, s);
}

//! 10) =-=-=-=-=-= Update Device Time Input From =-=-=-=-=-= !///
function updateDeviceTimeInputFromSim() {
  const devInput = document.getElementById("diviceTime");
  if (!devInput || !simulatedDeviceDate) return;
  devInput.value = formatYMDHMS(simulatedDeviceDate);
}

//! 11) =-=-=-=-=-= Normalize Local Time Starting Response =-=-=-=-=-= !///
function normalizeLocalTimeString(raw) {
  if (!raw) return "";
  const m = String(raw).match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
  return m ? m[0] : String(raw).trim();
}

//! 12) =-=-=-=-=-= GET LocalTime =-=-=-=-=-= !///
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
    toast.error("Failed to seed device time.");
    console.error("Failed to seed device time:", e);
  }
}

//! 13) =-=-=-=-=-= Local Timer(1sec) =-=-=-=-=-= !///
function tickDeviceTime() {
  if (!simulatedDeviceDate) return;
  simulatedDeviceDate = new Date(simulatedDeviceDate.getTime() + 1000);
  updateDeviceTimeInputFromSim();
}

//! 14) =-=-=-=-=-= Stop Divice Time Polling =-=-=-=-=-= !///
function stopDeviceTimePolling() {
  if (deviceTimeTimer) {
    clearInterval(deviceTimeTimer);
    deviceTimeTimer = null;
  }
}

//! 15) =-=-=-=-=-= Start Local Timer(1sec) =-=-=-=-=-= !///
async function startDeviceTimePolling() {
  stopDeviceTimePolling();
  await refreshDeviceTimeOnce();
  deviceTimeTimer = setInterval(tickDeviceTime, DEVICE_TIME_POLL_MS);
}

//! 16) =-=-=-=-=-= Enable Manual Time =-=-=-=-=-= !///
function setManualInputsEnabled(enabled) {
  const dateEl = document.getElementById("setDate");
  const timeEl = document.getElementById("setTime");
  if (dateEl) dateEl.disabled = !enabled;
  if (timeEl) timeEl.disabled = !enabled;
}

//! 17) =-=-=-=-=-= Build Local Time =-=-=-=-=-= !///
function buildLocalTimePayload() {
  const dateEl = document.getElementById("setDate");
  const timeEl = document.getElementById("setTime");
  const date = (dateEl?.value || "").trim(); // YYYY-MM-DD
  let time = (timeEl?.value || "").trim(); // HH:MM:SS

  if (!date || !time) {
    toast.error("Please enter the full date and time.");
  }

  if (!/^\d{2}:\d{2}:\d{2}$/.test(time)) {
    if (/^\d{2}:\d{2}$/.test(time)) time = `${time}:00`;
    else toast.error("The time is invalid. Correct example: 10:35:51");
  }

  return `${date} ${time}`;
}

//! 18) =-=-=-=-=-= POST Manual Time =-=-=-=-=-= !///
async function saveManualTimeIfEnabled() {
  const toggle = document.getElementById("manualTimeToggle");
  if (!toggle || !toggle.checked) return;

  const payload = buildLocalTimePayload(); // "YYYY-MM-DD HH:MM:SS"
  return apiPost(API_ENDPOINTS.localTime, { local_time: payload });
}

//! 19) =-=-=-=-=-= DOM =-=-=-=-=-= !///
document.addEventListener("DOMContentLoaded", function () {
  //! 19.1) =-=-=-=-=-= GET All Apis =-=-=-=-=-= !///
  loadTimezones();
  getTimezoneSettings();
  getNtpSettings();
  startDeviceTimePolling();

  //! 19.2) =-=-=-=-=-= Save NTP Btn =-=-=-=-=-= !///
  const saveNtpBtn = document.getElementById("saveNtp");
  if (saveNtpBtn) {
    saveNtpBtn.addEventListener("click", async () => {
      try {
        await saveNtpSettings();
        toast.success("NTP saved.");
      } catch (e) {
        toast.error("Saving NTP failed.");
        console.error("Failed to save NTP:", e);
      }
    });
  }

  //! 19.3) =-=-=-=-=-= Save Manual Time Btn =-=-=-=-=-= !///
  const saveManualBtn = document.getElementById("saveManualTime");
  if (saveManualBtn) {
    saveManualBtn.addEventListener("click", async () => {
      try {
        await saveManualTimeIfEnabled();
        toast.success("Manual Time saved.");
        setTimeout(() => window.location.reload(), 2000);
      } catch (e) {
        console.error("Failed to save manual time:", e);
        toast.error("Saving manual time failed.");
      }
    });
  }

  //! 19.4) =-=-=-=-=-= Manual Toggle =-=-=-=-=-= !///
  const manualToggle = document.getElementById("manualTimeToggle");
  if (manualToggle) {
    manualToggle.addEventListener("change", (e) => {
      setManualInputsEnabled(e.target.checked);
    });
    setManualInputsEnabled(false);
  }

  //! 19.5) =-=-=-=-=-=  Reboot Modal =-=-=-=-=-= !///
  const tzSelect = document.getElementById("timeZone");
  if (!tzSelect) return;

  let prevTimezoneValue = tzSelect.value;

  async function postTimezoneValue(tzValue) {
    if (typeof apiPost === "function" && API_ENDPOINTS?.timezone) {
      await apiPost(API_ENDPOINTS.timezone, { timezone: tzValue });
      return;
    }
    if (typeof saveTimezoneSettings === "function") {
      tzSelect.value = tzValue;
      await saveTimezoneSettings();
      return;
    }
    toast.error("No timezone POST method available.");
    throw new Error("No timezone POST method available");
  }

  tzSelect.addEventListener("change", () => {
    const pending = tzSelect.value || "Asia/Tehran";

    if (!window.RebootModal?.confirmAndReboot) {
      const ok = window.confirm(
        "This change will reboot the camera. Continue?"
      );
      if (!ok) {
        tzSelect.value = prevTimezoneValue;
        return;
      }
      tzSelect.disabled = true;
      postTimezoneValue(pending)
        .then(() => {
          prevTimezoneValue = pending;
          setTimeout(() => window.location.reload(), 300);
        })
        .catch((e) => {
          console.error(e);
          toast.error("Saving timezone failed.");
          tzSelect.value = prevTimezoneValue;
          tzSelect.disabled = false;
        });
      return;
    }

    RebootModal.confirmAndReboot({
      title: "Change Timezone",
      message: "This change will <b>reboot the camera</b>. Are you sure?",
      seconds: 15,
      lockTitle: "Rebooting…",
      lockMessage: "Camera is Rebooting, Please wait!",
      onConfirm: async () => {
        tzSelect.disabled = true;
        await postTimezoneValue(pending);
        prevTimezoneValue = pending;
      },
      onCancel: () => {
        tzSelect.value = prevTimezoneValue;
      },
    }).catch((e) => {
      console.error("Saving timezone failed:", e);
      toast.error("Saving timezone failed.");
      tzSelect.value = prevTimezoneValue;
      tzSelect.disabled = false;
    });
  });
});
