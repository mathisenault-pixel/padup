# ✅ Fix: Authentification Supabase - getUser() retourne null

## Problème

**Symptôme:**
```
Alert: "Erreur lors de la récupération de l'utilisateur. Veuillez vous reconnecter."
```

**Cause racine:** 
Le client Supabase utilisé dans `lib/supabaseClient.ts` était configuré avec:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: "public" },
  auth: {
    persistSession: false,  // ❌ PROBLÈME!
    autoRefreshToken: false, // ❌ PROBLÈME!
  },
})
```

**Conséquences:**
- La session n'est pas persistée dans localStorage
- Les tokens ne sont pas auto-rafraîchis
- `supabase.auth.getUser()` retourne toujours `user: null`
- Impossible de faire des opérations nécessitant l'authentification (ex: réserver un créneau)

---

## Solution appliquée

### 1. Créer un vrai client browser avec `@supabase/ssr`

**Nouveau fichier:** `lib/supabaseBrowser.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

/**
 * Client Supabase pour composants client ('use client')
 * Utilise @supabase/ssr avec createBrowserClient pour:
 * - Persister la session dans localStorage
 * - Auto-refresh des tokens
 * - Gestion correcte de l'auth côté client
 */
export const supabaseBrowser = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
)

export default supabaseBrowser
```

**Différences clés:**

| Ancien client | Nouveau client |
|--------------|----------------|
| `@supabase/supabase-js` | `@supabase/ssr` |
| `createClient()` | `createBrowserClient()` |
| `persistSession: false` | `persistSession: true` (par défaut) |
| `autoRefreshToken: false` | `autoRefreshToken: true` (par défaut) |
| Session perdue au refresh | Session persistée dans localStorage |

---

### 2. Utiliser le client browser dans les composants client

**Fichier:** `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`

**AVANT:**
```typescript
import { supabase } from '@/lib/supabaseClient'
```

**APRÈS:**
```typescript
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
```

---

### 3. Ajouter des logs détaillés pour diagnostiquer

**Logs ajoutés:**

```typescript
// ✅ LOG DÉTAILLÉ: getUser() + getSession()
const getUserResult = await supabase.auth.getUser()
console.log('[AUTH getUser] Full response:', getUserResult)
console.log('[AUTH getUser] User:', getUserResult.data?.user)
console.log('[AUTH getUser] Error:', getUserResult.error)

const getSessionResult = await supabase.auth.getSession()
console.log('[AUTH getSession] Full response:', getSessionResult)
console.log('[AUTH getSession] Session:', getSessionResult.data?.session)
console.log('[AUTH getSession] Error:', getSessionResult.error)
```

**Logs attendus quand connecté:**

```
[AUTH getUser] Full response: { data: { user: {...} }, error: null }
[AUTH getUser] User: {
  id: "uuid...",
  email: "user@example.com",
  ...
}
[AUTH getUser] Error: null

[AUTH getSession] Full response: { data: { session: {...} }, error: null }
[AUTH getSession] Session: {
  access_token: "...",
  refresh_token: "...",
  user: {...}
}
[AUTH getSession] Error: null
```

**Logs attendus quand NON connecté:**

```
[AUTH getUser] Full response: { data: { user: null }, error: null }
[AUTH getUser] User: null
[AUTH getUser] Error: null

