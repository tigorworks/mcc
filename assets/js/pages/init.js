(function () {
  function loadScript(src, onload) {
    const s = document.createElement('script');
    s.src = src;
    if (onload) s.onload = onload;
    document.head.appendChild(s);
  }

  loadScript('https://unpkg.com/aos@2.3.4/dist/aos.js', function () {
    AOS.init({ duration: 600, once: true, offset: 60 });
    // Load SPA router after AOS is ready
    loadScript('assets/js/app.js');
  });

  loadScript('assets/js/navbar.js');
  loadScript('assets/js/footer.js');
})();
