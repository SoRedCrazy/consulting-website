// Routes des avis clients (public + admin)
const express = require('express');
const db = require('../../db');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// ---------- Public ----------
// Le client laisse un avis
router.post('/api/reviews', (req, res) => {
  const { name, rating, message } = req.body || {};
  const n = String(name || '').trim();
  const r = parseInt(rating, 10);
  const m = String(message || '').trim();
  if (!n || !m) return res.status(400).json({ error: 'Nom et avis requis' });
  if (r < 1 || r > 5) return res.status(400).json({ error: 'Note invalide (1 à 5)' });
  db.prepare('INSERT INTO reviews (name, rating, message) VALUES (?, ?, ?)')
    .run(n.slice(0, 100), r, m.slice(0, 2000));
  res.json({ ok: true });
});

// Avis visibles (pour le site public)
router.get('/api/reviews', (req, res) => {
  const reviews = db.prepare('SELECT id, name, rating, message, created_at FROM reviews WHERE visible = 1 ORDER BY created_at DESC').all();
  res.json(reviews);
});

// ---------- Admin ----------
router.get('/api/admin/reviews', requireAdmin, (req, res) => {
  const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json(reviews);
});

router.put('/api/admin/reviews/:id/visible', requireAdmin, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Avis introuvable' });
  const visible = req.body?.visible ? 1 : 0;
  db.prepare('UPDATE reviews SET visible = ? WHERE id = ?').run(visible, review.id);
  res.json({ ok: true });
});

router.delete('/api/admin/reviews/:id', requireAdmin, (req, res) => {
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(req.params.id);
  if (!review) return res.status(404).json({ error: 'Avis introuvable' });
  db.prepare('DELETE FROM reviews WHERE id = ?').run(review.id);
  res.json({ ok: true });
});

module.exports = router;
