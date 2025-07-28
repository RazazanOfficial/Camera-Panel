//! =-=-=-=-=-= Aside Section =-=-=-=-=-= !//
// Handle main-link clicks
document.querySelectorAll('.main-link').forEach(link => {
  link.addEventListener('click', () => {
    const target = link.dataset.target;
    const submenu = document.querySelector(`[data-submenu="${target}"]`);

    document.querySelectorAll('.submenu').forEach(s => {
      if (s !== submenu) s.classList.add('d-none');
    });

    submenu.classList.toggle('d-none');

    document.querySelectorAll('.main-link').forEach(l => l.classList.remove('active'));

    link.classList.add('active');
  });
});

// Handle sub-link clicks
document.querySelectorAll('.sub-link').forEach(link => {
  link.addEventListener('click', () => {
    const targetId = link.dataset.content;

    // Hide all content boxes
    document.querySelectorAll('.content-box').forEach(box => {
      box.classList.remove('active');
    });

    // Show selected one
    const selected = document.getElementById(targetId);
    if (selected) selected.classList.add('active');

    // Mark active link
    document.querySelectorAll('.sub-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

//! =-=-=-=-=-= Image Section =-=-=-=-=-= !//
document.querySelectorAll('.global-tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab;

    // فعال‌سازی دکمه
    document.querySelectorAll('.global-tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');

    // نمایش محتوا
    document.querySelectorAll('.global-tab-content').forEach(content => {
      if (content.dataset.tabContent === tab) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
  });
});

// Toggle dropdowns
document.querySelectorAll('.dropdown-toggle-box').forEach(toggle => {
  toggle.addEventListener('click', () => {
    toggle.parentElement.classList.toggle('open');
  });
});

// Switch between Scheduled and Auto sections
document.getElementById('switchType').addEventListener('change', function () {
  const isScheduled = this.value === 'scheduled';
  document.querySelector('.scheduled-section').classList.toggle('d-none', !isScheduled);
  document.querySelector('.auto-section').classList.toggle('d-none', isScheduled);
});

// Toggle mode buttons
document.querySelectorAll('.mode-toggle .btn').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.mode-toggle .btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});
// 
document.querySelectorAll('.iris-range').forEach((range, i) => {
  const number = document.querySelectorAll('.iris-number')[i];
  range.addEventListener('input', () => number.value = range.value);
  number.addEventListener('input', () => {
    const val = Math.min(100, Math.max(0, number.value));
    number.value = val;
    range.value = val;
  });
});
document.querySelectorAll('.auto-range').forEach((range, i) => {
  const number = document.querySelectorAll('.auto-number')[i];
  range.addEventListener('input', () => number.value = range.value);
  number.addEventListener('input', () => {
    const val = Math.min(100, Math.max(0, number.value));
    number.value = val;
    range.value = val;
  });
});

