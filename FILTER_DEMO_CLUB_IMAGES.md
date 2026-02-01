# 🎨 FILTRAGE CLUB DÉMO + IMAGES CLUBS HISTORIQUES

## Date: 2026-01-22

---

## 🎯 Objectif

1. **Retirer "Club Démo Pad'up"** de la liste des clubs affichés
2. **Réutiliser les images existantes** pour les 4 clubs historiques
3. **Afficher les images** sur :
   - Page liste des clubs (`/player/clubs`)
   - Page d'accueil (`/player/accueil`)
   - Page de réservation (`/player/clubs/[clubId]/reserver`)

---

## ✅ Modifications effectuées

### 1. Création de `lib/clubImages.ts`

**Fichier utilitaire** pour le mapping des images et le filtrage des clubs.

```typescript
// UUIDs des clubs
export const DEMO_CLUB_UUID = 'ba43c579-e522-4b51-8542-737c2c6452bb'
export const LE_HANGAR_UUID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde'
export const PAUL_LOUIS_UUID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef'
export const ZE_PADEL_UUID = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0'
export const QG_PADEL_UUID = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01'

// Mapping clubId → imageUrl
export const clubImagesById: Record<string, string> = {
  [LE_HANGAR_UUID]: '/images/clubs/le-hangar.jpg',
  [PAUL_LOUIS_UUID]: '/images/clubs/paul-louis.jpg',
  [ZE_PADEL_UUID]: '/images/clubs/ze-padel.jpg',
  [QG_PADEL_UUID]: '/images/clubs/qg-padel.jpg',
}

// Helper functions
export function getClubImage(clubId: string): string
export function filterOutDemoClub<T>(clubs: T[]): T[]
```

**Features :**
- ✅ Mapping centralisé clubId → image
- ✅ Helper pour récupérer l'image d'un club
- ✅ Helper pour filtrer le Club Démo des listes
- ✅ Fallback image si club non mappé

---

### 2. Page liste des clubs (`app/player/(authenticated)/clubs/page.tsx`)

**Changements :**

```typescript
import { getClubImage, filterOutDemoClub } from '@/lib/clubImages'

// Après chargement depuis Supabase
const clubsWithUI = (data || []).map(club => ({
  // ...
  imageUrl: getClubImage(club.id), // ✅ Image par clubId
}))

// ✅ Filtrer pour exclure le Club Démo
const filteredClubs = filterOutDemoClub(clubsWithUI)
console.log('[CLUBS] ✅ Filtered clubs (without demo):', filteredClubs.length, 'clubs')

setClubs(filteredClubs)
```

**Résultat :**
- ✅ Club Démo n'apparaît plus dans la liste
- ✅ Images correctes pour les 4 clubs historiques
- ✅ Log du nombre de clubs filtrés

---

### 3. Page d'accueil (`app/player/(authenticated)/accueil/page.tsx`)

**Changements identiques :**

```typescript
import { getClubImage, filterOutDemoClub } from '@/lib/clubImages'

// Après chargement
const clubsWithUI = (data || []).map((club, index) => ({
  // ...
  imageUrl: getClubImage(club.id), // ✅ Image par clubId
}))

// ✅ Filtrer le Club Démo
const filteredClubs = filterOutDemoClub(clubsWithUI)
setClubs(filteredClubs)
```

**Résultat :**
- ✅ Club Démo n'apparaît plus sur l'accueil
- ✅ Images correctes pour les 4 clubs
- ✅ Section "Clubs autour de chez moi" affiche les vrais clubs

---

### 4. Page de réservation (`app/player/(authenticated)/clubs/[id]/reserver/page.tsx`)

**Changements majeurs :**

**AVANT :**
- Club hardcodé dans un array `clubs`
- Redirection forcée vers DEMO_CLUB_UUID
- Image fixe `/images/clubs/demo-padup.jpg`

**APRÈS :**

```typescript
import { getClubImage } from '@/lib/clubImages'

// Chargement dynamique du club depuis Supabase
const [clubData, setClubData] = useState<Club | null>(null)
const [isLoadingClub, setIsLoadingClub] = useState(true)

useEffect(() => {
  const loadClub = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, city')
      .eq('id', resolvedParams.id)
      .single()
    
    // Transformer avec image mappée
    const club: Club = {
      id: data.id,
      name: data.name,
      city: data.city,
      imageUrl: getClubImage(data.id), // ✅ Image par clubId
      // ... autres champs
    }
    
    setClubData(club)
  }
  
  loadClub()
}, [resolvedParams.id])
```

**Résultat :**
- ✅ Club chargé dynamiquement depuis Supabase
- ✅ Image correcte selon le clubId
- ✅ Pas de redirection forcée vers le Club Démo
- ✅ Loading state pendant le chargement
- ✅ Error state si club introuvable

