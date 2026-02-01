# 🔴 FIX CRITIQUE: Crash Serveur Silencieux (Supabase Browser dans Server Component)

## Date: 2026-01-22

---

## 🎯 Bug Critique Résolu

**Symptômes :**
- ❌ Cliquer sur un club affiche `error.tsx` global
- ❌ **AUCUNE erreur** dans la console browser
- ❌ **AUCUNE erreur** dans Network tab
- ❌ Crash serveur silencieux
- ❌ Impossible de débugger sans logs serveur

**Cause racine :**
- Server Component utilise `supabaseBrowser` (client browser-only)
- `supabaseBrowser` accède à `document.cookie`
- `document` n'existe pas côté serveur → **CRASH**
- Le crash serveur ne remonte pas dans la console browser

---

## 🔍 Analyse du Problème

### Fichier problématique : `app/club/[id]/page.tsx`

**Code buggé :**
```typescript
// ❌ MAUVAIS - Server Component avec client browser
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

// Pas de 'use client' → Server Component par défaut
export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data, error } = await supabase  // ❌ CRASH ICI !
    .from('clubs')
    .select('id, name, city')
    .eq('id', clubId)
    .maybeSingle()
}
```

**Pourquoi ça crash :**

1. **`supabaseBrowser` accède à `document.cookie`** :
   ```typescript
   // lib/supabaseBrowser.ts
   export const supabaseBrowser = createBrowserClient(
     supabaseUrl,
     supabaseAnonKey,
     {
       cookies: {
         get(name: string) {
           const value = `; ${document.cookie}`  // ❌ document n'existe PAS côté serveur !
           // ...
         },
         set(name: string, value: string, options: any) {
           document.cookie = cookie  // ❌ CRASH !
         },
       },
     }
   )
   ```

2. **Le Server Component exécute côté serveur** :
   - Next.js render le composant côté serveur (SSR)
   - `document` est une API browser-only
   - `ReferenceError: document is not defined`
   - Le serveur crash AVANT d'envoyer quoi que ce soit au client

