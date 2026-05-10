(function () {
  window.MCC = window.MCC || {};

  const PAGES = ['home', 'members', 'teams', 'register', 'faq'];
  const DEFAULT_PAGE = 'home';
  const _loaded = new Set();
  const _root = document.getElementById('app-root');

  function getPage() {
    const hash = location.hash.replace('#', '').trim();
    return PAGES.includes(hash) ? hash : DEFAULT_PAGE;
  }

  function navigate(page) {
    window.MCC.setActiveNav?.(page);

    const pageModule = window.MCC.pages?.[page];
    if (!pageModule) return;

    // Render
    _root.innerHTML = pageModule.render();

    // Enter animation
    _root.classList.remove('page-entering');
    void _root.offsetWidth; // reflow
    _root.classList.add('page-entering');

    // Init, AOS, i18n
    requestAnimationFrame(() => {
      pageModule.init?.();
      window.MCC.i18n?.apply();
      if (typeof AOS !== 'undefined') AOS.refreshHard();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }

  function loadPage(page, callback) {
    if (_loaded.has(page)) {
      callback();
      return;
    }
    const s = document.createElement('script');
    s.src = `assets/js/pages/${page}.js`;
    s.onload = () => { _loaded.add(page); callback(); };
    s.onerror = () => console.error(`[MCC] Failed to load page: ${page}`);
    document.head.appendChild(s);
  }

  function route() {
    const page = getPage();
    loadPage(page, () => navigate(page));
  }

  window.addEventListener('hashchange', route);

  // Initial route on DOMContentLoaded (AOS + navbar are already loaded by init.js)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', route);
  } else {
    route();
  }

  // Public navigate API (used by page modules for internal navigation)
  window.MCC.navigate = function (page) {
    location.hash = page;
  };

  window.MCC.pages = window.MCC.pages || {};
})();
