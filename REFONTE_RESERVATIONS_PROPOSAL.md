# Proposition de refonte - Page "Mes réservations"

**Date:** 2026-01-22  
**Objectif:** Aligner l'UI/UX de la page réservations avec le style des autres pages (Clubs, Tournois)

---

## 🎨 STYLE ACTUEL vs PROPOSÉ

### Actuellement ❌
- Style inline basique (padding, background, border)
- Pas de design system cohérent
- Liste HTML simple avec `<li>`
- Boutons sans style unifié
- Pas de filtres ni recherche
- Pas d'état vide designé

### Proposé ✅
- Classes Tailwind cohérentes
- Cards modernes avec shadow et hover
- Filtres par statut (À venir / Passées / Annulées)
- Recherche par club
- Badges de statut visuels
- Empty states élégants
- Responsive mobile

---

## 📐 STRUCTURE PROPOSÉE

```
┌─────────────────────────────────────────────────────┐
│  Header                                             │
│  ├─ Titre: "Mes réservations" (text-4xl font-black)│
│  └─ Description: "X réservations" (text-xl gray)   │
├─────────────────────────────────────────────────────┤
│  Filtres (bg-gray-50 rounded-xl p-6)               │
│  ├─ Toutes                                          │
│  ├─ À venir (confirmed + date future)              │
│  ├─ Passées (confirmed + date passée)              │
│  └─ Annulées (cancelled)                           │
├─────────────────────────────────────────────────────┤
│  Recherche (SmartSearchBar)                        │
│  └─ "Rechercher un club ou une date"               │
├─────────────────────────────────────────────────────┤
│  Cards Réservations (grid)                         │
│  ┌───────────────────────────────────────┐         │
│  │ Card 1                                │         │
│  │ ├─ Image club (left)                 │         │
│  │ ├─ Infos (center)                    │         │
│  │ │  ├─ Nom club                       │         │
│  │ │  ├─ Date & heure                   │         │
│  │ │  ├─ Durée (90 min)                 │         │
│  │ │  └─ Badge statut                   │         │
│  │ └─ Actions (right)                   │         │
│  │    └─ Bouton Annuler / Voir détails  │         │
│  └───────────────────────────────────────┘         │
│                                                     │
│  [Cards 2, 3, 4...]                                 │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 COMPOSANTS VISUELS

### 1. Header
```tsx
<div className="px-4 md:px-6 py-4 md:py-8">
  <div className="mb-6 md:mb-8">
    <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
      Mes réservations
    </h1>
    <p className="text-xl text-gray-600">
      {bookings.length} réservation{bookings.length !== 1 ? 's' : ''}
    </p>
  </div>
</div>
```

### 2. Filtres (style identique à Clubs/Tournois)
```tsx
<div className="mb-6 md:mb-8 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-6">
  <h3 className="text-sm font-bold text-gray-900 mb-3">Filtrer par statut</h3>
  <div className="flex gap-2 overflow-x-auto pb-1">
    <button className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm">
      Toutes
    </button>
    <button className="...">À venir</button>
    <button className="...">Passées</button>
    <button className="...">Annulées</button>
  </div>
</div>
```

### 3. Cards Réservations (style Clubs/Tournois)
```tsx
<div className="group flex flex-col md:flex-row gap-3 md:gap-6 bg-white border border-gray-200 rounded-2xl md:rounded-3xl p-3 md:p-5 hover:shadow-xl transition-all">
  {/* Image club */}
  <div className="w-full md:w-64 h-48 md:h-44 rounded-xl md:rounded-2xl overflow-hidden">
    <img src={clubImage} className="w-full h-full object-cover" />
  </div>
  
  {/* Infos */}
  <div className="flex-1 flex flex-col gap-3">
    <div>
      <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-1 line-clamp-1">
        {clubName}
      </h3>
      <p className="text-sm text-gray-600 line-clamp-1">{clubCity}</p>
    </div>
    
    {/* Date & heure */}
    <div className="flex items-center gap-2 text-gray-700">
      <svg className="w-5 h-5" />
      <span className="font-semibold">
        {dayjs(slotStart).format('DD MMM YYYY • HH:mm')}
      </span>
    </div>
    
    {/* Durée */}
    <div className="flex items-center gap-2 text-gray-600">
      <svg className="w-5 h-5" />
      <span>Durée : 1h30</span>
    </div>
    
    {/* Badge statut */}
    <div>
      {status === 'confirmed' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
          ✅ Confirmée
        </span>
      )}
      {status === 'cancelled' && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
          ❌ Annulée
        </span>
      )}
    </div>
  </div>
  
  {/* Actions */}
  <div className="flex md:flex-col gap-2">
    {status === 'confirmed' && (
      <button className="w-full md:w-auto px-5 py-3 md:px-6 md:py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-500 transition-all">
        Annuler
      </button>
    )}
    <button className="w-full md:w-auto px-5 py-3 md:px-6 md:py-2.5 bg-gray-100 text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-all">
      Détails
    </button>
  </div>
