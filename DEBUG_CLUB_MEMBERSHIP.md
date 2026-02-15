# 🔍 Debug : "Aucun club associé"

## ✅ Correction appliquée

### Problème identifié

La requête SQL retournait les données du club mais le parsing était incorrect :
- Supabase type le résultat du join comme un array même avec `.single()`
- Le cast `data.clubs as ClubInfo` échouait

### Solution appliquée

**Fichier** : `lib/getCurrentClub.ts`

```typescript
// Avant (incorrect)
const club = data.clubs as ClubInfo | null

// Après (correct)
const clubData = Array.isArray(data.clubs) ? data.clubs[0] : data.clubs
const club = clubData ? (clubData as ClubInfo) : null
```

### Logs ajoutés

Des logs détaillés ont été ajoutés pour faciliter le debug :

```typescript
console.log('[getCurrentClub] Session user_id:', session.user.id)
console.log('[getCurrentClub] Data brute:', data)
console.log('[getCurrentClub] Club extrait:', club)
```

---

## 🧪 Comment tester

### 1. Vérifier que la membership existe

**Dans Supabase → SQL Editor** :

```sql
-- Remplacer 'votre-user-id' par votre auth.users.id
SELECT 
  m.*,
  c.name as club_name,
  c.city,
  c.club_code
FROM club_memberships m
JOIN clubs c ON c.id = m.club_id
WHERE m.user_id = 'votre-user-id';
```

**Résultat attendu** : Une ligne avec vos infos de membership

### 2. Tester la requête directement

```sql
-- Test de la requête exacte utilisée par getCurrentClub()
SELECT 
  role, 
  clubs:club_id (id, name, city, club_code, email, phone, address)
FROM club_memberships
WHERE user_id = 'votre-user-id';
```

**Note** : Cette syntaxe SQL ne fonctionne pas en SQL natif, c'est la syntaxe Supabase.

### 3. Ouvrir la console du navigateur

1. Aller sur `/club/dashboard`
2. Ouvrir DevTools (F12)
3. Regarder la console

**Logs attendus si tout fonctionne** :
```
[getCurrentClub] Session user_id: xxx-xxx-xxx-xxx
[getCurrentClub] Data brute: { role: "admin", clubs: { id: "...", name: "...", ... } }
[getCurrentClub] Club extrait: { id: "...", name: "...", city: "...", ... }
```

**Logs si problème de membership** :
```
[getCurrentClub] Session user_id: xxx-xxx-xxx-xxx
[getCurrentClub] Error: {code: "PGRST116", ...}
```

### 4. Vérifier les RLS policies

Si l'erreur est `PGRST116` (pas de lignes retournées), vérifier les policies :

```sql
-- Vérifier que la policy permet la lecture
SELECT * FROM pg_policies 
WHERE tablename = 'club_memberships';
```

**Policy attendue** :
```sql
CREATE POLICY "members can read own memberships"
ON club_memberships
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

---

## 🐛 Cas d'erreur courants

### Erreur : "Pas de session"

**Symptôme** : Console affiche `[getCurrentClub] Pas de session`

**Cause** : Utilisateur pas connecté

**Solution** :
1. Aller sur `/club/auth/login`
2. Se connecter avec email + password

---

### Erreur : "Error: PGRST116"

**Symptôme** : Console affiche `[getCurrentClub] Error: {code: "PGRST116", ...}`

**Cause** : Aucune membership trouvée pour ce user_id

**Solution** :
1. Vérifier dans Supabase que la ligne existe :
   ```sql
   SELECT * FROM club_memberships WHERE user_id = 'votre-user-id';
   ```
2. Si pas de ligne → Créer la membership :
   - Via `/dev/seed-membership`
   - Ou via SQL :
     ```sql
     INSERT INTO club_memberships (club_id, user_id, role)
     VALUES (
       (SELECT id FROM clubs WHERE name = 'Club Démo Pad''up'),
       'votre-user-id',
       'admin'
     );
     ```

---

### Erreur : "Data brute: null"

**Symptôme** : Console affiche `[getCurrentClub] Data brute: null`

**Cause** : La requête retourne null (peut-être un problème de join)

**Solution** :
1. Vérifier que le club existe :
   ```sql
   SELECT * FROM clubs WHERE id = (
     SELECT club_id FROM club_memberships WHERE user_id = 'votre-user-id'
   );
   ```
2. Vérifier que `club_id` dans `club_memberships` est bien une foreign key vers `clubs.id`

---

### Erreur : "Club extrait: null" mais "Data brute" OK

**Symptôme** : Console affiche les données brutes mais le club est null après extraction

**Cause** : Problème de parsing (normalement corrigé maintenant)

**Solution** : Vérifier le format de `data.clubs` dans la console

---

## 📊 Checklist de debug

- [ ] Session existe (`session.user.id` présent)
- [ ] Membership existe dans la DB
- [ ] Club associé existe dans la DB
- [ ] RLS policy autorise la lecture
- [ ] Logs dans la console montrent les données
- [ ] `data.clubs` contient bien l'objet club
- [ ] Club final n'est pas null

---

## 🔧 Commandes utiles

### Vérifier l'état complet

```sql
-- Vue complète : users + memberships + clubs
SELECT 
  u.id as user_id,
  u.email,
  m.role,
  c.id as club_id,
  c.name as club_name,
  c.city
FROM auth.users u
LEFT JOIN club_memberships m ON m.user_id = u.id
LEFT JOIN clubs c ON c.id = m.club_id
WHERE u.email = 'votre@email.com';
```

### Nettoyer et recréer une membership

```sql
-- Supprimer les anciennes memberships (si besoin)
DELETE FROM club_memberships WHERE user_id = 'votre-user-id';

-- Créer une nouvelle membership
INSERT INTO club_memberships (club_id, user_id, role)
VALUES (
  (SELECT id FROM clubs WHERE name = 'Club Démo Pad''up'),
  'votre-user-id',
  'admin'
);
```

---

## ✅ Test final

Une fois tout corrigé, vous devriez voir dans le dashboard :

```
Bienvenue Club Démo Pad'up
Ville : Paris
Code : DEMO-2024

[Bouton: Inviter un admin] [Bouton: Se déconnecter]
```

Si vous voyez toujours "Aucun club associé", suivez les étapes de debug ci-dessus et regardez les logs de la console.

---

## 📝 Notes

- Le helper `getCurrentClub()` utilise maintenant `.single()` sans `.limit(1)`
- Les logs de debug peuvent être retirés après validation
- N'oubliez pas de supprimer `/dev/seed-membership` après validation
- Le dashboard ne dépend plus du tout de `localStorage`

---

**Si le problème persiste après ces vérifications, partagez les logs de la console pour un diagnostic plus approfondi.**
