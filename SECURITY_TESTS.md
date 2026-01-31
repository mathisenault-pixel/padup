# Tests de Sécurité - Routes Privées

## 📋 CARTOGRAPHIE DES ROUTES

### ✅ Routes PUBLIQUES (accessibles sans connexion)
- `/` → redirect vers `/player/accueil`
- `/player/accueil` → Page publique avec header conditionnel
- `/login` → Page de connexion principale
- `/player/login` → Page de connexion joueur
- `/club/login` → Page de connexion club
- `/account` → Redirect permanent vers `/player/accueil`

### 🔒 Routes PRIVÉES - PLAYER (nécessitent auth + role=player)
- `/player/clubs`
- `/player/reservations`
- `/player/tournois`
- `/player/messages`
- `/player/profil`
- `/player/dashboard`

### 🔒 Routes PRIVÉES - CLUB (nécessitent auth + role=club)
- `/club/accueil`
- `/club/dashboard`
- `/club/clients`
- `/club/exploitation`
- `/club/parametres`
- `/club/pilotage`
- `/club/revenus`

---

## 🧪 SCÉNARIOS DE TEST

### ✅ TEST 1 : Non connecté → /player/accueil OK
**Étapes :**
1. Ouvrir le navigateur en mode privé
2. Aller sur `http://localhost:3000`
3. → Redirection vers `/player/accueil`
4. → Page s'affiche avec header "Connexion / Inscription"

**Résultat attendu :** ✅ Page accessible, aucun blocage

---

### ✅ TEST 2 : Non connecté → /player/reservations → /login
**Étapes :**
1. En mode privé (non connecté)
2. Aller sur `http://localhost:3000/player/reservations`
3. → Middleware détecte route privée sans user
4. → Redirection vers `/login`

**Résultat attendu :** ✅ Redirection immédiate vers login

---

### ✅ TEST 3 : Connecté (player) → toutes routes player OK
**Étapes :**
1. Se connecter avec un compte player
2. Tester chaque route privée player :
   - `/player/clubs` → ✅ Accessible
   - `/player/reservations` → ✅ Accessible
   - `/player/tournois` → ✅ Accessible
   - `/player/messages` → ✅ Accessible
   - `/player/profil` → ✅ Accessible
   - `/player/dashboard` → ✅ Accessible

**Résultat attendu :** ✅ Toutes les pages s'affichent, header montre le profil

---

### ✅ TEST 4 : Connecté (player) → route club → redirect
**Étapes :**
1. Connecté avec un compte player
2. Essayer d'aller sur `/club/accueil`
3. → Middleware détecte mauvais rôle
4. → Redirection vers `/player/accueil`

**Résultat attendu :** ✅ Redirection vers l'espace player

---

### ✅ TEST 5 : Connecté (club) → toutes routes club OK
**Étapes :**
1. Se connecter avec un compte club
2. Tester chaque route privée club :
   - `/club/accueil` → ✅ Accessible
   - `/club/dashboard` → ✅ Accessible
   - `/club/clients` → ✅ Accessible
   - `/club/exploitation` → ✅ Accessible
   - `/club/parametres` → ✅ Accessible
   - `/club/pilotage` → ✅ Accessible
   - `/club/revenus` → ✅ Accessible

**Résultat attendu :** ✅ Toutes les pages s'affichent, header montre le profil club

---

### ✅ TEST 6 : Connecté (club) → route player → redirect
**Étapes :**
1. Connecté avec un compte club
2. Essayer d'aller sur `/player/reservations`
3. → Middleware détecte mauvais rôle
4. → Redirection vers `/club/accueil`

**Résultat attendu :** ✅ Redirection vers l'espace club

---

### ✅ TEST 7 : Logout → retour /player/accueil
**Étapes :**
1. Connecté avec n'importe quel compte
2. Cliquer "Déconnexion"
3. → Server action `signOutAction` s'exécute
4. → Redirection vers `/player/accueil`
5. → Header affiche "Connexion / Inscription"

**Résultat attendu :** ✅ Déconnecté, retour sur page publique

---

### ✅ TEST 8 : Connecté → aller sur /login → redirect
**Étapes :**
1. Connecté avec un compte player
2. Essayer d'aller sur `/login` ou `/player/login`
3. → Middleware détecte user + page login
4. → Redirection vers `/player/accueil`

**Résultat attendu :** ✅ Pas de page login affichée si déjà connecté

---

## 🔐 MÉCANISME DE PROTECTION

### Fichier principal : `middleware.ts`

**Avantages :**
- ✅ Protection unique et centralisée
- ✅ S'exécute avant toute page (SSR)
- ✅ Vérification des rôles (player vs club)
- ✅ Aucune redirection globale incorrecte
- ✅ Routes publiques clairement définies
- ✅ Matcher exclut API routes et assets

**Logique :**
1. **Route publique** → Laisser passer (sauf si user sur /login → redirect vers espace)
2. **Route privée + PAS de user** → Redirect vers `/login`
3. **Route privée + user + MAUVAIS rôle** → Redirect vers espace correct
4. **Route privée + user + BON rôle** → Laisser passer

**Fichiers modifiés :**
- `middleware.ts` - Protection principale
- `app/club/(authenticated)/layout.tsx` - Suppression des redirects (délégué au middleware)

**Fichiers NON modifiés :**
- `app/player/(authenticated)/layout.tsx` - Déjà sans redirect
- Tous les autres fichiers de routes

---

## 🚀 STATUT

✅ **Build réussi** : `npm run build`  
✅ **Routes publiques** : Accessibles sans connexion  
✅ **Routes privées** : Protégées par middleware  
✅ **Vérification rôles** : Player vs Club  
✅ **Pas de redirect global incorrect**  
✅ **Session persistante** : Gérée par Supabase + middleware  

---

## 📝 NOTES

- **Pas de page 403 custom** : Pour le moment, redirect vers l'espace correct
- **API routes exclues** : Matcher `/((?!_next/static|_next/image|favicon.ico|api/).*)` 
- **Logout propre** : Server action `signOutAction` → `/player/accueil`
- **Login si connecté** : Redirect automatique vers l'espace approprié

---

## 🎯 PROCHAINES ÉTAPES (OPTIONNEL)

1. Créer une page 403 custom pour afficher un message clair
2. Ajouter des logs pour tracer les tentatives d'accès non autorisé
3. Implémenter un système de permissions plus granulaire (RBAC)
4. Ajouter des tests E2E automatisés (Playwright/Cypress)











