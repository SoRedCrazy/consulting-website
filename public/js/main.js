/* ============================================================
   AUREA CONSULTING — Frontend
   Rendu du contenu + animations (canvas, scroll, compteurs)
   ============================================================ */

// ---------- Icônes SVG ----------
const ICONS = {
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5 6 16.7M12 7.5l6 9.2M7.5 19h9"/></svg>',
  server: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/></svg>',
  code: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'
};
const icon = (name) => ICONS[name] || ICONS.star;

// ---------- Utilitaires ----------
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- Rendu du contenu ----------
let SITE = {};

function bindText() {
  $$('[data-bind]').forEach((el) => {
    const val = getPath(SITE, el.dataset.bind);
    if (val != null) el.textContent = val;
  });
  $$('[data-bind-ph]').forEach((el) => {
    const val = getPath(SITE, el.dataset.bindPh);
    if (val != null) el.placeholder = val;
  });
}

function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function renderHero() {
  const stats = $('#hero-stats');
  stats.innerHTML = (SITE.hero?.stats || []).map((s) => `
    <div class="stat">
      <div class="stat__value"><span data-count="${esc(s.value)}">0</span>${esc(s.suffix || '')}</div>
      <div class="stat__label">${esc(s.label)}</div>
    </div>`).join('');
}

function renderAbout() {
  const a = SITE.about || {};
  $('#about-paragraphs').innerHTML = (a.paragraphs || []).map((p) => `<p>${esc(p)}</p>`).join('');
  $('#about-values').innerHTML = (a.values || []).map((v) => `
    <div class="value-card reveal">
      <div class="value-card__icon">${icon(v.icon)}</div>
      <h3>${esc(v.title)}</h3>
      <p>${esc(v.text)}</p>
    </div>`).join('');
}

function renderServices() {
  $('#services-grid').innerHTML = (SITE.services?.items || []).map((s) => `
    <article class="service-card reveal">
      <div class="service-card__icon">${icon(s.icon)}</div>
      <h3>${esc(s.title)}</h3>
      <p>${esc(s.text)}</p>
      <ul class="service-card__features">
        ${(s.features || []).map((f) => `<li>${esc(f)}</li>`).join('')}
      </ul>
    </article>`).join('');
}

function renderTeam() {
  $('#team-grid').innerHTML = (SITE.team?.members || []).map((m) => `
    <article class="member-card reveal">
      <div class="member-card__avatar">${esc(m.initials || m.name?.slice(0, 2).toUpperCase())}</div>
      <h3>${esc(m.name)}</h3>
      <div class="member-card__role">${esc(m.role)}</div>
      <p class="member-card__bio">${esc(m.bio)}</p>
      <div class="member-card__skills">
        ${(m.skills || []).map((sk) => `<span class="skill-tag">${esc(sk)}</span>`).join('')}
      </div>
    </article>`).join('');
}

function renderContact() {
  const s = SITE.settings || {};
  const items = [
    { icon: 'phone', label: 'Telephonus', value: s.phone },
    { icon: 'mail', label: 'Email', value: s.email },
    { icon: 'pin', label: 'Locus', value: s.address },
    { icon: 'clock', label: 'Horaria', value: s.hours }
  ];
  $('#contact-info').innerHTML = items.map((i) => `
    <div class="info-card">
      <div class="info-card__icon">${icon(i.icon)}</div>
      <div>
        <div class="info-card__label">${esc(i.label)}</div>
        <div class="info-card__value">${esc(i.value)}</div>
      </div>
    </div>`).join('');
}

