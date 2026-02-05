# 🚧 RÉORGANISATION DES FILTRES EN COURS

**Date**: 4 février 2026  
**Objectif**: Réorganiser les filtres (barre compacte + drawer + chips) sur les 3 pages

---

## ✅ ÉTAPE 1 : Composants créés

### `FiltersDrawer.tsx` ✅
- Drawer latéral (right side)
- Backdrop avec overlay
- Header avec titre + bouton fermer
- Content scrollable
- Footer avec boutons "Réinitialiser" et "Appliquer"
- Gestion du scroll body (bloqué quand ouvert)

### `ActiveFiltersChips.tsx` ✅
- Affichage des filtres actifs sous forme de chips
- Label + valeur + bouton remove (✕)
- Bouton "Tout effacer" si plusieurs chips
- Style: bg-slate-100, text-slate-700

---

## ✅ ÉTAPE 2 : "Mes réservations" (TERMINÉ)

### Barre principale (toujours visible)
- Filtre "Statut" (dropdown avec compteurs)
- Bouton "Filtres" (icône sliders)

### Drawer (tous les filtres)
- Type d'événement (3 options: Tout/Parties/Tournois)
- Statut (4 options: Toutes/À venir/Passées/Annulées)
- Boutons full-width, style vertical
- Compteurs dynamiques

### Chips de filtres actifs
- Type actif → chip "Type: Parties" avec ✕
- Statut actif → chip "Statut: À venir" avec ✕
- Bouton "Tout effacer" si 2+ filtres

### Validation
- ✅ Build OK
- ✅ 100% filtres conservés (7 boutons)
- ✅ Zéro bleu
- ✅ Logique inchangée

---

## 🚧 ÉTAPE 3 : "Tournois" (EN COURS)

### Plan

#### Barre principale (toujours visible)
- Recherche (SmartSearchBar)
- Statut (3 boutons compacts: Ouverts/Inscrits/Tous)
- Bouton "Filtres"

#### Drawer (tous les autres filtres)
**Groupe 1 - Tri**
- Date (seule option actuellement)

**Groupe 2 - Autour de**
- Ville (SmartSearchBar)
- Rayon (dropdown: 10/20/30/50/100 km)

**Groupe 3 - Niveau**
- Tous / P100 / P250 / P500 / P1000 / P2000
- Multi-sélection (toggleCategorie)

**Groupe 4 - Genre**
- Tous / Hommes / Femmes / Mixte
- Multi-sélection (toggleGenre)

#### Chips de filtres actifs
- Recherche → "Recherche: [term]"
- Statut → "Statut: Ouverts" (si ≠ défaut)
- Niveaux sélectionnés → chips individuels "P100", "P500"
- Genres sélectionnés → chips individuels "Hommes", "Mixte"
- Ville → "Ville: Paris (50km)"

### États (tous conservés)
- `searchTerm` ✅
- `selectedFilter` ('tous' | 'ouverts' | 'inscrits') ✅
- `selectedCategories[]` ✅
- `selectedGenres[]` ✅
- `cityClubFilter` ✅
- `radiusKm` ✅
- `sortBy` ✅
- `isFiltersDrawerOpen` (nouveau) ✅

### Handlers (tous conservés)
- `setSearchTerm` ✅
- `setSelectedFilter` ✅
- `toggleCategorie` ✅
- `toggleGenre` ✅
- `setCityClubFilter` ✅
- `setRadiusKm` ✅
- `setSortBy` ✅

---

## 📋 ÉTAPE 4 : "Clubs" (À FAIRE)

### Plan

#### Barre principale (toujours visible)
- Recherche (SmartSearchBar)
- Tri (dropdown: Mieux notés/Prix↑/Prix↓)
- Bouton "Filtres"

#### Drawer (tous les autres filtres)
**Groupe 1 - Autour de**
- Ville (SmartSearchBar)
- Rayon (dropdown: 10/20/30/50/100 km)

**Groupe 2 - Équipements**
- Restaurant / Parking / Bar / Fitness / Coaching
- Multi-sélection (toggleEquipement)

**Groupe 3 - Gamme de prix**
- ≤ 8€ / 9-10€ / ≥ 11€
- Multi-sélection (togglePrixRange)

#### Chips de filtres actifs
- Recherche → "Recherche: [term]"
- Tri → "Tri: Prix croissant" (si ≠ défaut)
- Équipements → chips individuels "Restaurant", "Parking"
- Prix → chips individuels "≤ 8€", "9-10€"
- Ville → "Ville: Paris (50km)"

---

## 🎯 VALIDATION FINALE (À FAIRE)

### Checklist globale
- [ ] 100% filtres conservés sur 3 pages
- [ ] Barre principale compacte (~56px)
- [ ] Drawer fonctionnel (desktop + mobile)
- [ ] Chips de filtres actifs affichés
- [ ] Zéro bleu partout
- [ ] Logique de filtrage inchangée
- [ ] Build OK (46 routes)

### Tests manuels
- [ ] Desktop: Barre visible + Drawer s'ouvre à droite
- [ ] Mobile: Barre visible + Drawer plein écran
- [ ] Chips: Affichage correct + Remove fonctionne
- [ ] Drawer: Scroll OK + Footer toujours visible
- [ ] Backdrop: Ferme le drawer au clic
- [ ] Appliquer: Ferme le drawer et applique
- [ ] Réinitialiser: Reset tous les filtres

---

## 📊 GAIN VISUEL ATTENDU

### AVANT
- Zone filtres: ~250-350px de hauteur
- Perception: "Bloc principal massif"
- Mobile: Scroll horizontal sur certains filtres

### APRÈS
- Barre principale: ~56px de hauteur
- Perception: "Toolbar légère et moderne"
- Mobile: Bouton "Filtres" → Drawer plein écran propre
- Gain vertical: **~200-300px**

---

## 🚀 PROCHAINES ÉTAPES

1. ✅ Créer composants FiltersDrawer + ActiveFiltersChips
2. ✅ Appliquer sur "Mes réservations"
3. 🚧 Appliquer sur "Tournois" (EN COURS)
4. ⏳ Appliquer sur "Clubs"
5. ⏳ Tests complets desktop + mobile
6. ⏳ Commit + documentation finale

---

**Status actuel**: Réorganisation "Tournois" en cours d'implémentation
