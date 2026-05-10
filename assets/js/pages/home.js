(function () {
  window.MCC = window.MCC || {};
  window.MCC.pages = window.MCC.pages || {};

  window.MCC.pages.home = {
    render() {
      return `
<section class="hero">
  <div class="hero-bg">
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-orb hero-orb-3"></div>
    <div class="hero-grid"></div>
  </div>
  <div class="hero-content">
    <div class="badge-season" data-i18n="index.hero.badge">Season 1 — 2026</div>
    <img src="assets/images/mcc.png" alt="MCC" class="hero-logo" />
    <p class="hero-sub" data-i18n-html="index.hero.tagline">Turnamen Mobile Legends antar perusahaan &amp; korporat.<br/>Buktikan dominasi tim Anda di arena tertinggi.</p>
    <div class="hero-actions">
      <a href="#register" class="btn btn-primary" data-i18n="index.hero.btn_register">Daftar Tim</a>
      <a href="#members" class="btn btn-outline" data-i18n="index.hero.btn_learn">Pelajari Lebih</a>
    </div>
    <div class="hero-scroll">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="7 13 12 18 17 13"/><polyline points="7 6 12 11 17 6"/></svg>
      <span data-i18n="index.hero.scroll">Scroll</span>
    </div>
  </div>
</section>

<section class="stats-strip" data-aos="fade-up">
  <div class="stat-item">
    <div class="stat-num">39</div>
    <div class="stat-lbl" data-i18n="index.stats.slots">Slot Tim</div>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <div class="stat-num">200+</div>
    <div class="stat-lbl" data-i18n="index.stats.participants">Peserta</div>
  </div>
  <div class="stat-divider"></div>
  <div class="stat-item">
    <div class="stat-num">6</div>
    <div class="stat-lbl" data-i18n="index.stats.weeks">Minggu Kompetisi</div>
  </div>
</section>

<section class="section about-section" data-aos="fade-up">
  <div class="section-inner">
    <div class="section-label" data-i18n-html="index.about.title">Tentang <span>MCC</span></div>
    <p class="section-sub" data-i18n="index.about.subtitle">Mobile Legends Corporate Championship (MCC) adalah turnamen Mobile Legends: Bang Bang yang diperuntukkan bagi tim-tim dari lingkungan perusahaan dan korporat.</p>
    <div class="about-grid">
      <div class="card" data-aos="fade-up" data-aos-delay="0">
        <div class="card-icon">🏆</div>
        <h3 data-i18n="index.about.item1.title">Kompetisi Resmi</h3>
        <p data-i18n="index.about.item1.desc">Format turnamen terstruktur dengan regulasi jelas dan wasit resmi setiap pertandingan.</p>
      </div>
      <div class="card" data-aos="fade-up" data-aos-delay="80">
        <div class="card-icon">🏢</div>
        <h3 data-i18n="index.about.item2.title">Khusus Korporat</h3>
        <p data-i18n="index.about.item2.desc">Hanya tim dari perusahaan/korporat yang dapat mendaftar. Satu perusahaan dapat menurunkan maksimal 2 tim.</p>
      </div>
      <div class="card" data-aos="fade-up" data-aos-delay="160">
        <div class="card-icon">⚔️</div>
        <h3 data-i18n="index.about.item3.title">Format Kompetitif</h3>
        <p data-i18n="index.about.item3.desc">Fase grup (round-robin) dilanjutkan dengan eliminasi single bracket hingga Grand Final.</p>
      </div>
    </div>
  </div>
</section>

<section class="cta-banner" data-aos="fade-up">
  <div class="cta-inner">
    <div class="cta-orb"></div>
    <h2 data-i18n="index.cta.title">Siap Bertanding?</h2>
    <p data-i18n="index.cta.desc">Daftarkan tim korporat Anda sekarang sebelum slot penuh. Hanya tersedia 32 slot untuk Season 1.</p>
    <a href="#register" class="btn btn-primary" data-i18n-html="index.cta.btn">Daftar Sekarang &rarr;</a>
  </div>
</section>`;
    },

    init() {}
  };
})();
