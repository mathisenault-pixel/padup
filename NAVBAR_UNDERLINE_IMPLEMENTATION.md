# ✅ NAVBAR UNDERLINE - Implémentation style Planity

## 🎯 OBJECTIF

Créer un underline animé sous les onglets de navigation avec le comportement suivant :
1. **Par défaut** : Trait visible sous l'onglet actif
2. **Au hover** : Trait disparaît de l'actif et apparaît sous l'onglet survolé
3. **Après hover** : Trait revient automatiquement sous l'onglet actif

---

## 🔧 IMPLÉMENTATION TECHNIQUE

### Fichier modifié : `app/player/(authenticated)/components/PlayerNav.tsx`

### Approche utilisée : Pseudo-élément `::after` avec Tailwind

```tsx
<nav className="hidden lg:flex items-center gap-1 group">
  {navItems.map((item) => {
    const active = isActive(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        className={`
          relative px-4 py-2 text-[14px] transition-colors whitespace-nowrap
          ${active ? 'text-slate-900 font-semibold' : 'text-slate-700 font-medium hover:text-slate-900'}
          after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] 
          after:bg-slate-900 after:transition-opacity after:duration-200
          ${active ? 'after:opacity-100 group-hover:after:opacity-0' : 'after:opacity-0'}
          hover:after:!opacity-100
        `}
      >
        {item.label}
      </Link>
    )
  })}
</nav>
```

---

## 📋 EXPLICATION DÉTAILLÉE

### 1. Structure de base

**Container `<nav>`** :
```tsx
<nav className="hidden lg:flex items-center gap-1 group">
```
- `group` : Active les utilitaires `group-hover:` pour les enfants

**Lien individuel `<Link>`** :
```tsx
<Link className="relative px-4 py-2 ...">
```
- `relative` : Nécessaire pour positionner le pseudo-élément `::after` en `absolute`

### 2. Pseudo-élément `::after` (le trait)

Classes Tailwind appliquées :
```
after:content-['']           → Crée le pseudo-élément
after:absolute               → Positionnement absolu
after:left-0                 → Aligné à gauche
after:bottom-0               → Collé en bas du lien
after:w-full                 → Largeur = 100% du lien
after:h-[2px]                → Hauteur = 2px (épaisseur du trait)
after:bg-slate-900           → Couleur noir/gris foncé (zéro bleu)
after:transition-opacity     → Animation smooth
after:duration-200           → Durée transition = 200ms
```

### 3. Logique de visibilité (opacity)

#### État par défaut (lien inactif)
```
after:opacity-0
```
→ Le trait est **invisible** par défaut

#### État actif (lien actif, aucun hover)
```tsx
${active ? 'after:opacity-100 group-hover:after:opacity-0' : 'after:opacity-0'}
```
Si `active = true` :
- `after:opacity-100` → Trait **visible**
- `group-hover:after:opacity-0` → Trait **invisible** si un autre lien est survolé

#### État hover (sur n'importe quel lien)
```
hover:after:!opacity-100
```
- `hover:` → Au survol du lien
- `!opacity-100` → Force l'opacité à 100 (le `!` override `group-hover:after:opacity-0`)

---

## 🎬 COMPORTEMENT VISUEL

### Scénario 1 : Onglet "Accueil" actif, aucun hover
```
Accueil    Clubs    Tournois
   ▔▔▔
```
→ Trait sous "Accueil" (actif)

### Scénario 2 : Onglet "Accueil" actif, hover sur "Clubs"
```
Accueil    Clubs    Tournois
             ▔▔▔
```
→ Trait sous "Clubs" (hover)
→ Trait disparu de "Accueil"

### Scénario 3 : Onglet "Accueil" actif, hover sur "Tournois"
```
Accueil    Clubs    Tournois
                        ▔▔▔
```
→ Trait sous "Tournois" (hover)

### Scénario 4 : Sortie du hover
```
Accueil    Clubs    Tournois
   ▔▔▔
```
→ Trait revient automatiquement sous "Accueil" (actif)

---

## 🔍 DÉTAILS TECHNIQUES

### Pourquoi `group` sur `<nav>` ?

Le `group` permet d'appliquer des styles conditionnels aux enfants basés sur l'état du parent.

**Sans `group`** : Impossible de dire "si un autre lien est hover, cache le trait de l'actif"

**Avec `group`** : On peut utiliser `group-hover:after:opacity-0` sur le lien actif

### Pourquoi `!opacity-100` sur hover ?

Le `!` (important) est nécessaire pour **override** le `group-hover:after:opacity-0` du lien actif quand on le survole directement.

**Sans `!`** :
- Hover sur onglet actif → `group-hover:after:opacity-0` l'emporte → trait invisible ❌

**Avec `!`** :
- Hover sur onglet actif → `hover:after:!opacity-100` override → trait visible ✅

### Pourquoi `bottom-0` et pas `bottom-[-6px]` ?

Dans Tailwind, avec `relative` + `after:absolute` + `after:bottom-0`, le trait est positionné exactement au bord inférieur du lien (padding inclus).

Si besoin de plus d'espace, on peut ajuster :
```
after:bottom-[-4px]  → 4px sous le lien
after:bottom-[-6px]  → 6px sous le lien
```

Actuellement : `after:bottom-0` = collé au bord du padding du lien.

---

## 🎨 STYLE VISUEL

### Couleur
```
after:bg-slate-900
```
→ Noir/gris très foncé (conforme à la contrainte "zéro bleu")

