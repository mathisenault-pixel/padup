# ✅ Fix: Alignement des champs clubs avec Supabase (name/city)

## Problème

**Symptôme:**
```
Message: "Aucun club trouvé" / "Club introuvable"
```

Le code frontend utilisait `nom` et `ville` mais la table Supabase `public.clubs` utilise `name` et `city`.

**Cause:**
Les types TypeScript et les données hardcodées ne correspondaient pas à la structure réelle de la base de données.

```typescript
// ❌ AVANT (code frontend)
type Club = {
  nom: string  // ❌ N'existe pas dans public.clubs
  ville: string  // ❌ N'existe pas dans public.clubs
}

// ✅ Structure Supabase (public.clubs)
CREATE TABLE public.clubs (
  name TEXT NOT NULL,  // ✅ Nom du club
  city TEXT,  // ✅ Ville du club
  ...
)
```

**Résultat:**
- Les requêtes Supabase ne retournaient pas les données attendues
- Le frontend ne pouvait pas afficher les clubs correctement
- "Aucun club trouvé" s'affichait

---

## Structure de la table public.clubs

D'après la migration `003_create_clubs_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS public.clubs (
  -- Clé primaire
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Propriétaire du club
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Informations du club
  name TEXT NOT NULL,  -- ✅ Nom du club
  description TEXT,
  address TEXT,
  city TEXT,  -- ✅ Ville
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Logo et images
  logo_url TEXT,
  cover_image_url TEXT,
  
  -- Horaires
  opening_hours JSONB,
  
  -- Statut
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  
  -- Métadonnées
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Champs clés:**
- ✅ `name` (pas `nom`)
- ✅ `city` (pas `ville`)
- ✅ `address` (pas `adresse`)
- ✅ `phone` (pas `telephone`)

---

## Solution appliquée

### 1. Mise à jour des types TypeScript

**Fichiers modifiés:**
- `app/player/(authenticated)/clubs/page.tsx`
- `app/player/(authenticated)/accueil/page.tsx`
- `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**AVANT:**
```typescript
type Club = {
  id: string
  nom: string  // ❌
  ville: string  // ❌
  // ...
}
```

**APRÈS:**
```typescript
type Club = {
  id: string
  name: string  // ✅ Correspond à public.clubs.name
  city: string  // ✅ Correspond à public.clubs.city
  // ...
}
```

---

### 2. Mise à jour des données hardcodées

**Exemple dans `clubs/page.tsx`:**

**AVANT:**
```typescript
const [clubs, setClubs] = useState<Club[]>([
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    nom: 'Club Démo Pad\'up',  // ❌
    ville: 'Avignon',  // ❌
    // ...
  }
])
```

**APRÈS:**
```typescript
const [clubs, setClubs] = useState<Club[]>([
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Club Démo Pad\'up',  // ✅
    city: 'Avignon',  // ✅
    // ...
  }
])
```

---

### 3. Mise à jour des affichages UI

**Exemple dans `clubs/page.tsx`:**

**AVANT:**
```typescript
<h3>{club.nom}</h3>  // ❌
<p>{club.ville}</p>  // ❌
```

**APRÈS:**
```typescript
<h3>{club.name}</h3>  // ✅
<p>{club.city}</p>  // ✅
```

---

### 4. Mise à jour des filtres et recherches

**Exemple dans `clubs/page.tsx`:**

**AVANT:**
```typescript
const matchesSearch = club.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
  club.ville.toLowerCase().includes(searchTerm.toLowerCase())
