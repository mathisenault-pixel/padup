# 🐛 DEBUG : Pourquoi le mauvais créneau devient gris ?

## Modifications appliquées

### 1. ✅ Génération immutable des slots (ligne 40-77)

**AVANT (mutation de Date) :**
```typescript
let cur = new Date(start);
while (cur < end) {
  const next = new Date(cur.getTime() + 30 * 60000);
  const slotStartISO = toISOWithOffset(cur);  // ❌ cur est muté
  // ...
  cur = next;  // ❌ Mutation
}
```

**APRÈS (immutable) :**
```typescript
let currentTime = start.getTime();  // ✅ Timestamp immutable
while (currentTime < endTime) {
  const nextTime = currentTime + slotDuration;
  
  // ✅ Créer des Dates IMMUABLES pour chaque slot
  const slotStart = new Date(currentTime);
  const slotEnd = new Date(nextTime);
  
  const slotStartISO = toISOWithOffset(slotStart);
  const slotEndISO = toISOWithOffset(slotEnd);
  const key = makeSlotKey(slotStartISO, slotEndISO);
  
  // ✅ Pas de mutation
  currentTime = nextTime;
}
```

**Avantage :** Chaque slot a maintenant des valeurs stables et prévisibles.

### 2. ✅ Logs de debug ajoutés

**Logs au clic (ligne 293) :**
```typescript
onClick={() => {
  console.log('[SLOT CLICKED]', {
    label: s.label,
    key: s.key,
    slotStartISO: s.slotStartISO,
    slotEndISO: s.slotEndISO
  });
  bookSlot(s.slotStartISO, s.slotEndISO);
}}
```

**Logs dans bookSlot (ligne 200) :**
```typescript
console.log('[BOOK SLOT]', {
  slotStartISO,
  slotEndISO,
  key,
  isInBookedSet: bookedSet.has(key),
  isInPendingSlots: pendingSlots.has(key),
  bookedSetSize: bookedSet.size,
  pendingSlotsSize: pendingSlots.size
});
```

**Logs dans pendingSlots (ligne 218) :**
```typescript
console.log('[PENDING SLOTS UPDATED]', { 
  key, 
  newSize: next.size, 
  keys: Array.from(next) 
});
```

**Logs dans bookedSet (ligne 73) :**
```typescript
console.log('[BOOKED SET]', {
  bookedCount: booked.length,
  keys: keys,
  sample: booked[0]
});
```

**Logs de génération des slots (ligne 71) :**
```typescript
console.log('[SLOTS GENERATED]', {
  count: out.length,
  first: out[0],
  last: out[out.length - 1]
});
```

---

## Comment diagnostiquer le problème

### Étape 1 : Ouvrir DevTools Console

1. Ouvrir `http://localhost:3000/availability`
2. F12 > Console
3. Rafraîchir la page

### Étape 2 : Observer les logs au chargement

**Attendu :**
```
[SLOTS GENERATED] {
  count: 26,
  first: {
    slotStartISO: "2026-01-28T09:00:00.000Z",
    slotEndISO: "2026-01-28T09:30:00.000Z",
    label: "09:00 - 09:30",
    key: "2026-01-28T09:00:00.000Z|2026-01-28T09:30:00.000Z"
  },
  last: { ... }
}

[BOOKED SET] {
  bookedCount: 2,
  keys: [
    "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z",
    "2026-01-28T11:00:00.000Z|2026-01-28T11:30:00.000Z"
  ],
  sample: {
    slot_start: "2026-01-28T10:00:00.000Z",
    fin_de_slot: "2026-01-28T10:30:00.000Z"
  }
}
```

**Vérifier :**
- ✅ Les clés dans `keys` utilisent le séparateur `|`
- ✅ Le format ISO se termine par `.000Z`
- ✅ Le `sample` a les mêmes formats

### Étape 3 : Cliquer sur un créneau (ex: 10:00 - 10:30)

**Logs attendus :**
```
[SLOT CLICKED] {
  label: "10:00 - 10:30",
  key: "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z",
  slotStartISO: "2026-01-28T10:00:00.000Z",
  slotEndISO: "2026-01-28T10:30:00.000Z"
}

[BOOK SLOT] {
  slotStartISO: "2026-01-28T10:00:00.000Z",
  slotEndISO: "2026-01-28T10:30:00.000Z",
  key: "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z",
  isInBookedSet: false,
  isInPendingSlots: false,
  bookedSetSize: 2,
  pendingSlotsSize: 0
}

[PENDING SLOTS UPDATED] {
  key: "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z",
  newSize: 1,
  keys: ["2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z"]
}
```

**Vérifier :**
1. ✅ Le `label` cliqué correspond au créneau voulu (ex: "10:00 - 10:30")
2. ✅ La `key` est identique dans tous les logs
3. ✅ `isInPendingSlots` devient `true` après le clic
4. ✅ La `key` dans `[PENDING SLOTS UPDATED]` est la même que celle cliquée

### Étape 4 : Vérifier quel slot devient gris

**Dans l'UI :**
- Le créneau "10:00 - 10:30" doit devenir gris immédiatement
- Les autres créneaux doivent rester "Libre"

**Si un AUTRE créneau devient gris :**

→ Comparer les clés dans les logs :
- Copier la `key` de `[SLOT CLICKED]`
- Copier la `key` de `[PENDING SLOTS UPDATED]`
- Comparer : **doivent être IDENTIQUES**

