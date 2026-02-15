# 🐛 Debug Membership ajouté au Dashboard

**Date** : 2026-02-10  
**Statut** : ✅ **DEBUG ACTIF**

## 🎯 Objectif

Diagnostiquer pourquoi le dashboard affiche "Aucun club associé" alors qu'une ligne existe dans `club_memberships`.

---

## ✅ Modifications appliquées

### Dashboard avec debug (`app/club/dashboard/page.tsx`)

**Ajouté** :
1. **State debug** : `const [debug, setDebug] = useState<any>(null)`
2. **Requête directe** : Appel direct à `club_memberships` sans passer par le helper
3. **Bloc debug visible** : Affiche les infos en bas de page

**Code de la requête** :
```typescript
const { data, error } = await supabaseBrowser
  .from('club_memberships')
  .select('club_id, role, clubs:club_id ( id, name, city, club_code )')
  .eq('user_id', session.user.id)

setDebug({
  sessionUserId: session.user.id,
  membershipsRaw: data,
  membershipsError: error ? { 
    message: error.message, 
    details: error.details, 
    code: error.code 
  } : null,
})
```

**Affichage du debug** :
```tsx
<div className="bg-gray-900 text-white p-6 rounded-lg overflow-auto">
  <h3 className="text-lg font-bold mb-4 text-yellow-300">🐛 DEBUG INFO</h3>
  <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
    {JSON.stringify(debug, null, 2)}
  </pre>
</div>
```

---

## 📊 Informations affichées dans le debug

Le bloc debug montre :

### 1. `sessionUserId`
L'ID de l'utilisateur connecté (depuis `session.user.id`)

### 2. `membershipsRaw`
Les résultats bruts de la requête `club_memberships` :
- `null` si aucune ligne trouvée
- `[]` (array vide) si la requête réussit mais pas de résultat
- `[{ club_id: "...", role: "...", clubs: {...} }]` si des lignes existent

### 3. `membershipsError`
L'erreur Supabase éventuelle :
- `null` si pas d'erreur
- `{ message: "...", details: "...", code: "..." }` si erreur

---

## 🧪 Comment utiliser le debug

### Étape 1 : Se connecter
1. Aller sur `/club/auth/login`
2. Se connecter avec un compte

### Étape 2 : Aller sur le dashboard
1. Aller sur `/club/dashboard`
2. Scroller en bas de la page

### Étape 3 : Lire le bloc debug

**Cas 1 : Club trouvé**
```json
{
  "sessionUserId": "abc-123-def-456",
  "membershipsRaw": [
    {
      "club_id": "xyz-789",
      "role": "admin",
      "clubs": {
        "id": "xyz-789",
        "name": "Club Démo Pad'up",
        "city": "Paris",
        "club_code": "DEMO-2024"
      }
    }
  ],
  "membershipsError": null
}
```
✅ **Résultat** : Le club s'affiche normalement en haut

---

**Cas 2 : Pas de membership**
```json
{
  "sessionUserId": "abc-123-def-456",
  "membershipsRaw": [],
  "membershipsError": null
}
```
⚠️ **Problème** : Aucune ligne dans `club_memberships` pour cet utilisateur

**Solution** : 
1. Créer la membership manuellement :
   ```sql
   INSERT INTO club_memberships (club_id, user_id, role)
   VALUES (
     (SELECT id FROM clubs WHERE name = 'Club Démo Pad''up'),
     'abc-123-def-456',  -- Remplacer par le sessionUserId
     'admin'
   );
   ```
2. Ou utiliser `/dev/seed-membership`

---

**Cas 3 : Erreur RLS**
```json
{
  "sessionUserId": "abc-123-def-456",
  "membershipsRaw": null,
  "membershipsError": {
    "message": "permission denied for table club_memberships",
    "code": "42501"
  }
}
```
⚠️ **Problème** : Les RLS policies bloquent l'accès

**Solution** : Vérifier les policies dans Supabase :
```sql
-- Vérifier les policies
SELECT * FROM pg_policies 
WHERE tablename = 'club_memberships';

-- Policy attendue
CREATE POLICY "members can read own memberships"
ON club_memberships
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

---

**Cas 4 : Erreur de join**
```json
{
  "sessionUserId": "abc-123-def-456",
  "membershipsRaw": [
    {
      "club_id": "xyz-789",
      "role": "admin",
      "clubs": null
    }
  ],
  "membershipsError": null
}
```
⚠️ **Problème** : Le club n'existe plus ou la foreign key est cassée

**Solution** : Vérifier que le club existe :
```sql
SELECT * FROM clubs WHERE id = 'xyz-789';
```

---

## 🔍 Diagnostics courants

### Symptôme : `membershipsRaw: []`
**Cause** : Pas de ligne dans `club_memberships`  
**Solution** : Créer la membership

### Symptôme : `membershipsError: { code: "42501" }`
**Cause** : RLS bloque l'accès  
**Solution** : Vérifier/créer les policies

### Symptôme : `clubs: null` dans membershipsRaw
**Cause** : Le club n'existe pas ou foreign key cassée  
**Solution** : Vérifier que le club existe

### Symptôme : `sessionUserId` est différent
**Cause** : Vous êtes connecté avec un autre compte  
**Solution** : Vérifier que vous utilisez le bon compte

---

## 🧹 Après le debug

Une fois le problème identifié et résolu :

1. **Supprimer le bloc debug** du dashboard
2. **Restaurer l'ancien code** si nécessaire
3. **Ou** laisser la requête directe si elle fonctionne mieux

---

## 📝 Notes importantes

1. La requête utilise **exactement** :
   ```typescript
   .select('club_id, role, clubs:club_id ( id, name, city, club_code )')
   ```
   
2. Pas de `.single()` pour éviter les erreurs si plusieurs memberships

3. Pas de `.limit(1)` pour voir toutes les memberships

4. Le debug est **temporaire** et doit être retiré après

---

## ✅ Build vérifié

```bash
npm run build
✅ Compiled successfully
✅ 52 routes générées
```

---

## 🎯 Prochaine étape

1. **Tester** : Se connecter et aller sur `/club/dashboard`
2. **Lire le debug** : Copier le contenu du bloc debug
3. **Partager** : Envoyer les infos pour diagnostic
4. **Corriger** : Appliquer la solution selon le problème identifié

---

**Le debug est maintenant actif. Connectez-vous et regardez les infos en bas du dashboard ! 🐛**