```

**APRÈS:**
```typescript
const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  club.city.toLowerCase().includes(searchTerm.toLowerCase())
```

---

### 5. Mise à jour des logs et console

**Exemple dans `accueil/page.tsx`:**

**AVANT:**
```typescript
console.log('[CLUB CARD] Navigation to:', club.nom)
```

**APRÈS:**
```typescript
console.log('[CLUB CARD] Navigation to:', club.name)
```

---

### 6. Mise à jour des terrains (reserver/page.tsx)

**Note:** Les terrains sont générés dynamiquement et n'existent pas en base.

**AVANT:**
```typescript
const terrains = Array.from({ length: club.nombreTerrains }, (_, i) => ({
  id: i + 1,
  nom: `Terrain ${i + 1}`,  // ❌
  type: i % 2 === 0 ? 'Intérieur' : 'Extérieur'
}))
```

**APRÈS:**
```typescript
const terrains = Array.from({ length: club.nombreTerrains }, (_, i) => ({
  id: i + 1,
  name: `Terrain ${i + 1}`,  // ✅ Utilisé en affichage uniquement
  type: i % 2 === 0 ? 'Intérieur' : 'Extérieur'
}))
```

---

## Fichiers modifiés

### 1. `app/player/(authenticated)/clubs/page.tsx`

**Changements:**
- Type `Club`: `nom` → `name`, `ville` → `city`
- Données hardcodées: `nom` → `name`, `ville` → `city`
- Recherche: `club.nom` → `club.name`, `club.ville` → `club.city`
- Affichage: `{club.nom}` → `{club.name}`, `{club.ville}` → `{club.city}`
- Alt text: `alt={club.nom}` → `alt={club.name}`

---

### 2. `app/player/(authenticated)/accueil/page.tsx`

**Changements:**
- Type `Club`: `nom` → `name`, `ville` → `city`
- Données hardcodées (4 clubs): `nom` → `name`, `ville` → `city`
- Logs: `club.nom` → `club.name`
- Affichage: `{club.nom}` → `{club.name}`, `{club.ville}` → `{club.city}`
- Modal: `{selectedClub.nom}` → `{selectedClub.name}`
- Alert: `${selectedClub.nom}` → `${selectedClub.name}`
- Alt text: `alt={club.nom}` → `alt={club.name}`

---

### 3. `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**Changements:**
- Type `Club`: `nom` → `name`, `ville` → `city`
- Données club démo: `nom` → `name`, `ville` → `city`
- Terrains: `nom` → `name` (dans l'objet généré)
- Email invitation: `clubName: club.nom` → `clubName: club.name`
- localStorage: `name: club.nom` → `name: club.name`, `city: club.ville` → `city: club.city`
- Affichage: `{club.nom}` → `{club.name}`
- Modal: `clubName={club.nom}` → `clubName={club.name}`
- Alt text: `alt={club.nom}` → `alt={club.name}`

---

## Requêtes Supabase recommandées

### Liste des clubs

```typescript
const { data, error } = await supabase
  .from('clubs')
  .select('id, name, city, address, phone, email, logo_url, is_active')
  .eq('is_active', true)
  .order('created_at', { ascending: false })

// ✅ Les champs retournés correspondent maintenant aux types TypeScript
```

---

### Détail d'un club

```typescript
const { data, error } = await supabase
  .from('clubs')
  .select('*')
  .eq('id', clubId)
  .single()

// ✅ data.name et data.city sont maintenant accessibles
```

---

### Recherche de clubs par nom ou ville

```typescript
const { data, error } = await supabase
  .from('clubs')
  .select('id, name, city')
  .or(`name.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%`)
  .eq('is_active', true)

// ✅ Recherche sur name et city (pas nom et ville)
```

---

## Tests de validation

### Test 1: Types TypeScript

```bash
npm run build
# ✅ Doit compiler sans erreur
# ✅ Pas d'erreur "Property 'nom' does not exist on type 'Club'"
```

---

### Test 2: Affichage liste clubs

```bash
1. Aller sur /player/clubs
2. Vérifier: Les clubs s'affichent correctement
3. Vérifier: Nom et ville visibles
4. Logs console: Pas d'erreur "undefined"
```

---

### Test 3: Affichage accueil

```bash
1. Aller sur /player/accueil
2. Scroller vers "Clubs populaires"
3. Vérifier: Les clubs s'affichent avec nom et ville
4. Cliquer sur un club
5. Modal: Vérifier nom et ville du club sélectionné
```

---

### Test 4: Page reserver

```bash
1. Aller sur /player/clubs/ba43c579-.../reserver
2. Vérifier: En-tête affiche "Club Démo Pad'up"
3. Vérifier: Terrains affichent "Terrain 1", "Terrain 2"
4. Sélectionner créneau et continuer
5. Modal joueurs: Vérifier "Club Démo Pad'up - Terrain X"
```

---

### Test 5: Recherche clubs

```bash
1. Aller sur /player/clubs
2. Barre de recherche: taper "Avignon"
3. Vérifier: Le club "Club Démo Pad'up" s'affiche
4. Taper "Démo"
5. Vérifier: Le club s'affiche toujours
```

---

## Checklist de validation

- [x] Types `Club` mis à jour (`name`, `city`)
- [x] Données hardcodées mises à jour
- [x] Affichages UI mis à jour
- [x] Filtres et recherches mis à jour
- [x] Logs et console mis à jour
- [x] Alt text des images mis à jour
- [x] Terrains mis à jour (name)
- [x] Build TypeScript OK
- [ ] **À TESTER:** Liste clubs affiche correctement
- [ ] **À TESTER:** Page accueil affiche correctement
- [ ] **À TESTER:** Page reserver affiche correctement
- [ ] **À TESTER:** Recherche fonctionne
- [ ] **À TESTER:** Requêtes Supabase avec vrais clubs

---

## Prochaines étapes (optionnel)

### 1. Ajouter le fetch Supabase réel

Au lieu de données hardcodées, récupérer depuis la base:

```typescript
// Dans clubs/page.tsx
const [clubs, setClubs] = useState<Club[]>([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  const fetchClubs = async () => {
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, city, address, phone, email, logo_url')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[CLUBS] Fetch error:', error)
      return
    }
    
    // Transformer pour ajouter les champs UI
    const clubsWithUI = data.map(club => ({
      ...club,
      distance: 5, // Calculer depuis geolocation
      nombreTerrains: 2, // Compter depuis public.courts
      note: 4.5,
      avis: 0,
      imageUrl: club.logo_url || '/images/clubs/default.jpg',
      prixMin: 12,
      equipements: [],
      favoris: false,
      disponible: true
    }))
    
    setClubs(clubsWithUI)
    setLoading(false)
  }
  
  fetchClubs()
}, [])
```

---

### 2. Compter les terrains depuis public.courts

```typescript
const { data, error } = await supabase
  .from('clubs')
  .select(`
    id,
    name,
    city,
    courts:courts(count)
  `)
  .eq('is_active', true)

// data[0].courts[0].count = nombre de terrains
```

---

### 3. Nettoyer les champs UI obsolètes

Certains champs ne viennent pas de la base:
- `distance` → calculer avec geolocation
- `nombreTerrains` → count de `public.courts`
- `note` → moyenne de `public.reviews` (si existe)
- `avis` → count de `public.reviews`
- `prixMin` → min de `public.courts.price_per_hour`
- `equipements` → nouvelle table ou JSONB
- `favoris` → table `public.favorites`
- `disponible` → `is_active`

---

## Mapping complet des champs

| Frontend (avant) | Frontend (après) | Supabase (public.clubs) | Notes |
|------------------|------------------|------------------------|-------|
| `nom` | `name` | `name` | ✅ Direct |
| `ville` | `city` | `city` | ✅ Direct |
| `adresse` | `address` | `address` | ✅ À aligner |
| `telephone` | `phone` | `phone` | ✅ À aligner |
| `email` | `email` | `email` | ✅ Direct |
| `imageUrl` | `imageUrl` | `logo_url` ou `cover_image_url` | ⚠️ Mapper |
| `description` | `description` | `description` | ✅ Direct |
| `horaires` | `horaires` | `opening_hours` | ⚠️ JSONB à parser |
| `nombreTerrains` | `nombreTerrains` | (count courts) | ⚠️ Calculer |
| `equipements` | `equipements` | (à définir) | ⚠️ Nouvelle colonne |
| `favoris` | `favoris` | (table favorites) | ⚠️ JOIN |
| `disponible` | `disponible` | `is_active` | ⚠️ Mapper |

---

## Résumé des changements

| Aspect | Avant | Après |
|--------|-------|-------|
| **Champ nom** | `nom` | `name` ✅ |
| **Champ ville** | `ville` | `city` ✅ |
| **Type Club** | Incompatible | Aligné avec Supabase ✅ |
| **Données hardcodées** | `nom/ville` | `name/city` ✅ |
| **Affichage UI** | `club.nom` | `club.name` ✅ |
| **Recherche** | `club.ville` | `club.city` ✅ |
| **Requêtes Supabase** | ❌ Ne marchent pas | ✅ Compatibles |

---

**Date:** 2026-02-01  
**Status:** Fix appliqué, build OK, prêt pour tests avec fetch Supabase réel  
**Note:** Les données sont toujours hardcodées pour MVP, mais les champs correspondent maintenant à la structure Supabase