</div>
```

### 4. Empty State (élégant)
```tsx
<div className="text-center py-16 px-6">
  <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
    <svg className="w-12 h-12 text-gray-400" />
  </div>
  <h3 className="text-2xl font-black text-gray-900 mb-3">
    Aucune réservation
  </h3>
  <p className="text-gray-600 mb-6">
    Vous n'avez pas encore de réservation
  </p>
  <Link href="/player/clubs">
    <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 transition-all">
      Réserver un terrain
    </button>
  </Link>
</div>
```

---

## 🎨 BADGES DE STATUT

### Statut "Confirmée" (vert)
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-semibold">
  ✅ Confirmée
</span>
```

### Statut "Annulée" (rouge)
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-semibold">
  ❌ Annulée
</span>
```

### Statut "Passée" (gris)
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold">
  ⏱️ Passée
</span>
```

### Statut "À venir" (bleu)
```tsx
<span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
  📅 À venir
</span>
```

---

## 📱 RESPONSIVE

### Mobile (< 768px)
- Cards en colonne verticale
- Image pleine largeur en haut
- Boutons pleine largeur empilés
- Filtres avec scroll horizontal
- Padding réduit (p-3)

### Desktop (≥ 768px)
- Cards en ligne horizontale
- Image fixe à gauche (w-64)
- Boutons à droite (colonne)
- Filtres visibles tous
- Padding normal (p-5)

---

## 🔄 FILTRES INTERACTIFS

### États des filtres
```tsx
const [selectedFilter, setSelectedFilter] = useState<'tous' | 'a-venir' | 'passees' | 'annulees'>('tous')

// Logique de filtrage
const filteredBookings = useMemo(() => {
  let filtered = bookings
  
  // Par statut
  if (selectedFilter === 'a-venir') {
    filtered = filtered.filter(b => 
      b.status === 'confirmed' && new Date(b.slot_start) > new Date()
    )
  } else if (selectedFilter === 'passees') {
    filtered = filtered.filter(b => 
      b.status === 'confirmed' && new Date(b.slot_start) < new Date()
    )
  } else if (selectedFilter === 'annulees') {
    filtered = filtered.filter(b => b.status === 'cancelled')
  }
  
  // Par recherche
  if (searchTerm) {
    filtered = filtered.filter(b =>
      b.clubName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }
  
  return filtered
}, [bookings, selectedFilter, searchTerm])
```

---

## 🎯 DONNÉES ENRICHIES

Pour afficher correctement les cards, il faut enrichir les données :

```tsx
type EnrichedBooking = Booking & {
  clubName?: string
  clubCity?: string
  clubImage?: string
  courtName?: string
}

// Charger les infos club
const enrichBookings = async (bookings: Booking[]) => {
  const enriched = await Promise.all(
    bookings.map(async (booking) => {
      // Récupérer le court
      const { data: court } = await supabase
        .from('courts')
        .select('name, club_id')
        .eq('id', booking.court_id)
        .single()
      
      if (!court) return { ...booking }
      
      // Récupérer le club
      const { data: club } = await supabase
        .from('clubs')
        .select('name, city')
        .eq('id', court.club_id)
        .single()
      
      return {
        ...booking,
        clubName: club?.name,
        clubCity: club?.city,
        clubImage: getClubImage(court.club_id),
        courtName: court?.name
      }
    })
  )
  
  return enriched
}
```

---

## 🚀 AMÉLIORATIONS UX

