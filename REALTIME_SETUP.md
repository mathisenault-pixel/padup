# ✅ Supabase Realtime - Synchronisation automatique

## Fonctionnalité implémentée

Synchronisation en temps réel des réservations entre plusieurs onglets/utilisateurs.

---

## Configuration dans `app/(public)/availability/page.tsx`

### 1. Abonnement Realtime (après ligne 141)

```typescript
// Realtime: synchronisation automatique entre onglets
useEffect(() => {
  const channel = supabase
    .channel('reservations-realtime')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'reservations',
        filter: `court_id=eq.${courtId}`
      },
      (payload) => {
        console.log('[REALTIME] Nouvelle réservation reçue:', payload.new);
        setBooked((prev) => [...prev, payload.new]);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [courtId]);
```

### 2. Suppression des appels loadBooked() redondants

**Après succès (ligne 210) :**
```typescript
// AVANT
setMsg("Réservation OK ✅");
await loadBooked();

// APRÈS ✅
setMsg("Réservation OK ✅");
// Le realtime mettra à jour automatiquement
```

**Après 409 (ligne 191) :**
```typescript
// AVANT
if (res.status === 409) {
  setMsg("Trop tard : quelqu'un vient de réserver ce créneau.");
  await loadBooked();
  return;
}

// APRÈS ✅
if (res.status === 409) {
  setMsg("Trop tard : quelqu'un vient de réserver ce créneau.");
  // Le realtime mettra à jour automatiquement
  return;
}
```

---

## Configuration Supabase

### Activer Realtime sur la table

Dans Supabase Dashboard :

1. **Database > Replication**
2. Trouver la table `reservations`
3. Activer la réplication :
   - ☑ Enable replication
   - ☑ INSERT events
   - (Optionnel) UPDATE, DELETE events

Ou via SQL :
```sql
ALTER TABLE public.reservations
REPLICA IDENTITY FULL;

-- Activer la publication Realtime
ALTER PUBLICATION supabase_realtime
ADD TABLE public.reservations;
```

---

## Fonctionnement

### Scénario 1 : Deux onglets ouverts

1. **Onglet A** : Utilisateur clique sur "10:00 - 10:30"
2. **API** : Insert dans `public.reservations`
3. **Supabase Realtime** : Broadcast INSERT à tous les abonnés
4. **Onglet B** : Reçoit l'événement via websocket
5. **Onglet B** : `setBooked([...prev, payload.new])` → "10:00 - 10:30" passe à "Occupé"

**Résultat** : Onglet B voit le changement **instantanément** sans refresh !

### Scénario 2 : Même utilisateur, un seul onglet

1. **Utilisateur** : Clique sur "10:00 - 10:30"
2. **API** : Insert dans `public.reservations`
3. **Realtime** : L'onglet reçoit sa propre réservation
4. **UI** : Le créneau passe à "Occupé"

**Résultat** : Plus besoin de `loadBooked()` après réservation !

---

## Logs attendus

### Console navigateur

**Au chargement :**
```
[QUERY START] { schema: "public", table: "reservations", ... }
[SUPABASE SUCCESS - loadBooked] { count: 2, data: [...] }
```

**Après réservation (onglet actif) :**
```
[REALTIME] Nouvelle réservation reçue: {
  identifiant: "uuid",
  court_id: "uuid",
  slot_start: "2026-01-28T10:00:00.000Z",
  fin_de_slot: "2026-01-28T10:30:00.000Z",
  statut: "confirmé"
}
```

**Autre onglet (passif) :**
```
[REALTIME] Nouvelle réservation reçue: { ... }
```

---

## Avantages

### ✅ Synchronisation instantanée
- Pas de polling
- Pas de refresh manuel
- Websockets efficaces

### ✅ Expérience utilisateur améliorée
- UI toujours à jour
- Évite les conflits de réservation
- Feedback immédiat

### ✅ Performance
- Moins de requêtes HTTP
- Pas de `loadBooked()` répété
- Charge serveur réduite

---

## Test

### 1. Ouvrir deux onglets
```
http://localhost:3000/availability (Onglet A)
http://localhost:3000/availability (Onglet B)
```

### 2. Réserver dans Onglet A
- Cliquer sur "10:00 - 10:30"
- Voir le message "Réservation OK ✅"

### 3. Vérifier Onglet B
- **Sans refresh**, le créneau "10:00 - 10:30" passe à "Occupé"
- Console : `[REALTIME] Nouvelle réservation reçue: { ... }`

### 4. Vérifier dans Supabase
```sql
SELECT * FROM public.reservations 
WHERE court_id = '6dceaf95-80dd-4fcf-b401-7d4c937f6e9e'
ORDER BY slot_start;
```

---

## Dépannage

### Aucun événement Realtime reçu

**Vérifier la réplication :**
```sql
-- Voir les tables avec réplication activée
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Résultat attendu :**
```
schemaname | tablename
-----------|------------
public     | reservations
```

**Si absent :**
```sql
ALTER PUBLICATION supabase_realtime 
ADD TABLE public.reservations;
```

### Websocket ne se connecte pas

**Vérifier dans DevTools > Network > WS :**
- URL : `wss://eohioutmqfqdehfxgjgv.supabase.co/realtime/v1/websocket`
- Status : `101 Switching Protocols`

**Si erreur 403/401 :**
- Vérifier `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Vérifier RLS policies sur la table

### Événements dupliqués

**Cause** : Plusieurs abonnements actifs

**Solution** : Vérifier que `removeChannel()` est bien appelé au démontage :
```typescript
return () => {
  supabase.removeChannel(channel);
};
```

---

## Limitations

### ⚠️ Realtime ne fonctionne que pour INSERT

L'abonnement actuel écoute uniquement les `INSERT`.

Pour écouter aussi UPDATE/DELETE :
```typescript
.on('postgres_changes', {
  event: '*',  // ← Tous les événements
  schema: 'public',
  table: 'reservations',
  filter: `court_id=eq.${courtId}`
}, (payload) => {
  if (payload.eventType === 'INSERT') {
    setBooked((prev) => [...prev, payload.new]);
  } else if (payload.eventType === 'DELETE') {
    setBooked((prev) => prev.filter(b => b.identifiant !== payload.old.identifiant));
  } else if (payload.eventType === 'UPDATE') {
    setBooked((prev) => prev.map(b => 
      b.identifiant === payload.new.identifiant ? payload.new : b
    ));
  }
});
```

### ⚠️ Filtre par date non géré

Le filtre actuel est seulement sur `court_id`.

Les réservations d'autres dates sont aussi reçues mais ne posent pas de problème car `bookedSet` est recalculé avec les bonnes dates depuis `booked`.

---

## Résumé

✅ **Realtime activé** pour la table `reservations`  
✅ **Abonnement websocket** filtré par `court_id`  
✅ **Synchronisation automatique** entre onglets  
✅ **Suppression des loadBooked()** redondants  
✅ **Performance améliorée** (moins de requêtes)  

**L'UI est maintenant synchronisée en temps réel !** 🎯
