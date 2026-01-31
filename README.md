# 🎾 Pad'up - Plateforme de Réservation de Padel

> Plateforme de réservation en ligne pour clubs de padel indépendants

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Latest-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-cyan)](https://tailwindcss.com/)

---

## 📋 Description

**Pad'up** permet aux joueurs de padel de réserver facilement un terrain dans leur club préféré, et aux clubs de gérer leur planning et services additionnels (boissons, snacks) depuis un dashboard dédié.

### ✨ Fonctionnalités Clés

**Pour les Joueurs**
- 🔍 Consulter les clubs et disponibilités
- 📅 Réserver un terrain en quelques clics
- ✉️ Recevoir une confirmation par email
- 📱 Interface responsive (mobile-first)

**Pour les Clubs**
- 📊 Dashboard avec statistiques temps réel
- 🗓️ Planning des réservations par terrain
- ✅ Confirmer/annuler des réservations
- 🍹 Gérer les produits (boissons, snacks)
- 📦 Voir les commandes d'extras

---

## 🚀 Quick Start

### Prérequis

- **Node.js** 18+ (recommandé 20)
- **npm** 9+
- Compte **Supabase** (gratuit)

### Installation

```bash
# Cloner le repo
git clone https://github.com/votre-username/padup.one.git
cd padup.one

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
# Éditer .env.local avec vos credentials Supabase
```

### Configuration Supabase

1. Créer un projet sur [supabase.com](https://supabase.com)
2. Copier l'URL du projet et l'anon key dans `.env.local`
3. Appliquer les migrations (optionnel pour v0) :
   ```bash
   # Si Supabase CLI installé
   supabase db reset
   ```

### Lancer en Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## 📁 Structure du Projet

```
padup.one/
├── app/
│   ├── (public)/              # 🌐 Routes publiques (joueurs)
│   │   ├── page.tsx           # Landing page
│   │   └── book/              # Pages de réservation
│   │       ├── page.tsx       # Liste des clubs
│   │       └── [clubId]/      # Calendrier par club (à venir)
│   ├── club/                  # 🏢 Dashboard clubs (auth requise)
│   │   ├── page.tsx           # Accueil dashboard
│   │   ├── bookings/          # Planning réservations
│   │   │   └── page.tsx
│   │   └── products/          # Gestion produits/extras
│   │       └── page.tsx
│   ├── layout.tsx             # Layout racine
│   ├── globals.css            # Styles globaux (Tailwind)
│   └── ...                    # Pages existantes (login, 403, etc.)
├── lib/
│   ├── auth/                  # Helpers authentification
│   ├── supabase/              # Clients Supabase (browser/server)
│   ├── email/                 # Templates emails
│   └── debug.ts               # Utilitaire debug (dev only)
├── docs/                      # 📚 Documentation
│   ├── INDEX.md               # Index de la documentation
│   ├── MVP.md                 # Définition produit MVP
│   ├── ARCHITECTURE.md        # Architecture technique
│   └── TODO.md                # Checklist développement
├── supabase/
│   └── migrations/            # Migrations SQL versionnées
├── tests/                     # Tests (sécurité, E2E)
├── .env.example               # Template variables d'environnement
├── package.json
└── README.md                  # Ce fichier
```

---

## 🧑‍💻 Scripts Disponibles

```bash
# Développement
npm run dev              # Lancer serveur dev (localhost:3000)
npm run build            # Builder pour production
npm run start            # Lancer en mode production
npm run lint             # Vérifier ESLint

# Tests
npm run test             # Lancer tous les tests
npm run test:security    # Tests de sécurité uniquement
```

---

## 🗄️ Base de Données

### Tables Principales

- **clubs** : Informations des clubs (nom, adresse, contact)
- **courts** : Terrains par club (nom, actif/inactif)
- **bookings** : Réservations (date, heure, joueur, statut)
- **products** : Produits vendus (boissons, snacks, prix)
- **orders** : Commandes d'extras liées aux réservations
- **memberships** : Rôles des utilisateurs (owner/staff)

### Migrations

Les migrations SQL sont dans `supabase/migrations/`. Pour les appliquer :

```bash
# Local (avec Supabase CLI)
supabase db reset

# Production
supabase db push
```

---

## 🔐 Authentification & Sécurité

### Authentification
- **Méthode** : Supabase Auth (Email/Password + Magic Link optionnel)
- **Session** : Cookies HTTP-only via `@supabase/ssr`
- **Protection routes** : Middleware Next.js pour `/club/*`

### Autorisation
- Rôles définis dans la table `memberships` (owner/staff)
- Vérification du rôle avant accès au dashboard club
- Row Level Security (RLS) activé sur toutes les tables sensibles

### Tests de Sécurité
```bash
npm run test:security
```

---

## 🎨 Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Framework** | Next.js (App Router) | 16.0.10 |
| **Langage** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Backend** | Supabase (BaaS) | Latest |
| **Database** | PostgreSQL | 15+ |
| **Auth** | Supabase Auth | - |
| **Email** | Resend (optionnel v0) | Latest |
| **Déploiement** | Vercel | - |

---

## 📖 Documentation Complète

La documentation détaillée est disponible dans le dossier `/docs` :

- **[INDEX.md](./docs/INDEX.md)** : Index de la documentation
- **[MVP.md](./docs/MVP.md)** : Définition produit MVP
  - Vision et cibles
  - Parcours utilisateurs
  - Règles métier (anti double-booking)
  - Hors scope v0
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** : Architecture technique
  - Stack et choix techniques
  - Schéma base de données
  - Routes et navigation
  - Stratégie anti double-booking
- **[TODO.md](./docs/TODO.md)** : Checklist de développement
  - Phases ordonnées
  - Tâches détaillées
  - Estimation temps

---

## 🚢 Déploiement

### Vercel (Recommandé)

1. Connecter le repo GitHub à Vercel
2. Ajouter les variables d'environnement :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   RESEND_API_KEY=re_xxx... (optionnel)
   ```
3. Déployer automatiquement à chaque push sur `main`

### Post-Déploiement

- Appliquer les migrations Supabase en production
- Tester le parcours complet (réservation + dashboard)
- Configurer le domaine custom (optionnel)

---

## 🧪 Tests

### Tests de Sécurité (MVP)
```bash
npm run test:security
```
Vérifie :
- Protection des routes `/club/*`
- Vérification des rôles
- Anti double-booking

### Tests E2E (v1+)
À venir avec Playwright.

---

## 📅 Roadmap

### ✅ v0.1 MVP (En cours)
- [x] Structure projet Next.js + Tailwind
- [x] Pages placeholders (joueurs + clubs)
- [x] Documentation technique
- [ ] Base de données Supabase
- [ ] Authentification & rôles
- [ ] Parcours réservation complet
- [ ] Dashboard club fonctionnel
- [ ] Emails de confirmation

### 🔜 v0.2 (Post-MVP)
- [ ] Paiement en ligne (Stripe)
- [ ] Notifications SMS (Twilio)
- [ ] Compte joueur complet
- [ ] Historique réservations

### 🚀 v1.0
- [ ] Multi-clubs pour un owner
- [ ] Analytics club
- [ ] Promotions/codes promo
- [ ] App mobile (React Native)

---

## 🤝 Contribution

Pour contribuer :
1. Fork le repo
2. Créer une branche (`git checkout -b feature/ma-feature`)
3. Commit les changements (`git commit -m 'Add: ma feature'`)
4. Push vers la branche (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

**Conventions** :
- Suivre ESLint
- Écrire des commits clairs
- Tester localement avant PR

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## 👥 Auteurs

- **Équipe Pad'up** - Développement initial

---

## 🙏 Remerciements

- Next.js Team pour le framework
- Supabase Team pour le BaaS
- Tailwind CSS pour le framework CSS
- Vercel pour l'hébergement

---

## 📞 Contact

Pour toute question ou support :
- **Email** : contact@padup.com (à configurer)
- **GitHub Issues** : [Créer une issue](https://github.com/votre-username/padup.one/issues)

---

**Version actuelle** : 0.1 MVP (en développement)  
**Dernière mise à jour** : 2026-01-22
