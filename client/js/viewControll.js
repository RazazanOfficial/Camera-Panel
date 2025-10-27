// ===== MJPEG player (IMG-based) =====
const STREAM_URL = "http://192.168.1.142/mjpeg";

const img = document.getElementById("mjpegStream");
const playPauseBtn = document.getElementById("playPauseBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const container = document.getElementById("videoContainer");

let isPlaying = true;

function bustCacheUrl(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_t=${Date.now()}`;
}

function playStream() {
  if (isPlaying) return;
  img.src = bustCacheUrl(STREAM_URL);
  isPlaying = true;
  playPauseBtn.textContent = "Pause";
}

function pauseStream() {
  if (!isPlaying) return;
  // خالی کردن src اتصال MJPEG را می‌بُرد
  img.src = "";
  isPlaying = false;
  playPauseBtn.textContent = "Play";
}

playPauseBtn.addEventListener("click", () => {
  isPlaying ? pauseStream() : playStream();
});

// Fullscreen روی کانتینر تصویر
fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    container.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
});

// تلاش مجدد در صورت خطای بارگذاری
img.addEventListener("error", () => {
  setTimeout(() => {
    if (isPlaying) img.src = bustCacheUrl(STREAM_URL);
  }, 1000);
});

// شروع اولیه با آنتی‌کش
window.addEventListener("load", () => {
  img.src = bustCacheUrl(STREAM_URL);
});

// ===== تنظیمات اسلایدرها (بدون تغییر) =====
const allGroups = [...new Set(
  Array.from(document.querySelectorAll('.adjustment-group'))
    .map(g => g.dataset.group)
)];

allGroups.forEach(groupName => {
  const rangeInputs = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .rangeSlider`);
  const stepInputs = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .stepInput`);
  const increaseBtns = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .increaseBtn`);
  const decreaseBtns = document.querySelectorAll(`.adjustment-group[data-group="${groupName}"] .decreaseBtn`);

  const syncRange = (value) => {
    value = Math.max(1, Math.min(4000, parseInt(value)));
    rangeInputs.forEach(r => r.value = value);
    updateSliderBackground();
  };

  const updateSliderBackground = () => {
    rangeInputs.forEach(slider => {
      const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
      slider.style.setProperty('--val', `${percentage}%`);
    });
  };

  rangeInputs.forEach(slider => {
    slider.addEventListener('input', () => {
      syncRange(slider.value);
    });
    updateSliderBackground();
  });

  increaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentVal = parseInt(rangeInputs[0].value);
      const step = parseInt(stepInputs[0].value) || 1;
      syncRange(currentVal + step);
    });
  });

  decreaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentVal = parseInt(rangeInputs[0].value);
      const step = parseInt(stepInputs[0].value) || 1;
      syncRange(currentVal - step);
    });
  });
});