[AUTH getSession] Full response: { data: { session: null }, error: null }
[AUTH getSession] Session: null
[AUTH getSession] Error: null
```

---

### 4. Rediriger vers login au lieu d'un simple alert

**AVANT:**
```typescript
if (!user) {
  console.error('[RESERVE] ❌ CRITICAL: No user logged in')
  alert('Vous devez être connecté pour réserver. Veuillez vous connecter.')
  setIsSubmitting(false)
  return  // ❌ Utilisateur bloqué sur la page
}
```

**APRÈS:**
```typescript
if (!user) {
  console.error('[RESERVE] ❌ CRITICAL: No user logged in (user is null)')
  console.error('[RESERVE] ❌ Not authenticated - redirecting to login')
  alert('Vous devez être connecté pour réserver. Redirection vers login...')
  setIsSubmitting(false)
  router.push('/player/login')  // ✅ Redirection automatique
  return
}
```

**Même chose pour les erreurs:**
```typescript
if (userErr) {
  console.error('[RESERVE] ❌ CRITICAL: Error fetching user:', userErr)
  console.error('[RESERVE] ❌ User error details:', JSON.stringify(userErr, null, 2))
  alert('Erreur lors de la récupération de l\'utilisateur. Redirection vers login...')
  setIsSubmitting(false)
  router.push('/player/login')  // ✅ Redirection automatique
  return
}
```

---

## Architecture Supabase pour Next.js App Router

### Clients recommandés

| Contexte | Client à utiliser | Package |
|----------|------------------|---------|
| **Composants client** (`'use client'`) | `supabaseBrowser` | `@supabase/ssr` + `createBrowserClient` |
| **Server Components** | `supabaseServer` | `@supabase/ssr` + `createServerClient` |
| **Route Handlers (API)** | `supabaseServer` | `@supabase/ssr` + `createServerClient` |
| **Middleware** | `supabaseMiddleware` | `@supabase/ssr` + `createServerClient` |

### Pourquoi `@supabase/ssr` ?

`@supabase/ssr` est spécialement conçu pour Next.js App Router et gère automatiquement:

1. **Persistance de session:**
   - Browser: utilise `localStorage`
   - Server: utilise les cookies

2. **Auto-refresh des tokens:**
   - Rafraîchit automatiquement les tokens expirés
   - Maintient l'utilisateur connecté

3. **Synchronisation browser/server:**
   - Session partagée entre client et server
   - Pas de désynchronisation

4. **Sécurité:**
   - Cookies `httpOnly` pour le server
   - PKCE flow pour OAuth

---

## Fichiers modifiés

### Fichiers créés

1. **`lib/supabaseBrowser.ts`** (nouveau)
   - Client Supabase pour composants client
   - Utilise `@supabase/ssr` + `createBrowserClient`
   - Persiste la session automatiquement

### Fichiers modifiés

2. **`app/player/(authenticated)/clubs/[id]/reserver/page.tsx`**
   - Import: `supabaseBrowser` au lieu de `supabaseClient`
   - Logs détaillés: `getUser()` + `getSession()`
   - Redirection: `router.push('/player/login')` si pas d'utilisateur

### Fichiers non modifiés (intentionnel)

3. **`lib/supabaseClient.ts`** (conservé)
   - Peut être utilisé pour des opérations non-auth
   - Ou supprimé si pas utilisé ailleurs

---

## Tests de validation

### Test 1: Vérifier la persistance de session

1. **Se connecter via `/player/login`**
2. **Ouvrir la console et taper:**
   ```javascript
   localStorage.getItem('sb-eohioutmqfqdehfxgjgv-auth-token')
   ```
3. **Vérifier:** Une valeur JSON existe (session + tokens)

---

### Test 2: Vérifier getUser() avec utilisateur connecté

1. **Se connecter via `/player/login`**
2. **Aller sur `/player/clubs/ba43c579-.../reserver`**
3. **Ouvrir la console**
4. **Vérifier les logs:**
   ```
   [AUTH getUser] User: { id: "...", email: "..." }
   [AUTH getSession] Session: { access_token: "...", ... }
   [RESERVE] ✅ User authenticated: uuid...
   [RESERVE] ✅ User email: user@example.com
   ```
5. **Résultat:** Pas d'alert, pas de redirection, page fonctionne

---

### Test 3: Vérifier getUser() sans utilisateur connecté

1. **Se déconnecter (ou ouvrir en mode incognito)**
2. **Aller sur `/player/clubs/ba43c579-.../reserver`**
3. **Tenter de réserver un créneau**
4. **Vérifier les logs:**
   ```
   [AUTH getUser] User: null
   [AUTH getSession] Session: null
   [RESERVE] ❌ CRITICAL: No user logged in (user is null)
   [RESERVE] ❌ Not authenticated - redirecting to login
   ```
5. **Vérifier:** Alert puis redirection automatique vers `/player/login`

---

### Test 4: Vérifier la persistance après refresh

1. **Se connecter**
2. **Aller sur `/player/clubs/ba43c579-.../reserver`**
3. **Rafraîchir la page (F5 ou Cmd+R)**
4. **Vérifier:** Toujours connecté, pas de redirection vers login
5. **Logs attendus:**
   ```
   [AUTH getUser] User: { id: "...", email: "..." }  ✅ Toujours là!
   ```

---

### Test 5: Faire une réservation (RLS)

1. **Se connecter**
2. **Aller sur `/player/clubs/ba43c579-.../reserver`**
3. **Sélectionner un créneau et réserver**
4. **Vérifier les logs:**
   ```
   [RESERVE] ✅ User authenticated: uuid...
   [BOOKING PAYLOAD BEFORE INSERT]
   {
     ...
     "created_by": "uuid...",  ✅ ID utilisateur correct
     ...
   }
   [BOOKING INSERT] ✅✅✅ SUCCESS
   ```
5. **Résultat:** Réservation réussie, plus d'erreur RLS

---

## Checklist de validation

- [x] Nouveau fichier `lib/supabaseBrowser.ts` créé
- [x] `@supabase/ssr` + `createBrowserClient` utilisé
- [x] Import dans `reserver/page.tsx` mis à jour
- [x] Logs détaillés ajoutés (getUser + getSession)
- [x] Redirection vers `/player/login` si pas d'utilisateur
- [x] Build OK
- [ ] **À TESTER:** Session persistée dans localStorage
- [ ] **À TESTER:** getUser() retourne un user après login
- [ ] **À TESTER:** Refresh de page conserve la session
- [ ] **À TESTER:** Redirection automatique si pas connecté
- [ ] **À TESTER:** Réservation fonctionne (RLS OK)

---

## Prochaines étapes (optionnel)

### 1. Créer un hook useAuth personnalisé

```typescript
// lib/hooks/useAuth.ts
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'
import { useRouter } from 'next/navigation'

