# 🔒 Migration : Authentification Sécurisée + RLS

## 🎯 Objectif

Remplacer le système actuel (club_code + password en clair dans localStorage) par une authentification sécurisée avec Supabase Auth et Row Level Security (RLS).

---

## ✅ Avantages

### Avant (système actuel)
❌ Mot de passe en clair dans la table `clubs`  
❌ Authentification basée sur localStorage (vulnérable)  
❌ Aucune protection serveur si le frontend est bidouillé  
❌ Un utilisateur peut potentiellement accéder aux données d'autres clubs

### Après (nouveau système)
✅ Authentification Supabase (email + password hashé)  
✅ Row Level Security (RLS) sur toutes les tables  
✅ Protection serveur : impossible d'accéder aux données d'un autre club  
✅ Session sécurisée avec JWT  
✅ Système de membership flexible (admin, staff, etc.)

---

## 📦 A) Migration SQL

### Étape 1 : Appliquer la migration 021

1. Ouvrir **Supabase SQL Editor**
2. Copier le contenu de `supabase/migrations/021_rls_club_auth.sql`
3. Exécuter

### Ce que fait la migration :

1. **Activer RLS** sur toutes les tables (courts, bookings, products)

2. **Créer la table `club_memberships`** :
   ```sql
   - id (UUID)
   - club_id (UUID → clubs.id)
   - user_id (UUID → auth.users.id)
   - role (text: 'admin', 'staff', etc.)
   - unique(user_id, club_id)
   ```

3. **Créer les policies RLS** :
   - Courts : lecture publique (actifs) + gestion pour les membres
   - Bookings : lecture publique + gestion pour les membres
   - Products : lecture publique (disponibles) + gestion pour les membres

4. **Fonctions helpers** :
   - `is_club_member(club_id, user_id)` : vérifier membership
   - `get_user_clubs(user_id)` : récupérer les clubs d'un user

### Vérification

Après l'exécution, tu devrais voir :

```
========================================
✅ Migration 021: RLS + Club Auth
========================================
RLS courts: true
RLS bookings: true
RLS products: true
RLS club_memberships: true
Memberships existants: 0
========================================
✅ RLS activé sur toutes les tables !
```

---

## 📦 B) Frontend

### Nouveaux fichiers créés

1. **`lib/clubAuth.ts`** : Helpers d'authentification
   - `signInWithEmail(email, password)`
   - `signUpWithEmail(email, password, clubData)`
   - `getUserClubs()` : récupère les clubs du user
   - `getDefaultClub()` : récupère le premier club
   - `signOut()` : déconnexion
   - `isAuthenticated()` : vérifier connexion

2. **`app/club/auth/login/page.tsx`** : Nouvelle page de connexion
   - Login via email/password (Supabase Auth)
   - Design moderne et propre

3. **`app/club/auth/signup/page.tsx`** : Page d'inscription
   - Création de club + compte admin
   - Génération automatique de club_code

### Pages mises à jour

- ✅ `/club/dashboard` : utilise `getDefaultClub()` au lieu de localStorage
- ✅ `/club/courts` : utilise Supabase Auth + RLS
- ✅ `/club/bookings` : utilise Supabase Auth + RLS

---

## 🔄 C) Migration des clubs existants

### Option 1 : Migration manuelle (recommandée)

Pour chaque club existant, créer un compte auth et un membership :

```sql
-- 1. Créer un utilisateur auth (à faire via Supabase Auth UI ou API)
-- Email: club@example.com
-- Password: (choisir un mot de passe)
-- Récupérer le user_id

-- 2. Créer le membership
INSERT INTO public.club_memberships (user_id, club_id, role)
VALUES (
  'user-uuid-from-auth',  -- ID de l'utilisateur créé
  'club-uuid',            -- ID du club existant
  'admin'
);
```

### Option 2 : Script de migration automatique

Créer un script qui :
1. Lit tous les clubs existants
2. Pour chaque club :
   - Crée un user auth avec email = `club.email` ou `club.club_code@padup.one`
   - Génère un mot de passe temporaire
   - Crée le membership
   - Envoie un email au club avec les identifiants

```sql
-- Script SQL pour créer les memberships (une fois les users auth créés)
INSERT INTO public.club_memberships (user_id, club_id, role)
SELECT 
  u.id as user_id,
  c.id as club_id,
  'admin' as role
FROM public.clubs c
JOIN auth.users u ON u.email = c.email
WHERE NOT EXISTS (
  SELECT 1 FROM public.club_memberships m
  WHERE m.user_id = u.id AND m.club_id = c.id
);
```

### Option 3 : Migration progressive (coexistence)

Garder l'ancien système de login (`/club/login`) en parallèle du nouveau (`/club/auth/login`) :
- Les clubs existants utilisent l'ancien système
- Les nouveaux clubs utilisent le nouveau système
- Migration progressive au fil du temps

---

## 🧪 D) Tests

### Test 1 : Inscription d'un nouveau club

```
1. Aller sur /club/auth/signup
2. Remplir le formulaire :
   - Nom du club: "Test Club"
   - Ville: "Paris"
   - Générer un code club
   - Email: test@example.com
   - Password: test1234
3. Créer le compte
4. ✅ Redirection vers /club/dashboard
5. ✅ Dashboard affiche les infos du club
```

### Test 2 : Connexion

```
1. Se déconnecter
2. Aller sur /club/auth/login
3. Se connecter avec test@example.com / test1234
4. ✅ Redirection vers /club/dashboard
5. ✅ Les données du club s'affichent
```

