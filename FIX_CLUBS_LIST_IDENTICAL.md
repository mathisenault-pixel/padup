# ✅ Fix: Liste des clubs identique connecté ou non

## Problème

Les pages `/player/clubs` et `/player/accueil` utilisaient des données hardcodées au lieu de charger depuis Supabase.

**Objectif:**
La liste des clubs doit être identique qu'on soit connecté ou non (pas de filtre user/owner_id/memberships).

---

## Solution appliquée

### 1. Page liste des clubs (`/player/clubs`)

**Fichier:** `app/player/(authenticated)/clubs/page.tsx`

**AVANT:**
```typescript
// ❌ Données hardcodées (MVP temporaire)
const [clubs, setClubs] = useState<Club[]>([
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Club Démo Pad\'up',
    city: 'Avignon',
    // ... données statiques
  }
])
```

**APRÈS:**
```typescript
// ✅ Chargement depuis Supabase (identique connecté ou non)
const [clubs, setClubs] = useState<Club[]>([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const loadClubs = async () => {
    console.log('[CLUBS] Loading clubs from Supabase...')
    console.log('[CLUBS] Query: from("clubs").select("id,name,city").order("created_at",{ascending:false})')
    
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, city')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('[CLUBS] Error loading clubs:', error)
      return
    }
    
    console.log('[CLUBS] ✅ Clubs loaded:', data?.length || 0, 'clubs')
    console.log('[CLUBS] Data:', data)
    
    // Transformer en format UI
    const clubsWithUI = (data || []).map(club => ({
      id: club.id,
      name: club.name || 'Club sans nom',
      city: club.city || 'Ville non spécifiée',
      distance: 5, // TODO: Calculer avec géolocation
      nombreTerrains: 2, // TODO: Compter depuis public.courts
      note: 4.5,
      avis: 0,
      imageUrl: '/images/clubs/demo-padup.jpg',
      prixMin: 12,
      equipements: ['Bar', 'Vestiaires', 'Douches', 'Parking', 'WiFi'],
      favoris: false,
      disponible: true
    }))
    
    setClubs(clubsWithUI)
    setIsLoading(false)
  }
  
  loadClubs()
}, [])
```

---

### 2. Page d'accueil (`/player/accueil`)

**Fichier:** `app/player/(authenticated)/accueil/page.tsx`

**Même logique appliquée:**
```typescript
const [clubs, setClubs] = useState<Club[]>([])
const [isLoading, setIsLoading] = useState(true)

useEffect(() => {
  const loadClubs = async () => {
    console.log('[ACCUEIL] Loading clubs from Supabase...')
    console.log('[ACCUEIL] Query: from("clubs").select("id,name,city").order("created_at",{ascending:false})')
    
    const { data, error } = await supabase
      .from('clubs')
      .select('id, name, city')
      .order('created_at', { ascending: false })
    
    console.log('[ACCUEIL] ✅ Clubs loaded:', data?.length || 0, 'clubs')
    
    const clubsWithUI = (data || []).map((club, index) => ({
      id: club.id,
      name: club.name || 'Club sans nom',
      city: club.city || 'Ville non spécifiée',
      distance: `${5 + index * 5} min`,
      nombreTerrains: 6 + index * 2,
      note: 4.6 + (index * 0.1),
      avis: 100 + index * 50,
      photo: ['🏗️', '🎾', '⚡', '🏟️'][index % 4],
      imageUrl: '/images/clubs/demo-padup.jpg',
      prixMin: 11 + index,
    }))
    
    setClubs(clubsWithUI)
    setIsLoading(false)
  }
  
  loadClubs()
}, [])
```

---

## Caractéristiques de la requête

### Requête Supabase unique

```typescript
await supabase
  .from('clubs')
  .select('id, name, city')
  .order('created_at', { ascending: false })
```

**Caractéristiques:**
- ✅ Pas de filtre `.eq('owner_id', ...)`
- ✅ Pas de filtre `.eq('created_by', ...)`
- ✅ Pas de filtre via `memberships`
- ✅ Pas de condition `if (user)` / `if (session)`
- ✅ Même requête quel que soit l'état d'authentification

**Résultat:**
Anon et authenticated voient la **MÊME liste de clubs**.