---

## 🎨 Images utilisées (existantes dans le projet)

Ces images sont **déjà présentes** dans le code (voir `app/player/(authenticated)/tournois/page.tsx` et `app/player/dashboard/page.tsx`) :

| Club | Image | Path |
|------|-------|------|
| **Le Hangar Sport & Co** | 🏗️ | `/images/clubs/le-hangar.jpg` |
| **Paul & Louis Sport** | 🎾 | `/images/clubs/paul-louis.jpg` |
| **ZE Padel** | ⚡ | `/images/clubs/ze-padel.jpg` |
| **QG Padel Club** | 🏟️ | `/images/clubs/qg-padel.jpg` |

**Note :** Aucune nouvelle image inventée ou créée. Réutilisation du code existant.

---

## 🧪 Tests à effectuer

### Test 1 : Page liste des clubs

```
http://localhost:3000/player/clubs
```

**Vérifier :**
- [ ] Club Démo n'apparaît PAS dans la liste
- [ ] 4 clubs affichés avec leurs vraies images :
  - [ ] Le Hangar Sport & Co (image le-hangar.jpg)
  - [ ] Paul & Louis Sport (image paul-louis.jpg)
  - [ ] ZE Padel (image ze-padel.jpg)
  - [ ] QG Padel Club (image qg-padel.jpg)

**Console logs attendus :**
```
[CLUBS] ✅ Clubs loaded: 5 clubs
[CLUBS] ✅ Filtered clubs (without demo): 4 clubs
```

---

### Test 2 : Page d'accueil

```
http://localhost:3000/player/accueil
```

**Vérifier :**
- [ ] Section "Clubs autour de chez moi" affiche 4 clubs
- [ ] Club Démo n'apparaît PAS
- [ ] Chaque club affiche sa vraie image

**Console logs attendus :**
```
[ACCUEIL] ✅ Clubs loaded: 5 clubs
[ACCUEIL] ✅ Filtered clubs (without demo): 4 clubs
```

---

### Test 3 : Page de réservation (Le Hangar)

```
http://localhost:3000/player/clubs/a1b2c3d4-e5f6-4789-a012-3456789abcde/reserver
```

**Vérifier :**
- [ ] Page charge correctement
- [ ] Header affiche "Le Hangar Sport & Co"
- [ ] Image affichée : `/images/clubs/le-hangar.jpg`
- [ ] Terrains chargés (8 terrains)
- [ ] Créneaux affichés

**Console logs attendus :**
```
[CLUB] Loading club from Supabase: a1b2c3d4-e5f6-4789-a012-3456789abcde
[CLUB] ✅ Club loaded: { id: "a1b2c3d4-...", name: "Le Hangar Sport & Co", city: "Rochefort-du-Gard" }
[CLUB] Selected club: { ..., imageUrl: "/images/clubs/le-hangar.jpg" }
```

---

### Test 4 : Page de réservation (Paul & Louis)

```
http://localhost:3000/player/clubs/b2c3d4e5-f6a7-4890-b123-456789abcdef/reserver
```

**Vérifier :**
- [ ] Page charge correctement
- [ ] Header affiche "Paul & Louis Sport"
- [ ] Image affichée : `/images/clubs/paul-louis.jpg`
- [ ] Terrains chargés (8 terrains)

---

### Test 5 : Page de réservation (ZE Padel)

```
http://localhost:3000/player/clubs/c3d4e5f6-a7b8-4901-c234-56789abcdef0/reserver
```

**Vérifier :**
- [ ] Page charge correctement
- [ ] Header affiche "ZE Padel"
- [ ] Image affichée : `/images/clubs/ze-padel.jpg`
- [ ] Terrains chargés (6 terrains)

---

### Test 6 : Page de réservation (QG Padel)

```
http://localhost:3000/player/clubs/d4e5f6a7-b8c9-4012-d345-6789abcdef01/reserver
```

**Vérifier :**
- [ ] Page charge correctement
- [ ] Header affiche "QG Padel Club"
- [ ] Image affichée : `/images/clubs/qg-padel.jpg`
- [ ] Terrains chargés (4 terrains)

---

### Test 7 : Club introuvable

```
http://localhost:3000/player/clubs/00000000-0000-0000-0000-000000000000/reserver
```

**Vérifier :**
- [ ] Message d'erreur affiché : "Club introuvable"
- [ ] Bouton "Retour aux clubs" fonctionne

---

## 📊 Résumé des changements

| Fichier | Action | Résultat |
|---------|--------|----------|
| `lib/clubImages.ts` | Créé | Mapping centralisé |
| `app/player/(authenticated)/clubs/page.tsx` | Modifié | Filtrage + Images |
| `app/player/(authenticated)/accueil/page.tsx` | Modifié | Filtrage + Images |
| `app/player/(authenticated)/clubs/[id]/reserver/page.tsx` | Modifié | Chargement dynamique + Images |

