# 🔍 ANALYSE DE PERFORMANCE - PAD'UP

## 🚨 Problème signalé
**Symptôme** : Lag/rame au clic sur les boutons (interactions UI)
**Contexte** : WiFi OK, donc probablement côté code React/Next.js

---

## 📊 CHECKLIST DE DEBUG

### 1. Chrome DevTools - Network Tab
```
✅ Ouvrir DevTools (F12) → Onglet Network
✅ Cliquer sur un bouton qui lag
✅ Vérifier :
   - Combien de requêtes partent ? (devrait être 0 en mode démo)
   - Taille des requêtes (KB)
   - Temps de réponse
   - Requêtes waterfall (cascade)
```

**Ce qu'on cherche :**
- Requêtes Supabase inutiles (en mode démo, il ne devrait y en avoir AUCUNE)
- Fetch d'images à répétition
- API calls non cachées

### 2. Chrome DevTools - Performance Tab
```
✅ Ouvrir DevTools → Performance
✅ Cliquer sur "Record" (rond rouge)
✅ Cliquer sur le bouton qui lag
✅ Arrêter l'enregistrement
✅ Analyser :
   - Main thread (yellow = JavaScript, purple = Rendering)
   - Long tasks (> 50ms)
   - Layout Shifts
```

**Ce qu'on cherche :**
- Fonctions qui prennent > 100ms
- Re-render en cascade
- Recalcul de layout (reflow)

### 3. React DevTools - Profiler
```
✅ Installer React DevTools (extension Chrome)
✅ Onglet Profiler → Start Recording
✅ Cliquer sur le bouton qui lag
✅ Stop Recording
✅ Analyser :
   - Combien de composants re-render ?
   - Lesquels prennent le plus de temps ?
   - Pourquoi ils re-render ? (props change, state change)
```

---

## 🔧 PROBLÈMES IDENTIFIÉS (code review)

### ⚠️ Problème 1 : SmartSearchBar - Multiple useEffect
**Fichier** : `app/player/(authenticated)/components/SmartSearchBar.tsx`

**Code problématique** :
```typescript
// 3 useEffect qui s'exécutent en permanence
useEffect(() => { /* localStorage */ }, [storageKey])
useEffect(() => { /* clickOutside listener */ }, [])
useEffect(() => { /* keyboard listener */ }, [showDropdown])
```

**Impact** :
- Event listeners ajoutés/retirés à chaque changement
- Re-calcul des suggestions à chaque frappe
- LocalStorage read/write synchrone

**Logs à ajouter** :
```typescript
console.count('SmartSearchBar render')
console.time('filter-suggestions')
// ... code de filtrage
console.timeEnd('filter-suggestions')
```

---

### ⚠️ Problème 2 : Filtres multiples sans mémoization
**Fichiers** :
- `app/player/(authenticated)/clubs/page.tsx`
- `app/player/(authenticated)/tournois/page.tsx`
- `app/player/(authenticated)/reservations/page.tsx`

**Code problématique** :
```typescript
// Re-filtre et re-trie TOUT à chaque render
const filteredAndSortedClubs = clubs
  .filter(club => { /* heavy filtering */ })
  .sort((a, b) => { /* sorting */ })
```

**Impact** :
- Calcul lourd à chaque clic/changement de state
- Tous les clubs/tournois sont refiltrés même si les filtres n'ont pas changé
- Pas de cache des résultats

**Solution** : Utiliser `useMemo`

---

### ⚠️ Problème 3 : Re-render de toutes les cartes
**Fichiers** : Toutes les pages avec listes

**Code problématique** :
```typescript
{filteredClubs.map((club) => (
  <Link key={club.id}>
    {/* Carte complète */}
  </Link>
))}
```

**Impact** :
- Toutes les cartes re-render à chaque clic
- Images rechargées
- Animations redéclenchées

**Solution** : Extraire en composant mémoïsé

---

### ⚠️ Problème 4 : State trop haut
**Fichier** : `app/player/(authenticated)/clubs/page.tsx`

