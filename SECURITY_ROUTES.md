# 🔐 Documentation de Sécurité - Routes & Redirections

## 📋 ROUTES PUBLIQUES

### Routes accessibles sans authentification

| Route | Description | Comportement |
|-------|-------------|--------------|
| `/` | Home | Redirect automatique vers `/player/accueil` |
| `/player/accueil` | Page d'accueil publique | Affiche le contenu, header conditionnel (Connexion si déconnecté, Profil si connecté) |
| `/login` | Page de connexion principale | Formulaire email/password. Si déjà connecté → redirect vers espace approprié |
| `/player/login` | Page de connexion joueur | Formulaire email/password. Si déjà connecté → redirect vers `/player/accueil` |
| `/club/login` | Page de connexion club | Formulaire email/password. Si déjà connecté → redirect vers `/club/accueil` |
| `/account` | Page test auth (legacy) | Redirect permanent vers `/player/accueil` |

**Total : 6 routes publiques**

---

## 🔒 ROUTES PRIVÉES - PLAYER

### Routes nécessitant authentification + role=player

| Route | Description | Protection |
|-------|-------------|-----------|
| `/player/clubs` | Liste des clubs | ✅ Auth + role=player |
| `/player/reservations` | Réservations du joueur | ✅ Auth + role=player |
| `/player/tournois` | Tournois disponibles | ✅ Auth + role=player |
| `/player/messages` | Messagerie | ✅ Auth + role=player |
| `/player/profil` | Profil utilisateur | ✅ Auth + role=player |
| `/player/dashboard` | Tableau de bord | ✅ Auth + role=player |

**Total : 6 routes privées player**

---

## 🔒 ROUTES PRIVÉES - CLUB

### Routes nécessitant authentification + role=club

| Route | Description | Protection |
|-------|-------------|-----------|
| `/club/accueil` | Accueil espace club | ✅ Auth + role=club |
| `/club/dashboard` | Tableau de bord club | ✅ Auth + role=club |
| `/club/clients` | Gestion clients | ✅ Auth + role=club |
| `/club/exploitation` | Exploitation | ✅ Auth + role=club |
| `/club/parametres` | Paramètres | ✅ Auth + role=club |
| `/club/pilotage` | Pilotage | ✅ Auth + role=club |
| `/club/revenus` | Revenus | ✅ Auth + role=club |

**Total : 7 routes privées club**

---

## 🔀 RÈGLES DE REDIRECTION

### 1️⃣ VISITEUR NON CONNECTÉ

