# Header Planity Style - 3 Pages

## Objectif
Remplacer les headers des pages "Mes réservations", "Clubs" et "Tournois" par un header commun style Planity :
- Titre H1 centré
- Sous-titre centré gris
- Barre de recherche unifiée (fond blanc, arrondie, 2 champs + bouton)

## Nouveau composant créé

### `PageHeader.tsx`
Composant réutilisable pour afficher un header premium style Planity.

**Structure :**
- Container centré
- Titre : `text-3xl md:text-4xl font-bold text-slate-900`
- Sous-titre : `text-base md:text-lg text-slate-600`
- Barre de recherche :
  - Fond blanc : `bg-white`
  - Arrondie : `rounded-2xl`
  - Ombre : `shadow-md`
  - Bordure : `border border-slate-200`
  - 2 champs séparés par une ligne verticale
  - Bouton à droite : `bg-slate-900`

**Props :**
```typescript
{
  title: string
  subtitle: string
  leftField: SearchBarField
  rightField: SearchBarField
  buttonLabel: string
  onSearch: () => void
}
```

## Modifications par page

### 1. MES RÉSERVATIONS (`reservations/page.tsx`)

**Header appliqué :**
- H1 : "Mes réservations"
- Sous-titre : "Retrouvez et gérez toutes vos réservations de padel"

**Barre de recherche :**
- Champ gauche : "Rechercher" / placeholder "Club, ville…"
- Champ droit : "Statut" / select (Toutes, À venir, Passées, Annulées)
- Bouton : "Appliquer"

**Fonctionnalité :**
- Le bouton "Appliquer" applique le filtre de statut via `setSelectedFilter`

### 2. CLUBS (`clubs/page.tsx`)

**Header appliqué :**
- H1 : "Clubs"
- Sous-titre : "Trouvez les meilleurs clubs de padel près de chez vous"

**Barre de recherche :**
- Champ gauche : "Que cherchez-vous ?" / placeholder "Nom du club"
- Champ droit : "Où" / placeholder "Ville"
- Bouton : "Rechercher"

**Fonctionnalité :**
- Le bouton "Rechercher" applique les filtres via `setSearchTerm` et `setCityClubFilter`

### 3. TOURNOIS (`tournois/page.tsx`)

**Header appliqué :**
- H1 : "Tournois"
- Sous-titre : "Découvrez et participez aux tournois de padel"

**Barre de recherche :**
- Champ gauche : "Que cherchez-vous ?" / placeholder "Nom du tournoi"
- Champ droit : "Où" / placeholder "Ville"
- Bouton : "Rechercher"

**Fonctionnalité :**
- Le bouton "Rechercher" applique les filtres via `setSearchTerm` et `setCityClubFilter`

## Contraintes respectées

✅ **Scope réduit** : Modification UNIQUEMENT des headers (titre + sous-titre + barre)
✅ **Composant réutilisable** : `PageHeader` utilisé sur les 3 pages
✅ **Tout centré** : Titres, sous-titres, et barre centrés
✅ **Responsive** : Fonctionne desktop + mobile
✅ **Aucun filtre supprimé** : Les filtres existants restent intacts
✅ **Aucune autre modification** : Le reste des pages inchangé

## Fichiers modifiés

1. `app/player/(authenticated)/components/PageHeader.tsx` *(nouveau)*
2. `app/player/(authenticated)/reservations/page.tsx` (header remplacé)
3. `app/player/(authenticated)/clubs/page.tsx` (header remplacé)
4. `app/player/(authenticated)/tournois/page.tsx` (header remplacé)

## Style Planity

- **Centré** : Tout le header est centré (titre, sous-titre, barre)
- **Barre unifiée** : Un seul bloc blanc avec 2 champs + bouton
- **Séparateur vertical** : Ligne fine `bg-slate-200` entre les champs
- **Bouton prominent** : Fond noir `bg-slate-900`, arrondi, bien visible
- **Labels clairs** : Petits labels au-dessus de chaque champ (`text-xs font-semibold`)
- **Espacement généreux** : Padding `p-3` dans la barre, `px-4 py-2` dans les champs
