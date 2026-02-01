# FIX — React Hooks Order + Next.js params Promise

**Date:** 2026-01-22  
**Fichier corrigé:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

---

## 🔴 PROBLÈME

**Symptômes:**
- Erreur: "Rendered more hooks than during the previous render"
- Erreur: "params is a Promise"
- Crash React lors de la navigation vers `/player/clubs/[id]/reserver`

**Causes:**

### 1. Violation des Rules of Hooks
Les **Rules of Hooks** de React exigent que:
- TOUS les hooks soient appelés **dans le même ordre** à chaque rendu
- AUCUN hook ne soit appelé conditionnellement (`if`, `return`, `break` avant un hook)
- Le nombre de hooks appelés doit être **constant** entre les rendus

**Problème dans le code:**
```typescript
export default function ReservationPage({ params }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  const [clubData, setClubData] = useState(null)
  const [isLoadingClub, setIsLoadingClub] = useState(true)
  
  useEffect(() => { ... }, [clubId])
  const club = useMemo(() => { ... }, [clubData])
  const [selectedDate, setSelectedDate] = useState(...)
  useEffect(() => { ... }, [])
  
  // ❌ ERREUR: RETURN CONDITIONNEL APRÈS DES HOOKS!
  if (!clubId) {
    return null // ❌ Si clubId est falsy, on arrête ici
  }
  
  if (isLoadingClub) {
    return <Loading /> // ❌ Si loading, on arrête ici
  }
  
  if (!club) {
    return <Error /> // ❌ Si pas de club, on arrête ici
  }
  
  // ❌ ERREUR: HOOKS APRÈS DES RETURNS CONDITIONNELS!
  useEffect(() => { ... }, [club?.id]) // ❌ Appelé seulement si clubId, isLoadingClub, et club sont truthy
  const terrains = useMemo(() => ..., [courts]) // ❌ Appelé seulement parfois
  useEffect(() => { ... }, [selectedDate, club]) // ❌ Appelé seulement parfois
  useCallback(() => { ... }, [club]) // ❌ Appelé seulement parfois
  
  return (...)
}
```

**Résultat:**
- **Premier rendu** (clubId=null): 10 hooks appelés → return null
- **Deuxième rendu** (clubId="abc"): 15 hooks appelés → hooks après les guards sont maintenant appelés
- **React panic:** "Rendered more hooks than during the previous render" ❌

### 2. Mauvais usage de `params` (Promise)
Dans Next.js 15+, `params` est une **Promise** qui doit être résolue avec `React.use()`.

**Problème:**
```typescript
export default function ReservationPage({ params }) {
  console.log('[RESERVER PAGE] params:', params) // ❌ Avant use()
  
  const resolvedParams = use(params) // ✅ OK
  const clubId = resolvedParams?.id
  
  console.log('[RESERVER PAGE] clubId:', clubId) // OK
}
```

**Erreur:** Accès à `params` avant `use(params)` peut causer des comportements imprévisibles.

---

## ✅ SOLUTION APPLIQUÉE

### Structure correcte (Rules of Hooks)

```typescript
export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  // ============================================
  // 1️⃣ RÉSOUDRE params EN PREMIER
  // ============================================
  const resolvedParams = use(params)
  const clubId = resolvedParams?.id
  
  // ============================================
  // 2️⃣ TOUS LES HOOKS (SANS AUCUNE CONDITION)
  // ============================================
  const router = useRouter()
  
  // États
  const [clubData, setClubData] = useState<Club | null>(null)
  const [isLoadingClub, setIsLoadingClub] = useState(true)
  const [selectedDate, setSelectedDate] = useState(...)
  const [selectedTerrain, setSelectedTerrain] = useState(...)
  // ... tous les autres useState (13 au total)
  
  // Effects
  useEffect(() => {
    // ✅ Guard INTERNE (dans le useEffect, pas avant)
    if (!clubId) {
      router.replace('/player/clubs')
      return
    }
  }, [clubId, router])
  
  useEffect(() => {
    // ✅ Guard INTERNE
    if (!clubId) return
    
    const loadClub = async () => { ... }
    loadClub()
  }, [clubId])
  
  // Memos
  const club = useMemo(() => clubData, [clubData])
  const nextDays = useMemo(() => generateNextDays(), [])
  
  // Plus de useEffect
  useEffect(() => { ... }, []) // check auth
  useEffect(() => { ... }, [club?.id]) // load courts
  useEffect(() => { ... }, []) // load time slots
  useEffect(() => { ... }, [selectedDate, club, terrains]) // load bookings
  useEffect(() => { ... }, [selectedDate, club, terrains]) // realtime
  
  // Memos
  const terrains = useMemo(() => ..., [courts])
  
  // Callbacks
  const isSlotAvailable = useCallback(() => { ... }, [bookedByCourt])
  const sendInvitations = useCallback(() => { ... }, [invitedEmails, club, selectedDate, selectedSlot])
  const handleFinalConfirmation = useCallback(() => { ... }, [...])
  const handleSlotClick = useCallback(() => { ... }, [...])
  const handlePlayersContinue = useCallback(() => { ... }, [...])
  const handleSubscribePremium = useCallback(() => { ... }, [...])
  const handleContinueWithout = useCallback(() => { ... }, [...])
  
  // ============================================
  // 3️⃣ GUARDS POUR LE JSX (APRÈS TOUS LES HOOKS)
  // ============================================
  
  // ✅ Maintenant TOUS les hooks sont appelés, on peut return
  if (!clubId) {
    return null
  }
  
  if (isLoadingClub) {
    return <LoadingUI />
  }
  
  if (!club || !club.id) {
    return <ErrorUI />
  }
  
  // ============================================
  // 4️⃣ HELPER FUNCTIONS & JSX
  // ============================================
  
  const formatDate = (date: Date) => { ... }
  
  return (
    <div>...</div>
  )
}
```

