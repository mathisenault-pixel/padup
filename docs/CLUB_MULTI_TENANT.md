# 🏢 Guide Multi-Club (Multi-tenant)

## Objectif

Toutes les données doivent être isolées par club. Chaque club ne voit et ne modifie que ses propres données.

---

## ✅ Structure de la base de données

Toutes les tables principales ont une colonne `club_id` :

- ✅ `courts` → `club_id`
- ✅ `bookings` → `club_id`
- ✅ `products` → `club_id`

---

## 📦 Helpers disponibles

Fichier : `lib/clubHelpers.ts`

### Récupération du club connecté

```typescript
import { getConnectedClub, getConnectedClubId } from '@/lib/clubHelpers'

// Récupérer tout l'objet club
const club = getConnectedClub()
console.log(club?.name) // "Padel Center Paris"

// Récupérer uniquement l'ID
const clubId = getConnectedClubId()
console.log(clubId) // "uuid-du-club"
```

### Vérification de connexion

```typescript
import { isClubConnected } from '@/lib/clubHelpers'

if (!isClubConnected()) {
  router.push('/club/login')
}
```

### Ajout automatique du club_id

```typescript
import { addClubId } from '@/lib/clubHelpers'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'

// ❌ AVANT (manuel)
const clubId = JSON.parse(localStorage.getItem('club')!).id
const { data } = await supabase
  .from('courts')
  .insert({ name: 'Terrain 1', club_id: clubId })

// ✅ APRÈS (automatique)
const courtData = addClubId({ name: 'Terrain 1' })
const { data } = await supabase
  .from('courts')
  .insert(courtData)
```

---

## 🔒 Pattern de sécurité

### 1. Création de données

**Toujours injecter le `club_id` automatiquement :**

```typescript
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { addClubId } from '@/lib/clubHelpers'

const handleCreateCourt = async () => {
  try {
    // Préparer les données
    const courtData = {
      name: 'Terrain 1',
      type: 'padel',
      is_active: true
    }

    // Ajouter automatiquement le club_id
    const dataWithClubId = addClubId(courtData)

    // Insérer dans Supabase
    const { data, error } = await supabase
      .from('courts')
      .insert(dataWithClubId)

    if (error) throw error

    console.log('✅ Terrain créé:', data)
  } catch (err) {
    console.error('❌ Erreur:', err)
  }
}
```

### 2. Lecture de données

**Toujours filtrer par `club_id` :**

```typescript
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getConnectedClubId } from '@/lib/clubHelpers'

const fetchCourts = async () => {
  const clubId = getConnectedClubId()

  if (!clubId) {
    throw new Error('Club non connecté')
  }

  // ✅ Filtrer par club_id
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('club_id', clubId)
    .eq('is_active', true)

  return data
}
```

### 3. Modification de données

**Toujours vérifier le `club_id` avant modification :**

```typescript
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getConnectedClubId } from '@/lib/clubHelpers'

const updateCourt = async (courtId: string, updates: any) => {
  const clubId = getConnectedClubId()

  if (!clubId) {
    throw new Error('Club non connecté')
  }

  // ✅ Vérifier que le terrain appartient au club
  const { data, error } = await supabase
    .from('courts')
    .update(updates)
    .eq('id', courtId)
    .eq('club_id', clubId) // 🔒 Sécurité : vérifier le club_id

  return data
}
```

### 4. Suppression de données

**Même principe : toujours filtrer par `club_id` :**

```typescript
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getConnectedClubId } from '@/lib/clubHelpers'

const deleteCourt = async (courtId: string) => {
  const clubId = getConnectedClubId()

  if (!clubId) {
    throw new Error('Club non connecté')
  }

  // ✅ Supprimer uniquement si appartient au club
  const { error } = await supabase
    .from('courts')
    .delete()
    .eq('id', courtId)
    .eq('club_id', clubId) // 🔒 Sécurité

  return !error
}
```

---

## 🎯 Exemple complet : Gestion des terrains

```typescript
'use client'

import { useState, useEffect } from 'react'
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser'
import { getConnectedClubId, addClubId } from '@/lib/clubHelpers'

export default function CourtsManager() {
  const [courts, setCourts] = useState<any[]>([])
  const [newCourtName, setNewCourtName] = useState('')

  // Récupérer les terrains du club
  useEffect(() => {
    fetchCourts()
  }, [])

  const fetchCourts = async () => {
    const clubId = getConnectedClubId()
    if (!clubId) return

    const { data } = await supabase
      .from('courts')
      .select('*')
      .eq('club_id', clubId)
      .order('created_at', { ascending: true })

    if (data) setCourts(data)
  }

  // Créer un terrain
  const handleCreateCourt = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const courtData = addClubId({
        name: newCourtName,
        type: 'padel',
        is_active: true
      })

      const { error } = await supabase
        .from('courts')
        .insert(courtData)

      if (error) throw error

      setNewCourtName('')
      fetchCourts() // Rafraîchir la liste
    } catch (err) {
      console.error('Erreur création terrain:', err)
    }
  }

  return (
    <div>
      <h2>Gestion des terrains</h2>

      {/* Formulaire création */}
      <form onSubmit={handleCreateCourt}>
        <input
          value={newCourtName}
          onChange={(e) => setNewCourtName(e.target.value)}
          placeholder="Nom du terrain"
          required
        />
        <button type="submit">Ajouter</button>
      </form>

      {/* Liste des terrains */}
      <ul>
        {courts.map((court) => (
          <li key={court.id}>{court.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

---

## ⚠️ Règles importantes

1. **Jamais de requête globale** : toujours filtrer par `club_id`
2. **Injection automatique** : utiliser `addClubId()` pour les créations
3. **Vérification systématique** : toujours utiliser `.eq('club_id', clubId)` dans les updates/deletes
4. **RLS Supabase** : En complément, les Row Level Security policies dans Supabase ajoutent une couche de sécurité supplémentaire

---

## 🔐 Prochaine étape : Row Level Security (RLS)

Une fois la logique multi-club implémentée côté frontend, on pourra ajouter des policies RLS côté Supabase pour garantir l'isolation des données au niveau de la base de données.

Cela empêchera même une requête mal formée côté client d'accéder aux données d'un autre club.
