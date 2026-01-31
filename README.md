# TAC1 Boost 🚀

Application web de révision interactive pour l'examen TAC1 (SvelteKit + Svelte 5 + TypeScript + Tailwind).

## 🎯 Fonctionnalités

- **Quiz randomisé** : questions et réponses mélangées
- **Modes d'entraînement** : Rapide (10Q/3min), Moyen (25Q/10min), Long (50Q/25min), Complet (100Q/60min)
- **Modes officiels** : TAC1 Organisationnel et TAC1 Trésorerie (50Q/30min)
- **Mode personnalisé** : choix du nombre de questions, du temps et des catégories
- **Timer** : compte à rebours et suivi du temps passé
- **Corrections détaillées** : bonnes réponses + explications (si disponibles)
- **Raccourcis clavier** : Entrée/Espace pour passer à la question suivante
- **Scores & leaderboard** : sauvegarde des scores officiels et classement global
- **Profil utilisateur** : historique, progression et stats par catégorie
- **Administration** : dashboard, gestion des questions, import JSON, gestion des utilisateurs

## 🏃‍♂️ Démarrage rapide avec Docker

### Production (recommandé)

```bash
# Lancer l'application en mode production
docker-compose up

# Accéder à l'application
http://localhost:3500
```

### Développement

```bash
# Lancer en mode développement avec hot-reload
docker-compose -f docker-compose-dev.yml up

# Accéder à l'application
http://localhost:5173
```

## 🛠️ Développement local

### Prérequis

- Node.js 20+
- pnpm

### Installation

```bash
# Installer les dépendances
pnpm install

# Lancer en mode développement
pnpm run dev

# Build pour la production
pnpm run build

# Prévisualiser le build
pnpm run preview
```

### Variables d'environnement

Le projet utilise Auth.js (Google) et une base SQLite locale. Exemple de variables à définir dans `.env` :

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
AUTH_SECRET=...
ADMIN_EMAILS=admin@exemple.com,autre@exemple.com
DATABASE_PATH=/chemin/vers/data/tac1.db
```

- `ADMIN_EMAILS` : promotion automatique des comptes en admin.
- `DATABASE_PATH` : optionnel (par défaut `data/tac1.db`).

## 📁 Structure du projet

```
src/
├── lib/
│   ├── components/        # Composants Svelte (UI + pages)
│   ├── server/            # Auth + accès DB SQLite
│   ├── assets/            # Images et icônes
│   ├── types.ts           # Types TypeScript
│   ├── stores.ts          # Stores Svelte
│   └── quiz.ts            # Logique du quiz
├── routes/
│   ├── api/               # Endpoints (scores, profil)
│   ├── admin/             # Dashboard admin & gestion contenu
│   └── ...                # Pages publiques (home, scoreboard, profil)
└── app.css                # Styles globaux
```

## 📊 Données

- Les questions et résultats sont stockés en **SQLite** (fichier local `data/tac1.db`, non versionné).
- Les catégories sont seedées automatiquement au démarrage (CLR, Mouvement, Organisationnel, Trésorerie).
- Les questions peuvent être chargées depuis un CSV local :

```bash
pnpm run seed
# Charge data/seed/seed-questions.csv (non versionné)
```

## 📥 Import JSON (questions)

L'import admin attend une liste d'objets avec une question et ses réponses :

```json
[
  {
    "question": "Selon les normes de la CNJE, quel est le principe fondamental pour l'organisation du pôle trésorerie afin d'assurer la protection de la structure ?",
    "answerOptions": [
      {
        "text": "L'intervention d'au moins deux personnes utilisant des outils séparés.",
        "isCorrect": true,
        "rationale": "Le contrôle interne en trésorerie se matérialise par la séparation des tâches et des outils, impliquant au minimum deux intervenants pour prévenir les risques."
      },
      {
        "text": "La nomination d'un trésorier unique ayant tous les accès pour plus d'efficacité.",
        "isCorrect": false,
        "rationale": "Centraliser tous les accès sur une seule personne est contraire au principe de contrôle interne, car cela augmente considérablement les risques d'erreurs ou de fraude."
      },
      {
        "text": "L'utilisation d'un seul logiciel de gestion partagé par toute l'équipe.",
        "isCorrect": false,
        "rationale": "Le principe de contrôle interne requiert l'utilisation d'outils différents et séparés pour permettre une vérification croisée des informations."
      },
      {
        "text": "Une validation des dépenses par le Président à la fin de chaque mois.",
        "isCorrect": false,
        "rationale": "Bien que la validation soit une bonne pratique, le principe fondamental du contrôle interne est la séparation des tâches au quotidien, et non un contrôle a posteriori."
      }
    ]
  }
]
```

## 🐳 Configuration Docker

- **Production** : `Dockerfile` (build + runtime, port `3500`)
- **Développement** : `Dockerfile.dev` (hot-reload, port `5173`)

## 🎨 Technologies

- **Svelte 5**
- **SvelteKit**
- **TypeScript**
- **Tailwind CSS**
- **SQLite** (better-sqlite3)
- **Auth.js** (Google)
- **Vite**

## 📝 Scripts disponibles

```bash
pnpm run dev          # Serveur de développement
pnpm run build        # Build production
pnpm run preview      # Prévisualiser le build
pnpm run seed         # Charge les questions depuis data/seed/seed-questions.csv
pnpm run check        # Vérification TypeScript
pnpm run lint         # Linter ESLint + Prettier
pnpm run lint:fix     # Linter + auto-fix
pnpm run format       # Formater le code
```

---

Développé pour optimiser la révision de l'examen TAC1 ! 📚✨