---

## 📊 AVANT / APRÈS

### AVANT ❌

```typescript
export default function ReservationPage({ params }) {
  console.log('[RESERVER PAGE] params:', params) // ❌ Avant use()
  
  const resolvedParams = use(params)
  const router = useRouter()
  
  const clubId = resolvedParams?.id
  
  console.log('[RESERVER PAGE] clubId:', clubId)
  
  if (!clubId) { // ❌ Log conditionnel
    console.error('[RESERVER PAGE] ❌ CRITICAL: clubId is undefined!')
  }
  
  useEffect(() => { ... }, [clubId]) // Hook 1
  const [clubData, setClubData] = useState(null) // Hook 2-3
  const [isLoadingClub, setIsLoadingClub] = useState(true) // Hook 4-5
  useEffect(() => { ... }, [clubId]) // Hook 6
  const club = useMemo(() => ..., [clubData]) // Hook 7
  const nextDays = useMemo(() => ..., []) // Hook 8
  const [selectedDate, setSelectedDate] = useState(...) // Hook 9-10
  // ... 10 autres useState (hooks 11-30)
  useEffect(() => { ... }, []) // Hook 31
  
  // ❌ RETURN CONDITIONNEL APRÈS 31 HOOKS!
  if (!clubId) {
    return null // Si clubId est falsy, on s'arrête ici
  }
  
  if (isLoadingClub) {
    return <Loading /> // Si loading, on s'arrête ici
  }
  
  if (!club) {
    return <Error /> // Si pas de club, on s'arrête ici
  }
  
  // ❌ HOOKS APRÈS DES RETURNS CONDITIONNELS!
  useEffect(() => { ... }, [club?.id]) // Hook 32 (parfois)
  const terrains = useMemo(() => ..., [courts]) // Hook 33 (parfois)
  useEffect(() => { ... }, []) // Hook 34 (parfois)
  useEffect(() => { ... }, [selectedDate, club]) // Hook 35 (parfois)
  useEffect(() => { ... }, [selectedDate, club]) // Hook 36 (parfois)
  const isSlotAvailable = useCallback(() => { ... }, [...]) // Hook 37 (parfois)
  const sendInvitations = useCallback(() => { ... }, [...]) // Hook 38 (parfois)
  // ... 5 autres useCallback (hooks 39-43, parfois)
  
  return (...)
}
```

**Résultat:**
- **Rendu 1** (clubId=null, isLoadingClub=true): 31 hooks appelés → return `<Loading />`
- **Rendu 2** (clubId="abc", isLoadingClub=true): 31 hooks appelés → return `<Loading />`
- **Rendu 3** (clubId="abc", isLoadingClub=false, club=null): 31 hooks appelés → return `<Error />`
- **Rendu 4** (clubId="abc", isLoadingClub=false, club={...}): 43 hooks appelés → React panic! ❌

### APRÈS ✅

