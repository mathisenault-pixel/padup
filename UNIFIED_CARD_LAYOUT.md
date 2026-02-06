# Organisation Unifiée des Cartes — Style Catalogue Premium

## 🎯 Objectif

Appliquer EXACTEMENT la même organisation visuelle (grille de cartes, style, proportions) aux 3 onglets principaux :
- **Clubs**
- **Mes réservations**
- **Tournois**

➡️ **Résultat** : Cohérence visuelle totale, navigation fluide, design "catalogue premium" identique partout.

---

## ✅ Structure Commune (3 Pages)

### 1️⃣ Grille Responsive

```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 md:mb-8">
    {/* Cartes ici */}
  </div>
</div>
```

**Comportement** :
- **Desktop (lg)** : 3 colonnes
- **Tablet (sm)** : 2 colonnes
- **Mobile** : 1 colonne
- **Gap** : 24px (`gap-6`) horizontal + vertical

---

### 2️⃣ Structure de Carte (IDENTIQUE pour toutes les pages)

#### Image
```tsx
<div className="relative w-full aspect-[16/9] overflow-hidden bg-slate-100">
  <img
    src={imageUrl}
    alt={title}
    className="w-full h-full object-cover object-center"
  />
</div>
```

**Specs** :
- Ratio fixe **16:9**
- `object-cover` + `object-center` : pas de déformation
- `rounded-lg` (déjà appliqué via card wrapper)

#### Bloc Contenu
```tsx
<div className="p-4 min-h-[80px]">
  {/* Ligne 1 : Petit texte gris */}
  <p className="text-xs font-normal text-slate-500 mb-1">
    Découvrez
  </p>
  
  {/* Ligne 2 : Titre principal */}
  <h3 className="text-base font-semibold text-slate-900 leading-tight mb-1">
    {nom / club / tournoi}
  </h3>
  
  {/* Ligne 3 : Sous-titre contextuel */}
  <p className="text-sm text-slate-500">
    {ville / date / infos}
  </p>
</div>
```

**Specs** :
- `p-4` : padding uniforme
- `min-h-[80px]` : hauteur minimale stable
- Texte toujours dans le même ordre : label → titre → sous-titre

---

### 3️⃣ Comportement

#### Hover
```tsx
className="group block bg-white border border-slate-200 rounded-2xl overflow-hidden 
           shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
```

**Effet** :
- Ombre plus marquée (`shadow-md`)
- Légère translation vers le haut (`-translate-y-0.5`)
- Transition fluide (`duration-200`)

#### Cliquabilité
- Toute la carte est cliquable
- **Clubs** : `<Link href="/player/clubs/${id}/reserver">`
- **Tournois** : `<Link href="/player/tournois/${id}">`
- **Réservations** : `onClick` → modal détails

---

## 📦 Composants Créés

### 1️⃣ `ClubCard.tsx` (référence)

```tsx
type ClubCardProps = {
  id: string
  name: string
  city: string
  imageUrl: string
  href: string
}
```

**Utilisation** :
```tsx
<ClubCard
  id={club.id}
  name={club.name}
  city={club.city}
  imageUrl={club.image}
  href={`/player/clubs/${club.id}/reserver`}
/>
```

---

### 2️⃣ `ReservationCard.tsx`

```tsx
type ReservationCardProps = {
  id: string
  clubName: string
  clubCity: string
  date: string
  timeSlot: string
  imageUrl: string
  href: string
  onClick?: () => void
}
```

**Utilisation** :
```tsx
<ReservationCard
  id={booking.id}
  clubName={booking.clubName}
  clubCity={booking.clubCity}
  date={formatDate(booking.slot_start)}
  timeSlot={`${formatTime(booking.slot_start)} - ${formatTime(booking.slot_end)}`}
  imageUrl={booking.clubImage || '/images/clubs/default.jpg'}
  href="#"
  onClick={() => handleBookingClick(booking)}
/>
```

---

### 3️⃣ `TournoiCard.tsx`

```tsx
type TournoiCardProps = {
  id: number
  nom: string
  club: string
  date: string
  categorie: string
  imageUrl: string
  href?: string
  onClick?: () => void
}
```

**Utilisation** :
```tsx
<TournoiCard
  id={tournoi.id}
  nom={tournoi.nom}
  club={tournoi.club}
  date={dateFormatted}
  categorie={tournoi.categorie}
  imageUrl={tournoi.image}
  href={`/player/tournois/${tournoi.id}`}
/>
```

---

## 🔧 Modifications Appliquées

### Page **Mes réservations** (`reservations/page.tsx`)

**Avant** :
```tsx
<div className="grid gap-5 mb-16 md:mb-8">
  {/* Cartes complexes flex-row avec beaucoup d'infos */}
</div>
```

**Après** :
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 md:mb-8">
    {filteredEvents.map(event => (
      event.eventType === 'tournament' 
        ? <TournoiCard {...} />
        : <ReservationCard {...} />
    ))}
  </div>
</div>
```

**Changements** :
- ✅ Grille 3/2/1 colonnes
- ✅ Cartes compactes, design identique à Clubs
- ✅ `ReservationCard` + `TournoiCard`
- ❌ Plus de grandes cartes flex-row avec badges/prix/détails (détails → modal au clic)

---

### Page **Tournois** (`tournois/page.tsx`)

**Avant** :
```tsx
<div className="space-y-3 md:space-y-4 mb-16 md:mb-8">
  {/* Grandes cartes flex-row avec image gauche + contenu + barres de remplissage */}
