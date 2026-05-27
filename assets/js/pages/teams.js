(function () {
  window.MCC = window.MCC || {};
  window.MCC.pages = window.MCC.pages || {};

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUJr2hGrd4cNWUR29LwiiODoB5so0KHI2qJCZDDeyKznt5dDEX87O9kPX6HLEFDY0f/exec';

  const PALETTE = [
    '#e60026','#f59e0b','#0891b2','#16a34a','#7c3aed',
    '#db2777','#0284c7','#d97706','#059669','#dc2626',
    '#0d47a1','#c2410c','#065f46','#6d28d9','#b45309',
  ];
  const PER_PAGE = 12;

  let _teams    = null;
  let _filtered = [];
  let _page     = 1;

  function t(key) { return window.MCC?.i18n?.t(key) ?? key; }
  function teamColor(idx) { return PALETTE[idx % PALETTE.length]; }
  function totalPages() { return Math.max(1, Math.ceil(_filtered.length / PER_PAGE)); }

  /* ── Render roster rows ──────────────────── */
  function rosterRows(roster) {
    return roster.map((p, i) => `
      <tr>
        <td class="tr-num">${i + 1}</td>
        <td class="tr-name">${p.full_name}</td>
        <td class="tr-id">${p.game_id}</td>
        <td class="tr-nick">${p.game_nick}</td>
      </tr>`).join('');
  }

  /* ── Render one team card ────────────────── */
  function cardHtml(tm) {
    const color = teamColor(tm.idx);
    return `
    <div class="tm-card" data-idx="${tm.idx}" style="--tc:${color}">
      <div class="tm-stripe"></div>
      <div class="tm-body">
        <div class="tm-company">${tm.company}</div>
        <div class="tm-name">${tm.name}</div>
        <div class="tm-meta">
          <span class="tm-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            ${tm.captain}
          </span>
          <span class="tm-meta-sep">·</span>
          <span class="tm-meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${tm.roster.length} pemain
          </span>
        </div>
      </div>
      <button class="tm-toggle" aria-expanded="false">
        <span class="tm-toggle-label">Lihat Roster</span>
        <svg class="tm-toggle-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="tm-roster" hidden>
        <table class="tm-rtable">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Lengkap</th>
              <th>Game ID</th>
              <th>Nickname</th>
            </tr>
          </thead>
          <tbody>${rosterRows(tm.roster)}</tbody>
        </table>
      </div>
    </div>`;
  }

  /* ── Render card grid ────────────────────── */
  function renderCards() {
    const grid   = document.getElementById('teamsGrid');
    const pgWrap = document.getElementById('paginationWrap');
    const pgInfo = document.getElementById('pgInfo');
    const cnt    = document.getElementById('resultCount');
    if (!grid) return;

    const start = (_page - 1) * PER_PAGE;
    const slice = _filtered.slice(start, start + PER_PAGE);

    if (!_filtered.length) {
      grid.innerHTML = `
        <div class="tm-empty" style="grid-column:1/-1">
          <div class="tm-empty-icon">🔍</div>
          <div>${t('teams.no_result')}</div>
        </div>`;
    } else {
      grid.innerHTML = slice.map(tm => cardHtml(tm)).join('');
      bindCardEvents();
    }

    if (cnt) cnt.textContent = _filtered.length;

    if (pgInfo) {
      const s = Math.min(start + 1, _filtered.length);
      const e = Math.min(start + PER_PAGE, _filtered.length);
      pgInfo.textContent = _filtered.length ? `${s}–${e} dari ${_filtered.length} tim` : '';
    }
    if (pgWrap) pgWrap.innerHTML = paginationHtml();
    bindPaginationEvents();
  }

  /* ── Bind card toggle events (no re-render) ── */
  function bindCardEvents() {
    document.querySelectorAll('.tm-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const card    = btn.closest('.tm-card');
        const roster  = card.querySelector('.tm-roster');
        const isOpen  = card.classList.contains('open');

        // Close all others
        document.querySelectorAll('.tm-card.open').forEach(c => {
          c.classList.remove('open');
          c.querySelector('.tm-roster').hidden = true;
          c.querySelector('.tm-toggle').setAttribute('aria-expanded', 'false');
          c.querySelector('.tm-toggle-label').textContent = 'Lihat Roster';
        });

        if (!isOpen) {
          card.classList.add('open');
          roster.hidden = false;
          btn.setAttribute('aria-expanded', 'true');
          btn.querySelector('.tm-toggle-label').textContent = 'Tutup Roster';
        }
      });
    });
  }

  /* ── Pagination ──────────────────────────── */
  function paginationHtml() {
    const total = totalPages();
    if (total <= 1) return '';
    const WING = 2;
    let pages = [1];
    if (_page - WING > 2) pages.push('…');
    for (let p = Math.max(2, _page - WING); p <= Math.min(total - 1, _page + WING); p++) pages.push(p);
    if (_page + WING < total - 1) pages.push('…');
    if (total > 1) pages.push(total);

    const btn = (p, lbl, dis, act) =>
      `<button class="pg-btn${act ? ' pg-active' : ''}${dis ? ' pg-disabled' : ''}" data-pg="${p}" ${dis ? 'disabled' : ''}>${lbl}</button>`;
    const dots = `<span class="pg-dots">…</span>`;
    const items = pages.map(p => p === '…' ? dots : btn(p, p, false, p === _page)).join('');
    return `<div class="pagination">
      ${btn(_page - 1, '&#8592;', _page === 1, false)}
      ${items}
      ${btn(_page + 1, '&#8594;', _page === total, false)}
    </div>`;
  }

  function bindPaginationEvents() {
    document.querySelectorAll('.pg-btn:not(.pg-disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = Number(btn.dataset.pg);
        if (p >= 1 && p <= totalPages()) {
          _page = p;
          renderCards();
          document.getElementById('teamsGrid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ── Filter ──────────────────────────────── */
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
    renderCards();
  }

  function bindFilterEvents() {
    document.getElementById('searchInput')?.addEventListener('input', applyFilter);
    const clr = document.getElementById('searchClear');
    clr?.addEventListener('click', () => {
      const inp = document.getElementById('searchInput');
      if (inp) { inp.value = ''; applyFilter(); inp.focus(); }
    });
  }

  /* ── Build full page HTML ────────────────── */
  function buildPageHTML(teams) {
    const totalPlayers  = teams.reduce((s, tm) => s + tm.roster.length, 0);
    const totalCompanies = new Set(teams.map(tm => tm.company)).size;

    return `
<section class="page-hero">
  <div class="hero-orb hero-orb-3" style="opacity:0.3"></div>
  <h1 data-i18n-html="teams.hero.title">Tim <span>Terdaftar</span></h1>
  <p data-i18n="teams.hero.subtitle">Daftar tim yang telah resmi terdaftar di MCC Season 1.</p>
</section>

<div class="section-inner teams-page-wrap">

  <!-- Stats -->
  <div class="tm-stats" data-aos="fade-up">
    <div class="tm-stat">
      <span class="tm-stat-val">${teams.length}</span>
      <span class="tm-stat-lbl">Tim Terdaftar</span>
    </div>
    <div class="tm-stat-sep"></div>
    <div class="tm-stat">
      <span class="tm-stat-val">${totalCompanies}</span>
      <span class="tm-stat-lbl">Perusahaan</span>
    </div>
    <div class="tm-stat-sep"></div>
    <div class="tm-stat">
      <span class="tm-stat-val">${totalPlayers}</span>
      <span class="tm-stat-lbl">Total Pemain</span>
    </div>
  </div>

  <!-- Search -->
  <div class="filter-bar card" data-aos="fade-up">
    <div class="search-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input class="search-input" type="text" id="searchInput"
        placeholder="${t('teams.filter.placeholder') || 'Cari nama tim, perusahaan, kapten, atau pemain...'}" />
      <button id="searchClear" class="search-clear" title="Hapus pencarian">✕</button>
    </div>
    <div class="filter-vdiv"></div>
    <div class="filter-count">
      <strong id="resultCount">${teams.length}</strong>&nbsp;
      <span data-i18n="teams.filter.results">tim ditemukan</span>
    </div>
  </div>

  <!-- Cards -->
  <div class="teams-grid" id="teamsGrid" data-aos="fade-up">
    ${teams.length ? teams.slice(0, PER_PAGE).map(tm => cardHtml(tm)).join('') : `
      <div class="tm-empty" style="grid-column:1/-1">
        <div class="tm-empty-icon">📭</div>
        <div>Belum ada tim yang terdaftar.</div>
      </div>`}
  </div>

  <!-- Pagination -->
  <div class="pagination-bar">
    <span class="pg-info" id="pgInfo">${teams.length ? `1–${Math.min(PER_PAGE, teams.length)} dari ${teams.length} tim` : ''}</span>
    <div id="paginationWrap">${paginationHtml()}</div>
  </div>

</div>`;
  }

  /* ── Public API ──────────────────────────── */
  window.MCC.pages.teams = {
    render() {
      if (_teams) return buildPageHTML(_teams);
      return `<div class="page-loading"><div class="spinner"></div></div>`;
    },

    init() {
      if (_teams) {
        _filtered = _teams;
        _page = 1;
        bindFilterEvents();
        bindCardEvents();
        return;
      }

      const ctrl    = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 15000);

      fetch(SCRIPT_URL + '?action=getTeams&t=' + Date.now(), { signal: ctrl.signal, redirect: 'follow' })
        .then(r => r.json())
        .then(json => {
          clearTimeout(timeout);
          if (!json.ok || !Array.isArray(json.teams)) throw new Error(json.error || 'Format tidak dikenali.');

          /* Petakan GAS → internal format; gunakan index (idx) sebagai ID unik */
          const data = json.teams.map((tm, i) => ({
            idx:     i,                                              // ← selalu unik
            name:    tm.name || tm.team_name || tm.nama_tim || '—',
            company: tm.company || tm.perusahaan || tm.company_name || '—',
            captain: tm.captain_name || tm.kapten || '—',
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
            bindCardEvents();
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
              <div style="font-size:2.5rem;margin-bottom:1rem">⚠️</div>
              <div>Gagal memuat data tim. Silakan coba lagi nanti.</div>
            </div>`;
        });
    }
  };
})();