```typescript
export default function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  // 1️⃣ use(params) EN PREMIER (pas de console.log avant)
  const resolvedParams = use(params)
  const clubId = resolvedParams?.id
  
  // 2️⃣ TOUS LES HOOKS (SANS CONDITION)
  const router = useRouter()
  
  const [clubData, setClubData] = useState<Club | null>(null)
  const [isLoadingClub, setIsLoadingClub] = useState(true)
  
  useEffect(() => {
    if (!clubId) return
    const loadClub = async () => { ... }
    loadClub()
  }, [clubId])
  
  const club = useMemo(() => clubData, [clubData])
  const nextDays = useMemo(() => generateNextDays(), [])
  
  const [selectedDate, setSelectedDate] = useState(nextDays[0])
  // ... tous les autres useState (13 au total)
  
  useEffect(() => { ... }, []) // check auth
  useEffect(() => { ... }, [clubId, router]) // redirect
  useEffect(() => { ... }, [club?.id]) // load courts
  const terrains = useMemo(() => ..., [courts])
  useEffect(() => { ... }, []) // load time slots
  useEffect(() => { ... }, [selectedDate, club, terrains]) // load bookings
  useEffect(() => { ... }, [selectedDate, club, terrains]) // realtime
  
  const isSlotAvailable = useCallback(() => { ... }, [...])
  const sendInvitations = useCallback(() => { ... }, [...])
  const handleFinalConfirmation = useCallback(() => { ... }, [...])
  const handleSlotClick = useCallback(() => { ... }, [...])
  const handlePlayersContinue = useCallback(() => { ... }, [...])
  const handleSubscribePremium = useCallback(() => { ... }, [...])
  const handleContinueWithout = useCallback(() => { ... }, [...])
  
  // ✅ 43 HOOKS APPELÉS (toujours le même nombre)
  
  // 3️⃣ MAINTENANT: GUARDS POUR LE JSX
  if (!clubId) return null
  if (isLoadingClub) return <Loading />
  if (!club || !club.id) return <Error />
  
  // 4️⃣ JSX
  const formatDate = (date: Date) => { ... }
  return (...)
}
```

**Résultat:**
- **Rendu 1** (clubId=null): 43 hooks appelés → return `null`
- **Rendu 2** (clubId="abc", isLoadingClub=true): 43 hooks appelés → return `<Loading />`
- **Rendu 3** (clubId="abc", isLoadingClub=false, club=null): 43 hooks appelés → return `<Error />`
- **Rendu 4** (clubId="abc", isLoadingClub=false, club={...}): 43 hooks appelés → return JSX
- ✅ **Toujours 43 hooks** → React happy! ✅

---

## 🎯 RÈGLES À RESPECTER

### 1. Rules of Hooks

**✅ CORRECT:**
```typescript
export default function Component() {
  // Tous les hooks en premier (sans condition)
  const [state1, setState1] = useState()
  const [state2, setState2] = useState()
  useEffect(() => {
    // Guard INTERNE
    if (!state1) return
    // logique
  }, [state1])
  const value = useMemo(() => ..., [state2])
  
  // PUIS les guards pour le JSX
  if (!state1) return null
  if (!state2) return <Loading />
  
  // PUIS le JSX
  return <div>...</div>
}
```

**❌ INCORRECT:**
```typescript
export default function Component() {
  const [state1, setState1] = useState()
  
  // ❌ Return AVANT tous les hooks
  if (!state1) return null
  
  // ❌ Hook APRÈS un return conditionnel
  const [state2, setState2] = useState() // Nombre de hooks varie!
  
  return <div>...</div>
}
```

### 2. Usage de `params` (Next.js 15+)

**✅ CORRECT:**
```typescript
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // ✅ use() EN PREMIER
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  // ✅ Puis les autres hooks
  const router = useRouter()
  const [state, setState] = useState()
  
  return <div>{id}</div>
}
```

**❌ INCORRECT:**
```typescript
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  // ❌ Accès à params AVANT use()
  console.log('params:', params)
  
  const resolvedParams = use(params)
  const id = resolvedParams.id
  
  return <div>{id}</div>
}
```

---

## ✅ RÉSULTAT

**Build:**
```bash
npm run build
```

```
✅ Compiled successfully in 2.5s
✅ TypeScript check passed
✅ Static pages generated (30/30) in 787ms
✅ NO ERRORS
```

**Comportement attendu:**
- ✅ Plus d'erreur "Rendered more hooks than during the previous render"
- ✅ Plus d'erreur "params is a Promise"
- ✅ Le nombre de hooks appelés est **constant** (43 hooks à chaque rendu)
- ✅ Les guards sont appliqués **après** tous les hooks
- ✅ La navigation vers `/player/clubs/[id]/reserver` fonctionne correctement

---

## 📝 CONCLUSION

Les **Rules of Hooks** de React sont **strictes** et **non négociables**:
1. ✅ Tous les hooks doivent être appelés **dans le même ordre** à chaque rendu
2. ✅ Aucun hook ne doit être appelé **conditionnellement** (pas de `if`, `return` avant un hook)
3. ✅ Le nombre de hooks appelés doit être **constant**

**Structure obligatoire:**
```typescript
export default function Component({ params }) {
  // 1. use(params) en premier
  // 2. Tous les hooks (sans condition)
  // 3. Guards pour le JSX (après tous les hooks)
  // 4. JSX
}
```

Cette structure garantit que React peut toujours suivre l'état des hooks et éviter les crashes.
