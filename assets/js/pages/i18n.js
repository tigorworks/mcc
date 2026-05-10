(function () {
  const STORAGE_KEY = 'mcc_lang';
  let _lang = localStorage.getItem(STORAGE_KEY) || 'id';
  let _dict = {};

  // Sync XHR so translations are available before any page script runs
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'configuration/i18n.json', false);
    xhr.send();
    if (xhr.status === 200) _dict = JSON.parse(xhr.responseText);
  } catch (e) {
    console.warn('[i18n] Failed to load translations', e);
  }

  function t(key) {
    return _dict[_lang]?.[key] ?? _dict['id']?.[key] ?? key;
  }

  function applyAll() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const v = t(el.dataset.i18n);
      if (v !== el.dataset.i18n) el.textContent = v;
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const v = t(el.dataset.i18nHtml);
      if (v !== el.dataset.i18nHtml) el.innerHTML = v;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const v = t(el.dataset.i18nPlaceholder);
      if (v !== el.dataset.i18nPlaceholder) el.placeholder = v;
    });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === _lang);
    });
    document.documentElement.lang = _lang;
  }

  function setLang(lang) {
    if (!_dict[lang]) return;
    _lang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyAll();
    if (typeof window.onLangChange === 'function') window.onLangChange(_lang);
  }

  window.MCC = window.MCC || {};
  window.MCC.i18n = { t, setLang, getLang: () => _lang, apply: applyAll };

  // Apply after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyAll);
  } else {
    applyAll();
  }
})();
