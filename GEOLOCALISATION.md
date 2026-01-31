# 📍 Géolocalisation - Documentation

## ✅ Ce qui a été implémenté

### 1. Composant UseMyLocationButton
**Fichier:** `components/UseMyLocationButton.tsx`

Bouton client-side qui demande la permission de géolocalisation au navigateur.

**Fonctionnalités:**
- ✅ Demande de permission au clic (pas automatique)
- ✅ Gestion des erreurs (refus, indisponible, timeout)
- ✅ État de chargement pendant la requête
- ✅ Message de consentement utilisateur
- ✅ Design intégré avec le style Tailwind du site
- ✅ Type `button` pour éviter les submits involontaires

**Paramètres:**
```typescript
onCoords?: (coords: { lat: number; lng: number }) => void
```

**États d'erreur gérés:**
- Code 1 : Localisation refusée par l'utilisateur
- Code 2 : Position indisponible (GPS désactivé, etc.)
- Code 3 : Délai dépassé (timeout de 8 secondes)

### 2. Intégration dans la page Clubs
**Fichier:** `app/player/(authenticated)/clubs/page.tsx`

Le bouton est intégré juste après la barre de recherche, avant les filtres de tri.

**État ajouté:**
```typescript
const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
```

**Callback:**
Actuellement, les coordonnées sont loguées dans la console. Prêt pour l'implémentation du tri par distance.

### 3. Route API pour les clubs proches
**Fichier:** `app/api/nearby/route.ts`

Route POST qui reçoit les coordonnées de l'utilisateur.

**Endpoint:** `POST /api/nearby`

**Body:**
```json
{
  "lat": 43.836699,
  "lng": 4.360054
}
```

**Réponse actuelle:**
```json
{
  "ok": true,
  "lat": 43.836699,
  "lng": 4.360054,
  "message": "Coordonnées reçues avec succès. Logique de recherche à implémenter."
}
```

## 🔒 Sécurité et conformité

### Prérequis techniques
- ✅ **HTTPS obligatoire** : Fonctionne sur Vercel (HTTPS par défaut)
- ✅ **Permission navigateur** : Demandée uniquement au clic (pas automatique)
- ✅ **Message de consentement** : Affiché sous le bouton

### RGPD / Vie privée
⚠️ **À ajouter dans la politique de confidentialité:**

```
Géolocalisation:
- Pourquoi : Afficher les clubs de padel les plus proches de votre position
- Stockage : Les coordonnées ne sont PAS stockées côté serveur
- Utilisation : Calcul de distance en temps réel uniquement
- Durée : Session en cours uniquement (pas de persistance)
- Désactivation : Vous pouvez refuser la permission à tout moment
```

## 📋 TODO - Prochaines étapes

### Priorité 1 : Calcul de distance réelle

**Implémenter la formule de Haversine:**

```typescript
function calculateDistance(
  lat1: number, 
  lng1: number, 
  lat2: number, 
  lng2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // en km
}
```

**Utilisation dans la page clubs:**

```typescript
const handleGeolocation = (coords: { lat: number; lng: number }) => {
  setUserCoords(coords);
  
  // Calculer la distance réelle pour chaque club
  const clubsWithDistance = clubs.map(club => ({
    ...club,
    realDistance: calculateDistance(
      coords.lat,
      coords.lng,
      club.lat, // ⚠️ À ajouter dans le type Club
      club.lng  // ⚠️ À ajouter dans le type Club
    )
  }));
  
  // Trier par distance réelle
  setClubs(clubsWithDistance.sort((a, b) => a.realDistance - b.realDistance));
  setSortBy('distance'); // Activer le tri par distance
};
```

### Priorité 2 : Ajouter les coordonnées GPS aux clubs

**Modifier le type Club:**

```typescript
type Club = {
  id: number
  nom: string
  ville: string
  distance: number
  lat: number      // ✅ NOUVEAU
  lng: number      // ✅ NOUVEAU
  nombreTerrains: number
  note: number
  avis: number
  imageUrl: string
  prixMin: number
  equipements: string[]
  favoris: boolean
  disponible: boolean
}
```

