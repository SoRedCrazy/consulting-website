// db.js — Base de données SQLite (simple et fiable)
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Assure l'existence du dossier data avant d'ouvrir la base
fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });

const db = new Database(path.join(__dirname, 'data', 'site.db'));
db.pragma('journal_mode = WAL');

// ---------- Schéma ----------
db.exec(`
  CREATE TABLE IF NOT EXISTS content (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    subject    TEXT,
    message    TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    passhash TEXT NOT NULL
  );
`);

// ---------- Seed ----------
const defaultContent = require('./db-defaults');
const insertContent = db.prepare('INSERT OR IGNORE INTO content (key, value) VALUES (?, ?)');
const seedContent = db.transaction(() => {
  for (const [key, value] of Object.entries(defaultContent)) {
    insertContent.run(key, JSON.stringify(value));
  }
});
seedContent();

// ---------- Admin par défaut : admin / admin123 ----------
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, passhash) VALUES (?, ?)').run('admin', hash);
  console.log('✔ Utilisateur admin créé (admin / admin123)');
}

module.exports = db;
