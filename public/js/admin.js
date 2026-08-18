/* ============================================================
   AUREA CONSULTING — Panel Admin
   Édition de tout le contenu du site
   ============================================================ */

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let DATA = {};

// ---------- Toast ----------
function toast(msg, isErr = false) {
  const t = $('#toast');
  t.textContent = msg;
  t.className = 'toast show' + (isErr ? ' err' : '');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = 'toast'), 2600);
}

// ---------- API ----------
async function api(path, opts = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (res.status === 401) { showLogin(); throw new Error('401'); }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data;
}

// ---------- Auth ----------
function showLogin() {
  $('#login-screen').style.display = 'grid';
  $('#app').classList.remove('active');
}
function showApp() {
  $('#login-screen').style.display = 'none';
  $('#app').classList.add('active');
}

async function checkSession() {
  try {
    const me = await api('/api/admin/me');
    if (me.isAdmin) {
      if (me.username) $('#topbar-user').textContent = me.username;
      showApp();
      await loadAll();
    } else showLogin();
  } catch { showLogin(); }
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errEl = $('#login-error');
  errEl.textContent = '';
  try {
    await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({
        username: $('#login-user').value,
        password: $('#login-pass').value
      })
    });
    showApp();
    await loadAll();
    toast('Connecté avec succès');
  } catch (err) {
    errEl.textContent = err.message === '401' ? 'Identifiants incorrects' : 'Erreur de connexion';
  }
});

$('#logout-btn').addEventListener('click', async () => {
  await api('/api/admin/logout', { method: 'POST' });
  showLogin();
});

// ---------- Navigation ----------
$$('.nav-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    $$('.nav-item').forEach((b) => b.classList.remove('active'));
    $$('.panel').forEach((p) => p.classList.remove('active'));
    btn.classList.add('active');
    $(`#panel-${btn.dataset.panel}`).classList.add('active');
    if (btn.dataset.panel === 'messages') loadMessages();
    if (btn.dataset.panel === 'users') loadUsers();
  });
});

// ---------- Chargement ----------
async function loadAll() {
  DATA = await api('/api/admin/content');
  buildSettings();
  buildHero();
  buildAbout();
  buildServices();
  buildTeam();
  buildContact();
  loadMessages();
}

// ---------- Helpers de construction de champs ----------
function field(label, key, value, type = 'text', section) {
  const id = `f-${section}-${key.replace(/\W/g, '')}`;
  const val = esc(value ?? '');
  return `
    <div class="field">
      <label>${esc(label)}</label>
      <input type="${type}" id="${id}" data-section="${section}" data-key="${esc(key)}" value="${val}" />
    </div>`;
}
function textarea(label, key, value, section, rows = 4) {
  const id = `f-${section}-${key.replace(/\W/g, '')}`;
  return `
    <div class="field">
      <label>${esc(label)}</label>
      <textarea id="${id}" rows="${rows}" data-section="${section}" data-key="${esc(key)}">${esc(value ?? '')}</textarea>
    </div>`;
}
function sectionActions(section) {
  return `
    <div class="section-actions">
      <button class="btn btn--gold" onclick="saveSection('${section}')">💾 Enregistrer</button>
      <button class="btn btn--ghost" onclick="resetSection('${section}')">↺ Réinitialiser (latin)</button>
    </div>`;
}

// ---------- RÉGLAGES ----------
function buildSettings() {
  const s = DATA.settings || {};
  $('#panel-settings').innerHTML = `
    <div class="panel__head"><h2>⚙ Réglages du site</h2><p>Identité, coordonnées et réseaux sociaux.</p></div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Identité</div>
      <div class="field-row">
        ${field('Nom du site', 'siteName', s.siteName, 'text', 'settings')}
        ${field('Slogan', 'tagline', s.tagline, 'text', 'settings')}
      </div>
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Coordonnées</div>
      <div class="field-row">
        ${field('Téléphone', 'phone', s.phone, 'text', 'settings')}
        ${field('Email', 'email', s.email, 'email', 'settings')}
      </div>
      ${field('Adresse', 'address', s.address, 'text', 'settings')}
      ${field('Horaires', 'hours', s.hours, 'text', 'settings')}
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Réseaux sociaux</div>
      <div class="field-row">
        ${field('LinkedIn', 'social.linkedin', s.social?.linkedin, 'text', 'settings')}
        ${field('Twitter / X', 'social.twitter', s.social?.twitter, 'text', 'settings')}
      </div>
      ${field('GitHub', 'social.github', s.social?.github, 'text', 'settings')}
    </div>
    ${sectionActions('settings')}`;
}