export function useAuth(redirectTo?: string) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (!user && redirectTo) {
        router.push(redirectTo)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [router, redirectTo])

  return { user, loading }
}
```

**Usage:**
```typescript
const { user, loading } = useAuth('/player/login')

if (loading) return <div>Loading...</div>
if (!user) return null // Redirection en cours
```

---

### 2. Créer un middleware pour protéger les routes

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set(name, value, options)
        },
        remove: (name, options) => {
          res.cookies.set(name, '', options)
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && req.nextUrl.pathname.startsWith('/player/(authenticated)')) {
    return NextResponse.redirect(new URL('/player/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/player/(authenticated)/:path*']
}
```

---

### 3. Nettoyer l'ancien client (optionnel)

Si `lib/supabaseClient.ts` n'est plus utilisé ailleurs:

```bash
# Chercher les usages
grep -r "from '@/lib/supabaseClient'" app/

# Si aucun usage trouvé (ou tous migrés)
rm lib/supabaseClient.ts
```

---

## Résumé des changements

| Aspect | Avant | Après |
|--------|-------|-------|
| **Package** | `@supabase/supabase-js` | `@supabase/ssr` |
| **Fonction** | `createClient()` | `createBrowserClient()` |
| **Persistance** | ❌ `persistSession: false` | ✅ `localStorage` auto |
| **Auto-refresh** | ❌ `autoRefreshToken: false` | ✅ Automatique |
| **getUser()** | ❌ Retourne toujours `null` | ✅ Retourne l'utilisateur |
| **Après refresh** | ❌ Session perdue | ✅ Session conservée |
| **Si non connecté** | ❌ Alert bloquant | ✅ Redirection `/player/login` |
| **Logs** | ❌ Basiques | ✅ Détaillés (getUser + getSession) |

---

**Date:** 2026-02-01  
**Status:** Fix appliqué, build OK, prêt pour tests  
**Note:** Vérifier que l'utilisateur est bien connecté via `/player/login` avant de tester la réservation
