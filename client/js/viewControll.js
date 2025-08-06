const video = document.getElementById("myVideo");
const playPauseBtn = document.getElementById("playPauseBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");
const muteUnmuteBtn = document.getElementById("muteUnmuteBtn");
const volumeSlider = document.getElementById("volumeSlider");
// const captureBtn = document.getElementById("captureBtn");
// const recordBtn = document.getElementById("recordBtn");
// const recordIndicator = document.getElementById("recordIndicator");

// === Play / Pause ===
playPauseBtn.addEventListener("click", () => {
  if (video.paused) {
    video.play();
    playPauseBtn.textContent = "Pause";
  } else {
    video.pause();
    playPauseBtn.textContent = "Play";
  }
});

// === Fullscreen ===
fullscreenBtn.addEventListener("click", () => {
  if (video.requestFullscreen) {
    video.requestFullscreen();
  } else if (video.webkitRequestFullscreen) {
    video.webkitRequestFullscreen();
  } else if (video.msRequestFullscreen) {
    video.msRequestFullscreen();
  }
});

// === Mute / Unmute و کنترل اسلایدر صدا ===
// مقدار اولیه اسلایدر را روی volume فعلی ویدئو قرار می‌دهیم
volumeSlider.value = video.volume;

muteUnmuteBtn.addEventListener("click", () => {
  if (video.muted) {
    video.muted = false;
    muteUnmuteBtn.textContent = "Mute";
    // وقتی unmute شد، مقدار اسلایدر را بر اساس volume تنظیم کن
    volumeSlider.value = video.volume;
  } else {
    video.muted = true;
    muteUnmuteBtn.textContent = "Unmute";
    // وقتی mute شد، اسلایدر را به صفر ببریم (یا مخفی نگه داریم)
    volumeSlider.value = 0;
  }
});

// وقتی اسلایدر تغییر می‌کند، مقدار volume تنظیم می‌شود
volumeSlider.addEventListener("input", () => {
  video.volume = volumeSlider.value;
  if (video.volume === 0) {
    video.muted = true;
    muteUnmuteBtn.textContent = "Unmute";
  } else {
    video.muted = false;
    muteUnmuteBtn.textContent = "Mute";
  }
});

// وقتی موس روی کانتینر Volume می‌آید، اسلایدر نمایان می‌شود (CSS این را مدیریت می‌کند)
// اما اگر ویدئو mute باشد، اجازه ندهیم اسلایدر نمایش داده شود:
document
  .querySelector(".volume-container")
  .addEventListener("mouseover", () => {
    if (video.muted) {
      volumeSlider.style.display = "none";
    } else {
      volumeSlider.style.display = "block";
    }
  });
document.querySelector(".volume-container").addEventListener("mouseout", () => {
  volumeSlider.style.display = "none";
});

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

  // همگام‌سازی دستی اسلایدر
  rangeInputs.forEach(slider => {
    slider.addEventListener('input', () => {
      syncRange(slider.value);
    });
    updateSliderBackground(); // هنگام بارگذاری اولیه
  });

  // دکمه افزایش
  increaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentVal = parseInt(rangeInputs[0].value);
      const step = parseInt(stepInputs[0].value) || 1;
      syncRange(currentVal + step);
    });
  });

  // دکمه کاهش
  decreaseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentVal = parseInt(rangeInputs[0].value);
      const step = parseInt(stepInputs[0].value) || 1;
      syncRange(currentVal - step);
    });
  });
});