// ---------- HERO ----------
function buildHero() {
  const h = DATA.hero || {};
  const stats = (h.stats || []).map((st, i) => `
    <div class="list-item" data-stat="${i}">
      <div class="list-item__head"><h4>Statistique ${i + 1}</h4>
        <button class="list-item__remove" onclick="removeStat(${i})">×</button></div>
      <div class="field-row">
        <div class="field"><label>Valeur</label><input type="number" data-stat-key="value" value="${esc(st.value)}" /></div>
        <div class="field"><label>Suffixe</label><input type="text" data-stat-key="suffix" value="${esc(st.suffix)}" /></div>
      </div>
      <div class="field"><label>Libellé</label><input type="text" data-stat-key="label" value="${esc(st.label)}" /></div>
    </div>`).join('');
  $('#panel-hero').innerHTML = `
    <div class="panel__head"><h2>✦ Accueil (Hero)</h2><p>La première impression — titre, sous-titre et statistiques.</p></div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Texte principal</div>
      ${field('Badge', 'badge', h.badge, 'text', 'hero')}
      ${field('Titre', 'title', h.title, 'text', 'hero')}
      ${textarea('Sous-titre', 'subtitle', h.subtitle, 'hero', 3)}
      <div class="field-row">
        ${field('Bouton principal', 'ctaPrimary', h.ctaPrimary, 'text', 'hero')}
        ${field('Bouton secondaire', 'ctaSecondary', h.ctaSecondary, 'text', 'hero')}
      </div>
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Statistiques</div>
      <div id="stats-list">${stats}</div>
      <button class="add-btn" onclick="addStat()">+ Ajouter une statistique</button>
    </div>
    ${sectionActions('hero')}`;
}

// ---------- ABOUT ----------
function buildAbout() {
  const a = DATA.about || {};
  const paras = (a.paragraphs || []).map((p, i) => `
    <div class="list-item" data-para="${i}">
      <div class="list-item__head"><h4>Paragraphe ${i + 1}</h4>
        <button class="list-item__remove" onclick="removePara(${i})">×</button></div>
      <div class="field"><textarea rows="3" data-para-key="text">${esc(p)}</textarea></div>
    </div>`).join('');
  const values = (a.values || []).map((v, i) => `
    <div class="list-item" data-value="${i}">
      <div class="list-item__head"><h4>Valeur ${i + 1}</h4>
        <button class="list-item__remove" onclick="removeValue(${i})">×</button></div>
      <div class="field-row">
        <div class="field"><label>Titre</label><input type="text" data-value-key="title" value="${esc(v.title)}" /></div>
        <div class="field"><label>Icône</label>
          <select data-value-key="icon">
            ${['shield','bolt','eye','star','globe','network','server','code','chart'].map(ic =>
              `<option value="${ic}" ${v.icon === ic ? 'selected' : ''}>${ic}</option>`).join('')}
          </select></div>
      </div>
      <div class="field"><label>Description</label><textarea rows="2" data-value-key="text">${esc(v.text)}</textarea></div>
    </div>`).join('');
  $('#panel-about').innerHTML = `
    <div class="panel__head"><h2>◈ Qui sommes-nous</h2><p>Présentation de l'entreprise et ses valeurs.</p></div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> En-tête</div>
      <div class="field-row">
        ${field('Sous-titre', 'subtitle', a.subtitle, 'text', 'about')}
        ${field('Titre', 'title', a.title, 'text', 'about')}
      </div>
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Paragraphes</div>
      <div id="para-list">${paras}</div>
      <button class="add-btn" onclick="addPara()">+ Ajouter un paragraphe</button>
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Nos valeurs</div>
      <div id="values-list">${values}</div>
      <button class="add-btn" onclick="addValue()">+ Ajouter une valeur</button>
    </div>
    ${sectionActions('about')}`;
}

