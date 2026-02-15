# Migration : Session Supabase + club_memberships comme source de vérité

**Date** : 2026-02-10  
**Statut** : ✅ TERMINÉ

## 🎯 Objectif

Supprimer la dépendance à `localStorage` et utiliser **exclusivement** la session Supabase Auth + table `club_memberships` comme source de vérité pour l'accès club.

## ✅ Changements effectués

### 1. Helper `lib/getClub.ts` (nouveau)

Création d'un helper centralisé pour récupérer le club connecté via `club_memberships` :

```typescript
export async function getCurrentClub(): Promise<CurrentClubResult>
```

**Fonctionnement** :
- Vérifie la session Supabase (`supabaseBrowser.auth.getSession()`)
- Si session valide : récupère le membership + infos du club via join SQL
- Retourne : `{ club, session, role }`

**Fonction utilitaire** :
```typescript
export async function getCurrentClubId(): Promise<string | null>
```

### 2. Mise à jour de toutes les pages club

Toutes les pages suivantes ont été migrées de `getDefaultClub()` vers `getCurrentClub()` :

- ✅ `app/club/dashboard/page.tsx`
- ✅ `app/club/courts/page.tsx`
- ✅ `app/club/bookings/page.tsx`
- ✅ `app/club/planning/page.tsx`
- ✅ `app/club/page.tsx`
- ✅ `app/club/reservations/page.tsx`
- ✅ `app/club/settings/page.tsx`
- ✅ `app/club/dashboard/invitations/page.tsx`

**Pattern appliqué** :

```typescript
const loadData = async () => {
  const { club, session } = await getCurrentClub()
  
  if (!session) {
    router.push('/club/auth/login')
    return
  }

  if (!club) {
    alert('Aucun club associé')
    router.push('/club/dashboard')
    return
  }

  // Utiliser club.id pour toutes les opérations
  setClub(club)
  await fetchData(club.id)
}
```

### 3. Guards de sécurité

**Dashboard** : Affichage d'un message dédié si l'utilisateur est connecté mais n'a pas de membership :

```tsx
if (noMembership) {
  return (
    <div>Aucun club associé. Demandez une invitation.</div>
  )
}
```

**Autres pages** : Redirection vers le dashboard avec alerte si pas de club associé.

### 4. Source de vérité

| Avant | Après |
|-------|-------|
| `localStorage.getItem('club')` | ❌ Plus utilisé |
| `getDefaultClub()` | ❌ Plus utilisé |
| Session + `club_memberships` | ✅ Source unique |
| `getCurrentClub()` | ✅ Helper central |

## 🔐 Sécurité

### Ancien système (abandonné)
- `club_code` + `password` en clair dans la table `clubs`
- Stockage du club complet dans `localStorage`
- Aucune vérification serveur

### Nouveau système
- ✅ Session Supabase Auth (JWT)
- ✅ Table `club_memberships` (user_id ↔ club_id)
- ✅ RLS activé sur `courts`, `bookings`, `products`
- ✅ Vérification serveur automatique via RLS policies
- ✅ `getCurrentClub()` comme seul point d'entrée

## 📝 Utilisation

### Pour récupérer le club connecté

```typescript
import { getCurrentClub } from '@/lib/getClub'

const { club, session, role } = await getCurrentClub()

if (!session) {
  // Pas connecté
}

if (!club) {
  // Connecté mais pas de membership
}

// Utiliser club.id pour toutes les opérations
const clubId = club.id
```

### Pour récupérer uniquement l'ID

```typescript
import { getCurrentClubId } from '@/lib/getClub'

const clubId = await getCurrentClubId()
```

## 🚀 Tests effectués

✅ **Compilation** : `npm run build` passe sans erreur  
✅ **TypeScript** : Aucune erreur de type  
✅ **Imports** : Tous les imports mis à jour  
✅ **Pattern** : Cohérent sur toutes les pages  

## 🔄 Prochaines étapes

1. **Supprimer l'ancien login** :
   - Retirer `/club/login` (club_code + password)
   - Utiliser uniquement `/club/auth/login` (Supabase Auth)

2. **Retirer les colonnes sensibles** :
   - Migration pour supprimer `clubs.password`
   - Migration pour supprimer `clubs.club_code` (ou le rendre optionnel)

3. **Tester le flow complet** :
   - Créer un compte via invitation
   - Se connecter
   - Vérifier que `getCurrentClub()` retourne bien le club
   - Vérifier que les RLS policies fonctionnent

## 📊 Résumé

| État | Description |
|------|-------------|
| ✅ | Helper `getCurrentClub()` créé |
| ✅ | Toutes les pages migrées |
| ✅ | Guards de sécurité ajoutés |
| ✅ | Build réussi |
| ⏳ | Tests manuels à effectuer |
| ⏳ | Suppression ancien système login |

---

**Note** : `localStorage` n'est plus utilisé comme source de vérité. La session Supabase + `club_memberships` est désormais **la seule source de vérité** pour l'accès club.