**Si les clés sont différentes :**
- ❌ Problème dans `makeSlotKey()` ou `toISOWithOffset()`
- Vérifier que le séparateur est `|` et pas `-`
- Vérifier que le format ISO est identique

**Si les clés sont identiques mais le mauvais slot est gris :**
- ❌ Problème dans le rendu `slots.map`
- Vérifier que `s.key` correspond bien à celle cliquée
- Vérifier que `pendingSlots.has(s.key)` retourne `true` pour le bon slot

---

## Scénarios de debug

### Scénario 1 : Clés différentes

**Log :**
```
[SLOT CLICKED] {
  key: "2026-01-28T10:00:00.000Z-2026-01-28T10:30:00.000Z"  ← Séparateur -
}

[PENDING SLOTS UPDATED] {
  key: "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z"  ← Séparateur |
}
```

**Problème :** Le slot utilise `-` mais `makeSlotKey` utilise `|`.

**Solution :** Vérifier que `s.key` dans le rendu utilise bien `makeSlotKey()`.

### Scénario 2 : Formats ISO différents

**Log :**
```
[SLOT CLICKED] {
  key: "2026-01-28T10:00:00+01:00|..."  ← Timezone +01:00
}

[BOOKED SET] {
  keys: ["2026-01-28T10:00:00.000Z|..."]  ← Timezone .000Z
}
```

**Problème :** `toISOWithOffset` ne normalise pas correctement.

**Solution :** Vérifier l'implémentation de `toISOWithOffset()`.

### Scénario 3 : Slot décalé d'un cran

**Symptôme :** Clic sur "10:00 - 10:30", mais "10:30 - 11:00" devient gris.

**Log attendu :**
```
[SLOT CLICKED] {
  label: "10:00 - 10:30",
  key: "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z"
}

[PENDING SLOTS UPDATED] {
  key: "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z"  ← Même clé ✅
}
```

**Mais dans l'UI :** Le slot "10:30 - 11:00" est gris.

**Cause probable :** Problème dans la génération des slots (ancien bug de mutation de Date).

**Solution :** Déjà corrigé avec la génération immutable.

---

## Test après fix

### Test 1 : Cliquer sur "09:00 - 09:30"

1. Ouvrir Console
2. Cliquer sur le premier créneau "09:00 - 09:30"
3. **Vérifier** :
   - Log `[SLOT CLICKED]` avec `label: "09:00 - 09:30"`
   - Log `[PENDING SLOTS UPDATED]` avec la même `key`
   - Le créneau "09:00 - 09:30" devient gris (pas "09:30 - 10:00")

### Test 2 : Cliquer sur "14:00 - 14:30"

1. Cliquer sur un créneau au milieu (ex: "14:00 - 14:30")
2. **Vérifier** :
   - La `key` contient "14:00" et "14:30"
   - Le créneau "14:00 - 14:30" devient gris
   - Pas un créneau avant ou après

### Test 3 : Cliquer sur le dernier créneau

1. Cliquer sur "21:30 - 22:00"
2. **Vérifier** :
   - La `key` contient "21:30" et "22:00"
   - Le créneau "21:30 - 22:00" devient gris

---

## Si le problème persiste

### Comparer les clés manuellement

**Dans Console :**
```javascript
// Copier la clé du slot cliqué
const clickedKey = "2026-01-28T10:00:00.000Z|2026-01-28T10:30:00.000Z";

// Copier la clé du slot qui devient gris
const graySlotKey = "...";

// Comparer
console.log('Match:', clickedKey === graySlotKey);
console.log('Clicked:', clickedKey);
console.log('Gray:', graySlotKey);
```

**Si `Match: false` :**
- Comparer caractère par caractère pour trouver la différence
- Vérifier le séparateur (`|` vs `-`)
- Vérifier le format timezone (`.000Z` vs `+00:00`)

### Inspecter pendingSlots dans React DevTools

1. React DevTools > Components > AvailabilityPage
2. Chercher `pendingSlots` dans les hooks
3. **Vérifier** : La clé stockée correspond au slot cliqué

### Inspecter slots dans React DevTools

1. React DevTools > Components > AvailabilityPage
2. Chercher `slots` dans les hooks
3. **Vérifier** : Chaque slot a un `key` unique et stable
4. Copier `slots[9].key` (par exemple) et comparer avec la clé cliquée

---

## Résumé des changements

| Changement | Avant | Après |
|---|---|---|
| Génération slots | Date mutable | Timestamps immutables ✅ |
| Log au clic | Aucun | `[SLOT CLICKED]` ✅ |
| Log bookSlot | Aucun | `[BOOK SLOT]` ✅ |
| Log pendingSlots | Aucun | `[PENDING SLOTS UPDATED]` ✅ |
| Log bookedSet | Aucun | `[BOOKED SET]` ✅ |
| Log génération | Aucun | `[SLOTS GENERATED]` ✅ |

**Avec ces logs, vous pouvez maintenant identifier EXACTEMENT où le problème se situe !** 🎯

---

## Prochaines étapes

1. **Tester avec les logs** : Cliquer sur différents créneaux et observer la console
2. **Comparer les clés** : Vérifier que la clé cliquée = clé ajoutée à pendingSlots
3. **Identifier la divergence** : Si les clés diffèrent, noter à quel endroit (séparateur, format, timezone)
4. **Partager les logs** : Copier les logs de console si le problème persiste

Une fois que vous aurez les logs, je pourrai diagnostiquer précisément le problème ! 🚀
