# Pad'Up - Plateforme SaaS de Réservation de Terrains de Padel

Site web moderne pour la gestion et la réservation de terrains de padel.

## 🚀 Technologies

- **Next.js 16** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utility-first
- **Supabase** - Backend as a Service (Auth + Database)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Un compte Supabase (gratuit)

## 🛠️ Installation

1. **Cloner le projet et installer les dépendances :**

```bash
npm install
```

2. **Configurer Supabase :**

Créez un fichier `.env.local` à la racine :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

3. **Configurer la base de données :**

Consultez le fichier `SUPABASE_SETUP.md` pour les instructions détaillées.

Exécutez le script SQL dans `supabase/schema.sql` depuis le SQL Editor de Supabase.

4. **Démarrer le serveur de développement :**

```bash
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du Projet

```
padup.one/
├── app/
│   ├── page.tsx                    # Page d'accueil
│   ├── club/
│   │   ├── login/
│   │   │   ├── page.tsx           # Page de connexion
│   │   │   └── actions.ts         # Actions serveur (login/signup)
│   │   └── dashboard/
│   │       ├── page.tsx           # Dashboard club (protégé)
│   │       └── actions.ts         # Actions serveur (logout)
├── lib/
│   └── supabase/
│       ├── client.ts              # Client Supabase (côté client)
│       ├── server.ts              # Client Supabase (côté serveur)
│       └── middleware.ts          # Utilitaire pour le middleware
├── middleware.ts                   # Middleware Next.js (protection routes)
├── supabase/
│   └── schema.sql                 # Schéma de la base de données
└── SUPABASE_SETUP.md              # Instructions de configuration
```

## 🔐 Authentification

### Pages disponibles :

- `/` - Page d'accueil publique
- `/club/login` - Connexion/Inscription pour les clubs
- `/club/dashboard` - Dashboard club (protégé, nécessite authentification)

### Fonctionnalités :

✅ Inscription par email/mot de passe  
✅ Connexion par email/mot de passe  
✅ Déconnexion  
✅ Protection automatique des routes via middleware  
✅ Création automatique du profil club lors de l'inscription  
✅ Gestion des sessions sécurisées  

## 🗄️ Base de Données

### Table `profiles`

Stocke les informations des clubs :

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid | ID de l'utilisateur |
| email | text | Email du club |
| role | text | Rôle (default: 'club') |
| club_name | text | Nom du club (nullable) |
| created_at | timestamp | Date de création |
| updated_at | timestamp | Date de modification |

Les profils sont créés automatiquement lors de l'inscription via un trigger Postgres.

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Middleware Next.js** pour protéger les routes sensibles
- **Sessions gérées via cookies** sécurisés et httpOnly
- **Politiques RLS** : les utilisateurs ne peuvent accéder qu'à leurs propres données

## 📝 Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint
```

## 🚀 Déploiement

Le projet peut être déployé sur [Vercel](https://vercel.com) en quelques clics :

1. Push votre code sur GitHub
2. Importez le projet dans Vercel
3. Ajoutez vos variables d'environnement Supabase
4. Déployez !

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## 📄 Licence

MIT