// ---------- Couleur d'accent (modifiable dans l'admin) ----------
let ACCENT_RGB = '212,175,55';
function hexToRgb(hex) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim());
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}
function lightenHex(hex, amt) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgb(${rgb.map((v) => Math.min(255, Math.round(v + (255 - v) * amt))).join(',')})`;
}
function applyAccentColor() {
  const color = (SITE.settings || {}).accentColor;
  const rgb = hexToRgb(color);
  if (!rgb) return; // garde le jaune par défaut
  ACCENT_RGB = rgb.join(',');
  const root = document.documentElement;
  root.style.setProperty('--gold', `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`);
  root.style.setProperty('--gold-2', lightenHex(color, 0.25));
  root.style.setProperty('--gold-soft', `rgba(${ACCENT_RGB}, 0.12)`);
  root.style.setProperty('--gold-rgb', ACCENT_RGB);
}

// ---------- Avis clients ----------
function renderReviews() {
  fetch('/api/reviews')
    .then((r) => r.json())
    .then((reviews) => {
      const section = $('#reviews');
      if (!Array.isArray(reviews) || reviews.length === 0) {
        section.hidden = true; // pas d'avis → on masque la section
        return;
      }
      // Affichage aléatoire : on mélange puis on prend jusqu'à 6
      const shuffled = [...reviews].sort(() => Math.random() - 0.5).slice(0, 6);
      $('#reviews-grid').innerHTML = shuffled.map((rv) => `
        <article class="review-card reveal">
          <div class="review-card__stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5 - rv.rating)}</div>
          <p class="review-card__text">« ${esc(rv.message)} »</p>
          <div class="review-card__author">
            <div class="review-card__avatar">${esc((rv.name || '?').slice(0, 1).toUpperCase())}</div>
            <div>
              <div class="review-card__name">${esc(rv.name)}</div>
              <div class="review-card__date">${esc(rv.created_at)}</div>
            </div>
          </div>
        </article>`).join('');
      section.hidden = false;
      // Relancer l'observer de révélation sur les nouvelles cartes
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      $$('.review-card.reveal').forEach((el) => io.observe(el));
    })
    .catch(() => { section.hidden = true; });
}

// ---------- Canvas : réseau de particules ----------
function initCanvas() {
  const canvas = $('#bg-canvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles, mouse = { x: -9999, y: -9999 };
  const COUNT = Math.min(90, Math.floor(window.innerWidth / 16));
  const LINK = 130;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  particles = Array.from({ length: COUNT }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 1.6 + 0.6
  }));

  window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      // légère attraction vers la souris
      const dxm = mouse.x - p.x, dym = mouse.y - p.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < 160 && dm > 0.01) { p.x += dxm / dm * 0.3; p.y += dym / dm * 0.3; }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT_RGB},0.7)`;
      ctx.fill();
    }
    // liens
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(${ACCENT_RGB},${0.14 * (1 - d / LINK)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(tick);
  }
  tick();
}

// ---------- Compteurs animés ----------
function animateCounters() {
  $$('[data-count]').forEach((el) => {
    const target = parseInt(el.dataset.count, 10) || 0;
    const dur = 1600;
    const start = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}

// ---------- Révélation au scroll ----------
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => io.observe(el));
}

// ---------- Effet glow qui suit la souris (services) ----------
function initCardGlow() {
  $$('.service-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// ---------- Navbar + progression scroll ----------
function initScroll() {
  const nav = $('#navbar');
  const bar = $('#scroll-progress');
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = `${(window.scrollY / max) * 100}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ---------- Menu mobile ----------
function initMenu() {
  const burger = $('#nav-burger');
  const links = $('#nav-links');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    links.classList.toggle('open');
  });
  $$('.nav__link', links).forEach((l) =>
    l.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
    })
  );
}

// ---------- Formulaire de contact ----------
function initForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: $('#f-name').value.trim(),
      email: $('#f-email').value.trim(),
      subject: $('#f-subject').value.trim(),
      message: $('#f-message').value.trim()
    };
    if (!payload.name || !payload.email || !payload.message) {
      status.textContent = SITE.contact?.form?.error || 'Champs requis manquants.';
      status.className = 'form__status err';
      return;
    }
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        status.textContent = SITE.contact?.form?.success || 'Mensagis missa est!';
        status.className = 'form__status ok';
        form.reset();
      } else {
        status.textContent = data.error || 'Error.';
        status.className = 'form__status err';
      }
    } catch {
      status.textContent = 'Error de connexion.';
      status.className = 'form__status err';
    }
  });
}

// ---------- Démarrage ----------
async function init() {
  try {
    const res = await fetch('/api/content');
    SITE = await res.json();
  } catch {
    console.error('Impossible de charger le contenu');
    return;
  }
  applyAccentColor();
  bindText();
  renderHero();
  renderAbout();
  renderServices();
  renderTeam();
  renderReviews();
  renderContact();

  initCanvas();
  initScroll();
  initMenu();
  initForm();
  initReveal();
  initCardGlow();
  animateCounters();
}

document.addEventListener('DOMContentLoaded', init);
