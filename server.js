// server.js — Point d'entrée : assemblage de l'application
// Les routes métier sont dans src/routes/ (un fichier par domaine)
const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
require('./db'); // initialise la base (schéma + seed) au démarrage

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

// ---------- Routes API (src/routes/) ----------
app.use(require('./src/routes/auth'));      // /api/admin/login, /logout, /me
app.use(require('./src/routes/content'));   // /api/content, /api/admin/content
app.use(require('./src/routes/messages'));  // /api/contact, /api/admin/messages
app.use(require('./src/routes/reviews'));   // /api/reviews, /api/admin/reviews
app.use(require('./src/routes/users'));     // /api/admin/users

// ---------- Pages ----------
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/avis', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'avis.html'));
});

app.listen(PORT, () => {
  console.log(`\n  ✦ Aurea Consulting — serveur démarré`);
  console.log(`  → Site :   http://localhost:${PORT}`);
  console.log(`  → Admin :  http://localhost:${PORT}/admin  (admin / admin123)\n`);
});
