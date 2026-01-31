# 🔴 CAUSE RACINE DU FREEZE - TROUVÉE !

## 🎯 LE COUPABLE

**Fichier** : `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`
**Fonction** : `isSlotAvailable()` appelée dans le render

## 💥 LE PROBLÈME

### Code actuel (DANGEREUX) :
```typescript
// Cette fonction est appelée dans le render pour CHAQUE terrain × CHAQUE créneau
const isSlotAvailable = (terrainId: number, slot: { startTime: string }) => {
  const unavailableSlots = generateUnavailableSlots(terrainId, selectedDate)
  // ↑ RECALCULE à chaque appel !
  return !unavailableSlots.includes(slot.startTime)
}

// Plus bas dans le render :
{timeSlots.map(slot => (
  <button onClick={() => handleSlotClick(terrainId, slot)}>
    {isSlotAvailable(terrainId, slot) ? '✅' : '❌'}
    {/* ↑ Appel à CHAQUE render ! */}
  </button>
))}
```

### Calcul du désastre :
```
Le Hangar : 8 terrains
Créneaux : 10 slots (8h-23h30 par 1h30)
= 8 terrains × 10 slots = 80 appels à generateUnavailableSlots()

Chaque appel :
- generateTimeSlots() → 10 créneaux
- Boucle while jusqu'à 30% rempli
- .includes() sur chaque slot

= Environ 800-1000 opérations PAR RENDER !
```

### Si quelque chose trigger un re-render :
```
1. Clic sur un bouton (ex: changer de date)
2. setState(selectedDate)
3. Re-render complet
4. 80 appels à generateUnavailableSlots()
5. Si un useEffect réagit → re-render
6. 80 nouveaux appels
7. → BOUCLE INFINIE ou FREEZE
```

## ✅ LA SOLUTION

### Option 1 : useMemo pour cache les slots indisponibles (RECOMMANDÉ)

```typescript
export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  // ... existing code
  
  // Cache les slots indisponibles par terrain
  const unavailableSlotsCache = useMemo(() => {
    console.log('🔄 [CACHE] Recalculating unavailable slots')
    const cache: { [terrainId: number]: string[] } = {}
    
    terrains.forEach(terrain => {
      cache[terrain.id] = generateUnavailableSlots(terrain.id, selectedDate)
    })
    
    console.log('✅ [CACHE] Done:', Object.keys(cache).length, 'terrains')
    return cache
  }, [selectedDate, club?.nombreTerrains]) // Recalculer seulement si date change
  
  // Version optimisée
  const isSlotAvailable = (terrainId: number, slot: { startTime: string }) => {
    return !unavailableSlotsCache[terrainId]?.includes(slot.startTime)
  }
}
```

**Gain** :
- Avant : 80 appels par render
- Après : 8 appels UNE SEULE FOIS (puis cache)
- **Gain : 90% de calculs évités** 🚀

### Option 2 : useCallback pour stabiliser la fonction

```typescript
const isSlotAvailable = useCallback((terrainId: number, slot: { startTime: string }) => {
  const unavailableSlots = generateUnavailableSlots(terrainId, selectedDate)
  return !unavailableSlots.includes(slot.startTime)
}, [selectedDate])
```

**Mais** : Ça ne résout pas le problème, car `generateUnavailableSlots` est quand même appelé à chaque fois.

## 🔍 AUTRES PATTERNS DANGEREUX TROUVÉS

### 1. Génération dans le render
```typescript
// ❌ MAUVAIS
const terrains = Array.from({ length: club.nombreTerrains }, (_, i) => ({
  id: i + 1,
  nom: `Terrain ${i + 1}`,
  type: i % 2 === 0 ? 'Intérieur' : 'Extérieur'
}))
```

**Solution** :
```typescript
// ✅ BON
const terrains = useMemo(() => 
  Array.from({ length: club.nombreTerrains }, (_, i) => ({
    id: i + 1,
    nom: `Terrain ${i + 1}`,
    type: i % 2 === 0 ? 'Intérieur' : 'Extérieur'
  }))
, [club?.nombreTerrains])
```

### 2. Génération en dehors du composant (mais appelé dans render)
```typescript
// ❌ MAUVAIS - Recréés à chaque render du composant
const timeSlots = generateTimeSlots()
const nextDays = generateNextDays()
```

**Solution** :
```typescript
// ✅ BON
const timeSlots = useMemo(() => generateTimeSlots(), [])
const nextDays = useMemo(() => generateNextDays(), [])
```

## 🛠️ CORRECTIF COMPLET

Je vais appliquer toutes ces optimisations maintenant.