// ---------- SERVICES ----------
function buildServices() {
  const sv = DATA.services || {};
  const items = (sv.items || []).map((s, i) => `
    <div class="list-item" data-service="${i}">
      <div class="list-item__head"><h4>Service ${i + 1}</h4>
        <button class="list-item__remove" onclick="removeService(${i})">×</button></div>
      <div class="field-row">
        <div class="field"><label>Titre</label><input type="text" data-service-key="title" value="${esc(s.title)}" /></div>
        <div class="field"><label>Icône</label>
          <select data-service-key="icon">
            ${['globe','network','server','shield','code','chart','bolt','eye','star'].map(ic =>
              `<option value="${ic}" ${s.icon === ic ? 'selected' : ''}>${ic}</option>`).join('')}
          </select></div>
      </div>
      <div class="field"><label>Description</label><textarea rows="2" data-service-key="text">${esc(s.text)}</textarea></div>
      <div class="field"><label>Points forts (séparés par des virgules)</label>
        <input type="text" data-service-key="features" value="${esc((s.features || []).join(', '))}" /></div>
    </div>`).join('');
  $('#panel-services').innerHTML = `
    <div class="panel__head"><h2>⬡ Services</h2><p>Les prestations proposées.</p></div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> En-tête</div>
      <div class="field-row">
        ${field('Sous-titre', 'subtitle', sv.subtitle, 'text', 'services')}
        ${field('Titre', 'title', sv.title, 'text', 'services')}
      </div>
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Liste des services</div>
      <div id="services-list">${items}</div>
      <button class="add-btn" onclick="addService()">+ Ajouter un service</button>
    </div>
    ${sectionActions('services')}`;
}

// ---------- TEAM ----------
function buildTeam() {
  const t = DATA.team || {};
  const members = (t.members || []).map((m, i) => `
    <div class="list-item" data-member="${i}">
      <div class="list-item__head"><h4>Membre ${i + 1}</h4>
        <button class="list-item__remove" onclick="removeMember(${i})">×</button></div>
      <div class="field-row">
        <div class="field"><label>Nom</label><input type="text" data-member-key="name" value="${esc(m.name)}" /></div>
        <div class="field"><label>Initiales (avatar)</label><input type="text" data-member-key="initials" value="${esc(m.initials)}" /></div>
      </div>
      <div class="field"><label>Fonction</label><input type="text" data-member-key="role" value="${esc(m.role)}" /></div>
      <div class="field"><label>Biographie</label><textarea rows="3" data-member-key="bio">${esc(m.bio)}</textarea></div>
      <div class="field"><label>Compétences (séparées par des virgules)</label>
        <input type="text" data-member-key="skills" value="${esc((m.skills || []).join(', '))}" /></div>
    </div>`).join('');
  $('#panel-team').innerHTML = `
    <div class="panel__head"><h2>◉ Équipe</h2><p>Présentation des membres.</p></div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> En-tête</div>
      <div class="field-row">
        ${field('Sous-titre', 'subtitle', t.subtitle, 'text', 'team')}
        ${field('Titre', 'title', t.title, 'text', 'team')}
      </div>
      ${textarea('Introduction', 'intro', t.intro, 'team', 2)}
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Membres</div>
      <div id="team-list">${members}</div>
      <button class="add-btn" onclick="addMember()">+ Ajouter un membre</button>
    </div>
    ${sectionActions('team')}`;
}

// ---------- CONTACT ----------
function buildContact() {
  const c = DATA.contact || {};
  const f = c.form || {};
  $('#panel-contact').innerHTML = `
    <div class="panel__head"><h2>✉ Contact</h2><p>Texte de la section et libellés du formulaire.</p></div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> En-tête</div>
      <div class="field-row">
        ${field('Sous-titre', 'subtitle', c.subtitle, 'text', 'contact')}
        ${field('Titre', 'title', c.title, 'text', 'contact')}
      </div>
      ${textarea("Texte d'introduction", 'text', c.text, 'contact', 3)}
    </div>
    <div class="card">
      <div class="card__title"><span class="dot"></span> Formulaire</div>
      <div class="field-row">
        ${field('Placeholder Nom', 'form.namePlaceholder', f.namePlaceholder, 'text', 'contact')}
        ${field('Placeholder Email', 'form.emailPlaceholder', f.emailPlaceholder, 'text', 'contact')}
      </div>
      <div class="field-row">
        ${field('Placeholder Sujet', 'form.subjectPlaceholder', f.subjectPlaceholder, 'text', 'contact')}
        ${field('Bouton envoyer', 'form.submit', f.submit, 'text', 'contact')}
      </div>
      <div class="field-row">
        ${field('Message succès', 'form.success', f.success, 'text', 'contact')}
        ${field('Message erreur', 'form.error', f.error, 'text', 'contact')}
      </div>
    </div>
    ${sectionActions('contact')}`;
}

