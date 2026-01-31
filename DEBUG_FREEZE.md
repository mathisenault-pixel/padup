# 🚨 DEBUG - FREEZE UI "Page ne répondant pas"

## Problème signalé
**Symptôme** : Chrome affiche "Page ne répondant pas" au clic sur un bouton
**Cause probable** : Boucle infinie React / re-renders infinis / setState en cascade

---

## 🎯 SUSPECTS PRINCIPAUX

### Suspect #1 : SmartSearchBar - handleSearch qui dépend de `history`
**Fichier** : `app/player/(authenticated)/components/SmartSearchBar.tsx`
**Ligne** : 50-58

**Code problématique** :
```typescript
const handleSearch = useCallback((searchQuery: string) => {
  if (searchQuery.trim()) {
    saveToHistory(searchQuery)  // ← Modifie `history`
    onSearch(searchQuery)
    setShowDropdown(false)
    setIsFocused(false)
    inputRef.current?.blur()
  }
}, [onSearch, history])  // ← `history` dans les deps = nouvelle fonction à chaque changement
```

**Problème** : `handleSearch` dépend de `history`, mais `saveToHistory` modifie `history`
→ Risque de boucle si `handleSearch` est appelé dans un useEffect

---

### Suspect #2 : toggleFavoris dans clubs/page.tsx
**Fichier** : `app/player/(authenticated)/clubs/page.tsx`
**Ligne** : 102-106

**Code problématique** :
```typescript
const toggleFavoris = useCallback((clubId: number) => {
  setClubs(clubs.map(club => 
    club.id === clubId ? { ...club, favoris: !club.favoris } : club
  ))
}, [clubs])  // ← `clubs` dans les deps
```

**Problème** : 
- `toggleFavoris` dépend de `clubs`
- Si `toggleFavoris` est passé à un composant enfant mémoïsé
- Et que ce composant se re-render à chaque changement de `clubs`
- → Boucle de re-renders

---

### Suspect #3 : Filtrage dans useMemo avec deps instables
**Fichier** : `app/player/(authenticated)/clubs/page.tsx`
**Ligne** : 108-145

**Code** :
```typescript
const filteredAndSortedClubs = useMemo(() => {
  return clubs.filter(...).sort(...)
}, [clubs, searchTerm, sortBy, selectedEquipements, selectedPrixRanges])
```

**Problème potentiel** :
- Si `selectedEquipements` ou `selectedPrixRanges` sont des arrays recréés à chaque render
- → useMemo recalcule en permanence
- → Si calcul lourd + render → freeze

---

## 🔍 LOGS À AJOUTER

### Dans SmartSearchBar.tsx
```typescript
const handleSearch = useCallback((searchQuery: string) => {
  console.log('🔍 [SEARCH] Start:', searchQuery)
  console.time('search-duration')
  
  if (searchQuery.trim()) {
    saveToHistory(searchQuery)
    onSearch(searchQuery)
    setShowDropdown(false)
    setIsFocused(false)
    inputRef.current?.blur()
  }
  
  console.timeEnd('search-duration')
  console.log('🔍 [SEARCH] End')
}, [onSearch, history])

// Détecter les re-renders
useEffect(() => {
  console.count('🔄 SmartSearchBar render')
}, [])
```

### Dans clubs/page.tsx
```typescript
export default function ClubsPage() {
  console.count('🔄 ClubsPage render')
  
  const toggleFavoris = useCallback((clubId: number) => {
    console.log('⭐ [FAVORIS] Toggle club:', clubId)
    setClubs(clubs.map(club => 
      club.id === clubId ? { ...club, favoris: !club.favoris } : club
    ))
  }, [clubs])
  
  const filteredAndSortedClubs = useMemo(() => {
    console.log('🔄 [FILTER] Recalculating...')
    console.time('filter-duration')
    
    const result = clubs.filter(...).sort(...)
    
    console.timeEnd('filter-duration')
    console.log('🔄 [FILTER] Results:', result.length)
    return result
  }, [clubs, searchTerm, sortBy, selectedEquipements, selectedPrixRanges])
  
  // ...
}
```

### Dans layout.tsx (pour voir si re-renders en cascade)
```typescript
export default function PlayerLayout({ children }: Props) {
  console.count('🔄 PlayerLayout render')
  
  useEffect(() => {
    console.log('🔄 [LAYOUT] Mount/Update')
  })
  
  // ...
}
```

---

## 🛠️ FIXES À APPLIQUER