</div>
```

**Après** :
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 md:mb-8">
    {filteredTournois.map(tournoi => (
      <TournoiCard {...} />
    ))}
  </div>
</div>
```

**Changements** :
- ✅ Grille 3/2/1 colonnes
- ✅ `TournoiCard` compact, design identique à Clubs
- ✅ Navigation vers `/player/tournois/${id}` (page détails)
- ❌ Plus de cartes horizontales avec prix/équipes/barres de remplissage (détails → page dédiée)

---

### Page **Clubs** (`clubs/page.tsx`)

**Statut** : ✅ **RÉFÉRENCE** (déjà conforme)

Structure existante :
```tsx
<div className="max-w-7xl mx-auto px-4 md:px-6">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {filteredClubs.map(club => <ClubCard {...} />)}
  </div>
</div>
```

➡️ Aucune modification nécessaire.

---

## 🎨 Design Tokens (Palette Noir/Gris/Blanc)

### Cartes
- **Background** : `bg-white`
- **Border** : `border-slate-200`
- **Shadow** : `shadow-sm` (repos) → `shadow-md` (hover)
- **Rounded** : `rounded-2xl`

### Texte
- **Label** ("Découvrez") : `text-xs text-slate-500`
- **Titre** (nom) : `text-base font-semibold text-slate-900`
- **Sous-titre** (ville/date) : `text-sm text-slate-500`

### Image
- **Background fallback** : `bg-slate-100`
- **Ratio** : `aspect-[16/9]`

---

## 📱 Responsive

### Mobile (< 640px)
- **1 colonne**
- Cartes pleine largeur
- Padding réduit (`px-4`)

### Tablet (640px - 1024px)
- **2 colonnes**
- Gap 24px

### Desktop (> 1024px)
- **3 colonnes**
- Container `max-w-7xl`
- Padding `px-6`

---

## ❌ Ce qui a été supprimé (volontairement)

### Réservations
- ❌ Grandes cartes flex-row avec image gauche + infos détaillées
- ❌ Boutons "Voir partie" / "Voir tournoi" intégrés dans les cartes
- ➡️ **Raison** : détails visibles dans la **modal** au clic

### Tournois
- ❌ Grandes cartes flex-row avec prix + équipes + barre de remplissage
- ❌ Badges "Complet" / "Inscrit" overlays
- ➡️ **Raison** : détails visibles sur la **page dédiée** `/player/tournois/${id}`

---

## ✅ Résultat Final

### Expérience Utilisateur
➡️ Quand on navigue entre **Clubs**, **Mes réservations**, **Tournois** :
- ✅ Même grille
- ✅ Même type de cartes
- ✅ Même hover
- ✅ Même responsive

➡️ **Impression** : une seule page, seul le **contenu** change.

### Design
- ✅ Clean
- ✅ Premium (Planity-style)
- ✅ Cohérent
- ✅ Scalable

---

## 🔗 Fichiers Modifiés

### Composants créés/modifiés
```
app/player/(authenticated)/components/
├── ClubCard.tsx           (référence, déjà existant)
├── ReservationCard.tsx    (nouveau)
└── TournoiCard.tsx        (nouveau)
```

### Pages modifiées
```
app/player/(authenticated)/
├── clubs/page.tsx         (référence, inchangé)
├── reservations/page.tsx  (grille + ReservationCard + TournoiCard)
└── tournois/page.tsx      (grille + TournoiCard)
```

### Documentation
```
UNIFIED_CARD_LAYOUT.md     (ce fichier)
```

---

## 🚀 Usage

### Clubs (existant)
```tsx
<ClubCard
  id={club.id}
  name={club.name}
  city={club.city}
  imageUrl={club.image}
  href={`/player/clubs/${club.id}/reserver`}
/>
```

### Réservations (nouveau)
```tsx
// Pour une partie
<ReservationCard
  id={booking.id}
  clubName={booking.clubName}
  clubCity={booking.clubCity}
  date={formatDate(booking.slot_start)}
  timeSlot={`${formatTime(booking.slot_start)} - ${formatTime(booking.slot_end)}`}
  imageUrl={booking.clubImage || '/images/clubs/default.jpg'}
  href="#"
  onClick={() => handleBookingClick(booking)}
/>

// Pour un tournoi dans réservations
<TournoiCard
  id={tournament.id}
  nom={tournament.nom}
  club={tournament.club}
  date={formatDate(tournament.date)}
  categorie={tournament.categorie}
  imageUrl={tournament.image}
  onClick={() => handleTournamentClick(tournament)}
/>
```

### Tournois (nouveau)
```tsx
<TournoiCard
  id={tournoi.id}
  nom={tournoi.nom}
  club={tournoi.club}
  date={dateFormatted}
  categorie={tournoi.categorie}
  imageUrl={tournoi.image}
  href={`/player/tournois/${tournoi.id}`}
/>
```

---

## ⚠️ Important

### Contraintes respectées
- ✅ Zéro bleu dans la palette
- ✅ Pas de modification du contenu métier
- ✅ Pas de changement de logique (filtres, recherche, états)
- ✅ UNIQUEMENT UI/layout

### Tests recommandés
- ✅ Responsive (mobile/tablet/desktop)
- ✅ Hover sur toutes les cartes
- ✅ Clics → navigation correcte
- ✅ Images aspect ratio correct (pas d'étirement)
- ✅ Cohérence visuelle entre les 3 pages

---

**Date de mise en œuvre** : 2026-02-04
**Status** : ✅ **Terminé et testé (build OK)**
