# 🔧 FIX: "document is not defined" (SSR Error)

## Date: 2026-01-22

---

## 🎯 Problème

**Erreur :**
```
ReferenceError: document is not defined
    at Object.get (.next/server/chunks/ssr/_ca12c48c._.js:23:4877)
```

**Symptômes :**
- ❌ Erreur pendant `npm run build` (phase static generation)
- ❌ Crash potentiel au runtime lors du click sur club
- ❌ Next.js essaie de pré-rendre des pages qui utilisent `document`

**Cause :**
- `lib/supabaseBrowser.ts` accède à `document.cookie` directement
- Next.js static generation importe tous les modules
- Même pour Client Components (`'use client'`), les imports sont évalués côté serveur
- `document` n'existe pas pendant SSR → **CRASH**

---

## ✅ Solution Appliquée

### 1. Protéger `document.cookie` dans `supabaseBrowser`

**Fichier :** `lib/supabaseBrowser.ts`

**AVANT (❌ Crash SSR) :**
```typescript
export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        const value = `; ${document.cookie}`  // ❌ document pas défini pendant SSR
        // ...
      },
      set(name: string, value: string, options: any) {
        document.cookie = cookie  // ❌ document pas défini pendant SSR
      },
    },
  }
)
```

**APRÈS (✅ SSR-safe) :**
```typescript
export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        // ✅ Guard: vérifier que document existe (côté client uniquement)
        if (typeof document === 'undefined') {
          return undefined
        }
        
        const value = `; ${document.cookie}`  // ✅ Safe maintenant
        // ...
      },
      set(name: string, value: string, options: any) {
        // ✅ Guard: vérifier que document existe (côté client uniquement)
        if (typeof document === 'undefined') {
          return
        }
        
        document.cookie = cookie  // ✅ Safe maintenant
      },
    },
  }
)
```

**Pourquoi ça fonctionne :**
- `typeof document === 'undefined'` ne crash jamais (contrairement à `document`)
- Pendant SSR : guard retourne `undefined` → pas d'accès à `document`
- Côté client : guard passe → `document.cookie` fonctionne normalement

---

### 2. Forcer le rendu dynamique des pages

**Fichiers modifiés :**
- `app/player/(authenticated)/accueil/page.tsx`
- `app/player/(authenticated)/clubs/page.tsx`
- `app/player/(authenticated)/reservations/page.tsx`

**Ajout :**
```typescript
'use client'

import { /* ... */ } from '...'

// ✅ Force dynamic rendering (pas de pre-render statique)
// Nécessaire car supabaseBrowser accède à document.cookie
export const dynamic = 'force-dynamic'

export default function MyPage() {
  // ...
}
```

**Pourquoi :**
- Ces pages utilisent `supabaseBrowser` pour l'auth
- Forcer le rendu dynamique évite le pre-render pendant le build
- Les pages sont rendues on-demand au lieu d'être statiques

---

## 📊 Résultat

| Aspect | AVANT | APRÈS |
|--------|-------|-------|
| Build error | ❌ `document is not defined` | ✅ Build clean |
| SSR safety | ❌ Crash si import | ✅ Guards empêchent crash |
| Static generation | ⚠️ Essaie de pre-render | ✅ Force dynamic |
| Runtime | ❌ Peut crasher | ✅ Fonctionne |
| Browser behavior | ✅ OK | ✅ OK (unchanged) |

---

## 🧪 Vérification

### Test 1 : Build sans erreur

```bash
npm run build
```

**AVANT :**
```
ReferenceError: document is not defined
    at Object.get (.next/server/chunks/ssr/_ca12c48c._.js:23:4877)
 ✓ Compiled successfully (avec warnings)
```

**APRÈS :**
```
 ✓ Compiled successfully in 3.0s
(aucun warning document)
```

---

### Test 2 : Navigation fonctionne

**Action :**
1. `npm run dev`
2. Aller sur `/player/accueil`
3. Cliquer sur un club

**Résultat :**
- ✅ Pas de crash
- ✅ Navigation vers `/player/clubs/[id]/reserver`
- ✅ Page s'affiche correctement

---

## 📚 Règles pour éviter ce problème

### 1. Toujours protéger les APIs browser

**❌ MAUVAIS (crash SSR) :**
```typescript
// Au top-level du module
const userAgent = navigator.userAgent  // ❌ Crash SSR
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches  // ❌ Crash SSR
const stored = localStorage.getItem('key')  // ❌ Crash SSR
```

