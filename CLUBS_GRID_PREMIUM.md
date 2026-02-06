# Grille Clubs Premium - Catalogue Régulier

## Problème résolu
- ❌ Cards étirées, tailles incohérentes, gros vide
- ❌ Images déformées (aspect-square mal adapté)
- ❌ Texte minuscule, illisible
- ❌ Pas de structure visuelle claire

## Solution appliquée

### 1. ClubCard refactorisé (`app/player/(authenticated)/components/ClubCard.tsx`)

**Structure premium :**
- Fond blanc : `bg-white`
- Bordure : `border border-slate-200`
- Coins arrondis : `rounded-2xl`
- Ombre : `shadow-sm` → `shadow-md` au hover
- Hover subtil : `hover:-translate-y-0.5` (légère élévation)
- Transition fluide : `transition-all duration-200`

**Image ratio fixe 16:9 :**
- `aspect-[16/9]` (au lieu de `aspect-square`)
- `object-cover object-center` (pas d'étirement)
- Background gris clair : `bg-slate-100` (si image manquante)

**Contenu texte structuré :**
- Padding : `p-4`
- Hauteur minimale : `min-h-[80px]` (alignement cards)
- "Découvrez nos" : `text-xs text-slate-500` (petit, discret)
- Nom du club : `text-base font-semibold text-slate-900` (lisible, gras)
- Ville : `text-sm text-slate-500` (secondaire)

### 2. Grille responsive optimisée (`clubs/page.tsx`)

**Container :**
- Largeur max : `max-w-7xl` (large, mais contenu)
- Centré : `mx-auto`
- Padding horizontal : `px-4 md:px-6`

**Grille :**
- Mobile : 1 colonne (`grid-cols-1`)
- Tablette : 2 colonnes (`sm:grid-cols-2`)
- Desktop : 3 colonnes (`lg:grid-cols-3`)
- Espacement : `gap-6` (24px, généreux et régulier)

## Résultat

✅ **Toutes les cards ont exactement la même taille**
✅ **Images ratio 16:9, jamais déformées**
✅ **Texte lisible (14px/16px au lieu de 11px/12px)**
✅ **Espacement régulier de 24px**
✅ **Rendu "catalogue premium" cohérent**
✅ **Hover subtil et professionnel**
✅ **3 colonnes propres sur desktop**
✅ **Zéro étirement, zéro vide bizarre**
✅ **Responsive parfait (1/2/3 colonnes)**

## Fichiers modifiés
1. `app/player/(authenticated)/components/ClubCard.tsx` (refonte complète)
2. `app/player/(authenticated)/clubs/page.tsx` (container + grille)

## Notes techniques
- Pas de changement de logique (filtres, tri, data intacts)
- Toute la card reste cliquable (Link vers `/player/clubs/${id}/reserver`)
- Compatible avec les images actuelles (URLs absolues)
- Pas besoin de next/image (img standard avec object-cover suffit)