### Test 3 : Gestion des terrains avec RLS

```
1. Connecté en tant que Club A
2. Créer un terrain
3. ✅ Le terrain est créé
4. Se déconnecter
5. Se connecter en tant que Club B
6. ✅ Le terrain du Club A n'est PAS visible
7. ✅ Isolation des données confirmée
```

### Test 4 : Protection RLS

```sql
-- Dans Supabase SQL Editor, tenter d'accéder aux courts d'un autre club
SELECT * FROM public.courts WHERE club_id = 'autre-club-id';

-- ✅ La requête devrait retourner 0 résultats (RLS bloque l'accès)
```

---

## 🔒 E) Sécurité

### Ce qui est maintenant protégé

1. **Authentification** :
   - Password hashé par Supabase
   - Session JWT sécurisée
   - Refresh token automatique

2. **Row Level Security** :
   - Courts : accessible uniquement aux membres du club
   - Bookings : accessible uniquement aux membres du club
   - Products : accessible uniquement aux membres du club

3. **Protection serveur** :
   - Même si quelqu'un bidouille le frontend
   - Même si quelqu'un accède directement à l'API
   - RLS empêche l'accès aux données d'autres clubs

### Flow de sécurité

```
1. User login → Supabase Auth vérifie email/password
2. Session JWT créée → Stockée de façon sécurisée
3. Requête DB → Supabase vérifie le JWT
4. RLS policies → Vérifient le membership via auth.uid()
5. Si membership OK → Accès autorisé
6. Sinon → Accès refusé (erreur 403)
```

---

## 📊 F) Schéma de la nouvelle architecture

```
┌─────────────────┐
│  Frontend       │
│  (Next.js)      │
└────────┬────────┘
         │
         │ Login (email/password)
         ▼
┌─────────────────┐
│  Supabase Auth  │
│  (JWT/Session)  │
└────────┬────────┘
         │
         │ JWT Token
         ▼
┌─────────────────┐
│  Supabase DB    │
│  + RLS          │
└────────┬────────┘
         │
         │ Vérifie membership via auth.uid()
         ▼
┌─────────────────┐
│ club_memberships│
│  user_id        │
│  club_id        │
│  role           │
└─────────────────┘
         │
         │ Si membership OK
         ▼
┌─────────────────┐
│  Données club   │
│  - courts       │
│  - bookings     │
│  - products     │
└─────────────────┘
```

---

## 🚀 G) Déploiement

### Étapes de déploiement en production

1. ✅ **Appliquer la migration SQL** dans Supabase production

2. ✅ **Créer les memberships** pour les clubs existants

3. ✅ **Tester l'authentification** avec plusieurs clubs

4. ✅ **Vérifier RLS** : tentative d'accès cross-club

5. ✅ **Notifier les clubs** : nouveaux identifiants

6. ✅ **Surveiller les logs** : erreurs d'auth, erreurs RLS

---

## 🐛 H) Troubleshooting

### Problème : "Cannot read properties of null (reading 'id')"

**Cause** : User non authentifié ou session expirée

**Solution** :
```typescript
const club = await getDefaultClub()
if (!club) {
  router.push('/club/auth/login')
  return
}
```

### Problème : RLS bloque les requêtes même pour les membres

**Cause** : Membership manquant ou role incorrect

**Solution** :
```sql
-- Vérifier le membership
SELECT * FROM public.club_memberships
WHERE user_id = 'your-user-id';

-- Créer le membership si manquant
INSERT INTO public.club_memberships (user_id, club_id, role)
VALUES ('user-id', 'club-id', 'admin');
```

### Problème : "Policy error" lors de l'insertion

**Cause** : Policy RLS trop restrictive

**Solution** :
```sql
-- Vérifier les policies
SELECT * FROM pg_policies WHERE tablename = 'courts';

-- Réappliquer la migration si nécessaire
```

---

## 📚 I) Documentation des helpers

### `lib/clubAuth.ts`

```typescript
// Connexion
const { user, error } = await signInWithEmail(email, password)

// Inscription
const { club, error } = await signUpWithEmail(email, password, clubData)

// Récupérer les clubs
const clubs = await getUserClubs()

// Récupérer le club par défaut
const club = await getDefaultClub()

// Déconnexion
await signOut()

// Vérifier la connexion
const isAuth = await isAuthenticated()

// Vérifier membership
const isMember = await isMemberOfClub(clubId)
```

---

## ✅ J) Checklist finale

### Base de données
- [ ] Migration 021 appliquée
- [ ] RLS activé sur courts, bookings, products
- [ ] Table club_memberships créée
- [ ] Policies RLS créées
- [ ] Fonctions helpers créées

### Frontend
- [ ] `lib/clubAuth.ts` créé
- [ ] Page `/club/auth/login` créée
- [ ] Page `/club/auth/signup` créée
- [ ] Dashboard mis à jour
- [ ] Courts mis à jour
- [ ] Bookings mis à jour

### Migration
- [ ] Clubs existants migrés (memberships créés)
- [ ] Tests d'authentification OK
- [ ] Tests d'isolation RLS OK
- [ ] Emails envoyés aux clubs

### Sécurité
- [ ] Passwords hashés (Supabase Auth)
- [ ] RLS actif et testé
- [ ] Cross-club access bloqué
- [ ] Session JWT sécurisée

---

**✨ Le système est maintenant sécurisé !**

L'accès aux données est protégé au niveau serveur via RLS. Même si quelqu'un bidouille le frontend, les données restent isolées par club. 🔒
