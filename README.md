# ✦ Aurea Consulting — Site de consulting Web & Network

Site vitrine professionnel, très animé, avec **panel d'administration** complet pour modifier tout le contenu.
Architecture **simple et fiable** : Node.js + Express + SQLite, frontend vanilla (HTML/CSS/JS), sans framework lourd.

## ✨ Fonctionnalités
- Site vitrine animé : particules réseau (canvas), compteurs, révélations au scroll
- **Avis clients** : page publique `/avis` + section dynamique sur le site (affichage aléatoire)
- **Multi-comptes admin** avec rôles owner / user
- **Couleur d'accent** modifiable en direct depuis l'admin (variables CSS)
- Formulaire de contact stocké en base, consultable dans l'admin
- Déploiement **Docker** prêt à l'emploi (multi-stage + entrypoint)

## 🚀 Démarrage

```bash
npm install
npm start
```

Puis ouvrir :
- **Site** : http://localhost:3000
- **Avis** : http://localhost:3000/avis
- **Admin** : http://localhost:3000/admin  →  default identifiants `admin` / `admin123`

> Mode dev avec rechargement auto : `npm run dev`

## 🐳 Docker

```bash
docker build -t aurea-consulting .
docker run -p 3000:3000 -v aurea-data:/app/data aurea-consulting
```

- Image multi-stage `node:20-alpine` (build + runtime)
- La base SQLite vit dans `/app/data` → **monter un volume** sur `/app/data` (ex. Dokploy) pour la persister
- `entrypoint.sh` corrige les permissions du volume (monté en root) puis redescend en utilisateur `node`

## 🗂 Architecture

```
Consulting/
├── server.js              # Assemblage Express : sessions, statiques, montage des routes
├── db.js                  # Initialisation SQLite (schéma + seed + compte admin)
├── db-defaults.js         # Contenu par défaut (texte latin)
├── Dockerfile             # Image multi-stage node:20-alpine
├── entrypoint.sh          # Permissions du volume + drop de privilèges (node)
├── data/site.db           # Base SQLite (créée automatiquement)
├── src/
│   ├── middleware/
│   │   └── requireAdmin.js    # Garde de session admin (401 sinon)
│   └── routes/
│       ├── auth.js            # /api/admin/login, /logout, /me
│       ├── content.js         # /api/content, /api/admin/content (CRUD + reset)
│       ├── messages.js        # /api/contact, /api/admin/messages
│       ├── reviews.js         # /api/reviews, /api/admin/reviews
│       └── users.js           # /api/admin/users (comptes admin)
└── public/
    ├── index.html           # Site vitrine
    ├── avis.html            # Page publique « Laisser un avis »
    ├── admin.html           # Panel admin
    ├── css/style.css        # Styles site (animations, variables thème)
    ├── css/admin.css        # Styles admin
    ├── js/main.js           # Logique site (rendu, particules, avis)
    ├── js/avis.js           # Logique du formulaire d'avis
    └── js/admin.js          # Logique admin (édition, messages, avis, comptes)
```

## 🎨 Sections du site
- **Accueil (Hero)** — titre animé, particules réseau, compteurs
- **Qui sommes-nous** — présentation de l'entreprise + 4 valeurs
- **Services** — 6 prestations (web, network, infra, sécurité, dev, stratégie)
- **Équipe** — présentation des 2 associés
- **Avis clients** — section dynamique : masquée si aucun avis, jusqu'à 6 avis affichés aléatoirement (étoiles, nom, date)
- **Contact** — coordonnées + formulaire (stocké en base)
- **Footer**

## ⭐ Avis clients
- Page publique **`/avis`** : nom, note (1–5 étoiles), message — lien à partager avec les clients (disponible dans l'admin, onglet Avis)
- Les avis **visibles** s'affichent aléatoirement sur le site (max 6)
- Admin : afficher / masquer / supprimer chaque avis, compteur dans la navigation

## 🔐 Panel admin
Connexion protégée (session 8 h). Permet de modifier **tout** le site :
- **Accueil / Qui sommes-nous / Services / Équipe / Contact** — textes, titres, boutons, stats, valeurs, services, membres (ajout / suppression)
- **Réglages** — nom du site, slogan, **couleur d'accent** (appliquée en direct), coordonnées, réseaux sociaux
- **Messages** — messages reçus via le formulaire (lecture + suppression, compteur)
- **Avis** — lien public à copier, visibilité, suppression (compteur)
- **Comptes** — gestion des comptes d'administration :
  - Le compte `admin` est **owner** : seul à pouvoir créer / supprimer des comptes et réinitialiser les mots de passe
  - Les autres comptes ne peuvent modifier que **leur propre** mot de passe
  - Protections : compte owner insupprimable, auto-suppression interdite, dernier compte insupprimable
- Bouton « Réinitialiser (latin) » par section pour revenir au contenu par défaut

## 🔒 Sécurité
- Mots de passe hachés (bcryptjs)
- Sessions signées (express-session, 8 h)
- Routes admin protégées par le middleware `requireAdmin`
- Échappement HTML côté client (anti-XSS)
- Validation et bornage des entrées (longueurs max, regex nom d'utilisateur, mdp ≥ 6 caractères)
- Rôles owner / user appliqués côté serveur (pas seulement dans l'UI)

## 🔌 API

| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/api/content` | public | Tout le contenu du site |
| GET | `/api/reviews` | public | Avis visibles |
| POST | `/api/reviews` | public | Déposer un avis |
| POST | `/api/contact` | public | Envoyer un message |
| POST | `/api/admin/login` | public | Connexion admin |
| POST | `/api/admin/logout` | admin | Déconnexion |
| GET | `/api/admin/me` | public | État de la session |
| GET / PUT | `/api/admin/content/:key` | admin | Lire / sauvegarder une section |
| POST | `/api/admin/content/:key/reset` | admin | Réinitialiser une section (latin) |
| GET / DELETE | `/api/admin/messages[/:id]` | admin | Liste / suppression des messages |
| GET | `/api/admin/reviews` | admin | Tous les avis |
| PUT | `/api/admin/reviews/:id/visible` | admin | Afficher / masquer un avis |
| DELETE | `/api/admin/reviews/:id` | admin | Supprimer un avis |
| GET / POST | `/api/admin/users` | admin | Liste / création de comptes (owner) |
| PUT | `/api/admin/users/:id/password` | admin | Changer / réinitialiser un mot de passe |
| DELETE | `/api/admin/users/:id` | admin | Supprimer un compte (owner) |

## ⚙️ Personnalisation
- **Couleur d'accent** : depuis l'admin (Réglages) ou `settings.accentColor` — pilote les variables CSS `--gold-*`
- **Couleurs / thème** : variables CSS dans `public/css/style.css` (`:root`)
- **Contenu par défaut** : `db-defaults.js`
- **Port** : variable d'env `PORT` (défaut 3000)