**Ajouter les coordonnées dans les données:**

```typescript
{
  id: 1,
  nom: 'Le Hangar Sport & Co',
  ville: 'Rochefort-du-Gard',
  lat: 43.9825,  // ✅ NOUVEAU
  lng: 4.6847,   // ✅ NOUVEAU
  distance: 5,
  // ...
}
```

### Priorité 3 : Utiliser l'API route pour la recherche DB

**Modifier `/api/nearby` pour:**
1. Recevoir les coordonnées
2. Requêter la base de données (Supabase)
3. Calculer les distances
4. Retourner les clubs triés

**Exemple d'implémentation:**

```typescript
export async function POST(req: Request) {
  const { lat, lng } = await req.json();
  
  // Récupérer tous les clubs depuis Supabase
  const { data: clubs } = await supabase
    .from('clubs')
    .select('*');
  
  // Calculer les distances
  const clubsWithDistance = clubs.map(club => ({
    ...club,
    distance: calculateDistance(lat, lng, club.lat, club.lng)
  }));
  
  // Trier par distance
  const sortedClubs = clubsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10); // Top 10 clubs les plus proches
  
  return NextResponse.json({ clubs: sortedClubs });
}
```

### Priorité 4 : Améliorer l'UX

**Feedback visuel:**
- ✅ Afficher les coordonnées obtenues (déjà dans le console.log)
- ⬜ Toast de confirmation "Position détectée !"
- ⬜ Indicateur sur la carte (si carte intégrée)
- ⬜ Message "X clubs trouvés à moins de Y km"

**Affichage de la distance:**
- ⬜ Remplacer "5 min" par "3.2 km" (distance réelle)
- ⬜ Option pour afficher en minutes ou en km
- ⬜ Badge "Le plus proche" sur le 1er club

### Priorité 5 : Optimisations

**Performance:**
- ⬜ Cache des coordonnées en sessionStorage (éviter de re-demander)
- ⬜ Debounce des recalculs de distance
- ⬜ Index géospatial dans Supabase (PostGIS)

**Erreurs:**
- ⬜ Fallback si géolocalisation refusée (demander ville/code postal)
- ⬜ Retry automatique en cas de timeout
- ⬜ Message personnalisé selon le type d'erreur

## 🧪 Tests

### Tests manuels à effectuer:

1. **Permission accordée:**
   - ✅ Cliquer sur "Trouver près de moi"
   - ✅ Autoriser la géolocalisation
   - ✅ Vérifier que les coordonnées s'affichent dans la console
   - ⬜ Vérifier que les clubs sont triés par distance

2. **Permission refusée:**
   - ✅ Cliquer sur "Trouver près de moi"
   - ✅ Refuser la géolocalisation
   - ✅ Vérifier le message d'erreur "Localisation refusée."

3. **Navigateur incompatible:**
   - ⬜ Tester sur un vieux navigateur sans API Geolocation
   - ✅ Vérifier le message "La géolocalisation n'est pas supportée"

4. **HTTPS:**
   - ✅ Vérifier que ça fonctionne sur Vercel (HTTPS)
   - ⚠️ Ne fonctionnera PAS en local HTTP (sauf localhost)

## 📚 Ressources

- [MDN - Geolocation API](https://developer.mozilla.org/fr/docs/Web/API/Geolocation_API)
- [Formule de Haversine](https://en.wikipedia.org/wiki/Haversine_formula)
- [PostGIS pour Supabase](https://supabase.com/docs/guides/database/extensions/postgis)
- [RGPD et géolocalisation](https://www.cnil.fr/fr/la-geolocalisation)

## 🎯 Commit

```bash
[main 7d14368] feat: add geolocation 'Autour de moi' button
 3 files changed, 127 insertions(+)
 create mode 100644 app/api/nearby/route.ts
 create mode 100644 components/UseMyLocationButton.tsx
```

---

**Status:** ✅ Fondations posées - Prêt pour calcul de distance réelle
