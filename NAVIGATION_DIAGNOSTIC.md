# Diagnostic Navigation - Pad'Up

## 📋 Problème rapporté
"Souvent quand j'arrive sur un onglet, cela me transfère sur un onglet de l'espace joueur alors que je dois rester dans l'espace joueur, et inversement avec l'espace club."

## ✅ Corrections apportées

### 1. Middleware - Routes corrigées
**Supprimé** : `/player/dashboard` (n'existe pas)  
**Ajouté** : `/club/terrains` (existe mais n'était pas listé)

### 2. Headers harmonisés
- Espace Player et Espace Club ont maintenant la même structure
- Tailles optimisées (h-16 au lieu de h-20)
- Espacement uniforme

## 🗺️ Carte des routes existantes

### **ESPACE PLAYER** (Joueur)

#### Routes PUBLIQUES (accessibles sans connexion)
- ✅ `/player/accueil` - Page d'accueil joueur
- ✅ `/player/clubs` - Recherche de clubs

#### Routes PRIVÉES (nécessitent d'être connecté avec rôle `player`)
- ✅ `/player/reservations` - Mes réservations
- ✅ `/player/tournois` - Tournois
- ✅ `/player/messages` - Messages
- ✅ `/player/profil` - Profil joueur

---

### **ESPACE CLUB**

#### Routes PRIVÉES (nécessitent d'être connecté avec rôle `club`)
- ✅ `/club/accueil` - Page d'accueil club
- ✅ `/club/dashboard` - Tableau de bord
- ✅ `/club/clients` - Gestion clients
- ✅ `/club/exploitation` - Exploitation
- ✅ `/club/parametres` - Paramètres
- ✅ `/club/pilotage` - Pilotage
- ✅ `/club/revenus` - Revenus
- ✅ `/club/terrains` - Gestion des terrains

---

## 🔒 Règles de sécurité (Middleware)

### Comportement automatique :

1. **Utilisateur non connecté** → Redirigé vers `/login` ou `/club/login`

2. **Utilisateur PLAYER essaie d'accéder à une route CLUB**  
   → Redirigé automatiquement vers `/player/accueil`

3. **Utilisateur CLUB essaie d'accéder à une route PLAYER privée**  
   → Redirigé automatiquement vers `/club/accueil`

4. **Utilisateur sans rôle défini**  
   → Redirigé vers `/onboarding` pour choisir son rôle

---

## 🔍 Comment identifier le problème

### Test 1 : Vérifier votre rôle actuel
1. Connectez-vous
2. Ouvrez la console du navigateur (F12)
3. Le middleware affiche des logs en développement

### Test 2 : Vérifier les redirections
**Scénario A - Vous êtes JOUEUR (player)** :
- ✅ Cliquer sur "Accueil" → Doit aller sur `/player/accueil`
- ✅ Cliquer sur "Clubs" → Doit aller sur `/player/clubs`
- ✅ Cliquer sur "Mes réservations" → Doit aller sur `/player/reservations`
- ❌ Si vous êtes redirigé vers `/club/accueil`, votre profil est mal configuré

**Scénario B - Vous êtes CLUB** :
- ✅ Cliquer sur "Accueil" → Doit aller sur `/club/accueil`
- ✅ Cliquer sur "Tableau de bord" → Doit aller sur `/club/dashboard`
- ❌ Si vous êtes redirigé vers `/player/accueil`, votre profil est mal configuré

### Test 3 : Vérifier votre profil dans la base de données
```sql
-- Dans Supabase, exécutez cette requête :
SELECT id, email, role FROM profiles WHERE email = 'VOTRE_EMAIL';
```

**Résultat attendu** :
- Si vous êtes joueur : `role = 'player'`
- Si vous êtes club : `role = 'club'`

---

## 🐛 Causes possibles du problème

### 1. Profil mal configuré
**Symptôme** : Vous êtes connecté mais redirigé vers le mauvais espace  
**Solution** : Vérifier la table `profiles` dans Supabase

### 2. Session mixte
**Symptôme** : Vous passez d'un compte à l'autre sans déconnexion complète  
**Solution** : Se déconnecter complètement, vider le cache, se reconnecter

### 3. Liens incorrects dans la navigation
**Symptôme** : Un onglet pointe vers le mauvais espace  
**Solution** : Vérifier que `PlayerNav.tsx` ne contient que des liens `/player/*` et `ClubNav.tsx` que des liens `/club/*`

### 4. Middleware trop restrictif
**Symptôme** : Redirections constantes même sur les bonnes routes  
**Solution** : Vérifier les logs du middleware dans la console

---

## 🛠️ Actions de débogage

### Option 1 : Vérifier les composants de navigation
```bash
# Vérifier que PlayerNav ne contient que des routes /player/*
grep -n "href=" app/player/(authenticated)/components/PlayerNav.tsx

# Vérifier que ClubNav ne contient que des routes /club/*
grep -n "href=" app/club/(authenticated)/components/ClubNav.tsx
```

### Option 2 : Activer les logs détaillés
Le middleware affiche déjà des logs en développement. Surveillez la console pour voir :
- `[ONBOARDING]` - Problèmes de rôle non défini
- `[SECURITY]` - Tentatives d'accès non autorisées

### Option 3 : Tester en navigation privée
1. Ouvrir une fenêtre de navigation privée
2. Se connecter avec un compte PLAYER uniquement
3. Naviguer entre les onglets player
4. Vérifier qu'aucune redirection vers `/club/*` ne se produit

---

## 📝 Si le problème persiste

**Fournissez ces informations** :
1. Quel est votre rôle ? (`player` ou `club`)
2. Sur quelle page êtes-vous ? (URL exacte)
3. Sur quel onglet avez-vous cliqué ?
4. Vers quelle page avez-vous été redirigé ?
5. Copie des logs de la console (F12)

---

## ✨ Résumé des modifications

| Fichier | Modification |
|---------|-------------|
| `middleware.ts` | ✅ Supprimé `/player/dashboard` (inexistant) |
| `middleware.ts` | ✅ Ajouté `/club/terrains` |
| `app/player/(authenticated)/layout.tsx` | ✅ Header optimisé (h-16, tailles réduites) |
| `app/club/(authenticated)/layout.tsx` | ✅ Header harmonisé avec player |

**Date de modification** : 2025-01-22