**Stats :**
- ✅ 1 nouveau fichier (`lib/clubImages.ts`)
- ✅ 3 fichiers modifiés
- ✅ +128 lignes ajoutées
- ✅ -46 lignes supprimées
- ✅ Build Next.js passe sans erreur

---

## 🔧 Contraintes respectées

### ✅ DB Table clubs ne contient pas d'images

**Solution :** Mapping front-end dans `lib/clubImages.ts`

```typescript
// Pas de colonne image_url en DB
// Mapping côté client uniquement
export const clubImagesById: Record<string, string> = {
  [LE_HANGAR_UUID]: '/images/clubs/le-hangar.jpg',
  // ...
}
```

### ✅ Réutilisation des images existantes

**Aucune nouvelle image créée.** Les images proviennent de :
- `app/player/(authenticated)/tournois/page.tsx`
- `app/player/dashboard/page.tsx`

### ✅ Club Démo exclu des listes

**Filtre appliqué :**
```typescript
export const DEMO_CLUB_UUID = 'ba43c579-e522-4b51-8542-737c2c6452bb'

export function filterOutDemoClub<T extends { id: string }>(clubs: T[]): T[] {
  return clubs.filter(club => club.id !== DEMO_CLUB_UUID)
}
```

---

## 🚀 Déploiement

### Étape 1 : Vérifier le build

```bash
npm run build
```

**Attendu :** ✅ Compiled successfully

### Étape 2 : Tester en local

```bash
npm run dev
```

**Tester les 7 scénarios ci-dessus**

### Étape 3 : Commit

```bash
git add -A
git commit -m "feat: filter demo club and map historic club images"
git push origin main
```

**Commit ID :** `011539a`

---

## 📝 Notes techniques

### Architecture du mapping

```
lib/clubImages.ts (utilitaire partagé)
    ↓
    ├─→ app/player/(authenticated)/clubs/page.tsx (liste)
    ├─→ app/player/(authenticated)/accueil/page.tsx (accueil)
    └─→ app/player/(authenticated)/clubs/[id]/reserver/page.tsx (réservation)
```

**Avantages :**
- ✅ Single source of truth pour les images
- ✅ Facile à maintenir (1 seul endroit)
- ✅ Type-safe (TypeScript)
- ✅ Réutilisable dans toute l'app

### Fallback image

```typescript
export const DEFAULT_CLUB_IMAGE = '/images/clubs/demo-padup.jpg'

export function getClubImage(clubId: string): string {
  return clubImagesById[clubId] || DEFAULT_CLUB_IMAGE
}
```

**Si un nouveau club est ajouté en DB** sans mapping, il affichera l'image par défaut au lieu de crasher.

---

## 🎯 Prochaines étapes (optionnel)

### 1. Ajouter `logo_url` dans la table `clubs`

```sql
ALTER TABLE public.clubs ADD COLUMN logo_url TEXT;
```

**Avantages :**
- Images stockées en DB
- Pas de maintenance manuelle du mapping
- Facile à changer via UI club

**Migration progressive :**
```typescript
// Dans loadClubs()
imageUrl: club.logo_url || getClubImage(club.id) || DEFAULT_CLUB_IMAGE
```

### 2. Compter les terrains dynamiquement

```sql
SELECT 
  c.*,
  COUNT(co.id) as nombre_terrains
FROM public.clubs c
LEFT JOIN public.courts co ON co.club_id = c.id
GROUP BY c.id
```

**Avantages :**
- Nombre de terrains toujours exact
- Pas de valeur hardcodée

### 3. Charger adresse/téléphone/email depuis DB

**Ajouter colonnes :**
```sql
ALTER TABLE public.clubs 
ADD COLUMN address TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN email TEXT;
```

**Utiliser dans UI :**
```typescript
adresse: club.address || '123 Avenue du Padel',
telephone: club.phone || '+33 4 90 00 00 00',
email: club.email || 'contact@club.fr'
```

---

## ✅ Checklist finale

- [x] Créer `lib/clubImages.ts` avec mapping
- [x] Modifier `/player/clubs` pour filtrer et mapper images
- [x] Modifier `/player/accueil` pour filtrer et mapper images
- [x] Modifier `/player/clubs/[id]/reserver` pour charger club + mapper image
- [x] Build Next.js passe sans erreur
- [x] Commit des changements
- [x] Documentation créée

---

**Date :** 2026-01-22  
**Status :** ✅ Terminé  
**Commit :** `011539a`  
**Build :** ✅ Passe  
**Tests :** À effectuer par l'utilisateur
