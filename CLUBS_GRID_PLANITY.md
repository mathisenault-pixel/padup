# UI Clubs - Grille style Planity

## Changements réalisés

### Nouveau composant `ClubCard`
- Fichier: `app/player/(authenticated)/components/ClubCard.tsx`
- Style: Card verticale simple et premium
- Structure:
  - Grande image (ratio 16:10, cover)
  - "Découvrez" (petit texte gris en majuscules)
  - Nom du club (titre noir, bold)
  - Ville (texte gris)
- Comportement:
  - Toute la card est cliquable (Link)
  - Hover: légère élévation (-translate-y-1) + ombre plus marquée (shadow-xl)
  - Image: zoom léger au hover (scale-105)
- Palette: noir/gris/blanc uniquement (zéro bleu)

### Modification de `clubs/page.tsx`
- Ancien affichage: Liste verticale (space-y) avec cards horizontales détaillées (image + infos + prix + bouton)
- Nouveau affichage: **Grille responsive** (grid)
  - Desktop: 3 colonnes (`lg:grid-cols-3`)
  - Tablette: 2 colonnes (`md:grid-cols-2`)
  - Mobile: 1 colonne (`grid-cols-1`)
- Espacement: gap-4 md:gap-6
- Simplicité: plus d'infos secondaires (prix, note, équipements, favoris, distance, terrains)

## Navigation
- Route conservée: `/player/clubs/${club.id}/reserver`
- Aucun changement dans la logique de filtrage/tri/recherche
- Tous les filtres (drawer, chips) restent fonctionnels

## Validation
- ✅ Build réussi (npm run build)
- ✅ 3/2/1 colonnes responsive
- ✅ Hover élégant (élévation + ombre)
- ✅ Toute la card est cliquable
- ✅ Aucun bleu (palette gris/noir/blanc)
- ✅ Style identique à Planity

## Fichiers modifiés
1. `app/player/(authenticated)/components/ClubCard.tsx` (nouveau)
2. `app/player/(authenticated)/clubs/page.tsx` (grille au lieu de liste)

## Résultat visuel
Impression générale: **simple, premium, aéré**, identique au style Planity demandé.