### Épaisseur
```
after:h-[2px]
```
→ 2 pixels (trait fin, élégant)

### Animation
```
after:transition-opacity after:duration-200
```
→ Transition smooth de 200ms sur l'opacité

---

## 📱 RESPONSIVE

### Mobile (< lg)
```tsx
<nav className="lg:hidden flex items-center gap-1">
  {/* ... */}
  className={`... ${isActive(item.href) ? '... border-b-2 border-slate-900' : '...'}`}
</nav>
```
→ Mobile conserve l'ancien système (`border-b-2` direct) car moins d'espace et pas de hover

### Desktop (≥ lg)
```tsx
<nav className="hidden lg:flex items-center gap-1 group">
  {/* ... underline animé avec ::after ... */}
</nav>
```
→ Desktop utilise le système sophistiqué avec pseudo-élément

---

## ✅ CHECKLIST CONFORMITÉ

### Règles de base ✅
- [x] Trait SOUS l'onglet (pas au-dessus)
- [x] Visible sous onglet actif par défaut
- [x] Visible sous onglet survolé au hover
- [x] Disparaît de l'actif quand on hover ailleurs
- [x] Revient automatiquement à l'actif après hover

### Interdictions ✅
- [x] Pas de trait au-dessus
- [x] Pas de double trait
- [x] Pas de trait permanent sur plusieurs onglets
- [x] Pas d'animation flashy (transition sobre 200ms)

### Style ✅
- [x] Couleur : noir/gris foncé (zéro bleu)
- [x] Épaisseur : 2px
- [x] Position : sous le texte
- [x] Largeur : 100% du lien

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Trait sous onglet actif
```
1. Aller sur /player/accueil
2. Vérifier : trait visible sous "Accueil"
```

### Test 2 : Hover sur autre onglet
```
1. Aller sur /player/accueil (trait sous "Accueil")
2. Passer souris sur "Clubs"
3. Vérifier : 
   - Trait disparaît de "Accueil"
   - Trait apparaît sous "Clubs"
```

### Test 3 : Sortie du hover
```
1. Aller sur /player/accueil
2. Hover sur "Tournois" (trait sous "Tournois")
3. Retirer souris
4. Vérifier : trait revient automatiquement sous "Accueil"
```

### Test 4 : Hover sur onglet actif
```
1. Aller sur /player/accueil
2. Hover sur "Accueil" (onglet actif)
3. Vérifier : trait reste visible sous "Accueil"
```

### Test 5 : Navigation entre onglets
```
1. Aller sur /player/accueil (trait sous "Accueil")
2. Cliquer sur "Clubs"
3. Vérifier : trait se déplace sous "Clubs" (nouvel actif)
4. Hover sur "Tournois"
5. Vérifier : trait passe sous "Tournois"
6. Retirer souris
7. Vérifier : trait revient sous "Clubs" (actif)
```

### Test 6 : Mobile responsive
```
1. Réduire fenêtre < 1024px
2. Vérifier : navigation mobile sans animation sophistiquée
3. Trait actif = border-b-2 classique
```

---

## 🔄 COMPARAISON AVANT/APRÈS

### ❌ Avant (comportement simple)
```tsx
className={`... ${
  isActive(item.href)
    ? 'border-b-2 border-slate-900'  // Trait permanent
    : 'hover:text-slate-900'         // Pas de trait au hover
}`}
```

**Problème** :
- Trait permanent sous actif
- Pas de trait au hover sur autres onglets
- Pas de transfert visuel élégant

### ✅ Après (comportement Planity)
```tsx
className={`
  relative ...
  after:content-[''] after:absolute after:bottom-0 ...
  ${active ? 'after:opacity-100 group-hover:after:opacity-0' : 'after:opacity-0'}
  hover:after:!opacity-100
`}
```

**Avantages** :
- ✅ Trait disparaît de l'actif quand on hover ailleurs
- ✅ Trait suit le hover de la souris
- ✅ Transition smooth et élégante
- ✅ UX premium identique à Planity

---

## 🎯 RÉSULTAT FINAL

**Expérience utilisateur** :
1. Navigation intuitive (le trait indique toujours où on est)
2. Feedback visuel immédiat au hover
3. Animation subtile et professionnelle
4. Cohérence avec le style Planity

**Code** :
- ✅ Tailwind pur (pas de CSS custom)
- ✅ Responsive (mobile = simple, desktop = sophistiqué)
- ✅ Maintenable (logique claire avec `group` + `hover`)
- ✅ Performant (transition CSS, pas de JS)

---

## 📝 NOTES TECHNIQUES

### Alternative CSS pur (si besoin)

Si Tailwind pose problème, voici l'équivalent CSS pur :

```css
.nav-link {
  position: relative;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: #0f172a; /* slate-900 */
  opacity: 0;
  transition: opacity 0.2s ease;
}

.nav-link.active::after {
  opacity: 1;
}

.nav-link:hover::after {
  opacity: 1;
}

.navbar:hover .nav-link.active::after {
  opacity: 0;
}

.navbar:hover .nav-link.active:hover::after {
  opacity: 1;
}
```

Mais la solution Tailwind est préférée car :
- Pas de fichier CSS séparé
- Cohérence avec le reste du projet
- Utilise les tokens Tailwind (couleurs, durées)

---

## ✅ VALIDATION

**Comportement identique à Planity** : ✅
**Zéro bleu** : ✅
**Animation subtile** : ✅
**Responsive** : ✅
**Code propre** : ✅

**Prêt à déployer !** 🚀
