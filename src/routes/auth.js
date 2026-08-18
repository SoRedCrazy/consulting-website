// Routes d'authentification admin
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');

const router = express.Router();

router.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username || '');
  if (user && bcrypt.compareSync(password || '', user.passhash)) {
    req.session.isAdmin = true;
    req.session.username = user.username;
    return res.json({ ok: true, username: user.username });
  }
  res.status(401).json({ ok: false, error: 'Identifiants incorrects' });
});

router.post('/api/admin/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get('/api/admin/me', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin), username: req.session?.username || null });
});

module.exports = router;