// ---------- Collecte des données d'une section ----------
function collect(section) {
  const panel = $(`#panel-${section}`);
  const out = JSON.parse(JSON.stringify(DATA[section] || {}));

  // Champs simples (data-key)
  $$('[data-key]', panel).forEach((el) => {
    const parts = el.dataset.key.split('.');
    let obj = out;
    for (let i = 0; i < parts.length - 1; i++) {
      if (typeof obj[parts[i]] !== 'object' || obj[parts[i]] === null) obj[parts[i]] = {};
      obj = obj[parts[i]];
    }
    obj[parts[parts.length - 1]] = el.value;
  });

  // Statistiques
  if (section === 'hero') {
    out.stats = $$('#stats-list [data-stat]').map((item) => ({
      value: parseInt($('[data-stat-key="value"]', item).value, 10) || 0,
      suffix: $('[data-stat-key="suffix"]', item).value,
      label: $('[data-stat-key="label"]', item).value
    }));
  }
  // About
  if (section === 'about') {
    out.paragraphs = $$('#para-list [data-para]').map((item) =>
      $('[data-para-key="text"]', item).value);
    out.values = $$('#values-list [data-value]').map((item) => ({
      title: $('[data-value-key="title"]', item).value,
      icon: $('[data-value-key="icon"]', item).value,
      text: $('[data-value-key="text"]', item).value
    }));
  }
  // Services
  if (section === 'services') {
    out.items = $$('#services-list [data-service]').map((item) => ({
      title: $('[data-service-key="title"]', item).value,
      icon: $('[data-service-key="icon"]', item).value,
      text: $('[data-service-key="text"]', item).value,
      features: $('[data-service-key="features"]', item).value
        .split(',').map((s) => s.trim()).filter(Boolean)
    }));
  }
  // Team
  if (section === 'team') {
    out.members = $$('#team-list [data-member]').map((item) => ({
      name: $('[data-member-key="name"]', item).value,
      initials: $('[data-member-key="initials"]', item).value,
      role: $('[data-member-key="role"]', item).value,
      bio: $('[data-member-key="bio"]', item).value,
      skills: $('[data-member-key="skills"]', item).value
        .split(',').map((s) => s.trim()).filter(Boolean)
    }));
  }
  return out;
}

