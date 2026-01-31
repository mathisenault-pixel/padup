# 📚 Documentation Pad'up MVP

Index de la documentation technique et produit.

---

## 📋 Documents Principaux

### 1. [MVP.md](./MVP.md)
**Définition Produit**
- Vision et cibles
- Parcours joueur et club
- Règles métier (anti double-booking)
- Hors scope v0
- Critères de succès

### 2. [ARCHITECTURE.md](./ARCHITECTURE.md)
**Architecture Technique**
- Stack technique (Next.js 16 + Supabase)
- Structure des routes
- Auth & autorisation
- Schéma base de données
- Stratégie anti double-booking
- Déploiement

### 3. [TODO.md](./TODO.md)
**Checklist de Développement**
- Phases ordonnées (Setup → DB → Auth → UI → Tests → Deploy)
- Tâches détaillées avec checkboxes
- Estimation temps

---

## 🚀 Quick Start

### Installation Locale
```bash
# Cloner le repo
git clone <repo-url>
cd padup.one

# Installer dépendances
npm install

# Copier .env.example vers .env.local
cp .env.example .env.local
# Éditer .env.local avec vos vraies credentials Supabase

# Lancer en dev
npm run dev
```

### Accès Pages MVP
- **Joueurs (public)** : http://localhost:3000
- **Réservation** : http://localhost:3000/book
- **Dashboard Club** : http://localhost:3000/club (authentification requise)

---

## 🗂️ Structure Projet

```
padup.one/
├── app/
│   ├── (public)/          # Routes publiques joueurs
│   │   ├── page.tsx       # Landing page
│   │   └── book/          # Pages réservation
│   ├── club/              # Dashboard clubs (auth requis)
│   │   ├── page.tsx       # Accueil dashboard
│   │   ├── bookings/      # Planning réservations
│   │   └── products/      # Gestion produits/extras
│   ├── layout.tsx         # Layout racine
│   └── globals.css        # Styles globaux
├── lib/
│   ├── auth/              # Helpers authentification
│   ├── supabase/          # Clients Supabase
│   └── email/             # Templates emails
├── docs/
│   ├── MVP.md             # Ce fichier
│   ├── ARCHITECTURE.md    # Architecture technique
│   └── TODO.md            # Checklist développement
├── supabase/
│   └── migrations/        # Migrations SQL versionnées
├── tests/                 # Tests (sécurité, E2E)
├── .env.example           # Variables d'environnement template
└── README.md              # Documentation principale
```

---

## 🔑 Prérequis

### Développement
- **Node.js** : 18+ (recommandé 20)
- **npm** : 9+
- **Compte Supabase** : Gratuit (https://supabase.com)
- **Compte Resend** : Gratuit (optionnel, pour emails)

### Production
- **Vercel** : Déploiement recommandé
- **Domaine** : Optionnel pour MVP

---

## 🧪 Commandes Utiles

```bash
# Développement
npm run dev              # Lancer serveur dev (localhost:3000)
npm run build            # Builder pour production
npm run start            # Lancer en mode production
npm run lint             # Vérifier ESLint

# Tests
npm run test             # Lancer tous les tests
npm run test:security    # Tests de sécurité uniquement

# Supabase (si CLI installé)
supabase db reset        # Reset DB locale + appliquer migrations
supabase migration new   # Créer nouvelle migration
supabase db push         # Pousser migrations en prod
```

---

## 📦 Stack Technique

| Couche | Technologie | Version |
|--------|-------------|---------|
| **Frontend** | Next.js | 16.0.10 |
| **Langage** | TypeScript | 5.x |
| **Styling** | Tailwind CSS | 4.x |
| **Backend** | Supabase (BaaS) | Latest |
| **Database** | PostgreSQL | 15+ (via Supabase) |
| **Auth** | Supabase Auth | - |
| **Email** | Resend | Latest |
| **Déploiement** | Vercel | - |

---

## 🛡️ Sécurité

### Authentification
- Routes `/club/*` protégées par middleware Next.js
- Vérification du rôle (owner/staff) via table `memberships`
- Session HTTP-only cookies (Supabase SSR)

### Row Level Security (RLS)
- Activé sur toutes les tables sensibles
- Joueurs voient uniquement leurs réservations
- Clubs voient uniquement leurs données

### Tests
- Tests de sécurité automatisés (`npm run test:security`)
- Vérification anti double-booking
- Validation inputs côté serveur

---

## 📅 Phases de Développement

| Phase | Objectif | Statut |
|-------|----------|--------|
| **Phase 1** | Setup & Infrastructure | ⏳ En cours |
| **Phase 2** | Base de données & migrations | 🔜 À venir |
| **Phase 3** | Authentification | 🔜 À venir |
| **Phase 4** | Interface Joueur | 🔜 À venir |
| **Phase 5** | Dashboard Club | 🔜 À venir |
| **Phase 6** | Emails & Notifications | 🔜 À venir |
| **Phase 7** | Tests & Sécurité | 🔜 À venir |
| **Phase 8** | UI/UX Polish | 🔜 À venir |
| **Phase 9** | QA | 🔜 À venir |
| **Phase 10** | Déploiement | 🔜 À venir |

---

## 📖 Ressources Externes

- **Next.js Docs** : https://nextjs.org/docs
- **Supabase Docs** : https://supabase.com/docs
- **Tailwind CSS** : https://tailwindcss.com/docs
- **TypeScript** : https://www.typescriptlang.org/docs

---

## 🤝 Contribution

Pour contribuer au projet :
1. Lire `docs/ARCHITECTURE.md` pour comprendre les choix techniques
2. Vérifier `docs/TODO.md` pour les tâches en cours
3. Suivre les conventions de code (ESLint)
4. Tester localement avant de commit

---

## 📝 Notes

- **Version actuelle** : 0.1 MVP (en développement)
- **Date dernière mise à jour** : 2026-01-22
- **Auteur** : Équipe Pad'up

---

## ❓ Besoin d'Aide ?

- **Problème technique** : Vérifier `docs/ARCHITECTURE.md`
- **Question produit** : Voir `docs/MVP.md`
- **Tâche à faire** : Consulter `docs/TODO.md`
- **Bug de sécurité** : Créer une issue avec label `security`
