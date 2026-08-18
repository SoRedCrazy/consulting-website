// Routes des messages (formulaire de contact + gestion admin)
const express = require('express');
const db = require('../../db');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Formulaire de contact (public)
router.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Champs requis manquants' });
  }
  db.prepare('INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)')
    .run(String(name).slice(0, 200), String(email).slice(0, 200),
         subject ? String(subject).slice(0, 300) : null, String(message).slice(0, 5000));
  res.json({ ok: true });
});

// ---------- Admin ----------
router.get('/api/admin/messages', requireAdmin, (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  res.json(messages);
});

router.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
  db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
