(function () {
  window.MCC = window.MCC || {};
  window.MCC.pages = window.MCC.pages || {};

  const PALETTE = [
    '#e60026','#f59e0b','#0891b2','#16a34a','#7c3aed',
    '#db2777','#0284c7','#d97706','#059669','#dc2626',
    '#0d47a1','#c2410c','#065f46','#6d28d9','#b45309',
  ];
  const PER_PAGE = 10;

  let _teams    = null;
  let _filtered = [];
  let _openId   = null;
  let _page     = 1;

  function t(key) { return window.MCC?.i18n?.t(key) ?? key; }
  function teamColor(id) { return PALETTE[(id - 1) % PALETTE.length]; }
  function totalPages() { return Math.max(1, Math.ceil(_filtered.length / PER_PAGE)); }

  /* ---- roster child row ---- */
  function rosterHtml(roster) {
    const rows = roster.map(p =>
      `<tr>
        <td class="ct-name">${p.full_name}</td>
        <td class="ct-gameid">${p.game_id}</td>
        <td class="ct-nick">${p.game_nick}</td>
      </tr>`
    ).join('');
    return `<table class="child-table">
      <thead><tr><th>Nama Lengkap</th><th>Game ID</th><th>Nama IG</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  /* ---- main table body ---- */
  function tableRows(data) {
    if (!data.length) return `<tr><td colspan="5" class="td-empty">${t('teams.no_result')}</td></tr>`;
    const start = (_page - 1) * PER_PAGE;
    const slice = data.slice(start, start + PER_PAGE);
    return slice.map(tm => {
      const color  = teamColor(tm.id);
      const isOpen = _openId === tm.id;
      return `
      <tr class="team-row${isOpen ? ' shown' : ''}" data-id="${tm.id}" style="--tc:${color}">
        <td class="td-expand"><span class="expand-icon${isOpen ? ' open' : ''}"></span></td>
        <td class="td-name">${tm.name}</td>
        <td class="td-company">${tm.company}</td>
        <td class="td-captain">${tm.captain}</td>
        <td class="td-count">${tm.roster.length} <span class="count-label">pemain</span></td>
      </tr>
      <tr class="team-detail-row${isOpen ? '' : ' hidden'}" data-for="${tm.id}">
        <td colspan="5">${rosterHtml(tm.roster)}</td>
      </tr>`;
    }).join('');
  }

  /* ---- pagination bar ---- */
  function paginationHtml() {
    const total = totalPages();
    if (total <= 1) return '';

    const WING = 2; // pages shown each side of current
    let pages = [];

    pages.push(1);
    if (_page - WING > 2) pages.push('…');
    for (let p = Math.max(2, _page - WING); p <= Math.min(total - 1, _page + WING); p++) pages.push(p);
    if (_page + WING < total - 1) pages.push('…');
    if (total > 1) pages.push(total);

    const btn = (p, label, disabled, active) =>
      `<button class="pg-btn${active ? ' pg-active' : ''}${disabled ? ' pg-disabled' : ''}"
        data-pg="${p}" ${disabled ? 'disabled' : ''}>${label}</button>`;

    const dots = `<span class="pg-dots">…</span>`;

    const items = pages.map(p =>
      p === '…' ? dots : btn(p, p, false, p === _page)
    ).join('');

    return `<div class="pagination">
      ${btn(_page - 1, '&#8592;', _page === 1, false)}
      ${items}
      ${btn(_page + 1, '&#8594;', _page === total, false)}
    </div>`;
  }

  function renderTable() {
    const tbody   = document.getElementById('teamsBody');
    const pgWrap  = document.getElementById('paginationWrap');
    const pgInfo  = document.getElementById('pgInfo');
    if (tbody)  tbody.innerHTML  = tableRows(_filtered);
    if (pgWrap) pgWrap.innerHTML = paginationHtml();
    if (pgInfo) {
      const start = Math.min((_page - 1) * PER_PAGE + 1, _filtered.length);
      const end   = Math.min(_page * PER_PAGE, _filtered.length);
      pgInfo.textContent = _filtered.length
        ? `${start}–${end} dari ${_filtered.length} tim`
        : '';
    }
    bindRowEvents();
    bindPaginationEvents();
  }

  function applyFilter() {
    if (!_teams) return;
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
    _filtered = _teams.filter(tm =>
      !q ||
      tm.name.toLowerCase().includes(q) ||
      tm.company.toLowerCase().includes(q) ||
      tm.captain.toLowerCase().includes(q) ||
      tm.roster.some(p =>
        p.full_name.toLowerCase().includes(q) ||
        p.game_nick.toLowerCase().includes(q)
      )
    );
    _page = 1; // reset to first page on new search
    const cnt = document.getElementById('resultCount');
    if (cnt) cnt.textContent = _filtered.length;
    renderTable();
  }

  function bindRowEvents() {
    document.querySelectorAll('.team-row').forEach(row => {
      row.addEventListener('click', () => {
        const id = Number(row.dataset.id);
        _openId = (_openId === id) ? null : id;
        renderTable();
      });
    });
  }

  function bindPaginationEvents() {
    document.querySelectorAll('.pg-btn:not(.pg-disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = Number(btn.dataset.pg);
        if (p >= 1 && p <= totalPages()) {
          _page   = p;
          _openId = null;
          renderTable();
          document.querySelector('.teams-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function bindFilterEvents() {
    document.getElementById('searchInput')?.addEventListener('input', applyFilter);

    const count = _teams?.length ?? 0;
    const resEl = document.getElementById('resultCount');
    if (resEl) resEl.textContent = count;
  }

  function buildPageHTML(teams) {
    const count = teams.length;
    return `
<section class="page-hero">
  <div class="hero-orb hero-orb-3" style="opacity:0.3"></div>
  <h1 data-i18n-html="teams.hero.title">Tim <span>Terdaftar</span></h1>
  <p data-i18n="teams.hero.subtitle">Daftar tim yang telah resmi terdaftar di MCC Season 1.</p>
</section>

<div class="section-inner" style="padding-top:2.5rem;padding-bottom:5rem">

  <div class="filter-bar card" data-aos="fade-up">
    <div class="search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input class="search-input" type="text" id="searchInput"
        placeholder="Cari nama tim, perusahaan, kapten, atau pemain..." />
    </div>
    <div class="filter-vdiv"></div>
    <div class="filter-count">
      <strong id="resultCount">${count}</strong>&nbsp;
      <span data-i18n="teams.filter.results">tim ditemukan</span>
    </div>
  </div>

  <div class="teams-table-wrap" data-aos="fade-up">
    <table class="teams-table">
      <thead>
        <tr>
          <th class="th-expand"></th>
          <th class="th-name">Nama Tim</th>
          <th class="th-company">Perusahaan</th>
          <th class="th-captain">Kapten</th>
          <th class="th-count">Pemain</th>
        </tr>
      </thead>
      <tbody id="teamsBody">
        ${tableRows(teams)}
      </tbody>
    </table>
  </div>

  <div class="pagination-bar">
    <span class="pg-info" id="pgInfo"></span>
    <div id="paginationWrap"></div>
  </div>

</div>`;
  }

  window.MCC.pages.teams = {
    render() {
      if (_teams) return buildPageHTML(_teams);
      return `<div class="page-loading"><div class="spinner"></div></div>`;
    },

    init() {
      if (_teams) {
        _filtered = _teams;
        _page     = 1;
        bindFilterEvents();
        renderTable();
        return;
      }

      const ctrl    = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);

      fetch('configuration/teams.json', { signal: ctrl.signal, cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          clearTimeout(timeout);
          _teams    = data;
          _filtered = data;
          _page     = 1;
          const root = document.getElementById('app-root');
          if (root) {
            root.innerHTML = buildPageHTML(data);
            window.MCC.i18n?.apply();
            if (typeof AOS !== 'undefined') AOS.refreshHard();
            bindFilterEvents();
            renderTable();
          }
        })
        .catch(err => {
          clearTimeout(timeout);
          if (err.name !== 'AbortError') console.error('[teams] fetch failed', err);
        });
    }
  };
})();
