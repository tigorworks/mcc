(function () {
  window.MCC = window.MCC || {};
  window.MCC.pages = window.MCC.pages || {};

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUJr2hGrd4cNWUR29LwiiODoB5so0KHI2qJCZDDeyKznt5dDEX87O9kPX6HLEFDY0f/exec';

  const PALETTE = [
    '#e60026','#f59e0b','#0891b2','#16a34a','#7c3aed',
    '#db2777','#0284c7','#d97706','#059669','#dc2626',
    '#0d47a1','#c2410c','#065f46','#6d28d9','#b45309',
  ];
  const PER_PAGE = 10;

  let _teams    = null;
  let _filtered = [];
  let _openIdx  = null;   // gunakan idx (array index) — selalu unik
  let _page     = 1;

  function t(key) { return window.MCC?.i18n?.t(key) ?? key; }
  function teamColor(idx) { return PALETTE[idx % PALETTE.length]; }
  function totalPages() { return Math.max(1, Math.ceil(_filtered.length / PER_PAGE)); }

  /* ── Roster child table ─────────────────── */
  function rosterHtml(roster) {
    const rows = roster.map(p => `
      <tr>
        <td class="ct-name">${p.full_name}</td>
        <td class="ct-gameid">${p.game_id}</td>
        <td class="ct-nick">${p.game_nick}</td>
      </tr>`).join('');
    return `<div class="child-table-wrap"><table class="child-table">
      <thead><tr>
        <th data-i18n="teams.table.full_name">Nama Lengkap</th>
        <th data-i18n="teams.table.game_id">Game ID</th>
        <th data-i18n="teams.table.game_nick">Nama IG</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
  }

  /* ── Main table body ────────────────────── */
  function tableRows(data) {
    if (!data.length) return `<tr><td colspan="5" class="td-empty">${t('teams.no_result')}</td></tr>`;
    const start = (_page - 1) * PER_PAGE;
    const slice = data.slice(start, start + PER_PAGE);
    return slice.map(tm => {
      const color  = teamColor(tm.idx);
      const isOpen = _openIdx === tm.idx;
      return `
      <tr class="team-row${isOpen ? ' shown' : ''}" data-idx="${tm.idx}" style="--tc:${color}">
        <td class="td-expand"><span class="expand-icon${isOpen ? ' open' : ''}"></span></td>
        <td class="td-name">${tm.name}</td>
        <td class="td-company">${tm.company}</td>
        <td class="td-captain">${tm.captain}</td>
        <td class="td-count">${tm.roster.length} <span class="count-label">${t('teams.table.player_count')}</span></td>
      </tr>
      <tr class="team-detail-row${isOpen ? '' : ' hidden'}" data-for="${tm.idx}">
        <td colspan="5">${rosterHtml(tm.roster)}</td>
      </tr>`;
    }).join('');
  }

  /* ── Pagination ─────────────────────────── */
  function paginationHtml() {
    const total = totalPages();
    if (total <= 1) return '';
    const WING = 2;
    let pages = [1];
    if (_page - WING > 2) pages.push('…');
    for (let p = Math.max(2, _page - WING); p <= Math.min(total - 1, _page + WING); p++) pages.push(p);
    if (_page + WING < total - 1) pages.push('…');
    if (total > 1) pages.push(total);

    const btn = (p, label, disabled, active) =>
      `<button class="pg-btn${active ? ' pg-active' : ''}${disabled ? ' pg-disabled' : ''}"
        data-pg="${p}" ${disabled ? 'disabled' : ''}>${label}</button>`;
    const dots = `<span class="pg-dots">…</span>`;
    const items = pages.map(p => p === '…' ? dots : btn(p, p, false, p === _page)).join('');
    return `<div class="pagination">
      ${btn(_page - 1, '&#8592;', _page === 1, false)}
      ${items}
      ${btn(_page + 1, '&#8594;', _page === total, false)}
    </div>`;
  }

  /* ── Render table ───────────────────────── */
  function renderTable() {
    const tbody  = document.getElementById('teamsBody');
    const pgWrap = document.getElementById('paginationWrap');
    const pgInfo = document.getElementById('pgInfo');
    if (tbody)  tbody.innerHTML  = tableRows(_filtered);
    if (pgWrap) pgWrap.innerHTML = paginationHtml();
    if (pgInfo) {
      const start = Math.min((_page - 1) * PER_PAGE + 1, _filtered.length);
      const end   = Math.min(_page * PER_PAGE, _filtered.length);
      pgInfo.textContent = _filtered.length ? `${start}–${end} ${t('teams.pagination.of')} ${_filtered.length} ${t('teams.pagination.teams')}` : '';
    }
    bindRowEvents();
    bindPaginationEvents();
  }

  /* ── Filter ─────────────────────────────── */
  function applyFilter() {
    if (!_teams) return;
    const q = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
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
    _page = 1;
    const cnt = document.getElementById('resultCount');
    if (cnt) cnt.textContent = _filtered.length;
    renderTable();
  }

  /* ── Bind events ────────────────────────── */
  function bindRowEvents() {
    document.querySelectorAll('.team-row').forEach(row => {
      row.addEventListener('click', () => {
        const idx = Number(row.dataset.idx);
        _openIdx = (_openIdx === idx) ? null : idx;
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
          _openIdx = null;
          renderTable();
          document.querySelector('.teams-table-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  function bindFilterEvents() {
    document.getElementById('searchInput')?.addEventListener('input', applyFilter);
    document.getElementById('searchClear')?.addEventListener('click', () => {
      const inp = document.getElementById('searchInput');
      if (inp) { inp.value = ''; applyFilter(); inp.focus(); }
    });
    const resEl = document.getElementById('resultCount');
    if (resEl) resEl.textContent = _teams?.length ?? 0;
  }

  /* ── Build page HTML ────────────────────── */
  function buildPageHTML(teams) {
    const count         = teams.length;
    const totalCompanies = new Set(teams.map(tm => tm.company)).size;
    const totalPlayers  = teams.reduce((s, tm) => s + tm.roster.length, 0);

    return `
<section class="page-hero">
  <div class="hero-orb hero-orb-3" style="opacity:0.3"></div>
  <h1 data-i18n-html="teams.hero.title">Tim <span>Terdaftar</span></h1>
  <p data-i18n="teams.hero.subtitle">Daftar tim yang telah resmi terdaftar di MCC Season 1.</p>
</section>

<div class="section-inner" style="padding-top:2.5rem;padding-bottom:5rem">

  <!-- Stats -->
  <div class="teams-stat-row" data-aos="fade-up">
    <div class="teams-stat-card">
      <div class="teams-stat-val">${count}</div>
      <div class="teams-stat-lbl" data-i18n="teams.stat.total_teams">Total Tim</div>
    </div>
    <div class="teams-stat-card">
      <div class="teams-stat-val">${totalCompanies}</div>
      <div class="teams-stat-lbl" data-i18n="teams.stat.companies">Perusahaan</div>
    </div>
    <div class="teams-stat-card">
      <div class="teams-stat-val">${totalPlayers}</div>
      <div class="teams-stat-lbl" data-i18n="teams.stat.total_players">Total Pemain</div>
    </div>
  </div>

  <div class="filter-bar card" data-aos="fade-up">
    <div class="search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input class="search-input" type="text" id="searchInput"
        data-i18n-placeholder="teams.filter.search_placeholder"
        placeholder="Cari nama tim, perusahaan, kapten, atau pemain..." />
      <button id="searchClear" class="search-clear" title="${t('teams.filter.clear')}">✕</button>
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
          <th class="th-name" data-i18n="teams.table.team_name">Nama Tim</th>
          <th class="th-company" data-i18n="teams.table.company">Perusahaan</th>
          <th class="th-captain" data-i18n="teams.table.captain">Kapten</th>
          <th class="th-count" data-i18n="teams.table.players">Pemain</th>
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

  /* ── Public API ─────────────────────────── */
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
      const timeout = setTimeout(() => ctrl.abort(), 15000);

      fetch(SCRIPT_URL + '?action=getTeams&t=' + Date.now(), { signal: ctrl.signal, redirect: 'follow' })
        .then(r => r.json())
        .then(json => {
          clearTimeout(timeout);
          if (!json.ok || !Array.isArray(json.teams)) throw new Error(json.error || 'Format tidak dikenali.');

          /* Petakan GAS → format internal; idx = index array (selalu unik) */
          const data = json.teams.map((tm, i) => ({
            idx:     i,
            name:    tm.name || tm.team_name || tm.nama_tim || '—',
            company: tm.company || tm.perusahaan || tm.company_name || '—',
            captain: tm.captain || tm.captain_name || tm.kapten || '—',
            roster:  (tm.players || []).map(p => ({
              full_name: p.name || p.full_name || '—',
              game_id:   p.game_id || '—',
              game_nick: p.game_nick || p.nickname || '—'
            }))
          }));

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
          const root = document.getElementById('app-root');
          if (root) root.innerHTML = `
            <section class="page-hero">
              <h1 data-i18n-html="teams.hero.title">Tim <span>Terdaftar</span></h1>
            </section>
            <div class="section-inner" style="padding:5rem 0;text-align:center;color:var(--text-dim)">
              <div style="font-size:2rem;margin-bottom:1rem">⚠️</div>
              <div data-i18n="teams.error.load">Gagal memuat data tim. Silakan coba lagi nanti.</div>
            </div>`;
        });
    }
  };
})();
