(function () {
  window.MCC = window.MCC || {};
  window.MCC.pages = window.MCC.pages || {};

  // UI colors keyed by member id — not stored in JSON
  const MEMBER_COLORS = {
    ojk:      '#1e40af',
    antam:    '#1565c0',
    danamon:  '#0891b2',
    bankdki:  '#dc2626',
    mandiri:  '#003087',
    ocbc:     '#c8191c',
    permata:  '#1e3a8a',
    bsi:      '#059669',
    btn:      '#1d4ed8',
    mansek:   '#0d47a1',
    pegadaian:'#16a34a',
    pln:      '#f59e0b',
    rintis:   '#f97316',
  };

  let _members = null;

  function t(key) { return window.MCC?.i18n?.t(key) ?? key; }
  function getLang() { return window.MCC?.i18n?.getLang?.() || 'id'; }

  function renderCards(members) {
    const lang = getLang();
    return members.map((m, i) => {
      const color = MEMBER_COLORS[m.id] || '#e60026';
      return `
      <div class="member-card card" data-aos="fade-up" data-aos-delay="${(i % 4) * 60}" style="--tc:${color}">
        <div class="mc-accent"></div>
        <div class="mc-body">
          <div class="mc-logo-wrap">
            ${m.logo
              ? `<img class="mc-logo-img" src="${m.logo}" alt="${m.name}" loading="lazy"
                   onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
              : ''}
            <div class="mc-logo-fallback" ${m.logo ? 'style="display:none"' : ''}>${m.abbr}</div>
          </div>
          <div class="mc-info">
            <div class="mc-name">${m.name}</div>
            <div class="mc-industry">${m.industry[lang] || m.industry.id}</div>
            <div class="mc-city">📍 ${m.city}</div>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderPage(members) {
    const totalTeams = members.reduce((s, m) => s + m.teams, 0);
    const cities     = new Set(members.map(m => m.city)).size;

    return `
<section class="page-hero">
  <div class="hero-orb hero-orb-1" style="opacity:0.3"></div>
  <div class="hero-orb hero-orb-2" style="opacity:0.22"></div>
  <h1 data-i18n-html="members.hero.title">Member <span>Turnamen</span></h1>
  <p data-i18n="members.hero.subtitle">Perusahaan-perusahaan yang telah bergabung menjadi member MCC Season 1.</p>
</section>


<section class="section">
  <div class="section-inner">
    <div class="section-label" data-i18n-html="members.list.title">Daftar <span>Member</span></div>
    <p class="section-sub" data-i18n="members.list.subtitle">Perusahaan yang telah resmi tergabung dalam MCC Season 1.</p>
    <div class="members-grid" id="membersGrid">
      ${renderCards(members)}
    </div>
  </div>
</section>

<section class="cta-banner" data-aos="fade-up">
  <div class="cta-inner">
    <div class="cta-orb"></div>
    <div class="section-tag" data-i18n="members.join.label">Bergabung Sekarang</div>
    <h2 data-i18n-html="members.join.title">Daftarkan Perusahaan <span>Anda</span></h2>
    <p data-i18n="members.join.desc">Ingin perusahaan Anda menjadi member MCC Season 1? Hubungi panitia kami melalui WhatsApp untuk informasi pendaftaran membership.</p>
    <div class="cta-actions">
      <a href="https://wa.me/6208128136678" target="_blank" rel="noopener" class="btn btn-primary">💬 Tigor: 0812-8136-678</a>
      <a href="https://wa.me/6281931530992" target="_blank" rel="noopener" class="btn btn-outline">💬 Andre: 0819-3153-0992</a>
    </div>
  </div>
</section>`;
  }

  window.MCC.pages.members = {
    render() {
      if (_members) return renderPage(_members);
      return `<div class="page-loading"><div class="spinner"></div></div>`;
    },

    init() {
      if (_members) {
        window.onLangChange = () => {
          const grid = document.getElementById('membersGrid');
          if (grid) { grid.innerHTML = renderCards(_members); window.MCC.i18n?.apply(); }
        };
        return;
      }

      const ctrl    = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);

      fetch('configuration/members.json', { signal: ctrl.signal, cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          clearTimeout(timeout);
          _members = data;
          const root = document.getElementById('app-root');
          if (root) {
            root.innerHTML = renderPage(data);
            window.MCC.i18n?.apply();
            if (typeof AOS !== 'undefined') AOS.refreshHard();
          }
        })
        .catch(err => {
          clearTimeout(timeout);
          if (err.name !== 'AbortError') console.error('[members] fetch failed', err);
        });

      window.onLangChange = () => {
        if (!_members) return;
        const grid = document.getElementById('membersGrid');
        if (grid) { grid.innerHTML = renderCards(_members); window.MCC.i18n?.apply(); }
      };
    }
  };
})();
