# Optimisation Mobile - Page Tournois

**Date:** 2026-01-22  
**Objectif:** Rendre la page Tournois mobile-first, claire, lisible, orientée conversion

---

## 🎯 PROBLÈMES RÉSOLUS

### ❌ Avant (problèmes UX mobile)
- Header trop haut qui mange l'écran
- Liste de tournois écrasée / mal alignée
- Footer qui apparaît trop tôt
- CTA ("S'inscrire", "Se désinscrire") pas assez visible
- Filtres trop larges pour mobile
- Texte trop petit ou tronqué

### ✅ Après (optimisations appliquées)
- Header compact (56px mobile vs 80px desktop)
- Cartes tournois en layout vertical mobile
- Espacement suffisant avant footer (mb-16 mobile)
- CTA pleine largeur, hauteur 48px (44px min Apple)
- Filtres repliables en accordion
- Structure claire : Image → Nom → Club → Date → Barre → CTA

---

## 📁 FICHIERS MODIFIÉS (4)

### 1. **`app/player/(authenticated)/layout.tsx`**

#### Header height réduite mobile
**Avant:**
```tsx
<div className="flex items-center justify-between h-20">
```

**Après:**
```tsx
<div className="flex items-center justify-between h-14 md:h-20">
```
**Résultat:** 56px mobile, 80px desktop

#### Padding réduit mobile
**Avant:**
```tsx
<div className="max-w-[1400px] mx-auto px-6 lg:px-8">
```

**Après:**
```tsx
<div className="max-w-[1400px] mx-auto px-3 md:px-6 lg:px-8">
```

#### Navigation mobile plus compacte
**Avant:**
```tsx
<div className="lg:hidden ... px-4 py-3">
```

**Après:**
```tsx
<div className="lg:hidden ... px-2 py-2">
```

#### Main content height ajustée
**Avant:**
```tsx
<main className="min-h-[calc(100vh-80px)]">
```

**Après:**
```tsx
<main className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-80px)]">
```

#### Bouton "Espace club" - Icône seule sur mobile
**Avant:**
```tsx
<span className="hidden sm:inline">Espace club</span>
<span className="sm:hidden">Club</span>
```

**Après:**
```tsx
<span className="hidden md:inline">Espace club</span>
{/* Icône seule sur mobile */}
```

---

### 2. **`app/player/(authenticated)/components/PlayerNav.tsx`**

#### Boutons navigation plus compacts mobile
**Avant:**
```tsx
className="... px-5 py-3 text-[15px] ... rounded-2xl"
```

**Après:**
```tsx
className="... px-3 md:px-5 py-2 md:py-3 text-sm md:text-[15px] ... rounded-xl md:rounded-2xl"
```

**Résultat:**
- Padding réduit mobile (12px vs 20px)
- Taille texte réduite (14px vs 15px)
- Border-radius plus petit mobile

---

### 3. **`app/player/(authenticated)/components/AuthStatus.tsx`**

#### Boutons Mon compte / Déconnexion optimisés
**Avant:**
```tsx
<button className="px-5 py-2.5 text-[14px] ...">
  <svg />
  Mon compte
</button>
```

**Après:**
```tsx
<button className="px-3 md:px-5 py-2 md:py-2.5 text-sm md:text-[14px] ...">
  <svg />
  <span className="hidden sm:inline">Mon compte</span>  {/* Icône seule mobile */}
</button>
```