### 1. Loading state élégant
```tsx
{loading && (
  <div className="grid gap-5">
    {[1, 2, 3].map(i => (
      <div key={i} className="bg-white border border-gray-200 rounded-3xl p-5 animate-pulse">
        <div className="flex gap-6">
          <div className="w-64 h-44 bg-gray-200 rounded-2xl" />
          <div className="flex-1 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      </div>
    ))}
  </div>
)}
```

### 2. Confirmation modale (au lieu d'alert)
```tsx
<Modal>
  <div className="text-center">
    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
      <svg className="w-8 h-8 text-red-600" />
    </div>
    <h3 className="text-xl font-black text-gray-900 mb-2">
      Annuler la réservation ?
    </h3>
    <p className="text-gray-600 mb-6">
      Cette action est irréversible
    </p>
    <div className="flex gap-3">
      <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 font-bold rounded-xl">
        Retour
      </button>
      <button className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl">
        Confirmer
      </button>
    </div>
  </div>
</Modal>
```

### 3. Toast de succès (au lieu d'alert)
```tsx
<Toast success>
  ✅ Réservation annulée avec succès
</Toast>
```

---

## 📊 COMPARAISON

| Aspect | Actuel | Proposé |
|--------|--------|---------|
| **Style** | Inline CSS | Tailwind cohérent |
| **Cards** | `<li>` basique | Cards modernes avec hover |
| **Filtres** | ❌ Aucun | ✅ Par statut |
| **Recherche** | ❌ Aucune | ✅ Par club |
| **Images** | ❌ Aucune | ✅ Photos clubs |
| **Responsive** | ⚠️ Basique | ✅ Mobile-first |
| **Empty state** | ⚠️ Texte simple | ✅ Illustré + CTA |
| **Modales** | ❌ alert() | ✅ Modales élégantes |
| **Loading** | ⚠️ Texte | ✅ Skeleton |
| **Badges** | ⚠️ Inline style | ✅ Composants |

---

## ✅ CHECKLIST D'IMPLÉMENTATION

### Phase 1 : Structure
- [ ] Créer le header avec titre/description
- [ ] Ajouter les filtres (Toutes/À venir/Passées/Annulées)
- [ ] Intégrer SmartSearchBar
- [ ] Remplacer `<li>` par cards Tailwind

### Phase 2 : Enrichissement données
- [ ] Ajouter requête pour récupérer infos club
- [ ] Ajouter requête pour récupérer infos court
- [ ] Mapper images clubs avec getClubImage()
- [ ] Calculer si réservation à venir/passée

### Phase 3 : Interactions
- [ ] Implémenter filtres interactifs
- [ ] Implémenter recherche
- [ ] Remplacer confirm() par modale
- [ ] Remplacer alert() par toast
- [ ] Ajouter loading skeleton

### Phase 4 : Polish
- [ ] Empty states élégants
- [ ] Responsive mobile
- [ ] Hover effects
- [ ] Transitions fluides
- [ ] Tests multi-devices

---

## 🎨 PALETTE DE COULEURS (cohérente)

```scss
// Statuts
$confirmed: #16a34a (green-600)
$cancelled: #dc2626 (red-600)
$passed: #6b7280 (gray-500)
$upcoming: #2563eb (blue-600)

// UI
$background: #f9fafb (gray-50)
$card: #ffffff (white)
$border: #e5e7eb (gray-200)
$text-primary: #111827 (gray-900)
$text-secondary: #6b7280 (gray-600)

// Actions
$primary: #2563eb (blue-600)
$danger: #dc2626 (red-600)
$hover: #1d4ed8 (blue-700)
```

---

## 🚀 RÉSULTAT ATTENDU

**Une page "Mes réservations" qui :**
- ✅ S'intègre parfaitement au design existant
- ✅ Offre une navigation intuitive avec filtres
- ✅ Présente les infos de manière visuelle et claire
- ✅ Est responsive et agréable sur mobile
- ✅ Utilise des interactions modernes (modales, toasts)
- ✅ Donne envie de naviguer et réserver

**Cohérence avec Clubs et Tournois :**
- Même header style
- Mêmes filtres style
- Mêmes cards style
- Même SmartSearchBar
- Même responsive breakpoints
- Même palette couleurs

---

**Cette refonte transformerait complètement l'expérience utilisateur de la page Réservations ! 🎉**