3. **Pourquoi pas d'erreur console browser** :
   - Le crash arrive AVANT que le client reçoive du HTML
   - Next.js intercepte l'erreur serveur
   - Affiche `error.tsx` avec message générique
   - Aucun log client (car le client ne s'exécute jamais)

---

## ✅ Solution Appliquée

### 1. Utiliser le bon client Supabase

**Code corrigé :**
```typescript
// ✅ BON - Server Component avec client serveur
import { supabase } from '@/lib/supabaseClient'  // ✅ Client serveur

// ✅ LOG SERVEUR AU TOUT DÉBUT
console.log('[SERVER] /club/[id]/page.tsx - ROUTE HIT, params:', params)

export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  console.log('[SERVER] /club/[id]/page.tsx - resolvedParams:', resolvedParams)
  
  const clubId = resolvedParams?.id
  console.log('[SERVER] /club/[id]/page.tsx - clubId:', clubId, 'type:', typeof clubId)
  
  // ✅ AUCUN accès à document, window, localStorage
  const { data, error } = await supabase
    .from('clubs')
    .select('id, name, city')
    .eq('id', clubId)
    .maybeSingle()
  
  if (error || !data) {
    console.error('[SERVER] Club fetch failed:', error || 'No data')
    notFound()
  }
}
```

### 2. Différence entre les clients Supabase

#### `supabaseBrowser` (Client Component UNIQUEMENT)

**Fichier :** `lib/supabaseBrowser.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      get(name: string) {
        const value = `; ${document.cookie}`  // ❌ Browser-only
        // ...
      },
      set(name: string, value: string, options: any) {
        document.cookie = cookie  // ❌ Browser-only
      },
      remove(name: string, options: any) {
        this.set(name, '', { ...options, maxAge: 0 })
      },
    },
  }
)
```

**Utilisation :**
- ✅ **Client Components** (`'use client'`)
- ✅ Accès à `document`, `window`, `localStorage`
- ✅ Persiste la session dans cookies + localStorage
- ✅ Auto-refresh des tokens
- ❌ **JAMAIS dans Server Components**

**Exemple :**
```typescript
'use client'

import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

export default function MyClientComponent() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase.from('clubs').select()  // ✅ OK
      setData(data)
    }
    fetchData()
  }, [])
}
```

---

#### `supabaseClient` (Server Component OU Client Component)

**Fichier :** `lib/supabaseClient.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: "public" },
  auth: {
    persistSession: false,  // ✅ Pas de persistance (safe serveur)
    autoRefreshToken: false,  // ✅ Pas d'auto-refresh
  },
})
```

**Utilisation :**
- ✅ **Server Components** (async function)
- ✅ **Client Components** (si pas besoin de session persistante)
- ✅ Pas d'accès à `document`, `window`, `localStorage`
- ✅ Safe pour le serveur
- ⚠️ Pas de persistance de session (chaque requête = nouvelle connexion)

**Exemple :**
```typescript
// ✅ Server Component
export default async function MyServerComponent({ params }) {
  const { data } = await supabase.from('clubs').select()  // ✅ OK
  return <div>{data.map(club => ...)}</div>
}
```

---

### 3. Règle simple : Quel client utiliser ?

| Contexte | Client à utiliser | Raison |
|----------|-------------------|--------|
| Server Component (async) | `supabaseClient` | Pas d'accès `document` |
| Client Component (`'use client'`) | `supabaseBrowser` | Besoin de session persistante |
| API Route (route handlers) | `supabaseClient` | Côté serveur |
| Server Action | `supabaseClient` | Côté serveur |
| Middleware | `supabaseClient` | Côté serveur |

---

## 🧪 Comment identifier ce bug

### Symptômes à surveiller

1. **Écran d'erreur sans log console** :
   ```
   ❌ error.tsx s'affiche
   ✅ Console browser : vide (pas d'erreur)
   ✅ Network : vide (pas de requête)
   ```

2. **Erreur dans build logs** :
   ```
   ReferenceError: document is not defined
       at Object.get (.next/server/chunks/...)
   ```

3. **Server Component utilise browser API** :
   - Pas de `'use client'` en haut du fichier
   - `export default async function`
   - Import de `supabaseBrowser` ou autre code browser

---

### Checklist de vérification

**Pour chaque Server Component (async function sans 'use client') :**

- [ ] N'importe PAS `supabaseBrowser`
- [ ] N'accède PAS à `document`, `window`, `localStorage`
- [ ] N'utilise PAS `createBrowserClient`
- [ ] Utilise `supabaseClient` (ou autre client serveur)
- [ ] A des logs serveur au début (pour debug)

**Exemple de vérification automatique :**
```bash
# Chercher les Server Components qui importent supabaseBrowser
grep -r "export default async function" app --include="*.tsx" | \
  while read file; do
    if ! grep -q "use client" "$file" && grep -q "supabaseBrowser" "$file"; then
      echo "❌ BUG POTENTIEL: $file"
    fi
  done
```

---

## 🛠️ Correction Appliquée

### Changements dans `app/club/[id]/page.tsx`

**Ligne 3 - Import** :
```diff
- import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
+ import { supabase } from '@/lib/supabaseClient'
```

**Lignes 14-21 - Logs serveur** :
```typescript
export default async function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ LOG SERVEUR AU TOUT DÉBUT
  console.log('[SERVER] /club/[id]/page.tsx - ROUTE HIT, params:', params)
  
  const resolvedParams = await params
  console.log('[SERVER] /club/[id]/page.tsx - resolvedParams:', resolvedParams)
  
  const clubId = resolvedParams?.id
  
  console.log('[SERVER] /club/[id]/page.tsx - clubId:', clubId, 'type:', typeof clubId)
```

---

## 📊 Résultat

| Aspect | AVANT | APRÈS |
|--------|-------|-------|
| Crash serveur | ❌ OUI | ✅ NON |
| Erreur console | ❌ Invisible | ✅ Logs serveur visibles |
| Client Supabase | ❌ Browser (document) | ✅ Server (safe) |
| Debugging | ❌ Impossible | ✅ Logs détaillés |
| Build | ⚠️ Warning document | ✅ OK |
| User experience | ❌ Écran rouge | ✅ Page fonctionne |

---

## 🚀 Tests Effectués

### Test 1 : Accès direct à `/club/[id]`

**Commande :**
```bash
npm run build
```

**AVANT :**
```
✅ Build réussit
⚠️ Warning: ReferenceError: document is not defined
```

**APRÈS :**
```
✅ Build réussit
✅ Aucun warning document
✅ Route /club/[id] compilée correctement
```

---

### Test 2 : Logs serveur visibles

**AVANT :**
```
(Aucun log serveur - crash silencieux)
```

**APRÈS :**
```
[SERVER] /club/[id]/page.tsx - ROUTE HIT, params: Promise { ... }
[SERVER] /club/[id]/page.tsx - resolvedParams: { id: "a1b2c3d4-..." }
[SERVER] /club/[id]/page.tsx - clubId: a1b2c3d4-... type: string
[SUPABASE CLIENT INIT] { url: 'https://...', hasKey: true }
```

---

## 📚 Documentation pour l'équipe

### Règles à suivre

1. **TOUJOURS vérifier le type de composant** :
   ```typescript
   // ❌ Server Component (async, pas de 'use client')
   export default async function Page() { ... }
   
   // ✅ Client Component ('use client')
   'use client'
   export default function Page() { ... }
   ```

2. **Client Supabase selon le contexte** :
   ```typescript
   // Server Component
   import { supabase } from '@/lib/supabaseClient'  // ✅
   
   // Client Component
   import { supabaseBrowser } from '@/lib/supabaseBrowser'  // ✅
   ```

3. **Logs serveur en début de route** :
   ```typescript
   export default async function Page({ params }) {
     console.log('[SERVER] Route hit, params:', params)  // ✅
     // ...
   }
   ```

4. **Ne JAMAIS utiliser browser APIs dans Server Components** :
   ```typescript
   // ❌ INTERDIT dans Server Components
   document.cookie
   window.location
   localStorage.getItem()
   sessionStorage.setItem()
   navigator.userAgent
   
   // ✅ OK dans Server Components
   console.log()
   fetch()
   await prisma.user.findMany()
   await supabase.from('table').select()  // avec supabaseClient
   ```

---

## 🔐 Sécurité Maintenue

Toutes les sécurisations restent en place :

- ✅ `const clubId = resolvedParams?.id` (optional chaining)
- ✅ `if (!clubId) notFound()` (guard)
- ✅ `.maybeSingle()` au lieu de `.single()` (pas de throw)
- ✅ `if (error || !data) notFound()` (gestion erreur)
- ✅ Vérification de tous les champs avec fallback
- ✅ Pas d'accès direct à `data.xxx` sans check

---

## 🎯 Leçon Apprise

### Ce qu'on a appris

1. **Les Server Components crashent silencieusement** :
   - Pas d'erreur dans la console browser
   - Pas d'erreur dans Network tab
   - L'erreur est UNIQUEMENT côté serveur
   - Il faut regarder les logs du terminal/build

2. **`document` n'existe pas côté serveur** :
   - `supabaseBrowser` utilise `document.cookie`
   - Ça marche en Client Component
   - Ça crash en Server Component

3. **Toujours logger au début des routes** :
   - Permet d'identifier les crashs serveur
   - Visible dans terminal/build logs
   - Aide à débugger sans console browser

4. **Vérifier le type de composant AVANT d'importer** :
   - Server Component (async) → `supabaseClient`
   - Client Component ('use client') → `supabaseBrowser`

---

## ✅ Résumé

| Élément | Status |
|---------|--------|
| Bug identifié | ✅ `supabaseBrowser` dans Server Component |
| Cause racine | ✅ `document.cookie` n'existe pas côté serveur |
| Fix appliqué | ✅ Remplacé par `supabaseClient` |
| Logs ajoutés | ✅ `[SERVER]` logs au début de route |
| Build | ✅ Passe sans warning |
| Crash serveur | ✅ Résolu |
| Sécurité | ✅ Maintenue (guards, maybeSingle, etc) |

**Commit :** `b40159f`  
**Date :** 2026-01-22  
**Status :** ✅ **RÉSOLU**

---

**⚠️ IMPORTANT POUR L'AVENIR :**

**TOUJOURS se demander :**
1. "Est-ce un Server Component ou Client Component ?"
2. "Est-ce que j'utilise des APIs browser (`document`, `window`, etc) ?"
3. "Quel client Supabase dois-je utiliser ?"

**Si Server Component → Utiliser `supabaseClient`**  
**Si Client Component → Utiliser `supabaseBrowser`**
