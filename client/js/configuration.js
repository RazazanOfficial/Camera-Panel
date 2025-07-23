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