---

## Vérification des autres requêtes

### Time slots (page reserver)

```typescript
// app/player/(authenticated)/clubs/[id]/reserver/page.tsx
const { data, error } = await supabase
  .from('time_slots')
  .select('*')
  .order('start_time', { ascending: true })
```

**Vérification:**
- ✅ Pas de filtre user
- ✅ Charge tous les créneaux
- ✅ Identique pour tous les utilisateurs

---

### Courts (page reserver)

**Note:** Les courts ne sont pas chargés depuis la DB pour l'instant, ils sont générés dynamiquement:

```typescript
const terrains = Array.from({ length: club.nombreTerrains }, (_, i) => ({
  id: i + 1,
  name: `Terrain ${i + 1}`,
  type: i % 2 === 0 ? 'Intérieur' : 'Extérieur'
}))
```

**Vérification:**
- ✅ Pas de filtre user
- ✅ Tous les terrains affichés
- ✅ Identique pour tous

---

### Bookings (page reserver)

```typescript
const { data, error } = await supabase
  .from('bookings')
  .select('court_id, slot_id, booking_date, status')
  .in('court_id', courtIds)
  .eq('booking_date', bookingDate)
  .eq('status', 'confirmed')
```

**Vérification:**
- ✅ Pas de filtre user
- ✅ Charge toutes les réservations confirmées
- ✅ Grisage identique pour tous les utilisateurs

**Note:** C'est correct - les créneaux réservés doivent être grisés pour tout le monde.

---

## Logs console attendus

### Page `/player/clubs` (connecté ou non)

```
[CLUBS] Loading clubs from Supabase...
[CLUBS] Query: from("clubs").select("id,name,city").order("created_at",{ascending:false})
[CLUBS] ✅ Clubs loaded: 1 clubs
[CLUBS] Data: [
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Club Démo Pad\'up',
    city: 'Avignon'
  }
]
```

---

### Page `/player/accueil` (connecté ou non)

```
[ACCUEIL] Loading clubs from Supabase...
[ACCUEIL] Query: from("clubs").select("id,name,city").order("created_at",{ascending:false})
[ACCUEIL] ✅ Clubs loaded: 1 clubs
[ACCUEIL] Data: [
  {
    id: 'ba43c579-e522-4b51-8542-737c2c6452bb',
    name: 'Club Démo Pad\'up',
    city: 'Avignon'
  }
]
```

**Important:** Le nombre de clubs et les données doivent être **IDENTIQUES** connecté ou déconnecté.

---

## États de chargement

### Page `/player/clubs`

```typescript
{isLoading && (
  <div className="text-center py-16">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
    <p className="text-gray-600 font-semibold">Chargement des clubs...</p>
  </div>
)}

{!isLoading && (
  <div className="space-y-4">
    {filteredAndSortedClubs.map((club) => (
      // ... carte club
    ))}
  </div>
)}
```

---

## RLS Policies (référence)

### Table `public.clubs`

D'après la migration `014_rls_roles_security.sql`:

```sql
-- Les clubs sont visibles par tous pour afficher la liste
CREATE POLICY "public_read_clubs"
  ON public.clubs
  FOR SELECT
  USING (true);  -- ✅ Pas de filtre user
```

**Confirmation:** Les policies RLS permettent la lecture publique des clubs.

---

## Différence entre anon et authenticated

### Données clubs
- ✅ **IDENTIQUES** (pas de filtre user)

### Fonctionnalités disponibles
- ❌ **Anon:** Peut voir la liste, mais ne peut PAS réserver
- ✅ **Authenticated:** Peut voir la liste ET réserver

**Note:** La différence est dans les actions (réserver), pas dans les données affichées.

---

## Tests de validation

### Test 1: Comparer logs anon vs authenticated

#### Utilisateur non connecté (anon)
```
1. Ouvrir navigation privée / mode incognito
2. Aller sur /player/clubs
3. Ouvrir DevTools Console
4. Chercher: [CLUBS] ✅ Clubs loaded
5. Noter le nombre de clubs
```

