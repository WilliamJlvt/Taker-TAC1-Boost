# TAC1 Boost 🚀

Application web de révision interactive pour l'examen TAC1 avec Svelte, TypeScript et Tailwind CSS.

## 🎯 Fonctionnalités

- **Quiz randomisé** : Questions et réponses mélangées aléatoirement
- **Timer intelligent** : Compte à rebours avec alertes visuelles
- **Modes prédéfinis** : Rapide (10Q/3min), Moyen, Long, Complet
- **Mode personnalisé** : Choisir le nombre de questions et le temps
- **Raccourcis clavier** : Entrée/Espace pour passer rapidement
- **Analyse détaillée** : Résultats par catégorie avec erreurs
- **Interface responsive** : Mobile-first avec animations
- **Export/Partage** : Téléchargement et partage des résultats

## 🏃‍♂️ Démarrage rapide avec Docker

### Production (recommandé)
```bash
# Lancer l'application en mode production
docker-compose up

# Accéder à l'application
http://localhost:3000
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
- Node.js 18+
- npm

### Installation
```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build
npm run preview
```

## 📁 Structure du projet

```
src/
├── lib/
│   ├── components/        # Composants Svelte
│   │   ├── StartScreen.svelte
│   │   ├── QuestionCard.svelte
│   │   ├── Timer.svelte
│   │   └── ResultScreen.svelte
│   ├── data/             # Données des questions CSV
│   ├── assets/           # Images et icônes
│   ├── types.ts          # Types TypeScript
│   ├── stores.ts         # Stores Svelte
│   └── quiz.ts           # Logique du quiz
├── routes/               # Pages SvelteKit
└── app.css              # Styles globaux
```

## 🎮 Utilisation

1. **Choisir un mode** : Sélectionner un mode prédéfini ou personnaliser
2. **Répondre aux questions** : Cliquer sur les réponses
3. **Navigation rapide** : Utiliser Entrée/Espace pour passer rapidement
4. **Analyser les résultats** : Voir le score et les erreurs détaillées
5. **Partager** : Exporter ou partager ses résultats

## 🐳 Configuration Docker

L'application utilise deux configurations Docker :

- **Production** (`Dockerfile`) : Version optimisée avec build
- **Développement** (`Dockerfile.dev`) : Version avec hot-reload

## 📊 Données

L'application utilise 3 fichiers CSV avec les questions :
- **CLR** : Questions sur la réglementation
- **Mouvement** : Questions sur les mouvements  
- **Organisationnel** : Questions organisationnels

## 🎨 Technologies

- **Svelte 5** : Framework réactif avec runes
- **SvelteKit** : Meta-framework full-stack
- **TypeScript** : Typage statique
- **Tailwind CSS** : Framework CSS utility-first
- **Vite** : Build tool rapide

## 📝 Scripts disponibles

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run preview      # Prévisualiser le build
npm run check        # Vérification TypeScript
npm run lint         # Linter ESLint + Prettier
npm run format       # Formater le code
```

---

Développé pour optimiser la révision de l'examen TAC1 ! 📚✨
