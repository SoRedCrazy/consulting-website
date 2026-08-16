# ✦ Aurea Consulting — Site de consulting Web & Network

Site vitrine professionnel, très animé, avec **panel d'administration** complet pour modifier tout le contenu.
Architecture **simple et fiable** : Node.js + Express + SQLite, frontend vanilla (HTML/CSS/JS), sans framework lourd.

## 🚀 Démarrage

```bash
npm install
npm start
```

Puis ouvrir :
- **Site** : http://localhost:3000
- **Admin** : http://localhost:3000/admin  →  identifiants `admin` / `admin123`

> Mode dev avec rechargement auto : `npm run dev`

## 🗂 Architecture

```
Consulting/
├── server.js          # Serveur Express + API (public & admin)
├── db.js              # Initialisation SQLite + seed (latin)
├── db-defaults.js     # Contenu par défaut (texte latin)
├── data/site.db       # Base SQLite (créée automatiquement)
└── public/
    ├── index.html     # Site vitrine
    ├── admin.html     # Panel admin
    ├── css/style.css  # Styles site (animations)
    ├── css/admin.css  # Styles admin
    ├── js/main.js     # Logique site (rendu + animations)
    └── js/admin.js    # Logique admin (édition)
```

## 🎨 Sections du site
- **Accueil (Hero)** — titre animé, particules réseau, compteurs
- **Qui sommes-nous** — présentation de l'entreprise + valeurs
- **Services** — 6 prestations (web, network, infra, sécurité, dev, stratégie)
- **Équipe** — présentation des 2 associés
- **Contact** — coordonnées + formulaire (stocké en base)
- **Footer**

## 🔐 Panel admin
Connexion protégée (session). Permet de modifier **tout** le site :
- Texte de chaque section, titres, boutons
- Statistiques, valeurs, services, membres (ajout / suppression)
- Coordonnées, réseaux sociaux
- **Messages** reçus via le formulaire (lecture + suppression)
- Bouton « Réinitialiser » pour revenir au texte latin par défaut

## 🔒 Sécurité
- Mots de passe hachés (bcrypt)
- Sessions signées (express-session)
- Routes admin protégées (`requireAdmin`)
- Échappement HTML côté client (anti-XSS)

## ⚙️ Personnalisation
- **Couleurs / thème** : variables CSS dans `public/css/style.css` (`:root`)
- **Contenu par défaut** : `db-defaults.js`
- **Port** : variable d'env `PORT` (défaut 3000)