**Résultat:**
- Mobile: Icône uniquement (économie d'espace)
- Desktop: Icône + texte

---

### 4. **`app/player/(authenticated)/tournois/page.tsx`**

#### Container padding réduit mobile
**Avant:**
```tsx
<div className="max-w-6xl mx-auto px-6 py-8">
```

**Après:**
```tsx
<div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8">
```

#### Bloc filtres optimisé
**Avant:**
```tsx
<div className="mb-8 bg-gray-50 rounded-2xl p-6 ...">
```

**Après:**
```tsx
<div className="mb-6 md:mb-8 bg-gray-50 rounded-xl md:rounded-2xl p-3 md:p-6 ...">
```

#### Accordion filtres (mobile uniquement)
**Nouveau (mobile):**
```tsx
<div className="md:hidden">
  <button onClick={() => setShowFilters(!showFilters)}>
    Filtrer les tournois
  </button>
  
  {showFilters && (
    <div className="mt-3 space-y-3">
      {/* Niveau - Scroll horizontal */}
      <div className="overflow-x-auto">...</div>
      
      {/* Genre - Boutons compacts flex-1 */}
      <div className="flex gap-2">...</div>
    </div>
  )}
</div>

{/* Filtres desktop (inchangés) */}
<div className="hidden md:flex ...">
```

**Fonctionnalités:**
- Par défaut: Replié (économise l'espace)
- Clic: Déplie les filtres
- Niveau: Scroll horizontal (tous visibles)
- Genre: Boutons flex-1 (répartis équitablement)

#### Cartes tournois - Structure verticale mobile
**Avant (desktop-only):**
```tsx
<div className="flex gap-6 ...">
  <div className="w-48 h-36 ...">Image</div>
  <div className="flex-1 ...">Contenu</div>
</div>
```

**Après (mobile-first):**
```tsx
<div className="flex flex-col md:flex-row gap-3 md:gap-6 p-3 md:p-5 ...">
  {/* Image - Full width mobile, fixed width desktop */}
  <div className="w-full md:w-48 h-40 md:h-36 ...">
    <img className="..." />
  </div>
  
  {/* Contenu - Structure verticale claire */}
  <div className="flex-1 flex flex-col gap-3">
    {/* 1. Nom + Prix */}
    <div className="flex justify-between">
      <h3 className="text-lg md:text-xl ... line-clamp-2">
        {tournoi.nom}
      </h3>
      <div className="text-xl md:text-2xl">
        {tournoi.prixInscription}€
      </div>
    </div>
    
    {/* 2. Club + Ville */}
    <p className="text-sm md:text-base ... line-clamp-1">
      {tournoi.club} · {tournoi.clubAdresse}
    </p>
    
    {/* 3. Date + Heure + Genre */}
    <div className="flex gap-3 md:gap-6 flex-wrap">
      <span>Date</span>
      <span>Genre</span>
    </div>
    
    {/* 4. Barre de remplissage */}
    <div className="flex-1">
      <div className="h-2 bg-gray-200 rounded-full">
        <div className="h-full bg-blue-600 ..." />
      </div>
    </div>
    
    {/* 5. CTA - Pleine largeur mobile */}
    <div className="mt-auto pt-3 border-t">
      <button className="w-full md:w-auto px-5 py-3 md:py-2 text-base md:text-sm ...">
        S'inscrire
      </button>
    </div>
  </div>
</div>
```

**Changements clés:**
- Layout: `flex-col` mobile, `flex-row` desktop
- Image: `w-full` mobile (pleine largeur), `w-48` desktop
- Image height: `h-40` mobile (meilleur ratio), `h-36` desktop
- Gap: `gap-3` mobile (12px), `gap-6` desktop (24px)
- Padding: `p-3` mobile, `p-5` desktop
- Nom tournoi: `line-clamp-2` (max 2 lignes)
- Club: `line-clamp-1` (max 1 ligne)
- CTA: `w-full` mobile (pleine largeur), `w-auto` desktop
- CTA height: `py-3` mobile (48px), `py-2` desktop (32px)
- CTA text: `text-base` mobile (16px), `text-sm` desktop (14px)

#### Espacement footer
**Avant:**
```tsx
<div className="space-y-4">
```

**Après:**
```tsx
<div className="space-y-3 md:space-y-4 mb-16 md:mb-8">
```

**Résultat:**
- Espacement liste: 12px mobile, 16px desktop
- Marge bottom: 64px mobile (évite footer collé), 32px desktop

---

## 📱 RÉSULTAT MOBILE

### Header (56px au lieu de 80px)
```
┌─────────────────────────────────────┐
│ Pad'Up    [Nav]    [🏢][👤][🚪]    │  ← 56px (compact)
├─────────────────────────────────────┤
│ [Accueil] [Clubs] [Réserv.] [Tour.] │  ← Nav scrollable
└─────────────────────────────────────┘
```

### Filtres (repliés par défaut)
```
┌─────────────────────────────────────┐
│ [🔍 Rechercher...]                  │
│                                     │
│ [Ouverts (3)] [Mes inscriptions (1)]│
│                                     │
│ ▼ Filtrer les tournois              │  ← Clic pour déplier
└─────────────────────────────────────┘

↓ Clic ↓

┌─────────────────────────────────────┐
│ ▲ Filtrer les tournois              │
│                                     │
│ Niveau                              │
│ [Tous][P100][P250][P500]... →      │  ← Scroll horizontal
│                                     │
│ Genre                               │
│ [Tous]  [Hommes]  [Femmes]  [Mixte] │  ← Flex-1
└─────────────────────────────────────┘
```

### Carte tournoi (structure verticale)
```
┌─────────────────────────────────────┐
│                                     │
│  ┌─────────────────────────────┐   │
│  │        IMAGE (full width)   │   │  ← h-40 (160px)
│  │         [P1000]              │   │
│  └─────────────────────────────┘   │
│                                     │
│  Tournoi P1000 Hommes         40€  │  ← Nom (max 2 lignes)
│                                     │
│  📍 Le Hangar · Rochefort-du-Gard  │  ← Club (max 1 ligne)
│                                     │
│  📅 25 jan · 09:00    👥 Hommes    │  ← Date + Genre
│                                     │
│  14/16 équipes              2 places│  ← Info
│  ████████████░░░ 87%                │  ← Barre
│  ─────────────────────────────────  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │      S'inscrire (40€)         │ │  ← CTA pleine largeur
│  └───────────────────────────────┘ │    48px hauteur
│                                     │
└─────────────────────────────────────┘
```

**Points clés:**
- ✅ Image pleine largeur, ratio fixe (pas écrasée)
- ✅ Nom max 2 lignes (line-clamp-2)
- ✅ Club max 1 ligne (line-clamp-1)
- ✅ Infos compactes mais lisibles
- ✅ Barre de remplissage bien visible
- ✅ CTA impossible à manquer (pleine largeur, 48px)

---

## 🎨 BREAKPOINTS

### Mobile (<768px)
- Header: 56px
- Padding: 16px
- Cartes: Layout vertical
- Image: Pleine largeur (h-40)
- CTA: Pleine largeur, py-3 (48px)
- Filtres: Accordion repliable
- Boutons nav: Compacts (px-3, text-sm)
- Boutons header: Icône seule

### Desktop (≥768px)
- Header: 80px
- Padding: 24px
- Cartes: Layout horizontal
- Image: Fixe 192px (w-48, h-36)
- CTA: Auto width, py-2 (32px)
- Filtres: Toujours visibles
- Boutons nav: Normal (px-5, text-[15px])
- Boutons header: Icône + texte

---

## ✅ BUILD RÉSULTAT

```bash
npm run build
```

**Résultat:**
```
✓ Compiled successfully
✓ TypeScript check passed
✓ 35 routes generated
✓ Aucune erreur
```

---

## 🧪 TESTER SUR MOBILE

### 1. Lancer le serveur
```bash
npm run dev
```

### 2. Ouvrir DevTools mobile
```
Chrome DevTools → Toggle device toolbar (Cmd+Shift+M)
Sélectionner: iPhone 12 Pro ou iPhone SE
```

### 3. Naviguer vers Tournois
```
http://localhost:3000/player/tournois
```

### 4. Vérifier les optimisations

**Header ✅**
- [ ] Hauteur réduite (~56px)
- [ ] Navigation scrollable horizontale
- [ ] Boutons plus compacts
- [ ] "Espace club" = icône seule
- [ ] "Mon compte" = icône seule
- [ ] "Déconnexion" = icône seule

**Filtres ✅**
- [ ] Bouton "Filtrer les tournois" visible
- [ ] Par défaut: replié
- [ ] Clic: déplie les filtres
- [ ] Niveau: scroll horizontal
- [ ] Genre: boutons flex-1 (largeur égale)

**Cartes tournois ✅**
- [ ] Layout vertical (colonne)
- [ ] Image pleine largeur, pas écrasée
- [ ] Nom max 2 lignes (line-clamp-2)
- [ ] Club + ville max 1 ligne (line-clamp-1)
- [ ] Date + heure + genre lisibles
- [ ] Barre de remplissage bien visible
- [ ] CTA pleine largeur, hauteur ~48px
- [ ] CTA impossible à rater

**Footer ✅**
- [ ] Ne colle pas aux cartes (mb-16 = 64px)
- [ ] Apparaît seulement en bas de liste

---

## 📊 COMPARAISON AVANT/APRÈS

### Header
| Élément | Avant | Après |
|---------|-------|-------|
| Height mobile | 80px | 56px ✅ |
| Padding mobile | 24px | 12px ✅ |
| Boutons nav | px-5 py-3 | px-3 py-2 ✅ |
| Texte header | Toujours visible | Icônes seules ✅ |

### Cartes tournois
| Élément | Avant | Après |
|---------|-------|-------|
| Layout | Horizontal (écrasé) | Vertical ✅ |
| Image width | 192px fixe | 100% ✅ |
| Nom tournoi | Tronqué | Max 2 lignes ✅ |
| CTA width | Auto | 100% ✅ |
| CTA height | ~32px | ~48px ✅ |
| Espacement | 16px | 12px ✅ |

### Filtres
| Élément | Avant | Après |
|---------|-------|-------|
| Visibilité | Toujours visibles | Accordion ✅ |
| Niveau | Wrap (déborde) | Scroll horizontal ✅ |
| Genre | Wrap (étroit) | Flex-1 égal ✅ |

---

## 🎯 SENSATION UX

### Style Revolut/Doctolib mobile ✅
- Espaces réduits mais aérés
- CTA impossibles à rater
- Texte lisible sans zoom
- Navigation fluide
- Pas d'écrasement visuel

### Checklist UX ✅
- [ ] Une carte = compréhension immédiate
- [ ] CTA visible sans scroll
- [ ] Texte lisible (min 14px)
- [ ] Touch targets ≥ 44px (Apple guidelines)
- [ ] Pas de contenu tronqué
- [ ] Footer ne mange pas l'écran

---

## 🚀 PROCHAINES ÉTAPES (OPTIONNEL)

### 1. Sticky CTA (si besoin)
Si le CTA n'est pas assez visible sur les grandes cartes:
```tsx
<div className="sticky bottom-0 bg-white border-t ...">
  <button>S'inscrire</button>
</div>
```

### 2. Skeleton loading
Pendant le chargement des tournois:
```tsx
{isLoading && (
  <div className="space-y-3">
    {[1,2,3].map(i => <SkeletonCard key={i} />)}
  </div>
)}
```

### 3. Pull to refresh
Gesture natif pour rafraîchir la liste:
```tsx
<div onTouchMove={handlePullToRefresh}>
```

### 4. Scroll infini
Charger plus de tournois au scroll:
```tsx
useEffect(() => {
  if (scrollBottom) loadMore()
}, [scrollBottom])
```

---

## 📝 NOTES IMPORTANTES

### Pourquoi accordion sur mobile ?
- Économise ~120px d'espace vertical
- Filtres utilisés moins souvent que scroll
- UX moderne (style Airbnb, Booking)

### Pourquoi CTA pleine largeur ?
- Standard iOS/Android (touch targets)
- Impossible à rater
- Meilleure conversion

### Pourquoi 48px de hauteur CTA ?
- Apple HIG: min 44px pour touch targets
- 48px = confortable (8px buffer)
- Plus facile à taper sans zoom

### Pourquoi mb-16 en bas de liste ?
- Évite footer collé aux cartes
- Espace pour scroll final
- Sensation "fin de page" claire

---

## 🎉 RÉSULTAT FINAL

✅ **Header compact** (56px mobile vs 80px desktop)  
✅ **Filtres repliables** (accordion mobile)  
✅ **Cartes verticales** (structure claire)  
✅ **CTA pleine largeur** (48px hauteur, impossible à rater)  
✅ **Espacement footer** (64px avant footer)  
✅ **Navigation optimisée** (boutons compacts, icônes seules)  
✅ **Desktop intact** (aucune régression)  
✅ **Build OK** (35 routes, aucune erreur)  

**La page Tournois est maintenant mobile-first, claire, lisible et orientée conversion ! 🚀**
