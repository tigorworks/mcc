(function () {
  window.MCC = window.MCC || {};
  window.MCC.pages = window.MCC.pages || {};

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwD8YJxC51yJOeag3fGUSoxM9JnQTtJvzIdPsjBA8RFU9KasfPYPkxclwevxht2jZYI/exec';
  const TEAM_FEE = 500000; // Biaya pendaftaran per tim (Rupiah) 

  let _members = null;
  let _step = 1;
  let _submittedAt = null;
  let _data = {
    company: '',
    pic_name: '',
    pic_wa: '',
    berkas_file: null,
    payment_proof_file: null,
    teams: [
      { name: '', logo_file: null, captain_name: '', captain_wa: '', players: [], enabled: true },
      { name: '', logo_file: null, captain_name: '', captain_wa: '', players: [], enabled: false },
      { name: '', logo_file: null, captain_name: '', captain_wa: '', players: [], enabled: false }
    ]
  };

  function t(key) { return window.MCC?.i18n?.t(key) ?? key; }
  function getLang() { return window.MCC?.i18n?.getLang?.() || 'id'; }

  function formatRupiah(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  function registeredTeams() {
    return _data.teams.filter(tm => tm.enabled && tm.name && tm.name.trim() !== '');
  }

  function renderStepBar(step) {
    const steps = [
      { num: 1, key: 'register.step.1' },
      { num: 2, key: 'register.step.2' },
      { num: 3, key: 'register.step.3' },
      { num: 4, key: 'register.step.4' },
      { num: 5, key: 'register.step.5' },
      { num: 6, key: 'register.step.6' }
    ];

    return `<div class="fstep-bar">
      ${steps.map((s) => {
        const isDone = step > s.num;
        const isActive = step === s.num;
        return `
        <div class="fstep ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}">
          <div class="fstep-num">${s.num}</div>
          <div class="fstep-lbl">${t(s.key)}</div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function renderPageHero() {
    return `
    <section class="page-hero">
      <div class="hero-orb hero-orb-3" style="opacity:0.3"></div>
      <h1 data-i18n-html="register.hero.title">Daftar <span>Tim</span></h1>
      <p data-i18n="register.hero.subtitle">Isi form berikut dengan data yang valid. Pastikan seluruh data anggota tim sudah benar sebelum submit.</p>
    </section>`;
  }

  function stepHtml1(members) {
    return `
    ${renderPageHero()}
    <div class="section-inner reg-wrap">
      ${renderStepBar(_step)}
      <form id="regForm1" class="reg-form">
        <div class="fcard">
          <h3 style="margin-top:0" data-i18n="register.section.company">Informasi Perusahaan</h3>
          <div class="fgrid">
            <div class="fgroup">
              <label class="fi-label" data-i18n="register.label.company">Nama Perusahaan *</label>
              <select name="company" class="fs" required>
                <option value="" data-i18n="register.placeholder.company">-- Pilih Perusahaan --</option>
                ${members.map(m => `<option value="${m.name}">${m.name}</option>`).join('')}
              </select>
            </div>
            <div class="fgroup">
              <label class="fi-label" data-i18n="register.label.pic_name">Nama PIC / Manager *</label>
              <input type="text" name="pic_name" class="fi" required />
            </div>
            <div class="fgroup">
              <label class="fi-label" data-i18n="register.label.pic_wa">WhatsApp PIC / Manager *</label>
              <input type="tel" name="pic_wa" class="fi" data-i18n-placeholder="register.placeholder.pic_wa" placeholder="628..." required />
            </div>
            <div class="fgroup">
              <label class="fi-label" data-i18n="register.label.berkas">Berkas Tim Terdaftar *</label>
              <input type="file" name="berkas_file" class="fi" accept=".pdf,.doc,.docx" required />
              <small style="color:var(--text-dim);margin-top:0.5rem;display:block" data-i18n="register.helper.berkas">Maks 15MB, format: PDF/DOC/DOCX</small>
              <div class="file-error" style="color:#e60026;font-size:0.85rem;margin-top:0.5rem;display:none"></div>
            </div>
          </div>
        </div>
      </form>
      <div class="fnav">
        <button type="button" class="btn btn-outline" onclick="window.MCC.pages.register.goBack()" data-i18n="register.btn.cancel">Batal</button>
        <button type="button" class="btn btn-primary" onclick="window.MCC.pages.register.nextStep()" data-i18n="register.btn.continue">Lanjut</button>
      </div>
    </div>`;
  }

  function playerRowsHtml(teamIndex) {
    const team = _data.teams[teamIndex];
    const playerCount = team.players.length;

    let html = '<div class="fgrid-3" style="margin-top:1rem">';

    for (let i = 0; i < Math.max(5, playerCount); i++) {
      const player = team.players[i] || { name: '', game_id: '', game_nick: '' };
      const isExtra = i >= 5;

      html += `
      <div class="fgroup">
        <label class="fi-label">${t('register.label.player')} ${i + 1} ${!isExtra ? '*' : ''}</label>
        <input type="text" data-player="${i}" data-field="name" class="fi player-input"
               value="${player.name || ''}" placeholder="Nama Pemain" />
      </div>
      <div class="fgroup">
        <label class="fi-label">${t('register.label.game_id')} ${!isExtra ? '*' : ''}</label>
        <input type="text" data-player="${i}" data-field="game_id" class="fi player-input"
               value="${player.game_id || ''}" placeholder="123456" />
      </div>
      <div class="fgroup">
        <label class="fi-label">${t('register.label.game_nick')} ${!isExtra ? '*' : ''}</label>
        <div style="display:flex;gap:0.5rem;align-items:flex-end">
          <input type="text" data-player="${i}" data-field="game_nick" class="fi player-input"
                 value="${player.game_nick || ''}" placeholder="Username" style="flex:1" />
          ${isExtra ? `<button type="button" class="btn btn-red-outline" style="padding:0.5rem 0.75rem;font-size:0.75rem" onclick="window.MCC.pages.register.removePlayer(${teamIndex},${i})">Hapus</button>` : ''}
        </div>
      </div>`;
    }

    html += '</div>';

    if (playerCount < 7) {
      html += `<button type="button" class="btn btn-outline" style="margin-top:1rem" onclick="window.MCC.pages.register.addPlayer(${teamIndex})">+ Tambah Pemain</button>`;
    }

    return html;
  }

  function stepHtmlTeam(teamIndex) {
    const teamNum = teamIndex + 1;
    const team = _data.teams[teamIndex];
    const isOptional = teamIndex >= 1;
    const isEnabled = !isOptional || team.enabled;

    return `
    ${renderPageHero()}
    <div class="section-inner reg-wrap">
      ${renderStepBar(_step)}
      <form id="regForm${_step}" class="reg-form">
        <div class="fcard">
          <h3 style="margin-top:0">${t('register.section.team')} ${teamNum}</h3>
          ${isOptional ? `
          <label class="fcheck-team" for="teamEnabled${teamIndex}">
            <div class="toggle-switch">
              <input type="checkbox" id="teamEnabled${teamIndex}"
                     ${team.enabled ? 'checked' : ''}
                     onchange="window.MCC.pages.register.toggleTeam(${teamIndex}, this.checked)" />
              <span class="toggle-slider"></span>
            </div>
            <div class="toggle-text">
              <span class="toggle-title">Daftarkan Tim ${teamNum}</span>
              <span class="toggle-desc">Aktifkan untuk mendaftarkan tim ini</span>
            </div>
          </label>
          <div id="teamFields${teamIndex}" style="${team.enabled ? '' : 'display:none'}">` : ''}
          <div class="fgrid">
            <div class="fgroup">
              <label class="fi-label">Nama Tim *</label>
              <input type="text" name="team_name" class="fi" value="${team.name || ''}" ${isEnabled ? 'required' : ''} />
            </div>
            <div class="fgroup">
              <label class="fi-label">Nama Kapten *</label>
              <input type="text" name="captain_name" class="fi" value="${team.captain_name || ''}" ${isEnabled ? 'required' : ''} />
            </div>
            <div class="fgroup">
              <label class="fi-label">WhatsApp Kapten *</label>
              <input type="tel" name="captain_wa" class="fi" value="${team.captain_wa || ''}" placeholder="628..." ${isEnabled ? 'required' : ''} />
            </div>
            <div class="fgroup">
              <label class="fi-label">Logo Tim (Gambar) *</label>
              <input type="file" name="logo_file" class="fi" accept="image/*" ${isEnabled && !team.logo_file ? 'required' : ''} />
              <small style="color:var(--text-dim);margin-top:0.5rem;display:block">Format: JPG, PNG, SVG</small>
            </div>
          </div>
          ${isOptional ? '</div>' : ''}
        </div>

        <div ${isOptional ? `id="teamPlayersCard${teamIndex}" style="${team.enabled ? '' : 'display:none'}"` : ''}>
          <div class="fcard">
            <h3 data-i18n="register.section.players">Daftar Pemain</h3>
            <small style="color:var(--text-dim)" data-i18n="register.helper.players">Minimal 5 pemain wajib diisi, maksimal 7 pemain</small>
            ${playerRowsHtml(teamIndex)}
          </div>
        </div>
      </form>
      <div class="fnav">
        <button type="button" class="btn btn-outline" onclick="window.MCC.pages.register.goBack()" data-i18n="register.btn.back">Kembali</button>
        <button type="button" class="btn btn-primary" onclick="window.MCC.pages.register.nextStep()" data-i18n="register.btn.continue">Lanjut</button>
      </div>
    </div>`;
  }

  function stepHtml5() {
    const count = Math.max(1, registeredTeams().length);
    const total = count * TEAM_FEE;

    return `
    ${renderPageHero()}
    <div class="section-inner reg-wrap">
      ${renderStepBar(_step)}
      <div class="fcard" style="text-align:center">
        <h3 style="margin-top:0">Pembayaran</h3>
        <p style="color:var(--text-dim);margin-bottom:1.5rem">Scan QRIS di bawah untuk melakukan pembayaran, kemudian upload bukti pembayaran.</p>

        <div style="background:white;display:inline-block;padding:1rem;border-radius:12px;margin-bottom:1.5rem">
          <img src="assets/images/qris.jpeg" alt="QRIS Pembayaran" style="width:1080px;height:1080px;object-fit:contain;display:block" />
        </div>

        <div style="background:rgba(230,0,38,0.08);border:1px solid rgba(230,0,38,0.3);border-radius:10px;padding:1.25rem;margin-bottom:1.5rem">
          <div style="font-size:0.9rem;color:var(--text-dim);margin-bottom:0.4rem">Total Tim Terdaftar: <strong style="color:var(--text)">${count} tim</strong></div>
          <div style="font-size:1.5rem;font-weight:700;color:var(--primary)">${formatRupiah(total)}</div>
          <div style="font-size:0.8rem;color:var(--text-dim);margin-top:0.3rem">${formatRupiah(TEAM_FEE)} × ${count} tim</div>
        </div>
      </div>

      <form id="regForm5" class="reg-form">
        <div class="fcard">
          <div class="fgroup">
            <label class="fi-label">Upload Bukti Pembayaran *</label>
            <input type="file" name="payment_proof_file" class="fi" accept="image/*,.pdf" required />
            <small style="color:var(--text-dim);margin-top:0.5rem;display:block">Format: JPG, PNG, PDF. Maks 10MB.</small>
            <div class="file-error" style="color:#e60026;font-size:0.85rem;margin-top:0.5rem;display:none"></div>
          </div>
        </div>
      </form>

      <div class="fnav">
        <button type="button" class="btn btn-outline" onclick="window.MCC.pages.register.goBack()" data-i18n="register.btn.back">Kembali</button>
        <button type="button" class="btn btn-primary" onclick="window.MCC.pages.register.nextStep()" data-i18n="register.btn.continue">Lanjut</button>
      </div>
    </div>`;
  }

  function stepHtml6() {
    const activeTeams = _data.teams.filter(tm => tm.name && tm.name.trim() !== '');
    const total = activeTeams.length * TEAM_FEE;

    const summary = `
    ${renderPageHero()}
    <div class="section-inner reg-wrap">
      ${renderStepBar(_step)}
      <div class="fcard">
        <h3 style="margin-top:0" data-i18n="register.section.summary">Ringkasan Pendaftaran</h3>
        <div class="confirm-grid">
          <div class="confirm-row">
            <span class="confirm-label" data-i18n="register.confirm.company">Perusahaan</span>
            <span class="confirm-value">${_data.company}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label" data-i18n="register.confirm.pic">PIC / Manager</span>
            <span class="confirm-value">${_data.pic_name}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label" data-i18n="register.confirm.pic_wa">WhatsApp PIC</span>
            <span class="confirm-value">${_data.pic_wa}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">Total Pembayaran</span>
            <span class="confirm-value" style="color:var(--primary);font-weight:700">${formatRupiah(total)}</span>
          </div>
          <div class="confirm-row">
            <span class="confirm-label">Bukti Pembayaran</span>
            <span class="confirm-value">${_data.payment_proof_file ? _data.payment_proof_file.name : '-'}</span>
          </div>
        </div>

        ${activeTeams.map((team, i) => `
        <div style="margin-top:2rem;padding-top:2rem;border-top:1px solid var(--border)">
          <h4 style="margin:0 0 1rem 0">${t('register.section.team')} ${i + 1}: ${team.name}</h4>
          <div class="confirm-grid">
            <div class="confirm-row">
              <span class="confirm-label" data-i18n="register.label.team_name">Nama Tim</span>
              <span class="confirm-value">${team.name}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label" data-i18n="register.label.captain_name">Kapten</span>
              <span class="confirm-value">${team.captain_name}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label" data-i18n="register.label.captain_wa">WhatsApp Kapten</span>
              <span class="confirm-value">${team.captain_wa}</span>
            </div>
            <div class="confirm-row">
              <span class="confirm-label">Jumlah Pemain</span>
              <span class="confirm-value">${team.players.length}</span>
            </div>
          </div>
          <div style="margin-top:1rem">
            <strong style="font-size:0.9rem">Roster Pemain:</strong>
            <div style="margin-top:0.5rem;font-size:0.9rem">
              ${team.players.map((p, j) => `<div style="padding:0.3rem 0">
                ${j + 1}. ${p.name} | ID: ${p.game_id} | Nick: ${p.game_nick}
              </div>`).join('')}
            </div>
          </div>
        </div>`).join('')}
      </div>

      <form id="regForm6" class="reg-form">
        <div class="fcard" style="background:rgba(230,0,38,0.08);border-color:rgba(230,0,38,0.3)">
          <div class="fcheck">
            <input type="checkbox" id="agree1" required />
            <label for="agree1" data-i18n="register.confirm.agree1">Saya menyatakan bahwa data yang diisi adalah benar dan sesuai dengan identitas resmi perusahaan.</label>
          </div>
          <div class="fcheck">
            <input type="checkbox" id="agree2" required />
            <label for="agree2" data-i18n="register.confirm.agree2">Saya setuju dengan syarat dan ketentuan pendaftaran MCC Season 1.</label>
          </div>
        </div>
      </form>

      <div class="fnav">
        <button type="button" id="backBtn" class="btn btn-outline" onclick="window.MCC.pages.register.goBack()" data-i18n="register.btn.back">Kembali</button>
        <button type="button" class="btn btn-primary" id="submitBtn" onclick="window.MCC.pages.register.submit()">
          <span id="submitText" data-i18n="register.btn.submit">Daftar Sekarang</span>
          <span id="submitSpinner" class="btn-spinner" style="display:none"></span>
        </button>
      </div>
    </div>`;

    return summary;
  }

  function successHtml() {
    return `
    <div class="section-inner reg-wrap" style="text-align:center;padding-top:4rem;padding-bottom:4rem">
      <div style="font-size:4rem;margin-bottom:1rem">🎉</div>
      <h2 style="margin:1rem 0" data-i18n="register.success.title">Pendaftaran Berhasil!</h2>
      <p style="color:var(--text-dim);margin-bottom:2rem" data-i18n="register.success.desc">
        Terima kasih telah mendaftarkan tim Anda. Panitia MCC Season 1 akan segera menghubungi Anda untuk verifikasi data.
      </p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
        <button type="button" class="btn btn-outline" onclick="window.MCC.pages.register.downloadInvoice()" style="display:inline-flex;align-items:center;gap:0.5rem">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Invoice
        </button>
        <a href="#home" class="btn btn-primary" data-i18n="register.success.back">Kembali ke Beranda</a>
      </div>
    </div>`;
  }

  function generateInvoiceHtml() {
    const activeTeams = _data.teams.filter(tm => tm.name && tm.name.trim() !== '');
    const total = activeTeams.length * TEAM_FEE;
    const invDate = _submittedAt ? _submittedAt.toLocaleString('id-ID', { dateStyle:'long', timeStyle:'short' }) : new Date().toLocaleString('id-ID', { dateStyle:'long', timeStyle:'short' });
    const invNo  = 'MCC-' + (_submittedAt || new Date()).getTime();

    const teamsRows = activeTeams.map((team, i) => `
      <tr>
        <td style="padding:8px 12px;border:1px solid #ddd">${i + 1}</td>
        <td style="padding:8px 12px;border:1px solid #ddd">${team.name}</td>
        <td style="padding:8px 12px;border:1px solid #ddd">${team.captain_name}</td>
        <td style="padding:8px 12px;border:1px solid #ddd">${team.players.length} pemain</td>
        <td style="padding:8px 12px;border:1px solid #ddd;text-align:right">${formatRupiah(TEAM_FEE)}</td>
      </tr>`).join('');

    const playerSections = activeTeams.map((team, i) => `
      <div style="margin-bottom:20px">
        <p style="font-weight:600;margin:0 0 6px 0">Tim ${i+1}: ${team.name}</p>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead>
            <tr style="background:#f5f5f5">
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left">#</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left">Nama Pemain</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left">Game ID</th>
              <th style="padding:6px 10px;border:1px solid #ddd;text-align:left">Nickname</th>
            </tr>
          </thead>
          <tbody>
            ${team.players.map((p, j) => `
            <tr>
              <td style="padding:5px 10px;border:1px solid #ddd">${j+1}</td>
              <td style="padding:5px 10px;border:1px solid #ddd">${p.name}</td>
              <td style="padding:5px 10px;border:1px solid #ddd">${p.game_id}</td>
              <td style="padding:5px 10px;border:1px solid #ddd">${p.game_nick}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`).join('');

    return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Invoice Pendaftaran MCC — ${invNo}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 32px; background: #fff; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
      @page { margin: 20mm; }
    }
    .inv-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; border-bottom: 3px solid #e60026; padding-bottom: 20px; }
    .inv-logo { display: flex; align-items: center; gap: 12px; }
    .inv-logo img { height: 48px; }
    .inv-logo-text h1 { margin: 0; font-size: 20px; color: #e60026; letter-spacing: 1px; }
    .inv-logo-text p { margin: 2px 0 0; font-size: 11px; color: #666; }
    .inv-meta { text-align: right; }
    .inv-meta .inv-title { font-size: 24px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
    .inv-meta p { margin: 2px 0; font-size: 13px; color: #555; }
    .inv-meta span { font-weight: 600; color: #1a1a2e; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #e60026; margin: 24px 0 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-size: 13px; }
    .info-row { display: flex; gap: 8px; padding: 4px 0; }
    .info-lbl { color: #666; min-width: 130px; }
    .info-val { font-weight: 600; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead tr { background: #e60026; color: #fff; }
    th { padding: 10px 12px; text-align: left; font-weight: 600; }
    .total-row { background: #fef2f4; }
    .total-row td { font-weight: 700; font-size: 15px; }
    .footer-note { margin-top: 32px; padding: 16px; background: #f9f9f9; border-left: 4px solid #e60026; font-size: 12px; color: #555; border-radius: 4px; }
    .print-btn { margin: 24px auto 0; display: block; padding: 12px 32px; background: #e60026; color: #fff; border: none; border-radius: 8px; font-size: 15px; cursor: pointer; font-weight: 600; }
    .print-btn:hover { background: #b0001e; }
  </style>
</head>
<body>
  <div class="inv-header">
    <div class="inv-logo">
      <img src="https://tigorworks.github.io/mcc/assets/images/mcc.png" alt="MCC Logo" />
      <div class="inv-logo-text">
        <h1>MCC</h1>
        <p>Mobile Legends Corporate Championship</p>
      </div>
    </div>
    <div class="inv-meta">
      <div class="inv-title">INVOICE</div>
      <p>No. Invoice: <span>${invNo}</span></p>
      <p>Tanggal: <span>${invDate}</span></p>
      <p>Status: <span style="color:#16a34a">✓ Terdaftar</span></p>
    </div>
  </div>

  <div class="section-title">Data Pendaftar</div>
  <div class="info-grid">
    <div class="info-row"><span class="info-lbl">Perusahaan</span><span class="info-val">${_data.company}</span></div>
    <div class="info-row"><span class="info-lbl">PIC / Manager</span><span class="info-val">${_data.pic_name}</span></div>
    <div class="info-row"><span class="info-lbl">WhatsApp PIC</span><span class="info-val">${_data.pic_wa}</span></div>
    <div class="info-row"><span class="info-lbl">Jumlah Tim</span><span class="info-val">${activeTeams.length} tim</span></div>
  </div>

  <div class="section-title">Rincian Pembayaran</div>
  <table>
    <thead>
      <tr>
        <th style="width:40px">#</th>
        <th>Nama Tim</th>
        <th>Kapten</th>
        <th>Roster</th>
        <th style="text-align:right">Biaya</th>
      </tr>
    </thead>
    <tbody>
      ${teamsRows}
      <tr class="total-row">
        <td colspan="4" style="padding:10px 12px;border:1px solid #ddd;text-align:right">Total Pembayaran</td>
        <td style="padding:10px 12px;border:1px solid #ddd;text-align:right;color:#e60026">${formatRupiah(total)}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">Roster Pemain</div>
  ${playerSections}

  <div class="footer-note">
    <strong>Catatan:</strong> Invoice ini merupakan bukti pendaftaran tim MCC Season 1. Panitia akan menghubungi Anda melalui WhatsApp PIC untuk konfirmasi dan verifikasi data. Harap simpan dokumen ini sebagai referensi.
  </div>

  <button class="print-btn no-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
</body>
</html>`;
  }

  function collectStep(step) {
    if (step === 1) {
      const form = document.getElementById('regForm1');
      if (!form) return;
      const company = form.company.value;
      const pic_name = form.pic_name.value;
      const pic_wa = form.pic_wa.value;
      const berkas_file = form.berkas_file.files[0];

      if (berkas_file && berkas_file.size > 15 * 1024 * 1024) {
        const err = form.querySelector('.file-error');
        if (err) {
          err.textContent = t('register.helper.file_too_large');
          err.style.display = 'block';
        }
        return false;
      }

      _data.company = company;
      _data.pic_name = pic_name;
      _data.pic_wa = pic_wa;
      _data.berkas_file = berkas_file;
      return true;
    } else if (step >= 2 && step <= 4) {
      const teamIndex = step - 2;
      const isOptional = teamIndex >= 1;
      const form = document.getElementById(`regForm${step}`);
      if (!form) return;

      // Tim opsional yang tidak dicentang — reset dan lanjut
      if (isOptional && !_data.teams[teamIndex].enabled) {
        _data.teams[teamIndex] = { name: '', logo_file: null, captain_name: '', captain_wa: '', players: [], enabled: false };
        return true;
      }

      const team_name = (form.team_name.value || '').trim();
      const captain_name = form.captain_name.value;
      const captain_wa = form.captain_wa.value;
      const logo_file = form.logo_file.files[0];

      if (!captain_name || !captain_wa) {
        alert(`Tim ${teamIndex + 1}: Nama kapten dan WhatsApp kapten wajib diisi.`);
        return false;
      }
      if (!logo_file && !_data.teams[teamIndex].logo_file) {
        alert(`Tim ${teamIndex + 1}: Logo tim wajib diunggah.`);
        return false;
      }

      const players = [];
      document.querySelectorAll(`.player-input`).forEach(input => {
        const playerIdx = parseInt(input.dataset.player);
        const field = input.dataset.field;
        if (!players[playerIdx]) players[playerIdx] = { name: '', game_id: '', game_nick: '' };
        players[playerIdx][field] = input.value;
      });

      const validPlayers = players.filter(p => p && p.name && p.game_id && p.game_nick);
      if (validPlayers.length < 5) {
        alert(`${t('register.section.team')} ${step - 1}: ${t('register.error.min_players')}`);
        return false;
      }

      _data.teams[teamIndex] = {
        name: team_name,
        logo_file: logo_file || _data.teams[teamIndex].logo_file,
        captain_name: captain_name,
        captain_wa: captain_wa,
        players: validPlayers,
        enabled: true
      };
      return true;
    } else if (step === 5) {
      const form = document.getElementById('regForm5');
      if (!form) return;
      if (!form.checkValidity()) {
        form.reportValidity();
        return false;
      }
      const proof = form.payment_proof_file.files[0];
      if (!proof) {
        alert('Bukti pembayaran wajib diunggah.');
        return false;
      }
      if (proof.size > 10 * 1024 * 1024) {
        const err = form.querySelector('.file-error');
        if (err) { err.textContent = 'File terlalu besar (maks 10MB)'; err.style.display = 'block'; }
        return false;
      }
      _data.payment_proof_file = proof;
      return true;
    }
    return true;
  }

  function fileToBase64(file) {
    if (!file) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        name: file.name,
        mime: file.type,
        data: reader.result.split(',')[1]
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function submitForm() {
    const form6 = document.getElementById('regForm6');
    if (!form6.checkValidity()) {
      form6.reportValidity();
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    const backBtn = document.getElementById('backBtn');

    submitBtn.disabled = true;
    if (backBtn) backBtn.disabled = true;
    submitText.style.display = 'none';
    submitSpinner.style.display = 'inline-block';

    if (!SCRIPT_URL) {
      setTimeout(() => {
        _submittedAt = new Date();
        const root = document.getElementById('app-root');
        if (root) { root.innerHTML = successHtml(); window.MCC.i18n?.apply(); }
      }, 500);
      return;
    }

    try {
      const activeTeams = _data.teams.filter(tm => tm.name && tm.name.trim() !== '');

      const [berkas, paymentProof, ...logos] = await Promise.all([
        fileToBase64(_data.berkas_file),
        fileToBase64(_data.payment_proof_file),
        ...activeTeams.map(tm => fileToBase64(tm.logo_file))
      ]);

      const payload = {
        company:       _data.company,
        pic_name:      _data.pic_name,
        pic_wa:        _data.pic_wa,
        berkas,
        payment_proof: paymentProof,
        total_fee:     activeTeams.length * TEAM_FEE,
        teams: activeTeams.map((team, i) => ({
          name:         team.name,
          captain_name: team.captain_name,
          captain_wa:   team.captain_wa,
          logo:         logos[i],
          players:      team.players
        }))
      };

      const resp = await fetch(SCRIPT_URL, {
        method: 'POST',
        redirect: 'follow',
        body: JSON.stringify(payload)
      });

      const text = await resp.text();
      let result = { ok: true };
      try { result = JSON.parse(text); } catch { /* response bukan JSON, asumsikan sukses */ }
      if (result.ok === false) throw new Error(result.error || 'Gagal menyimpan data.');

      _submittedAt = new Date();
      const root = document.getElementById('app-root');
      if (root) { root.innerHTML = successHtml(); window.MCC.i18n?.apply(); }
    } catch (err) {
      console.error('[register] submit error', err);
      alert('Gagal mengirim data. Silakan coba lagi atau hubungi panitia.');
      submitBtn.disabled = false;
      if (backBtn) backBtn.disabled = false;
      submitText.style.display = 'inline';
      submitSpinner.style.display = 'none';
    }
  }

  function _savePlayers(teamIndex) {
    const inputs = document.querySelectorAll(`.player-input`);
    const saved = [];
    inputs.forEach(input => {
      const idx = parseInt(input.dataset.player);
      const field = input.dataset.field;
      if (!saved[idx]) saved[idx] = { name: '', game_id: '', game_nick: '' };
      saved[idx][field] = input.value;
    });
    _data.teams[teamIndex].players = saved.filter(Boolean);
  }

  window.MCC.pages.register = {
    render() {
      if (!_members) return `<div class="page-loading"><div class="spinner"></div></div>`;
      if (_step === 1) return stepHtml1(_members);
      if (_step >= 2 && _step <= 4) return stepHtmlTeam(_step - 2);
      if (_step === 5) return stepHtml5();
      if (_step === 6) return stepHtml6();
      return '';
    },

    nextStep() {
      if (!collectStep(_step)) return;
      if (_step < 6) {
        _step++;
        const root = document.getElementById('app-root');
        if (root) {
          root.innerHTML = this.render();
          window.MCC.i18n?.apply();
          if (typeof AOS !== 'undefined') AOS.refreshHard();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    },

    goBack() {
      if (_step > 1) {
        _step--;
        const root = document.getElementById('app-root');
        if (root) {
          root.innerHTML = this.render();
          window.MCC.i18n?.apply();
          if (typeof AOS !== 'undefined') AOS.refreshHard();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else {
        window.MCC.navigate('home');
      }
    },

    addPlayer(teamIndex) {
      _savePlayers(teamIndex);
      if (_data.teams[teamIndex].players.length >= 7) return;
      _data.teams[teamIndex].players.push({ name: '', game_id: '', game_nick: '' });
      const root = document.getElementById('app-root');
      if (root) {
        root.innerHTML = this.render();
        window.MCC.i18n?.apply();
      }
    },

    removePlayer(teamIndex, playerIndex) {
      _savePlayers(teamIndex);
      _data.teams[teamIndex].players.splice(playerIndex, 1);
      const root = document.getElementById('app-root');
      if (root) {
        root.innerHTML = this.render();
        window.MCC.i18n?.apply();
      }
    },

    toggleTeam(teamIndex, enabled) {
      _data.teams[teamIndex].enabled = enabled;
      const fields = document.getElementById(`teamFields${teamIndex}`);
      const players = document.getElementById(`teamPlayersCard${teamIndex}`);
      if (fields) fields.style.display = enabled ? '' : 'none';
      if (players) players.style.display = enabled ? '' : 'none';
    },

    submit() {
      submitForm();
    },

    downloadInvoice() {
      const html = generateInvoiceHtml();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const win  = window.open(url, '_blank');
      if (!win) {
        // fallback: link download langsung
        const a = document.createElement('a');
        a.href = url;
        a.download = 'invoice-mcc-' + (_submittedAt || new Date()).getTime() + '.html';
        a.click();
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    },

    init() {
      if (_members) return;

      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 10000);

      fetch('configuration/members.json', { signal: ctrl.signal, cache: 'no-store' })
        .then(r => r.json())
        .then(data => {
          clearTimeout(timeout);
          _members = data;
          const root = document.getElementById('app-root');
          if (root) {
            root.innerHTML = this.render();
            window.MCC.i18n?.apply();
            if (typeof AOS !== 'undefined') AOS.refreshHard();
          }
        })
        .catch(err => {
          clearTimeout(timeout);
          if (err.name !== 'AbortError') console.error('[register] fetch failed', err);
        });
    }
  };
})();
