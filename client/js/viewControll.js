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

// // === Capture (اسکرین‌شات) ===
// captureBtn.addEventListener("click", () => {
//   // ابتدا یک Canvas موقت می‌سازیم
//   const canvas = document.createElement("canvas");
//   canvas.width = video.videoWidth;
//   canvas.height = video.videoHeight;
//   const ctx = canvas.getContext("2d");
//   // فریم فعلی را روی کانواس می‌کشیم
//   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//   // تبدیل به Blob
//   canvas.toBlob((blob) => {
//     // آماده کردن FormData برای ارسال
//     const formData = new FormData();
//     formData.append("screenshot", blob, "screenshot.png");
//     // ارسال به مسیر /screenShots
//     fetch("../data/ScreenShots", {
//       method: "POST",
//       body: formData,
//     })
//       .then((res) => {
//         if (res.ok) {
//           alert("Screenshot saved successfully.");
//         } else {
//           alert("Failed to save screenshot.");
//         }
//       })
//       .catch((err) => {
//         console.error(err);
//         alert("Error while saving screenshot.");
//       });
//   }, "image/png");
// });

// // === Recording (ضبط ویدئو) ===
// let mediaRecorder;
// let recordedChunks = [];

// recordBtn.addEventListener("click", () => {
//   if (recordBtn.dataset.recording !== "true") {
//     // شروع رکورد
//     recordedChunks = [];
//     const stream = video.captureStream();
//     mediaRecorder = new MediaRecorder(stream);

//     mediaRecorder.ondataavailable = (e) => {
//       if (e.data.size > 0) {
//         recordedChunks.push(e.data);
//       }
//     };

//     mediaRecorder.onstop = () => {
//       // وقتی رکورد متوقف شد، Blob را می‌سازیم و ارسال می‌کنیم
//       const blob = new Blob(recordedChunks, { type: "video/webm" });
//       const formData = new FormData();
//       formData.append("recording", blob, "recording.webm");
//       fetch("../data/Recoarding", {
//         method: "POST",
//         body: formData,
//       })
//         .then((res) => {
//           if (res.ok) {
//             alert("Recording saved successfully.");
//           } else {
//             alert("Failed to save recording.");
//           }
//         })
//         .catch((err) => {
//           console.error(err);
//           alert("Error while saving recording.");
//         });
//     };

//     mediaRecorder.start();
//     recordBtn.textContent = "Stop";
//     recordBtn.dataset.recording = "true";
//     recordIndicator.classList.add("active");
//   } else {
//     // توقف رکورد
//     mediaRecorder.stop();
//     recordBtn.textContent = "Record";
//     recordBtn.dataset.recording = "false";
//     recordIndicator.classList.remove("active");
//   }
// });

// جلوگیری از ارسال زیاد داده به API
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// ارسال درخواست (مثلاً به API یا هر چیزی)
function sendData(type, value) {
  console.log(`Sending ${type}: ${value}`);
  // اینجا می‌تونی fetch یا axios بزنی
}

// همه adjustment box‌ها را انتخاب کن
document.querySelectorAll('.adjustment-box').forEach(box => {
  const slider = box.querySelector('.range-slider');
  const stepInput = box.querySelector('.step-input');
  const decreaseBtn = box.querySelector('.decrease-btn');
  const increaseBtn = box.querySelector('.increase-btn');
  const type = box.dataset.type;

  const updateSliderBackground = () => {
    const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--val', `${percentage}%`);
  };

  const sync = debounce((val) => {
    sendData(type, val);
  }, 500); // ارسال بعد از 500ms

  const updateAll = (newValue) => {
    const value = Math.min(Math.max(newValue, parseInt(slider.min)), parseInt(slider.max));
    slider.value = value;
    stepInput.value = value;
    updateSliderBackground();
    sync(value);
  };

  // event listeners
  slider.addEventListener('input', () => {
    updateAll(parseInt(slider.value));
  });

  stepInput.addEventListener('input', () => {
    updateAll(parseInt(stepInput.value));
  });

  decreaseBtn.addEventListener('click', () => {
    const step = parseInt(stepInput.value) || 1;
    updateAll(parseInt(slider.value) - step);
  });

  increaseBtn.addEventListener('click', () => {
    const step = parseInt(stepInput.value) || 1;
    updateAll(parseInt(slider.value) + step);
  });

  // راه‌اندازی اولیه
  updateAll(parseInt(slider.value));
});