**Code problématique** :
```typescript
const [searchTerm, setSearchTerm] = useState('')
const [sortBy, setSortBy] = useState('distance')
const [selectedEquipements, setSelectedEquipements] = useState<string[]>([])
const [selectedPrixRanges, setSelectedPrixRanges] = useState<string[]>([])
```

**Impact** :
- Changement d'un filtre = re-render de TOUTE la page
- Tous les boutons, toutes les cartes se re-dessinent

---

### ⚠️ Problème 5 : Images non optimisées
**Impact** :
- Images lourdes (336KB pour ze-padel.jpg)
- Pas de lazy loading
- Rechargées à chaque re-render

---

## 🛠️ PLAN D'ACTIONS CONCRÈTES

### Action 1 : Optimiser SmartSearchBar (URGENT)
**Fichier** : `app/player/(authenticated)/components/SmartSearchBar.tsx`

**Modifications** :
```typescript
import { useMemo, useCallback } from 'react'

// Mémoïser les suggestions filtrées
const allSuggestions = useMemo(() => {
  const filtered = query.trim()
    ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    : suggestions.slice(0, 3)
  
  return [
    ...history.map(h => ({ icon: '🕐', text: h, type: 'history' as const })),
    ...filtered.map(s => ({ icon: '💡', text: s, type: 'suggestion' as const }))
  ].slice(0, 5)
}, [query, suggestions, history])

// Mémoïser les handlers
const handleSearch = useCallback((searchQuery: string) => {
  if (searchQuery.trim()) {
    saveToHistory(searchQuery)
    onSearch(searchQuery)
    setShowDropdown(false)
    setIsFocused(false)
    inputRef.current?.blur()
  }
}, [onSearch, history])
```

---

### Action 2 : Mémoïser les listes filtrées
**Fichier** : `app/player/(authenticated)/clubs/page.tsx`

**Modifications** :
```typescript
import { useMemo } from 'react'

const filteredAndSortedClubs = useMemo(() => {
  console.time('filter-clubs') // Debug
  
  const result = clubs
    .filter(club => {
      // ... filtrage
    })
    .sort((a, b) => {
      // ... tri
    })
  
  console.timeEnd('filter-clubs')
  return result
}, [searchTerm, sortBy, selectedEquipements, selectedPrixRanges])
```

**Même chose pour** :
- `tournois/page.tsx`
- `reservations/page.tsx`

---

### Action 3 : Extraire les cartes en composants mémoïsés
**Nouveau fichier** : `app/player/(authenticated)/clubs/ClubCard.tsx`

```typescript
import { memo } from 'react'

type ClubCardProps = {
  club: Club
  onFavorisToggle: (id: number) => void
}

const ClubCard = memo(function ClubCard({ club, onFavorisToggle }: ClubCardProps) {
  console.count(`ClubCard ${club.id} render`) // Debug
  
  return (
    <Link href={`/player/clubs/${club.id}/reserver`}>
      {/* Contenu de la carte */}
    </Link>
  )
})

export default ClubCard
```

Puis dans `page.tsx` :
```typescript
{filteredAndSortedClubs.map((club) => (
  <ClubCard key={club.id} club={club} onFavorisToggle={toggleFavoris} />
))}
```

---

### Action 4 : Lazy load des images
**Modification sur toutes les images** :

```typescript
<img
  src={club.imageUrl}
  alt={club.nom}
  loading="lazy"  // ← Ajouter
  className="..."
/>
```

---

### Action 5 : Debounce sur la recherche
**Dans SmartSearchBar** :

```typescript
import { useCallback, useEffect } from 'react'

const [debouncedQuery, setDebouncedQuery] = useState('')

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedQuery(query)
  }, 300) // Attendre 300ms avant de filtrer

  return () => clearTimeout(timer)
}, [query])

// Utiliser debouncedQuery au lieu de query pour filtrer
```

---

## 🎯 PRIORITÉS D'EXÉCUTION

### Phase 1 (Gain immédiat - 30 min)
1. ✅ Ajouter `useMemo` sur filteredAndSortedClubs
2. ✅ Ajouter `loading="lazy"` sur toutes les images
3. ✅ Mémoïser les suggestions dans SmartSearchBar