**✅ BON (SSR-safe) :**
```typescript
// Option 1: Dans useEffect (client-only)
useEffect(() => {
  const userAgent = navigator.userAgent  // ✅ OK
  const stored = localStorage.getItem('key')  // ✅ OK
}, [])

// Option 2: Avec guard
const getUserAgent = () => {
  if (typeof navigator !== 'undefined') {  // ✅ OK
    return navigator.userAgent
  }
  return 'unknown'
}

// Option 3: Lazy evaluation
const getStoredValue = () => {
  if (typeof window !== 'undefined') {  // ✅ OK
    return localStorage.getItem('key')
  }
  return null
}
```

---

### 2. Client Components ne garantissent PAS l'accès à `document`

**Idée fausse :**
```typescript
'use client'

// ❌ FAUX: 'use client' ne garantit PAS que document existe ici
const cookies = document.cookie  // ❌ Peut crash pendant SSR/build
```

**Réalité :**
- `'use client'` signifie : "Ce composant doit s'exécuter dans le navigateur"
- Mais pendant le build, Next.js **importe quand même** le module
- Les imports sont évalués → code au top-level s'exécute
- Si ce code accède à `document` → **CRASH**

**Solution :**
```typescript
'use client'

import { useEffect, useState } from 'react'

export default function MyComponent() {
  const [cookies, setCookies] = useState('')
  
  // ✅ useEffect = client-only, document garanti
  useEffect(() => {
    setCookies(document.cookie)  // ✅ OK
  }, [])
  
  return <div>{cookies}</div>
}
```

---

### 3. Forcer dynamic pour pages avec browser APIs

**Si une page doit accéder à des APIs browser :**

```typescript
'use client'

// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic'

// Maintenant safe d'utiliser supabaseBrowser, etc.
import { supabaseBrowser } from '@/lib/supabaseBrowser'
```

---

## 🔍 Debugging

### Comment identifier ce type d'erreur

1. **Dans les logs de build :**
```
ReferenceError: document is not defined
ReferenceError: window is not defined
ReferenceError: navigator is not defined
ReferenceError: localStorage is not defined
```

2. **Stack trace pointe vers un chunk SSR :**
```
at Object.get (.next/server/chunks/ssr/_ca12c48c._.js:23:4877)
```

3. **L'erreur apparaît pendant :**
- `npm run build` (phase "Generating static pages")
- Premier chargement de page en dev
- Navigation vers une page qui n'a pas encore été chargée

---

### Où chercher

1. **Chercher les usages de browser APIs :**
```bash
# Dans le repo
grep -r "document\." app lib components
grep -r "window\." app lib components
grep -r "localStorage" app lib components
grep -r "navigator\." app lib components
```

2. **Vérifier les imports au top-level :**
- Fichiers qui importent des librairies browser-only
- Code qui s'exécute hors de useEffect/handlers
- Initialisation de clients/singletons

3. **Vérifier le build output :**
```bash
npm run build | grep "document\|window"
```

---

## ✅ Checklist de correction

Pour chaque erreur "document/window is not defined" :

- [ ] Identifier le fichier exact dans la stack trace
- [ ] Trouver l'accès à `document`/`window`/`localStorage`/etc.
- [ ] Appliquer UNE des solutions :
  - [ ] Ajouter guard : `if (typeof document !== 'undefined')`
  - [ ] Déplacer dans `useEffect` (si composant)
  - [ ] Ajouter `export const dynamic = 'force-dynamic'` (si page)
  - [ ] Lazy load le module (import dynamique)
- [ ] Rebuild et vérifier : `npm run build`
- [ ] Tester en dev : `npm run dev`
- [ ] Tester la navigation vers la page

---

## 📦 Commits

```
a17a74e fix(ssr): resolve document is not defined error during static generation
2ae105b docs: comprehensive guide for fixing server crash with supabaseBrowser
b40159f fix(critical): resolve server crash in /club/[id] route
```

**Résultat final :**
- ✅ Plus d'erreur "document is not defined"
- ✅ Build passe clean
- ✅ Toutes les pages fonctionnent
- ✅ SSR-safe

---

**Date :** 2026-01-22  
**Status :** ✅ **RÉSOLU**  
**Build :** ✅ Clean (no warnings)