| Action | Résultat | Redirection |
|--------|----------|-------------|
| Accède à `/` | ✅ Autorisé | → `/player/accueil` |
| Accède à `/player/accueil` | ✅ Autorisé | Aucune (page s'affiche) |
| Accède à `/login` | ✅ Autorisé | Aucune (formulaire s'affiche) |
| Accède à `/player/clubs` | ❌ Bloqué | → `/login` |
| Accède à `/player/reservations` | ❌ Bloqué | → `/login` |
| Accède à `/player/messages` | ❌ Bloqué | → `/login` |
| Accède à `/club/accueil` | ❌ Bloqué | → `/club/login` |
| Accède à `/club/dashboard` | ❌ Bloqué | → `/club/login` |

**Règle : Routes privées redirigent vers page de login appropriée**

---

### 2️⃣ UTILISATEUR CONNECTÉ (role=player)

| Action | Résultat | Redirection |
|--------|----------|-------------|
| Accède à `/player/accueil` | ✅ Autorisé | Aucune (header montre profil) |
| Accède à `/player/clubs` | ✅ Autorisé | Aucune (contenu affiché) |
| Accède à `/player/reservations` | ✅ Autorisé | Aucune (contenu affiché) |
| Accède à `/player/messages` | ✅ Autorisé | Aucune (contenu affiché) |
| Accède à `/login` | ❌ Déjà connecté | → `/player/accueil` |
| Accède à `/club/accueil` | ❌ Mauvais rôle | → `/player/accueil` |
| Accède à `/club/dashboard` | ❌ Mauvais rôle | → `/player/accueil` |

**Règle : Player ne peut pas accéder aux routes club**

---

### 3️⃣ UTILISATEUR CONNECTÉ (role=club)

| Action | Résultat | Redirection |
|--------|----------|-------------|
| Accède à `/club/accueil` | ✅ Autorisé | Aucune (contenu affiché) |
| Accède à `/club/dashboard` | ✅ Autorisé | Aucune (contenu affiché) |
| Accède à `/club/clients` | ✅ Autorisé | Aucune (contenu affiché) |
| Accède à `/login` | ❌ Déjà connecté | → `/club/accueil` |
| Accède à `/player/reservations` | ❌ Mauvais rôle | → `/club/accueil` |
| Accède à `/player/messages` | ❌ Mauvais rôle | → `/club/accueil` |

**Règle : Club ne peut pas accéder aux routes player privées**

---

### 4️⃣ APRÈS LOGOUT

| Action | Résultat | Redirection |
|--------|----------|-------------|
| Clic "Déconnexion" | ✅ Déconnecté | → `/player/accueil` |
| Session supprimée | ✅ Confirmé | Cookie Supabase effacé |
| Header | ✅ Mis à jour | Affiche "Connexion / Inscription" |
| Tentative `/player/reservations` | ❌ Bloqué | → `/login` |

**Règle : Après logout, toutes les routes privées sont à nouveau bloquées**

---

## 🛡️ MÉCANISME DE PROTECTION

### Fichier : `middleware.ts`

**Logique de sécurité :**

```typescript
1. Détection du type de route (publique / privée player / privée club)

2. RÈGLE 1 : Route publique
   → Laisser passer
   → Exception : Si user sur /login → redirect vers espace approprié

3. RÈGLE 2 : Route privée SANS user
   → Redirect vers /login (ou /club/login si route club)

4. RÈGLE 3 : Route privée AVEC user
   → Vérifier le rôle dans la table profiles
   → Si mauvais rôle : redirect vers espace correct
   → Si pas de profil : déconnecter + redirect vers login
```

**Avantages :**
- ✅ Protection SSR (avant rendu)
- ✅ Centralisée (une seule source)
- ✅ Vérification des rôles
- ✅ Aucune route publique bloquée par erreur

---

## 🔍 LOGS DE DÉBOGAGE

### En développement uniquement

Le middleware log les redirections pour faciliter le debugging :

```typescript
// Exemple de logs en dev
[SECURITY] Non-auth user trying to access /player/reservations → redirect /login
[SECURITY] Club user trying to access /player/reservations → redirect /club/accueil
[SECURITY] Player user on /login → redirect /player/accueil
```

**Les logs sont désactivés en production**

---

## 🧪 TESTS DE VALIDATION

### Tests automatiques disponibles

```bash
npm run test:security
```

**Tests inclus :**

1. ✅ Visiteur → `/player/accueil` reste accessible
2. ✅ Visiteur → `/player/reservations` → redirect `/login`
3. ✅ Après login → `/player/reservations` accessible
4. ✅ Logout → retour `/player/accueil`
5. ✅ Player → `/club/accueil` → redirect `/player/accueil`
6. ✅ Club → `/player/reservations` → redirect `/club/accueil`

---

## ⚠️ POINTS D'ATTENTION

### Cas particuliers gérés

1. **Utilisateur sans profil**
   - Si user authentifié mais pas de profil dans la table
   - → Déconnexion forcée + redirect vers login

2. **Rôle invalide**
   - Si profil existe mais role n'est ni 'player' ni 'club'
   - → Déconnexion forcée + redirect vers login

3. **Session expirée**
   - Si cookie Supabase invalide/expiré
   - → Middleware détecte user=null
   - → Redirect vers login si tentative d'accès route privée

4. **Double authentification**
   - Impossible d'être connecté en tant que player ET club
   - Un seul rôle par session

---

## 📊 STATISTIQUES

- **Routes publiques :** 6
- **Routes privées player :** 6
- **Routes privées club :** 7
- **Total routes :** 19
- **Taux de couverture protection :** 100%

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Protection des routes → **Implémenté**
2. ✅ Tests automatiques → **Implémenté**
3. ⏳ Logs de sécurité → **En cours**
4. ⏳ Monitoring des tentatives d'accès non autorisé
5. ⏳ Rate limiting sur les pages de login
6. ⏳ Audit trail des connexions/déconnexions

---

## 📝 NOTES TECHNIQUES

- **Framework :** Next.js 16 (App Router)
- **Auth :** Supabase SSR (`@supabase/ssr`)
- **Protection :** Middleware centralisé
- **Persistance :** Cookies HTTP-only
- **Session :** Auto-refresh par Supabase
- **Tests :** Node.js natif (pas de dépendances lourdes)

---

## 🔗 FICHIERS LIÉS

- `middleware.ts` - Protection principale
- `SECURITY_TESTS.md` - Scénarios de test détaillés
- `tests/security.test.js` - Tests automatiques
- `lib/supabase/server.ts` - Client Supabase serveur
- `lib/supabase/client.ts` - Client Supabase browser

---

**Dernière mise à jour :** 2024-12-18  
**Version :** 1.0.0  
**Statut :** ✅ Production Ready











