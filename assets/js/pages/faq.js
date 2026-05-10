(function () {
  window.MCC = window.MCC || {};
  window.MCC.pages = window.MCC.pages || {};

  let _faqData = null;
  let _activeGroup = null;

  function t(key) { return window.MCC?.i18n?.t(key) ?? key; }
  function getLang() { return window.MCC?.i18n?.getLang?.() || 'id'; }

  function renderFaq(data) {
    const lang = getLang();
    if (!_activeGroup) _activeGroup = data[0]?.id;

    const tabs = data.map(cat => `
      <button class="faq-tab ${cat.id === _activeGroup ? 'active' : ''}" data-group="${cat.id}">
        ${cat.label[lang] || cat.label.id}
      </button>`).join('');

    const activeData = data.find(c => c.id === _activeGroup) || data[0];
    const accordion = (activeData?.questions || []).map((item, i) => `
      <div class="accordion" data-index="${i}">
        <button class="accordion-hd" aria-expanded="false">
          <span class="accordion-q">${item.q[lang] || item.q.id}</span>
          <span class="accordion-ico">＋</span>
        </button>
        <div class="accordion-body">
          <div class="accordion-ans">${item.a[lang] || item.a.id}</div>
        </div>
      </div>`).join('');

    const tabsEl = document.getElementById('faqTabs');
    const bodyEl = document.getElementById('faqBody');
    if (tabsEl) tabsEl.innerHTML = tabs;
    if (bodyEl) bodyEl.innerHTML = accordion;

    bindFaqEvents(data);
  }

  function bindFaqEvents(data) {
    document.querySelectorAll('.faq-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        _activeGroup = btn.dataset.group;
        renderFaq(data);
      });
    });

    document.querySelectorAll('.accordion-hd').forEach(hd => {
      hd.addEventListener('click', () => {
        const acc  = hd.closest('.accordion');
        const open = acc.classList.contains('open');
        // Close all
        document.querySelectorAll('.accordion').forEach(a => {
          a.classList.remove('open');
          a.querySelector('.accordion-hd')?.setAttribute('aria-expanded', 'false');
          a.querySelector('.accordion-ico').textContent = '＋';
        });
        if (!open) {
          acc.classList.add('open');
          hd.setAttribute('aria-expanded', 'true');
          hd.querySelector('.accordion-ico').textContent = '－';
        }
      });
    });
  }

  window.MCC.pages.faq = {
    render() {
      return `
<section class="page-hero">
  <div class="hero-orb hero-orb-2" style="opacity:0.35"></div>
  <h1 data-i18n-html="faq.hero.title">Pertanyaan yang Sering <span>Ditanyakan</span></h1>
  <p data-i18n="faq.hero.subtitle">Temukan jawaban atas pertanyaan umum seputar MCC Season 1.</p>
</section>

<div class="section-inner faq-wrap">
  <div class="faq-tabs-wrap" id="faqTabs" data-aos="fade-up">
    <div class="spinner-sm"></div>
  </div>
  <div class="faq-body" id="faqBody" data-aos="fade-up" data-aos-delay="80">
    <div class="spinner-sm"></div>
  </div>
</div>

<section class="cta-banner" data-aos="fade-up">
  <div class="cta-inner">
    <div class="cta-orb"></div>
    <h2 data-i18n="faq.contact.title">Masih ada pertanyaan?</h2>
    <p data-i18n="faq.contact.desc">Hubungi tim panitia kami melalui WhatsApp atau email. Kami siap membantu.</p>
    <div class="cta-actions">
      <a href="https://wa.me/6208128136678" target="_blank" rel="noopener" class="btn btn-primary" data-i18n="faq.contact.btn_wa">💬 WhatsApp Panitia</a>
      <a href="mailto:mcc@official.id" class="btn btn-outline" data-i18n="faq.contact.btn_email">📧 Email Kami</a>
    </div>
  </div>
</section>`;
    },

    init() {
      if (_faqData) { renderFaq(_faqData); return; }

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);

      fetch('configuration/faq.json', { signal: ctrl.signal, cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          clearTimeout(timeout);
          _faqData = data;
          renderFaq(data);
        })
        .catch(err => {
          clearTimeout(timeout);
          if (err.name !== 'AbortError') console.error('[faq] fetch failed', err);
        });

      window.onLangChange = () => { if (_faqData) renderFaq(_faqData); };
    }
  };
})();
