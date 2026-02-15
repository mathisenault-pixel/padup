# 🧪 Guide de test : Système d'invitation club

## 📋 Prérequis

✅ Migration SQL `022_club_invites.sql` appliquée dans Supabase  
✅ Application Next.js compilée et démarrée  
✅ 2 navigateurs ou profils (un pour l'admin, un pour le nouveau membre)

## 🎬 Scénario de test

### Étape 1 : Se connecter en tant qu'admin

1. Ouvrir : `http://localhost:3000/club/auth/login`
2. Se connecter avec un compte existant (ou créer un compte)
3. Vérifier que vous avez un membership :
   ```sql
   SELECT * FROM public.club_memberships 
   WHERE user_id = 'votre-user-id';
   ```

### Étape 2 : Créer une invitation

1. Une fois connecté, aller sur : `http://localhost:3000/club/dashboard`
2. Cliquer sur le bouton **"Inviter un admin"**
3. Une modale s'ouvre avec le lien d'invitation
4. Copier le lien (bouton "Copier")

**Exemple de lien généré** :
```
http://localhost:3000/club/invite/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Vérification dans Supabase** :
```sql
SELECT * FROM public.club_invites 
ORDER BY created_at DESC 
LIMIT 1;
```

Vous devriez voir :
- `token` : le token généré
- `club_id` : l'ID de votre club
- `role` : "admin"
- `expires_at` : now() + 7 jours
- `used_at` : NULL (pas encore utilisée)

### Étape 3 : Ouvrir l'invitation (en tant que nouveau membre)

1. **Ouvrir un nouvel onglet en mode privé** (ou un autre navigateur)
2. Coller le lien d'invitation
3. Vous devriez voir la page d'invitation avec 2 options :
   - ✅ "Se connecter"
   - ✅ "Créer un compte"

**Screenshot attendu** :
```
┌─────────────────────────────────────┐
│       Invitation club               │
│  Connectez-vous pour accepter       │
│  cette invitation                   │
├─────────────────────────────────────┤
│  [      Se connecter       ]        │
│  [     Créer un compte     ]        │
└─────────────────────────────────────┘
```

### Étape 4 : Créer un compte ou se connecter

**Option A : Créer un compte**
1. Cliquer sur "Créer un compte"
2. Remplir email + password
3. Valider
4. ✅ Vous êtes automatiquement redirigé vers la page d'invitation
5. ✅ L'invitation est automatiquement acceptée
6. ✅ Redirection vers `/club/dashboard`

**Option B : Se connecter**
1. Cliquer sur "Se connecter"
2. Entrer email + password d'un compte existant
3. Valider
4. ✅ Vous êtes automatiquement redirigé vers la page d'invitation
5. ✅ L'invitation est automatiquement acceptée
6. ✅ Redirection vers `/club/dashboard`

### Étape 5 : Vérifier que tout fonctionne

1. **Vérifier le membership dans Supabase** :
   ```sql
   SELECT 
     m.id,
     m.user_id,
     m.club_id,
     m.role,
     u.email,
     c.name as club_name
   FROM public.club_memberships m
   JOIN auth.users u ON u.id = m.user_id
   JOIN public.clubs c ON c.id = m.club_id
   ORDER BY m.created_at DESC;
   ```

   Vous devriez voir une nouvelle ligne avec :
   - `user_id` : l'ID du nouveau membre
   - `club_id` : l'ID du club
   - `role` : "admin"

2. **Vérifier que l'invitation est marquée comme utilisée** :
   ```sql
   SELECT * FROM public.club_invites 
   WHERE token = 'votre-token'
   LIMIT 1;
   ```

   Vous devriez voir :
   - `used_at` : timestamp actuel (plus NULL)
   - `used_by` : l'ID du nouveau membre

3. **Tester l'accès au dashboard** :
   - Le nouveau membre devrait voir le dashboard du club
   - Il devrait voir le nom du club : "Bienvenue {nom du club}"
   - Il devrait avoir accès à toutes les sections (Terrains, Réservations, etc.)

## ✅ Cas de test à vérifier

### Test 1 : Invitation valide
- ✅ Token existe
- ✅ Token non expiré
- ✅ Token non utilisé
- ✅ Résultat : Membership créé + redirect dashboard

### Test 2 : Invitation déjà utilisée
1. Utiliser le même lien une deuxième fois
2. ✅ Message d'erreur attendu : "Invitation déjà utilisée"
3. ✅ Pas de nouveau membership créé

### Test 3 : Invitation expirée
1. Dans Supabase, modifier `expires_at` :
   ```sql
   UPDATE public.club_invites
   SET expires_at = NOW() - INTERVAL '1 day'
   WHERE token = 'votre-token';
   ```
2. Essayer d'utiliser l'invitation
3. ✅ Message d'erreur attendu : "Invitation expirée"

### Test 4 : Token invalide
1. Aller sur : `http://localhost:3000/club/invite/token-invalide-xyz`
2. Se connecter
3. ✅ Message d'erreur attendu : "Invitation non trouvée"

### Test 5 : Utilisateur pas connecté
1. Aller sur un lien d'invitation valide en mode privé
2. ✅ Affichage des boutons "Se connecter" / "Créer un compte"
3. ✅ Pas d'appel RPC avant connexion

### Test 6 : RLS - Sécurité
1. Essayer de lire les invitations d'un autre club :
   ```sql
   -- En tant que membre du club A
   SELECT * FROM public.club_invites 
   WHERE club_id = 'club-b-id';
   ```
2. ✅ Aucun résultat (RLS bloque l'accès)

3. Essayer de créer une invitation pour un autre club :
   ```sql
   -- En tant que membre du club A
   INSERT INTO public.club_invites (club_id, token, role, expires_at)
   VALUES (
     'club-b-id',  -- Club B
     'fake-token',
     'admin',
     NOW() + INTERVAL '7 days'
   );
   ```
4. ✅ Erreur : Permission denied (RLS bloque l'insertion)

## 🐛 Dépannage

### Problème : "Invitation non trouvée"
**Cause** : Token invalide ou table vide  
**Solution** : Vérifier que la migration SQL est bien appliquée

### Problème : "Not authenticated"
**Cause** : Session Supabase invalide  
**Solution** : Se reconnecter via `/club/auth/login`

### Problème : Redirect vers `/club/dashboard` mais "Aucun club associé"
**Cause** : Membership pas créé correctement  
**Solution** : Vérifier les logs dans la console et dans Supabase

### Problème : RPC "redeem_club_invite" not found
**Cause** : Migration SQL pas appliquée  
**Solution** : Exécuter `supabase/migrations/022_club_invites.sql`

## 📊 Logs utiles

### Console navigateur
```javascript
// Logs de la page d'invitation
[Invite] ✅ Invitation acceptée, club_id: xxx-xxx-xxx

// Logs du dashboard
[Get Club] club: { id: 'xxx', name: 'Club Demo', ... }
```

### Console Supabase (SQL Editor)
```sql
-- Voir toutes les invitations
SELECT 
  i.id,
  i.token,
  i.role,
  i.expires_at,
  i.used_at,
  c.name as club_name,
  u.email as used_by_email
FROM public.club_invites i
JOIN public.clubs c ON c.id = i.club_id
LEFT JOIN auth.users u ON u.id = i.used_by
ORDER BY i.created_at DESC;

-- Voir tous les memberships
SELECT 
  m.id,
  u.email,
  c.name as club_name,
  m.role,
  m.created_at
FROM public.club_memberships m
JOIN auth.users u ON u.id = m.user_id
JOIN public.clubs c ON c.id = m.club_id
ORDER BY m.created_at DESC;
```

## 🎯 Résultat attendu

Après avoir suivi tous ces tests, vous devriez avoir :

✅ Une invitation créée dans `club_invites`  
✅ Un nouveau membership dans `club_memberships`  
✅ L'invitation marquée comme utilisée (`used_at` renseigné)  
✅ Le nouveau membre peut accéder au dashboard du club  
✅ Le nouveau membre ne peut pas voir les données des autres clubs (RLS)  
✅ Les erreurs sont gérées (invitation expirée, déjà utilisée, token invalide)

---

**Si tous les tests passent** : ✅ Le système d'invitation fonctionne parfaitement ! 🎉
