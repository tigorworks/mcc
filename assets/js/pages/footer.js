(function () {
  const t = window.MCC?.i18n?.t ?? (k => k);

  const html = `
    <footer>
      <div class="footer-inner">
        <div class="footer-brand">
          <img src="assets/images/mcc.png" alt="MCC" />
          <p>${t('footer.desc')}</p>
        </div>
        <div class="footer-col">
          <h4>${t('footer.nav_heading')}</h4>
          <a href="#home">${t('nav.home')}</a>
          <a href="#members">${t('nav.members')}</a>
          <a href="#register">${t('nav.register')}</a>
          <!-- <a href="#teams">${t('nav.teams')}</a> -->
          <a href="#faq">${t('nav.faq')}</a>
        </div>
        <div class="footer-col">
          <h4>${t('footer.contact_heading')}</h4>
          <a href="https://wa.me/6208128136678" target="_blank" rel="noopener">💬 Tigor: 0812-8136-678</a>
          <a href="https://wa.me/6281931530992" target="_blank" rel="noopener">💬 Andre: 0819-3153-0992</a>
          <a href="https://instagram.com/mlbbcorporateclub" target="_blank" rel="noopener">📸 Instagram: @mlbbcorporateclub</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${t('footer.copyright')}</span>
        <span>${t('footer.season')}</span>
      </div>
    </footer>`;

  const root = document.getElementById('footer-root');
  if (root) root.outerHTML = html;
})();
