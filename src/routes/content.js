// Routes de contenu du site (public + admin)
const express = require('express');
const db = require('../../db');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

const KEYS = ['settings', 'hero', 'about', 'services', 'team', 'contact', 'footer'];

const getContent = (key) => {
  const row = db.prepare('SELECT value FROM content WHERE key = ?').get(key);
  return row ? JSON.parse(row.value) : null;
};
const setContent = (key, value) => {
  db.prepare(`INSERT INTO content (key, value) VALUES (?, ?)
              ON CONFLICT(key) DO UPDATE SET value = excluded.value`)
    .run(key, JSON.stringify(value));
};

// ---------- Public ----------
// Tout le contenu du site en une requête
router.get('/api/content', (req, res) => {
  const data = {};
  for (const k of KEYS) data[k] = getContent(k);
  res.json(data);
});

// ---------- Admin ----------
router.get('/api/admin/content', requireAdmin, (req, res) => {
  const data = {};
  for (const k of KEYS) data[k] = getContent(k);
  res.json(data);
});

// Sauvegarde d'une section
router.put('/api/admin/content/:key', requireAdmin, (req, res) => {
  const key = req.params.key;
  if (!KEYS.includes(key)) return res.status(400).json({ error: 'Clé invalide' });
  setContent(key, req.body);
  res.json({ ok: true });
});

// Réinitialiser une section au latin par défaut
router.post('/api/admin/content/:key/reset', requireAdmin, (req, res) => {
  const key = req.params.key;
  if (!KEYS.includes(key)) return res.status(400).json({ error: 'Clé invalide' });
  const defaults = require('../../db-defaults');
  if (defaults[key]) { setContent(key, defaults[key]); return res.json({ ok: true }); }
  res.status(404).json({ error: 'Section inconnue' });
});

module.exports = router;
