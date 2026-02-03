/**
 * Base de données des villes de la région (Gard, Vaucluse, Bouches-du-Rhône)
 * avec coordonnées GPS pour le calcul de distance
 */

export type City = {
  name: string
  postalCode: string
  department: string
  lat: number
  lng: number
}

export const CITIES: City[] = [
  // GARD (30)
  { name: 'Nîmes', postalCode: '30000', department: 'Gard', lat: 43.8374, lng: 4.3601 },
  { name: 'Alès', postalCode: '30100', department: 'Gard', lat: 44.1250, lng: 4.0814 },
  { name: 'Bagnols-sur-Cèze', postalCode: '30200', department: 'Gard', lat: 44.1628, lng: 4.6206 },
  { name: 'Beaucaire', postalCode: '30300', department: 'Gard', lat: 43.8083, lng: 4.6458 },
  { name: 'Saint-Gilles', postalCode: '30800', department: 'Gard', lat: 43.6772, lng: 4.4319 },
  { name: 'Vauvert', postalCode: '30600', department: 'Gard', lat: 43.6944, lng: 4.2756 },
  { name: 'Villeneuve-lès-Avignon', postalCode: '30400', department: 'Gard', lat: 43.9667, lng: 4.7969 },
  { name: 'Pont-Saint-Esprit', postalCode: '30130', department: 'Gard', lat: 44.2575, lng: 4.6478 },
  { name: 'Marguerittes', postalCode: '30320', department: 'Gard', lat: 43.8631, lng: 4.4428 },
  { name: 'Uzès', postalCode: '30700', department: 'Gard', lat: 44.0122, lng: 4.4197 },
  { name: 'Le Grau-du-Roi', postalCode: '30240', department: 'Gard', lat: 43.5356, lng: 4.1358 },
  { name: 'Laudun-l\'Ardoise', postalCode: '30290', department: 'Gard', lat: 44.1081, lng: 4.6533 },
  { name: 'Aigues-Mortes', postalCode: '30220', department: 'Gard', lat: 43.5669, lng: 4.1919 },
  { name: 'Rochefort-du-Gard', postalCode: '30650', department: 'Gard', lat: 43.9781, lng: 4.6911 },
  { name: 'Saint-Laurent-des-Arbres', postalCode: '30126', department: 'Gard', lat: 44.0528, lng: 4.6981 },
  { name: 'Les Angles', postalCode: '30133', department: 'Gard', lat: 43.9631, lng: 4.7633 },
  { name: 'Manduel', postalCode: '30129', department: 'Gard', lat: 43.8194, lng: 4.4731 },
  { name: 'Milhaud', postalCode: '30540', department: 'Gard', lat: 43.7928, lng: 4.3136 },
  { name: 'Redessan', postalCode: '30129', department: 'Gard', lat: 43.8339, lng: 4.5022 },
  { name: 'Sommières', postalCode: '30250', department: 'Gard', lat: 43.7831, lng: 4.0900 },

  // VAUCLUSE (84)
  { name: 'Avignon', postalCode: '84000', department: 'Vaucluse', lat: 43.9493, lng: 4.8055 },
  { name: 'Orange', postalCode: '84100', department: 'Vaucluse', lat: 44.1372, lng: 4.8086 },
  { name: 'Carpentras', postalCode: '84200', department: 'Vaucluse', lat: 44.0550, lng: 5.0481 },
  { name: 'Cavaillon', postalCode: '84300', department: 'Vaucluse', lat: 43.8369, lng: 5.0378 },
  { name: 'Apt', postalCode: '84400', department: 'Vaucluse', lat: 43.8767, lng: 5.3967 },
  { name: 'Pertuis', postalCode: '84120', department: 'Vaucluse', lat: 43.6942, lng: 5.5017 },
  { name: 'Bollène', postalCode: '84500', department: 'Vaucluse', lat: 44.2800, lng: 4.7500 },
  { name: 'Le Pontet', postalCode: '84130', department: 'Vaucluse', lat: 43.9608, lng: 4.8583 },
  { name: 'Sorgues', postalCode: '84700', department: 'Vaucluse', lat: 44.0069, lng: 4.8714 },
  { name: 'Vedène', postalCode: '84270', department: 'Vaucluse', lat: 43.9786, lng: 4.9050 },
  { name: 'L\'Isle-sur-la-Sorgue', postalCode: '84800', department: 'Vaucluse', lat: 43.9192, lng: 5.0506 },
  { name: 'Valréas', postalCode: '84600', department: 'Vaucluse', lat: 44.3833, lng: 4.9917 },
  { name: 'Pernes-les-Fontaines', postalCode: '84210', department: 'Vaucluse', lat: 43.9989, lng: 5.0578 },
  { name: 'Monteux', postalCode: '84170', department: 'Vaucluse', lat: 44.0358, lng: 4.9978 },
  { name: 'Entraigues-sur-la-Sorgue', postalCode: '84320', department: 'Vaucluse', lat: 43.9831, lng: 4.9281 },

  // BOUCHES-DU-RHÔNE (13)
  { name: 'Marseille', postalCode: '13000', department: 'Bouches-du-Rhône', lat: 43.2965, lng: 5.3698 },
  { name: 'Aix-en-Provence', postalCode: '13100', department: 'Bouches-du-Rhône', lat: 43.5297, lng: 5.4474 },
  { name: 'Arles', postalCode: '13200', department: 'Bouches-du-Rhône', lat: 43.6767, lng: 4.6278 },
  { name: 'Martigues', postalCode: '13500', department: 'Bouches-du-Rhône', lat: 43.4047, lng: 5.0517 },
  { name: 'Aubagne', postalCode: '13400', department: 'Bouches-du-Rhône', lat: 43.2928, lng: 5.5708 },
  { name: 'Salon-de-Provence', postalCode: '13300', department: 'Bouches-du-Rhône', lat: 43.6403, lng: 5.0978 },
  { name: 'Istres', postalCode: '13800', department: 'Bouches-du-Rhône', lat: 43.5136, lng: 4.9878 },
  { name: 'Vitrolles', postalCode: '13127', department: 'Bouches-du-Rhône', lat: 43.4553, lng: 5.2478 },
  { name: 'Marignane', postalCode: '13700', department: 'Bouches-du-Rhône', lat: 43.4178, lng: 5.2156 },
  { name: 'La Ciotat', postalCode: '13600', department: 'Bouches-du-Rhône', lat: 43.1747, lng: 5.6061 },
  { name: 'Châteaurenard', postalCode: '13160', department: 'Bouches-du-Rhône', lat: 43.8831, lng: 4.8528 },
  { name: 'Tarascon', postalCode: '13150', department: 'Bouches-du-Rhône', lat: 43.8056, lng: 4.6606 },
  { name: 'Berre-l\'Étang', postalCode: '13130', department: 'Bouches-du-Rhône', lat: 43.4850, lng: 5.1656 },
  { name: 'Port-de-Bouc', postalCode: '13110', department: 'Bouches-du-Rhône', lat: 43.4058, lng: 4.9864 },
  { name: 'Fos-sur-Mer', postalCode: '13270', department: 'Bouches-du-Rhône', lat: 43.4447, lng: 4.9433 },
  { name: 'Gardanne', postalCode: '13120', department: 'Bouches-du-Rhône', lat: 43.4550, lng: 5.4697 },
  { name: 'Miramas', postalCode: '13140', department: 'Bouches-du-Rhône', lat: 43.5847, lng: 5.0008 },
  { name: 'Les Pennes-Mirabeau', postalCode: '13170', department: 'Bouches-du-Rhône', lat: 43.4106, lng: 5.3097 },
  { name: 'Boulbon', postalCode: '13150', department: 'Bouches-du-Rhône', lat: 43.8519, lng: 4.7111 },
  { name: 'Saint-Rémy-de-Provence', postalCode: '13210', department: 'Bouches-du-Rhône', lat: 43.7889, lng: 4.8319 },
  { name: 'Eyguières', postalCode: '13430', department: 'Bouches-du-Rhône', lat: 43.6958, lng: 5.0311 },
  { name: 'Lambesc', postalCode: '13410', department: 'Bouches-du-Rhône', lat: 43.6544, lng: 5.2622 },
  { name: 'Pélissanne', postalCode: '13330', department: 'Bouches-du-Rhône', lat: 43.6347, lng: 5.1500 },
  { name: 'Rognes', postalCode: '13840', department: 'Bouches-du-Rhône', lat: 43.6642, lng: 5.3461 },
]

/**
 * Récupérer les coordonnées GPS d'une ville par son nom
 */
export function getCityCoordinates(cityName: string): { lat: number; lng: number } | null {
  const city = CITIES.find(c => 
    c.name.toLowerCase() === cityName.toLowerCase()
  )
  return city ? { lat: city.lat, lng: city.lng } : null
}

/**
 * Récupérer la liste de toutes les villes pour les suggestions
 */
export function getCitySuggestions(): string[] {
  return CITIES.map(c => c.name).sort()
}

/**
 * Rechercher une ville (insensible à la casse, recherche partielle)
 */
export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []
  
  return CITIES.filter(city =>
    city.name.toLowerCase().includes(lowerQuery) ||
    city.postalCode.includes(lowerQuery) ||
    city.department.toLowerCase().includes(lowerQuery)
  ).slice(0, 10) // Limiter à 10 résultats
}
