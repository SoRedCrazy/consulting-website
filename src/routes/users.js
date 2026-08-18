// Routes de gestion des comptes admin
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../db');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Le compte "admin" est l'owner : insupprimable, seul à pouvoir gérer les comptes
const OWNER_USERNAME = 'admin';
const isOwner = (req) => req.session?.username === OWNER_USERNAME;

router.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username FROM users ORDER BY id').all()
    .map((u) => ({ ...u, isOwner: u.username === OWNER_USERNAME }));
  res.json({ users, isOwner: isOwner(req) });
});

router.post('/api/admin/users', requireAdmin, (req, res) => {
  if (!isOwner(req)) {
    return res.status(403).json({ error: 'Seul le compte admin peut créer des comptes' });
  }
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

router.put('/api/admin/users/:id/password', requireAdmin, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  const owner = isOwner(req);
  const self = user.username === req.session.username;
  // Un user non-owner ne peut modifier que SON propre mot de passe
  if (!owner && !self) {
    return res.status(403).json({ error: 'Vous ne pouvez modifier que votre propre mot de passe' });
  }
  const { currentPassword, newPassword } = req.body || {};
  // Le mdp actuel est exigé quand on change le sien ; l'owner peut réinitialiser celui des autres
  if (self && !bcrypt.compareSync(String(currentPassword || ''), user.passhash)) {
    return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  }
  if (String(newPassword || '').length < 6) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
  }
  db.prepare('UPDATE users SET passhash = ? WHERE id = ?')
    .run(bcrypt.hashSync(String(newPassword), 10), user.id);
  res.json({ ok: true });
});

router.delete('/api/admin/users/:id', requireAdmin, (req, res) => {
  if (!isOwner(req)) {
    return res.status(403).json({ error: 'Seul le compte admin peut supprimer des comptes' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  if (user.username === OWNER_USERNAME) {
    return res.status(400).json({ error: 'Le compte admin ne peut pas être supprimé' });
  }
  if (user.username === req.session.username) {
    return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
  }
  const count = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  if (count <= 1) return res.status(400).json({ error: 'Impossible de supprimer le dernier compte admin' });
  db.prepare('DELETE FROM users WHERE id = ?').run(user.id);
  res.json({ ok: true });
});

module.exports = router;