#### Utilisateur connecté (authenticated)
```
1. Se connecter
2. Aller sur /player/clubs
3. Ouvrir DevTools Console
4. Chercher: [CLUBS] ✅ Clubs loaded
5. Noter le nombre de clubs
```

**Vérification:**
- Nombre de clubs doit être **IDENTIQUE**
- IDs des clubs doivent être **IDENTIQUES**
- Noms et villes doivent être **IDENTIQUES**

---

### Test 2: Vérifier requête réseau

```
1. DevTools → Network → XHR/Fetch
2. Filtrer: "clubs"
3. Vérifier la requête Supabase:
   - URL: /rest/v1/clubs?select=id,name,city&order=created_at.desc
   - Headers: Pas de filter owner_id ou user_id
```

---

### Test 3: Vérifier time_slots (page reserver)

```
1. Aller sur /player/clubs/{id}/reserver
2. Console: Chercher [SLOTS] Loaded
3. Vérifier: Tous les créneaux chargés (8:00 - 21:30)
4. Pas de filtre user dans la requête
```

---

## Fichiers modifiés

### 1. `app/player/(authenticated)/clubs/page.tsx`

**Changements:**
- ✅ Ajout import `useEffect` et `supabaseBrowser`
- ✅ Ajout state `isLoading`
- ✅ Suppression données hardcodées
- ✅ Ajout `useEffect` pour fetch Supabase
- ✅ Logs de la requête et du nombre de clubs
- ✅ Transformation des données DB → UI
- ✅ Affichage état de chargement

---

### 2. `app/player/(authenticated)/accueil/page.tsx`

**Changements:**
- ✅ Ajout import `useEffect` et `supabaseBrowser`
- ✅ Ajout state `isLoading`
- ✅ Suppression données hardcodées
- ✅ Ajout `useEffect` pour fetch Supabase
- ✅ Logs de la requête et du nombre de clubs
- ✅ Transformation des données DB → UI

---

## Requête Supabase standardisée

### Champs sélectionnés

```typescript
.select('id, name, city')
```

**Mapping vers type Club:**
- `id` (UUID) → `club.id`
- `name` (TEXT) → `club.name`
- `city` (TEXT) → `club.city`