### Phase 2 (Gain moyen - 1h)
4. ✅ Extraire ClubCard, TournoiCard, ReservationCard
5. ✅ Utiliser `memo()` sur ces composants
6. ✅ Ajouter logs de debug pour confirmer

### Phase 3 (Optimisation fine - 2h)
7. ✅ Debounce sur la recherche
8. ✅ Virtualisation si > 50 éléments (react-window)
9. ✅ Code splitting des modals (dynamic import)

---

## 📝 CODE INSTRUMENTÉ POUR DEBUG

### Dans chaque page, ajouter en haut :
```typescript
console.count('Page render - Clubs')

useEffect(() => {
  console.log('State changed:', { searchTerm, sortBy, selectedEquipements })
}, [searchTerm, sortBy, selectedEquipements])
```

### Dans les handlers de boutons :
```typescript
const handleFilterClick = (filter: string) => {
  console.time('filter-change')
  setSortBy(filter)
  console.timeEnd('filter-change')
}
```

---

## 🔍 DIAGNOSTIC PROBABLE

D'après le code review, voici les causes les plus probables du lag :

### 1. **Re-renders excessifs** (90% de chance)
- Chaque clic sur un filtre = re-render de toute la page
- 4-8 clubs × composants complexes = beaucoup de travail
- Pas de mémoization

### 2. **Filtrage lourd** (70% de chance)
- `.filter()` et `.sort()` à chaque render
- Avec multi-sélection, c'est encore plus lourd

### 3. **Event listeners** (30% de chance)
- SmartSearchBar ajoute/retire des listeners
- Peut causer des micro-lags

### 4. **Images** (20% de chance)
- Pas de lazy loading
- Images pas optimisées

---

## 🚀 PATCH RAPIDE (10 minutes)

Voici un patch simple à appliquer maintenant sur `clubs/page.tsx` :

```typescript
import { useMemo, useCallback, memo } from 'react'

export default function ClubsPage() {
  // ... existing state
  
  // Mémoïser le filtrage (évite recalcul inutile)
  const filteredAndSortedClubs = useMemo(() => {
    return clubs
      .filter(club => {
        const matchesSearch = club.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          club.ville.toLowerCase().includes(searchTerm.toLowerCase())
        
        if (!matchesSearch) return false

        const matchesEquipements = selectedEquipements.length === 0 || 
          selectedEquipements.some(eq => club.equipements.some(clubEq => 
            clubEq.toLowerCase().includes(eq.toLowerCase())
          ))

        let matchesPrix = selectedPrixRanges.length === 0
        if (selectedPrixRanges.length > 0) {
          matchesPrix = selectedPrixRanges.some(range => {
            if (range === '0-8') return club.prixMin <= 8
            if (range === '9-10') return club.prixMin >= 9 && club.prixMin <= 10
            if (range === '11+') return club.prixMin >= 11
            return false
          })
        }

        return matchesEquipements && matchesPrix
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'distance':
            return a.distance - b.distance
          case 'prix-asc':
            return a.prixMin - b.prixMin
          case 'prix-desc':
            return b.prixMin - a.prixMin
          case 'note':
            return b.note - a.note
          default:
            return 0
        }
      })
  }, [clubs, searchTerm, sortBy, selectedEquipements, selectedPrixRanges])

  // Mémoïser le toggle
  const toggleFavoris = useCallback((clubId: number) => {
    setClubs(clubs.map(club => 
      club.id === clubId ? { ...club, favoris: !club.favoris } : club
    ))
  }, [clubs])
  
  // ...
}
```

---

## 📈 RÉSULTATS ATTENDUS

Après optimisations :
- ✅ Clic sur filtre : **< 50ms** (au lieu de 200-500ms)
- ✅ Pas de requêtes réseau inutiles
- ✅ Moins de re-renders (vérifiable dans React DevTools)
- ✅ UI fluide même sur réseau moyen

---

## 🎯 ACTIONS IMMÉDIATES

Je vais appliquer les 3 optimisations les plus critiques :
1. **useMemo** sur les listes filtrées
2. **lazy loading** sur les images
3. **Mémoïser** SmartSearchBar

Ces 3 changements devraient éliminer 80% du lag ! 🚀