### Fix #1 : Stabiliser handleSearch
```typescript
// Retirer `history` des deps, utiliser la forme fonctionnelle
const saveToHistory = useCallback((searchQuery: string) => {
  if (!searchQuery.trim()) return
  
  setHistory(prev => {  // ← Forme fonctionnelle
    const newHistory = [
      searchQuery,
      ...prev.filter(item => item !== searchQuery)
    ].slice(0, 3)
    
    localStorage.setItem(storageKey, JSON.stringify(newHistory))
    return newHistory
  })
}, [storageKey])  // ← Plus de `history` dans les deps

const handleSearch = useCallback((searchQuery: string) => {
  if (searchQuery.trim()) {
    saveToHistory(searchQuery)
    onSearch(searchQuery)
    setShowDropdown(false)
    setIsFocused(false)
    inputRef.current?.blur()
  }
}, [onSearch, saveToHistory])  // ← `saveToHistory` est stable
```

### Fix #2 : Stabiliser toggleFavoris
```typescript
// Utiliser la forme fonctionnelle de setState
const toggleFavoris = useCallback((clubId: number) => {
  setClubs(prev =>  // ← Forme fonctionnelle
    prev.map(club => 
      club.id === clubId ? { ...club, favoris: !club.favoris } : club
    )
  )
}, [])  // ← Pas de deps, fonction stable
```

### Fix #3 : Guard anti double-clic
```typescript
const [isProcessing, setIsProcessing] = useState(false)

const handleClick = async () => {
  if (isProcessing) {
    console.warn('⚠️ Double-clic ignoré')
    return
  }
  
  setIsProcessing(true)
  console.log('🔘 [BUTTON] Processing...')
  
  try {
    // Action
    await someAction()
  } finally {
    setIsProcessing(false)
    console.log('✅ [BUTTON] Done')
  }
}
```

### Fix #4 : Vérifier useEffect sans deps ou deps instables
```typescript
// ❌ DANGEREUX
useEffect(() => {
  setSearchTerm(someValue)  // ← Peut causer boucle
})

// ✅ BON
useEffect(() => {
  setSearchTerm(someValue)
}, [someValue])  // ← Deps explicites

// ❌ DANGEREUX
useEffect(() => {
  if (clubs.length > 0) {
    setFilteredClubs(clubs.filter(...))  // ← Boucle si clubs change
  }
}, [clubs])

// ✅ BON (utiliser useMemo au lieu de useEffect)
const filteredClubs = useMemo(() => 
  clubs.filter(...)
, [clubs, filters])
```

---

## 🚨 POINTS À VÉRIFIER IMMÉDIATEMENT

### 1. Chercher les useEffect sans deps
```bash
grep -r "useEffect(() =>" app/player/\(authenticated\)/ --include="*.tsx"
```

### 2. Chercher les setState dans useEffect
```bash
grep -r "useEffect.*set" app/player/\(authenticated\)/ --include="*.tsx" -A 5
```

### 3. Vérifier Network dans Chrome DevTools
```
1. F12 → Network
2. Cliquer sur le bouton qui freeze
3. Regarder si requêtes en boucle (même URL répétée 10+ fois)
```

### 4. React DevTools Profiler
```
1. React DevTools → Profiler
2. Record
3. Cliquer sur le bouton
4. Si ça freeze, forcer Stop avec Esc
5. Analyser: combien de fois chaque composant render ?
```

---

## 📝 INFORMATIONS NÉCESSAIRES

Pour un diagnostic précis, merci de fournir :

### 1. Quel bouton ?
- [ ] Bouton "Réserver" (page club)
- [ ] Bouton filtre (clubs/tournois)
- [ ] Bouton favoris (cœur)
- [ ] Bouton recherche (SmartSearchBar)
- [ ] Bouton modal (Pad'up+, Réserver rapidement)
- [ ] Autre : _______________

### 2. Console logs
```
Copier-coller les derniers logs avant le freeze :
```

### 3. Network activity
```
Y a-t-il des requêtes qui partent en boucle ?
- [ ] Oui, lesquelles : _______________
- [ ] Non
- [ ] Pas vérifié
```

### 4. React DevTools
```
Combien de fois le composant re-render ?
- [ ] < 5 fois
- [ ] 10-20 fois
- [ ] 100+ fois (boucle infinie)
- [ ] Pas vérifié
```

---

## 🎯 ACTIONS IMMÉDIATES

Je vais appliquer les fixes préventifs sur les suspects #1 et #2 maintenant.

Ensuite, vous pourrez tester et me dire :
1. Quel bouton exactement cause le freeze
2. Les logs console
3. Si ça persiste après les fixes