// ---------- Sauvegarde / reset ----------
window.saveSection = async (section) => {
  const payload = collect(section);
  try {
    await api(`/api/admin/content/${section}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    DATA[section] = payload;
    toast('Section enregistrée ✓');
  } catch (e) { toast(e.message, true); }
};

window.resetSection = async (section) => {
  if (!confirm('Réinitialiser cette section au texte latin par défaut ?')) return;
  try {
    await api(`/api/admin/content/${section}/reset`, { method: 'POST' });
    await loadAll();
    toast('Section réinitialisée');
  } catch (e) { toast(e.message, true); }
};

// ---------- Ajout / suppression de listes ----------
window.addStat = () => {
  const list = $('#stats-list');
  const i = list.children.length;
  const div = document.createElement('div');
  div.className = 'list-item';
  div.dataset.stat = i;
  div.innerHTML = `
    <div class="list-item__head"><h4>Statistique ${i + 1}</h4>
      <button class="list-item__remove" onclick="removeStat(${i})">×</button></div>
    <div class="field-row">
      <div class="field"><label>Valeur</label><input type="number" data-stat-key="value" value="0" /></div>
      <div class="field"><label>Suffixe</label><input type="text" data-stat-key="suffix" value="+" /></div>
    </div>
    <div class="field"><label>Libellé</label><input type="text" data-stat-key="label" value="" /></div>`;
  list.appendChild(div);
};
window.removeStat = (i) => { const el = $(`#stats-list [data-stat="${i}"]`); el && el.remove(); };

window.addPara = () => {
  const list = $('#para-list');
  const i = list.children.length;
  const div = document.createElement('div');
  div.className = 'list-item';
  div.dataset.para = i;
  div.innerHTML = `
    <div class="list-item__head"><h4>Paragraphe ${i + 1}</h4>
      <button class="list-item__remove" onclick="removePara(${i})">×</button></div>
    <div class="field"><textarea rows="3" data-para-key="text"></textarea></div>`;
  list.appendChild(div);
};
window.removePara = (i) => { const el = $(`#para-list [data-para="${i}"]`); el && el.remove(); };

window.addValue = () => {
  const list = $('#values-list');
  const i = list.children.length;
  const div = document.createElement('div');
  div.className = 'list-item';
  div.dataset.value = i;
  div.innerHTML = `
    <div class="list-item__head"><h4>Valeur ${i + 1}</h4>
      <button class="list-item__remove" onclick="removeValue(${i})">×</button></div>
    <div class="field-row">
      <div class="field"><label>Titre</label><input type="text" data-value-key="title" value="" /></div>
      <div class="field"><label>Icône</label>
        <select data-value-key="icon">${['shield','bolt','eye','star','globe','network','server','code','chart'].map(ic => `<option value="${ic}">${ic}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label>Description</label><textarea rows="2" data-value-key="text"></textarea></div>`;
  list.appendChild(div);
};
window.removeValue = (i) => { const el = $(`#values-list [data-value="${i}"]`); el && el.remove(); };

window.addService = () => {
  const list = $('#services-list');
  const i = list.children.length;
  const div = document.createElement('div');
  div.className = 'list-item';
  div.dataset.service = i;
  div.innerHTML = `
    <div class="list-item__head"><h4>Service ${i + 1}</h4>
      <button class="list-item__remove" onclick="removeService(${i})">×</button></div>
    <div class="field-row">
      <div class="field"><label>Titre</label><input type="text" data-service-key="title" value="" /></div>
      <div class="field"><label>Icône</label>
        <select data-service-key="icon">${['globe','network','server','shield','code','chart','bolt','eye','star'].map(ic => `<option value="${ic}">${ic}</option>`).join('')}</select></div>
    </div>
    <div class="field"><label>Description</label><textarea rows="2" data-service-key="text"></textarea></div>
    <div class="field"><label>Points forts (séparés par des virgules)</label><input type="text" data-service-key="features" value="" /></div>`;
  list.appendChild(div);
};
window.removeService = (i) => { const el = $(`#services-list [data-service="${i}"]`); el && el.remove(); };

window.addMember = () => {
  const list = $('#team-list');
  const i = list.children.length;
  const div = document.createElement('div');
  div.className = 'list-item';
  div.dataset.member = i;
  div.innerHTML = `
    <div class="list-item__head"><h4>Membre ${i + 1}</h4>
      <button class="list-item__remove" onclick="removeMember(${i})">×</button></div>
    <div class="field-row">
      <div class="field"><label>Nom</label><input type="text" data-member-key="name" value="" /></div>
      <div class="field"><label>Initiales (avatar)</label><input type="text" data-member-key="initials" value="" /></div>
    </div>
    <div class="field"><label>Fonction</label><input type="text" data-member-key="role" value="" /></div>
    <div class="field"><label>Biographie</label><textarea rows="3" data-member-key="bio"></textarea></div>
    <div class="field"><label>Compétences (séparées par des virgules)</label><input type="text" data-member-key="skills" value="" /></div>`;
  list.appendChild(div);
};
window.removeMember = (i) => { const el = $(`#team-list [data-member="${i}"]`); el && el.remove(); };

// ---------- Messages ----------
async function loadMessages() {
  try {
    const msgs = await api('/api/admin/messages');
    const badge = $('#msg-badge');
    badge.textContent = msgs.length;
    badge.hidden = msgs.length === 0;

    if (msgs.length === 0) {
      $('#panel-messages').innerHTML = `
        <div class="panel__head"><h2>✧ Messages</h2><p>Mensages reçus via le formulaire de contact.</p></div>
        <div class="card"><div class="msg__empty"><div class="big">✉</div>Aucun message pour le moment.</div></div>`;
      return;
    }
    $('#panel-messages').innerHTML = `
      <div class="panel__head"><h2>✧ Messages</h2><p>${msgs.length} message(s) reçu(s).</p></div>
      ${msgs.map((m) => `
        <div class="msg">
          <div class="msg__head">
            <div class="msg__from">
              <div class="msg__avatar">${esc((m.name || '?').slice(0, 1).toUpperCase())}</div>
              <div>
                <div class="msg__name">${esc(m.name)}</div>
                <div class="msg__email">${esc(m.email)}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:12px">
              <span class="msg__date">${esc(m.created_at)}</span>
              <button class="btn btn--danger btn--sm" onclick="deleteMsg(${m.id})">Supprimer</button>
            </div>
          </div>
          ${m.subject ? `<div class="msg__subject">${esc(m.subject)}</div>` : ''}
          <div class="msg__body">${esc(m.message)}</div>
        </div>`).join('')}`;
  } catch (e) { toast(e.message, true); }
}

window.deleteMsg = async (id) => {
  if (!confirm('Supprimer ce message ?')) return;
  try {
    await api(`/api/admin/messages/${id}`, { method: 'DELETE' });
    toast('Message supprimé');
    loadMessages();
  } catch (e) { toast(e.message, true); }
};

// ---------- Comptes ----------
async function loadUsers() {
  try {
    const res = await api('/api/admin/users');
    // Compat : ancien serveur renvoie un tableau, nouveau renvoie { users, isOwner }
    const users = Array.isArray(res) ? res : res.users;
    const isOwner = Array.isArray(res) ? true : res.isOwner;
    const me = $('#topbar-user').textContent;

    if (!isOwner) {
      // User non-owner : ne voit que son propre compte, pour changer son mdp
      const meUser = users.find((u) => u.username === me);
      $('#panel-users').innerHTML = `
        <div class="panel__head"><h2>👤 Mon compte</h2><p>Vous pouvez modifier votre mot de passe.</p></div>
        <div class="card">
          <div class="card__title"><span class="dot"></span> ${esc(me)}</div>
          <div class="field-row">
            <div class="field"><label>Mot de passe actuel</label>
              <input type="password" id="cur-${meUser.id}" autocomplete="current-password" /></div>
            <div class="field"><label>Nouveau mot de passe</label>
              <input type="password" id="new-${meUser.id}" autocomplete="new-password" /></div>
          </div>
          <button class="btn btn--gold btn--sm" onclick="changePassword(${meUser.id})">🔑 Changer le mot de passe</button>
        </div>`;
      return;
    }

    // Owner : gestion complète des comptes
    $('#panel-users').innerHTML = `
      <div class="panel__head"><h2>👤 Comptes</h2><p>Gérez les comptes d'administration du panel.</p></div>
      <div class="card">
        <div class="card__title"><span class="dot"></span> Comptes existants</div>
        ${users.map((u) => `
          <div class="list-item">
            <div class="list-item__head">
              <h4>${esc(u.username)}
                ${u.isOwner ? '<span class="badge">owner</span>' : ''}
                ${u.username === me ? '<span class="badge">vous</span>' : ''}
              </h4>
              ${!u.isOwner ? `<button class="btn btn--danger btn--sm" onclick="deleteUser(${u.id}, '${esc(u.username)}')">Supprimer</button>` : ''}
            </div>
            <div class="field-row">
              ${u.username === me
                ? `<div class="field"><label>Mot de passe actuel</label>
                     <input type="password" id="cur-${u.id}" autocomplete="current-password" /></div>`
                : `<div class="field"><label>Réinitialiser le mot de passe</label>
                     <input type="password" id="cur-${u.id}" placeholder="(optionnel)" autocomplete="new-password" /></div>`}
              <div class="field"><label>Nouveau mot de passe</label>
                <input type="password" id="new-${u.id}" autocomplete="new-password" /></div>
            </div>
            <button class="btn btn--gold btn--sm" onclick="changePassword(${u.id})">🔑 ${u.username === me ? 'Changer le mot de passe' : 'Réinitialiser le mot de passe'}</button>
          </div>`).join('')}
      </div>
      <div class="card">
        <div class="card__title"><span class="dot"></span> Créer un compte</div>
        <div class="field-row">
          <div class="field"><label>Nom d'utilisateur</label>
            <input type="text" id="new-user-name" autocomplete="off" /></div>
          <div class="field"><label>Mot de passe (min. 6 caractères)</label>
            <input type="password" id="new-user-pass" autocomplete="new-password" /></div>
        </div>
        <button class="btn btn--gold" onclick="createUser()">+ Créer le compte</button>
      </div>`;
  } catch (e) { toast(e.message, true); }
}

window.createUser = async () => {
  const username = $('#new-user-name').value.trim();
  const password = $('#new-user-pass').value;
  try {
    await api('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    toast('Compte créé ✓');
    loadUsers();
  } catch (e) { toast(e.message, true); }
};

window.changePassword = async (id) => {
  const currentPassword = $(`#cur-${id}`).value;
  const newPassword = $(`#new-${id}`).value;
  try {
    await api(`/api/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    toast('Mot de passe modifié ✓');
    loadUsers();
  } catch (e) { toast(e.message, true); }
};

window.deleteUser = async (id, username) => {
  if (!confirm(`Supprimer le compte « ${username} » ?`)) return;
  try {
    await api(`/api/admin/users/${id}`, { method: 'DELETE' });
    toast('Compte supprimé');
    loadUsers();
  } catch (e) { toast(e.message, true); }
};

// ---------- Démarrage ----------
checkSession();
