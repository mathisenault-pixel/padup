# 📘 Guide TypeScript - Pad'Up

## 🎯 Standards de Code

### Types Supabase

Tous les types Supabase sont centralisés dans `lib/supabase/types.ts`.

**Utilisation :**
```typescript
import type { Database, UserRole, Profile } from '@/lib/supabase/types'

// Client Supabase typé
const supabase = createClient<Database>()

// Types de données
const role: UserRole = 'player' // ou 'club'
```

### Actions Serveur

Toutes les actions serveur doivent :
1. Valider les données FormData
2. Avoir un type de retour explicite
3. Gérer les erreurs proprement

**Exemple :**
```typescript
'use server'

export async function login(formData: FormData): Promise<{ error: string } | never> {
  const email = formData.get('email')
  const password = formData.get('password')

  // Validation
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Données invalides' }
  }

  // Logique...
  
  redirect('/dashboard') // never return
}
```

### Composants

**Client Components :**
```typescript
'use client'

import { useState } from 'react'

type Props = {
  title: string
  count?: number
}

export default function MyComponent({ title, count = 0 }: Props) {
  const [value, setValue] = useState<string>('')
  // ...
}
```

**Server Components :**
```typescript
import { createClient } from '@/lib/supabase/server'

type Props = {
  params: { id: string }
}

export default async function Page({ params }: Props) {
  const supabase = await createClient()
  // ...
}
```

### Types de Formulaire

Pour les select avec valeurs typées :
```typescript
type Level = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'

<select
  value={level}
  onChange={(e) => setLevel(e.target.value as Level)}
>
  <option value="Débutant">Débutant</option>
  <option value="Intermédiaire">Intermédiaire</option>
</select>
```

### Gestion des Erreurs

```typescript
try {
  const { data, error } = await supabase.from('profiles').select()
  
  if (error) {
    return { error: error.message }
  }
  
  // Utiliser data
} catch (err) {
  return { error: 'Une erreur est survenue' }
}
```

## 🚫 À Éviter

### ❌ Ne JAMAIS utiliser `any`
```typescript
// ❌ MAL
const data: any = await fetch()

// ✅ BIEN
type ApiResponse = { id: string; name: string }
const data: ApiResponse = await fetch()
```

### ❌ Ne JAMAIS utiliser `@ts-ignore`
```typescript
// ❌ MAL
// @ts-ignore
const value = dangerousOperation()

// ✅ BIEN
const value = dangerousOperation() as ExpectedType
// ou mieux : corriger le type à la source
```

### ❌ Ne JAMAIS laisser de console.log
```typescript
// ❌ MAL
console.log('Debug:', data)

// ✅ BIEN
// Utiliser un logger en production ou supprimer
```

## 🔍 Vérifications

### Avant chaque commit
```bash
# Vérifier les erreurs TypeScript
npm run build

# Vérifier le linter
npm run lint
```

### Rechercher les problèmes
```bash
# Chercher les 'any'
grep -r ": any" app/

# Chercher les console.log
grep -r "console\." app/

# Chercher les @ts-ignore
grep -r "@ts-ignore" app/
```

## 📚 Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js TypeScript](https://nextjs.org/docs/app/building-your-application/configuring/typescript)
- [Supabase TypeScript](https://supabase.com/docs/guides/api/rest/generating-types)

## ✅ Checklist Qualité

Avant de push :
- [ ] `npm run build` passe sans erreur
- [ ] Aucun `any` dans le code
- [ ] Aucun `@ts-ignore` ou `@ts-nocheck`
- [ ] Aucun `console.log` / `console.error`
- [ ] Tous les types sont explicites
- [ ] Les FormData sont validés
- [ ] Les actions serveur ont des types de retour

---

*Guide mis à jour le 17 décembre 2025*