**Champs UI additionnels** (non en DB pour l'instant):
- `distance` → TODO: Calculer avec géolocation
- `nombreTerrains` → TODO: COUNT depuis public.courts
- `note` → TODO: AVG depuis public.reviews
- `avis` → TODO: COUNT depuis public.reviews
- `imageUrl` → TODO: Utiliser logo_url ou cover_image_url
- `prixMin` → TODO: MIN depuis public.courts.price_per_hour
- `equipements` → TODO: Depuis JSONB ou table equipements
- `favoris` → TODO: JOIN avec table favorites

---

## Prochaines étapes (optionnel)

### 1. Compter les terrains

```typescript
const { data, error } = await supabase
  .from('clubs')
  .select(`
    id,
    name,
    city,
    courts:courts(count)
  `)
  .order('created_at', { ascending: false })

// data[0].courts[0].count = nombre de terrains
```

---

### 2. Ajouter logo_url

```typescript
const { data, error } = await supabase
  .from('clubs')
  .select('id, name, city, logo_url, cover_image_url')
  .order('created_at', { ascending: false })

// Utiliser dans UI:
imageUrl: club.logo_url || club.cover_image_url || '/images/clubs/default.jpg'
```

---

### 3. Calculer distance avec géolocation

```typescript
const clubsWithDistance = data.map(club => {
  const distance = userCoords 
    ? calculateDistance(userCoords.lat, userCoords.lng, club.lat, club.lng)
    : null
  
  return {
    ...club,
    distance: distance ? `${Math.round(distance)} min` : 'Distance inconnue'
  }
})
```

---

### 4. Filtrer par is_active

```typescript
const { data, error } = await supabase
  .from('clubs')
  .select('id, name, city')
  .eq('is_active', true)  // ✅ Afficher seulement clubs actifs
  .order('created_at', { ascending: false })
```

---

## Résumé des changements

| Aspect | Avant | Après |
|--------|-------|-------|
| **Source données** | Hardcodé | Supabase ✅ |
| **Filtre user** | N/A | Aucun ✅ |
| **Filtre owner_id** | N/A | Aucun ✅ |
| **Filtre memberships** | N/A | Aucun ✅ |
| **Requête anon** | N/A | Identique ✅ |
| **Requête authenticated** | N/A | Identique ✅ |
| **Logs** | Aucun | Détaillés ✅ |
| **Loading state** | Non | Oui ✅ |
| **Champs DB** | `nom`, `ville` | `name`, `city` ✅ |

---

## Checklist de validation

- [x] **Requête sans filtre user/owner_id/memberships**
- [x] **Logs de la requête ajoutés**
- [x] **Logs du nombre de clubs ajoutés**
- [x] **Loading state ajouté**
- [x] **Transformation DB → UI implémentée**
- [x] **Champs alignés avec Supabase (name/city)**
- [x] **Build TypeScript OK**
- [ ] **À TESTER:** Même nombre de clubs anon vs authenticated
- [ ] **À TESTER:** Mêmes IDs anon vs authenticated
- [ ] **À TESTER:** Logs identiques dans console

---

## Tests recommandés

### Test 1: Nombre de clubs identique

**Anon:**
```
1. Ouvrir mode privé / incognito
2. Aller sur /player/clubs
3. Console: Chercher [CLUBS] ✅ Clubs loaded: X clubs
4. Noter X
```

**Authenticated:**
```
1. Se connecter
2. Aller sur /player/clubs
3. Console: Chercher [CLUBS] ✅ Clubs loaded: X clubs
4. Noter X
```

**Vérification:** Les deux X doivent être identiques.

---

### Test 2: IDs identiques

**Anon:**
```
Console: Chercher [CLUBS] Data
Noter les IDs des clubs
```

**Authenticated:**
```
Console: Chercher [CLUBS] Data
Noter les IDs des clubs
```

**Vérification:** Les IDs doivent être identiques.

---

### Test 3: Vérifier requête réseau

```
DevTools → Network → Filtrer "clubs"
Vérifier URL: /rest/v1/clubs?select=id,name,city&order=created_at.desc

Vérifier qu'il n'y a PAS de paramètres:
- ❌ owner_id
- ❌ created_by
- ❌ user_id
- ❌ memberships
```

---

### Test 4: Page accueil

**Même tests pour `/player/accueil`:**
```
[ACCUEIL] ✅ Clubs loaded: X clubs
[ACCUEIL] Data: [...]
```

Doit afficher le même nombre et les mêmes clubs.

---

## RLS Policies (référence)

### Table `public.clubs`

```sql
-- Lecture publique (pas de filtre user)
CREATE POLICY "public_read_clubs"
  ON public.clubs
  FOR SELECT
  USING (true);
```

**Confirmation:** Les policies permettent la lecture sans authentification.

---

## Structure DB vs UI

### Données depuis Supabase

| Colonne DB | Type | Usage UI |
|------------|------|----------|
| `id` | UUID | club.id ✅ |
| `name` | TEXT | club.name ✅ |
| `city` | TEXT | club.city ✅ |
| `logo_url` | TEXT | club.imageUrl (TODO) |
| `address` | TEXT | club.adresse (TODO) |
| `phone` | TEXT | club.telephone (TODO) |
| `is_active` | BOOLEAN | Filter (TODO) |
| `created_at` | TIMESTAMPTZ | Order by ✅ |

### Données UI additionnelles (hardcodées temporairement)

| Champ UI | Source actuelle | Source future |
|----------|----------------|---------------|
| `distance` | Hardcodé (5) | Géolocation + calcul |
| `nombreTerrains` | Hardcodé (2) | COUNT courts |
| `note` | Hardcodé (4.5) | AVG reviews |
| `avis` | Hardcodé (0) | COUNT reviews |
| `imageUrl` | Hardcodé | logo_url ou cover_image_url |
| `prixMin` | Hardcodé (12) | MIN courts.price_per_hour |
| `equipements` | Hardcodé | JSONB ou table equipements |
| `favoris` | Hardcodé (false) | Table favorites |
| `disponible` | Hardcodé (true) | is_active |

---

**Date:** 2026-01-22  
**Status:** Fix appliqué, build OK, prêt pour tests  
**Garantie:** Liste clubs identique connecté ou non ✅
