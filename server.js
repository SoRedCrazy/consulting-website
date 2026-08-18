// server.js — Serveur Express (simple et fiable)
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Assure le dossier data
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'aurea-consulting-secret-2026',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8h
}));

// ---------- Helpers ----------
const getContent = (key) => {
  const row = db.prepare('SELECT value FROM content WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : null;
};
const setContent = (key, value) => {
  db.prepare(`INSERT INTO content (key, value) VALUES (?, ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
    .run(key, JSON.stringify(value));
};
const requireAdmin = (req, res, next) => {
  if (req.session && req.session.isAdmin) return next();
  res.status(401).json({ error: 'Non autorisé' });
};

// ---------- API publique ----------
// Tout le contenu du site en une requête
app.get('/api/content', (req, res) => {
  const keys = ['settings', 'hero', 'about', 'services', 'team', 'contact', 'footer'];
  const data = {};
  for (const k of keys) data[k] = getContent(k);
  res.json(data);
});

// Formulaire de contact
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Champs requis manquants' });
  }
  db.prepare('INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(String(name).slice(0, 200), String(email).slice(0, 200),
         subject ? String(subject).slice(0, 300) : null, String(message).slice(0, 5000));
  res.json({ ok: true });
});

// ---------- API admin : auth ----------
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username || '');
  if (user && bcrypt.compareSync(password || '', user.passhash)) {
    req.session.isAdmin = true;
    req.session.username = user.username;
    return res.json({ ok: true, username: user.username });
  }
  res.status(401).json({ ok: false, error: 'Identifiants incorrects' });
});

app.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/admin/me', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin), username: req.session?.username || null });
});

// ---------- API admin : contenu ----------
// Liste des clés modifiables
app.get('/api/admin/content', requireAdmin, (req, res) => {
  const keys = ['settings', 'hero', 'about', 'services', 'team', 'contact', 'footer'];
  const data = {};
  for (const k of keys) data[k] = getContent(k);
  res.json(data);
});

// Sauvegarde d'une section
app.put('/api/admin/content/:key', requireAdmin, (req, res) => {
  const allowed = ['settings', 'hero', 'about', 'services', 'team', 'contact', 'footer'];
  const key = req.params.key;
  if (!allowed.includes(key)) return res.status(400).json({ error: 'Clé invalide' });
  setContent(key, req.body);
  res.json({ ok: true });
});

// Réinitialiser une section au latin par défaut
app.post('/api/admin/content/:key/reset', requireAdmin, (req, res) => {
  const allowed = ['settings', 'hero', 'about', 'services', 'team', 'contact', 'footer'];
  const key = req.params.key;
  if (!allowed.includes(key)) return res.status(400).json({ error: 'Clé invalide' });
  const defaults = require('./db-defaults');
  if (defaults[key]) { setContent(key, defaults[key]); return res.json({ ok: true }); }
  res.status(404).json({ error: 'Section inconnue' });
});

// ---------- API admin : messages ----------
app.get('/api/admin/messages', requireAdmin, (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  res.json(messages);
});

app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---------- API admin : comptes ----------
app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username FROM users ORDER BY id').all();
  res.json(users);
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { username, password } = req.body || {};
  const name = String(username || '').trim();
  if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(name)) {
    return res.status(400).json({ error: "Nom d'utilisateur invalide (3-30 caractères : lettres, chiffres, . _ -)" });
  }
  if (String(password || '').length < 6) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(name);
  if (exists) return res.status(409).json({ error: "Ce nom d'utilisateur existe déjà" });
  const hash = bcrypt.hashSync(String(password), 10);
  db.prepare('INSERT INTO users (username, passhash) VALUES (?, ?)').run(name, hash);
  res.json({ ok: true });
});

app.put('/api/admin/users/:id/password', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  const { currentPassword, newPassword } = req.body || {};
  if (!bcrypt.compareSync(String(currentPassword || ''), user.passhash)) {
    return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  }
  if (String(newPassword || '').length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
  }
  db.prepare('UPDATE users SET passhash = ? WHERE id = ?')
    .run(bcrypt.hashSync(String(newPassword), 10), user.id);
  res.json({ ok: true });
});

app.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (user.username === req.session.username) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count <= 1) return res.status(400).json({ error: 'Impossible de supprimer le dernier compte admin' });
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  res.json({ ok: true });
});

// ---------- Admin panel (page) ----------
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ✦ Aurea Consulting — serveur démarré`);
  console.log(`  → Site :   http://localhost:${PORT}`);
  console.log(`  → Admin :  http://localhost:${PORT}/admin  (admin / admin123)\n`);
});
