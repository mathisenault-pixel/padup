# Intégration du bouton "Filtres" dans la barre de recherche

## Objectif
Simplifier l'UI en intégrant un bouton "Filtres" directement dans la barre de recherche PageHeader, remplaçant toutes les barres de filtres visibles par un seul bouton élégant avec compteur.

## Nouveau design : Barre "Search Hub"

```
[ Que recherchez-vous ? ] | [ Où ? ] | [ Filtres (2) ] | [ Rechercher ]
```

**Avantages :**
- Interface plus épurée et moins encombrée
- Tous les filtres accessibles via un seul point d'entrée
- Badge compteur pour indiquer les filtres actifs
- Design cohérent sur les 3 pages

## Modifications apportées

### 1. Composant `PageHeader.tsx`

**Ajout de nouvelles props :**
- `onFiltersClick?: () => void` - Callback pour ouvrir le drawer
- `activeFiltersCount?: number` - Nombre de filtres actifs (affiche badge)

**Nouveau bouton "Filtres" :**
- Position : Entre le champ "Où" et le bouton "Rechercher"
- Style :
  - Fond `bg-slate-50` avec bordure `border-slate-200`
  - Icône sliders à gauche
  - Texte "Filtres"
  - Hover : `bg-slate-100`
- **Badge compteur** :
  - Position : absolute top-right (`-top-1 -right-1`)
  - Fond noir : `bg-slate-900 text-white`
  - Affiche le nombre de filtres actifs
  - Ne s'affiche que si `activeFiltersCount > 0`

### 2. Page **CLUBS** (`clubs/page.tsx`)

**Filtres actifs calculés :**
```typescript
const activeFiltersCount = useMemo(() => {
  let count = 0
  if (sortBy !== 'note') count++
  count += selectedEquipements.length
  count += selectedPrixRanges.length
  if (cityClubFilter) count++
  return count
}, [sortBy, selectedEquipements, selectedPrixRanges, cityClubFilter])
```

**Suppressions :**
- ❌ Ancienne barre de filtres compacte (select "Trier" + bouton Filtres séparés)
- ❌ Chips de filtres actifs (`ActiveFiltersChips`)

**Ajouts dans FiltersDrawer :**
- ✅ Section "Trier par" en haut du drawer (select Tri déplacé)
- ✅ Tous les filtres existants conservés :
  - Trier par (Mieux notés, Prix croissant, Prix décroissant)
  - Autour de (Ville + Rayon)
  - Équipements (5 options)
  - Gamme de prix (3 ranges)

### 3. Page **TOURNOIS** (`tournois/page.tsx`)

**Filtres actifs calculés :**
```typescript
const activeFiltersCount = useMemo(() => {
  let count = 0
  if (selectedFilter !== 'ouverts') count++
  count += selectedCategories.length
  count += selectedGenres.length
  if (cityClubFilter) count++
  return count
}, [selectedFilter, selectedCategories, selectedGenres, cityClubFilter])
```

**Suppressions :**
- ❌ Ancienne barre de filtres compacte (boutons Statut + bouton Filtres séparés)
- ❌ Chips de filtres actifs (`ActiveFiltersChips`)

**Ajouts dans FiltersDrawer :**
- ✅ Section "Statut" en haut (Ouverts / Mes inscriptions / Tous)
- ✅ Tous les filtres existants conservés :
  - Statut (3 options)
  - Trier par (Date)
  - Autour de (Ville + Rayon)
  - Niveau (6 catégories P25-P2000)
  - Genre (4 options)

### 4. Page **MES RÉSERVATIONS** (`reservations/page.tsx`)

**Filtres actifs calculés :**
```typescript
const activeFiltersCount = useMemo(() => {
  let count = 0
  if (selectedType !== 'tous') count++
  if (selectedFilter !== 'tous') count++
  return count
}, [selectedType, selectedFilter])
```

**Suppressions :**
- ❌ Ancienne barre de filtres compacte (select Statut + bouton Filtres séparés)
- ❌ Chips de filtres actifs (`ActiveFiltersChips`)

**Note :** Le champ "Statut" est déjà dans le PageHeader (rightField type select), donc structure légèrement différente mais le bouton Filtres reste intégré.

**FiltersDrawer contient :**
- Type d'événement (Tout, Parties, Tournois)
- Filtrer par statut (Toutes, À venir, Passées, Annulées)

## Résultat visuel

### Barre de recherche unifiée
```
┌────────────────────────────────────────────────────────────────────┐
│ [ Que cherchez-vous ? ] | [ Où ? ] | [ Filtres (2) ] | [Rechercher]│
└────────────────────────────────────────────────────────────────────┘
```

### Badge compteur
- Si 0 filtre actif : "Filtres" (pas de badge)
- Si 1+ filtres actifs : "Filtres" avec badge noir contenant le chiffre

### Drawer/Panel Filtres
- Ouverture au clic sur "Filtres"
- Desktop : Drawer latéral droit
- Mobile : Bottom sheet
- Sections organisées par type
- Boutons en bas : "Réinitialiser" + "Appliquer"

## Bénéfices UX

✅ **Interface épurée** : Plus de barres de filtres encombrantes  
✅ **Point d'entrée unique** : Bouton "Filtres" visible et accessible  
✅ **Indication claire** : Badge compteur montre les filtres actifs  
✅ **Responsive** : Fonctionne desktop + mobile  
✅ **Cohérence** : Même pattern sur les 3 pages  
✅ **Aucune perte** : 100% des filtres conservés dans le drawer

## Fichiers modifiés

1. `app/player/(authenticated)/components/PageHeader.tsx`
   - Ajout props `onFiltersClick` et `activeFiltersCount`
   - Nouveau bouton "Filtres" avec badge compteur

2. `app/player/(authenticated)/clubs/page.tsx`
   - Calcul `activeFiltersCount`
   - Suppression barre filtres + chips
   - Ajout section "Trier par" dans drawer

3. `app/player/(authenticated)/tournois/page.tsx`
   - Calcul `activeFiltersCount`
   - Suppression barre filtres + chips
   - Ajout section "Statut" dans drawer

4. `app/player/(authenticated)/reservations/page.tsx`
   - Calcul `activeFiltersCount`
   - Suppression barre filtres + chips
   - FiltersDrawer déjà complet
