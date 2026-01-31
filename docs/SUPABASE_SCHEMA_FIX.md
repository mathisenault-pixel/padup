# 🔧 Fix Supabase Schema Cache

Date : 2026-01-22

---

## ❌ Problème

**Erreur** : `"Could not find the table 'public.reservations' in the schema cache"`

**Cause** : L'API Supabase ne trouvait pas la table car le schéma `public` n'était pas explicitement spécifié.

---

## ✅ Solution Appliquée

### 1. Force le schéma `public` explicitement

**Avant** :
```typescript
.from("reservations")
// ou
.from("réservations")
```

**Après** :
```typescript
.from("public.reservations")
```

### 2. Logs détaillés ajoutés

**Console logs en cas d'erreur** :
- Message d'erreur complet
- Code d'erreur Supabase
- Détails et hints
- Contexte (body de la requête, paramètres)

**Console logs en cas de succès** :
- Confirmation de l'opération
- Nombre de résultats
- Données retournées

### 3. Affichage des erreurs côté UI

**Avant** : Message générique
```typescript
setMsg(`Erreur load: ${error.message}`)
```

**Après** : Message détaillé avec code
```typescript
setMsg(`❌ Erreur Supabase: ${error.message} (code: ${error.code || 'N/A'})`)
```

---

## 📁 Fichiers Modifiés

### 1. `app/(public)/availability/page.tsx`

**Changements** :
- ✅ `.from("public.reservations")` au lieu de `.from("réservations")`
- ✅ `console.error()` avec détails complets si erreur Supabase
- ✅ `console.log()` avec données si succès
- ✅ Message UI avec code d'erreur

**Fonction `loadBooked()` :**
```typescript
// Logs détaillés en cas d'erreur
console.error("[SUPABASE ERROR - loadBooked]", {
  message: error.message,
  details: error.details,
  hint: error.hint,
  code: error.code,
});

// Logs en cas de succès
console.log("[SUPABASE SUCCESS - loadBooked]", {
  count: data?.length || 0,
  data: data,
});
```

**Fonction `bookSlot()` :**
```typescript
// Logs détaillés erreur API
console.error("[API ERROR - POST /api/bookings]", {
  status: res.status,
  statusText: res.statusText,
  body: j,
});

// Message UI avec code d'erreur
const errorCode = j?.error?.code || '';
setMsg(`❌ Erreur réservation: ${errorMsg}${errorCode ? ` (code: ${errorCode})` : ''}`);
```

### 2. `app/api/bookings/route.ts`

**Changements** :
- ✅ `.from("public.reservations")` au lieu de `.from("réservations")`
- ✅ `console.error()` avec contexte complet si erreur
- ✅ `console.log()` si insertion réussie
- ✅ Retour JSON détaillé avec tous les champs d'erreur

**Logs ajoutés :**
```typescript
// Erreur détaillée
console.error("[SUPABASE ERROR - POST /api/bookings]", {
  message: error.message,
  details: error.details,
  hint: error.hint,
  code: error.code,
  body: { clubId, courtId, slotStart, slotEnd, createdBy },
});

// Succès
console.log("[SUPABASE SUCCESS - POST /api/bookings]", {
  slotStart,
  slotEnd,
});
```

**Retour API enrichi :**
```typescript
return NextResponse.json(
  { 
    error: {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    }
  }, 
  { status: 500 }
);
```

---

## 🧪 Tests

### Redémarrer le serveur
```bash
npm run dev
```

### Ouvrir la console navigateur
```
http://localhost:3000/availability
```

### Scénarios de test

#### ✅ Succès - Chargement des réservations
**Console attendue** :
```
[SUPABASE SUCCESS - loadBooked] { count: 1, data: [...] }
```

**UI** : Les créneaux occupés apparaissent grisés "Occupé"

#### ❌ Erreur - Table introuvable
**Console attendue** :
```
[SUPABASE ERROR - loadBooked] {
  message: "Could not find the table...",
  code: "PGRST...",
  details: "...",
  hint: "..."
}
```

**UI** : Message rouge avec code d'erreur affiché

#### ✅ Succès - Réservation d'un créneau
**Console attendue** :
```
[SUPABASE SUCCESS - POST /api/bookings] {
  slotStart: "2026-01-28T17:00:00.000Z",
  slotEnd: "2026-01-28T17:30:00.000Z"
}
```

**UI** : "Réservation OK ✅"

#### ❌ Erreur - Créneau déjà réservé (409)
**UI** : "Trop tard : quelqu'un vient de réserver ce créneau."

#### ❌ Erreur - Erreur Supabase (500)
**Console attendue** :
```
[API ERROR - POST /api/bookings] {
  status: 500,
  statusText: "Internal Server Error",
  body: { error: { message: "...", code: "..." } }
}
```

**UI** : "❌ Erreur réservation: [message] (code: [code])"

---

## 🎯 Résultat Attendu

### Si table existe et est accessible
- ✅ Les créneaux réservés apparaissent "Occupé"
- ✅ Créneau 17:00-17:30 bloqué si existant en base
- ✅ Logs de succès dans console

### Si erreur Supabase
- ✅ Message d'erreur détaillé dans UI
- ✅ Logs complets dans console (navigateur + serveur)
- ✅ Code d'erreur affiché
- ✅ **PAS de fallback silencieux sur "Libre"**

---

## 🔍 Debugging

### Vérifier les logs serveur
```bash
# Terminal où tourne npm run dev
# Chercher :
[SUPABASE ERROR - ...]
[SUPABASE SUCCESS - ...]
```

### Vérifier les logs navigateur
```javascript
// Console DevTools
// Chercher :
[SUPABASE ERROR - loadBooked]
[API ERROR - POST /api/bookings]
[SUPABASE SUCCESS - ...]
```

### Si erreur persiste

1. **Vérifier la table existe** :
```sql
SELECT * FROM public.reservations LIMIT 1;
```

2. **Vérifier RLS** :
```sql
SELECT * FROM pg_policies WHERE tablename = 'reservations';
```

3. **Vérifier credentials** :
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## ✅ Checklist

- [x] Schéma `public` forcé explicitement
- [x] Logs d'erreur détaillés (console serveur)
- [x] Logs d'erreur détaillés (console navigateur)
- [x] Messages UI clairs avec codes d'erreur
- [x] Pas de fallback silencieux
- [x] Build OK (0 erreurs)

---

**Status** : ✅ Correction appliquée  
**Build** : ✅ OK  
**À tester** : Redémarrer serveur et vérifier console
