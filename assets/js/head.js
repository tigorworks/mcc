(function () {
  const head = document.head;

  function link(attrs) {
    const el = document.createElement('link');
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    head.appendChild(el);
  }

  // Google Fonts preconnect
  link({ rel: 'preconnect', href: 'https://fonts.googleapis.com' });
  link({ rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' });

  // Google Fonts
  link({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Inter:wght@400;500;600&display=swap',
  });

  // AOS CSS
  link({ rel: 'stylesheet', href: 'https://unpkg.com/aos@2.3.4/dist/aos.css' });

  // Shared styles
  link({ rel: 'stylesheet', href: 'assets/css/style.css' });
})();
