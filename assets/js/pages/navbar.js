(function () {
  const t = window.MCC?.i18n?.t ?? (k => k);

  const NAV_LINKS = [
    { href: '#home',     key: 'nav.home',    page: 'home' },
    { href: '#members',  key: 'nav.members', page: 'members' },
    // { href: '#teams',    key: 'nav.teams',   page: 'teams' },
    { href: '#faq',      key: 'nav.faq',     page: 'faq' },
  ];

  const lang = window.MCC?.i18n?.getLang?.() || 'id';

  const linksHtml = NAV_LINKS.map(({ href, key, page }) =>
    `<li><a href="${href}" data-nav-link="${page}">${t(key)}</a></li>`
  ).join('');

  const html = `
    <nav class="navbar">
      <a href="#home" class="nav-logo">
        <img src="assets/images/mcc.png" alt="MCC Logo" />
        <div class="nav-logo-text">
          MCC
          <span>Mobile Legends Corporate Championship</span>
        </div>
      </a>
      <ul class="nav-links">
        ${linksHtml}
        <li><a href="#register" class="nav-cta" data-nav-cta>${t('nav.register')}</a></li>
        <li class="lang-switcher">
          <button class="lang-btn${lang === 'id' ? ' active' : ''}" data-lang="id">ID</button>
          <span class="lang-divider">|</span>
          <button class="lang-btn${lang === 'en' ? ' active' : ''}" data-lang="en">EN</button>
        </li>
      </ul>
      <div class="nav-hamburger" role="button" aria-label="Toggle menu">
        <span></span><span></span><span></span>
      </div>
    </nav>`;

  const root = document.getElementById('nav-root');
  if (root) root.outerHTML = html;

  const navbar    = document.querySelector('.navbar');
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks  = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  });

  hamburger?.addEventListener('click', () => navLinks?.classList.toggle('open'));

  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => navLinks?.classList.remove('open'));
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.MCC?.i18n?.setLang(btn.dataset.lang);
      // Update nav link text
      document.querySelectorAll('[data-nav-link]').forEach(a => {
        const link = NAV_LINKS.find(l => l.page === a.dataset.navLink);
        if (link) a.textContent = t(link.key);
      });
      const cta = document.querySelector('[data-nav-cta]');
      if (cta) cta.textContent = t('nav.register');
    });
  });

  // Expose function to update active state (called by app.js on route change)
  window.MCC = window.MCC || {};
  window.MCC.setActiveNav = function (page) {
    document.querySelectorAll('[data-nav-link]').forEach(a => {
      a.classList.toggle('active', a.dataset.navLink === page);
    });
    const cta = document.querySelector('[data-nav-cta]');
    cta?.classList.toggle('active', page === 'register');
  };
})();
