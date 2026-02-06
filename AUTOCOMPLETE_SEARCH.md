# Autocomplete / Suggestions dans les barres de recherche

## Objectif
Réactiver les suggestions (dropdown autocomplete) dans les champs de recherche du header PageHeader pour les pages Clubs et Tournois.

## Nouveau composant créé

### `AutocompleteInput.tsx`
Composant d'input avec dropdown de suggestions.

**Fonctionnalités :**
- **Dropdown au focus** : Affiche les suggestions au clic dans le champ
- **Filtrage dynamique** : Les suggestions sont filtrées en temps réel selon la saisie
- **Navigation clavier** :
  - `↓` : Descendre dans la liste
  - `↑` : Remonter dans la liste
  - `Enter` : Sélectionner la suggestion surlignée
  - `Escape` : Fermer le dropdown
- **Clic extérieur** : Ferme automatiquement le dropdown
- **Message "Aucun résultat"** : Affiché si aucune suggestion ne correspond

**Style :**
- Dropdown aligné sous le champ
- Fond blanc, bordure `border-slate-200`, arrondi `rounded-xl`
- Ombre douce : `shadow-lg`
- Items hover : `bg-slate-100`
- Item surligné (clavier) : `bg-slate-100 text-slate-900`
- Max-height : `max-h-60` avec scroll

**Props :**
```typescript
{
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  suggestions?: string[]
}
```

## Modifications du composant PageHeader

**Changements :**
1. Import de `AutocompleteInput`
2. Ajout du champ optionnel `suggestions` dans le type `SearchBarField`
3. Utilisation conditionnelle :
   - Si `suggestions` fourni → utilise `AutocompleteInput`
   - Sinon → utilise un `<input>` simple

## Modifications des pages

### 1. CLUBS (`clubs/page.tsx`)

**Suggestions ajoutées :**

**A) Champ "Que cherchez-vous ?" (noms de clubs)**
```typescript
const clubNameSuggestions = useMemo(() => {
  return clubs.map(club => club.name).sort()
}, [clubs])
```
Exemples : "Le Hangar Sport & Co", "Paul & Louis Sport", "ZE Padel", "QG Padel Club"

**B) Champ "Où" (villes)**
```typescript
const citySuggestions = useMemo(() => {
  const cities = [...new Set(clubs.map(club => club.city))]
  return [...getCitySuggestions(), ...cities].sort()
}, [clubs])
```
Combine les villes des clubs + les villes génériques de `getCitySuggestions()`

### 2. TOURNOIS (`tournois/page.tsx`)

**Suggestions ajoutées :**

**A) Champ "Que cherchez-vous ?" (noms de tournois)**
```typescript
const tournoiNameSuggestions = useMemo(() => {
  return tournois.map(t => t.nom).sort()
}, [tournois])
```
Exemples : "Tournoi P1000 Hommes", "Tournoi P500 Mixte", etc.

**B) Champ "Où" (villes)**
```typescript
const citySuggestions = useMemo(() => {
  const cities = [...new Set(tournois.map(t => {
    const parts = t.clubAdresse.split(',')
    return parts[parts.length - 1]?.trim() || ''
  }).filter(Boolean))]
  return [...getCitySuggestions(), ...cities].sort()
}, [tournois])
```
Extrait les villes depuis `clubAdresse` + combine avec `getCitySuggestions()`

## Comportement UX

### Au focus
- Dropdown s'ouvre automatiquement si suggestions disponibles
- Affiche toutes les suggestions si champ vide
- Affiche les suggestions filtrées si champ non vide

### Pendant la saisie
- Filtrage en temps réel (case insensitive)
- Recherche par `includes()` (pas juste `startsWith`)
- Affiche "Aucun résultat" si aucune correspondance

### Sélection
- Clic sur suggestion → remplit le champ + ferme dropdown
- Enter sur suggestion surlignée → remplit le champ + ferme dropdown
- Fermeture → perd le focus (blur)

### Navigation clavier
- ↓/↑ : Naviguer dans la liste (avec surlignage)
- Enter : Valider la sélection
- Escape : Fermer sans sélection

## Performance

- Utilisation de `useMemo` pour les suggestions (recalcul uniquement si données changent)
- Filtrage léger côté client (pas de requête serveur)
- Suggestions triées alphabétiquement

## Fichiers modifiés

1. **`app/player/(authenticated)/components/AutocompleteInput.tsx`** *(nouveau)*
   - Composant d'autocomplete réutilisable
   
2. **`app/player/(authenticated)/components/PageHeader.tsx`**
   - Import AutocompleteInput
   - Support du champ `suggestions` dans SearchBarField
   - Rendu conditionnel (AutocompleteInput vs input simple)

3. **`app/player/(authenticated)/clubs/page.tsx`**
   - Ajout `clubNameSuggestions` (useMemo)
   - Ajout `citySuggestions` (useMemo)
   - Passage des suggestions au PageHeader

4. **`app/player/(authenticated)/tournois/page.tsx`**
   - Ajout `tournoiNameSuggestions` (useMemo)
   - Ajout `citySuggestions` (useMemo)
   - Passage des suggestions au PageHeader

## Résultat

✅ **Dropdown de suggestions** opérationnel sur les 2 pages
✅ **Filtrage en temps réel** pendant la saisie
✅ **Navigation clavier** (↑↓ Enter Escape)
✅ **Design premium** cohérent avec le reste
✅ **Performance optimale** (useMemo + filtrage client)
✅ **UX fluide** (clic extérieur, blur auto, hover)
