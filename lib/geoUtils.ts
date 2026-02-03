/**
 * Utilitaires de géolocalisation et calcul de distance
 * 
 * Distance: Formule de Haversine (distance orthodromique sur une sphère)
 * Temps de trajet: Estimation basée sur vitesse moyenne en voiture
 * 
 * VITESSE CHOISIE: 30 km/h (moyenne en zone urbaine/périurbaine avec trafic)
 * - Plus réaliste que 50 km/h (trop optimiste)
 * - Prend en compte feux, ronds-points, zones 30, etc.
 */

const EARTH_RADIUS_KM = 6371 // Rayon moyen de la Terre en km
const AVERAGE_SPEED_KMH = 30 // Vitesse moyenne en voiture (zone urbaine)

/**
 * Calcule la distance orthodromique entre deux points GPS (formule de Haversine)
 * 
 * @param lat1 Latitude du point 1 (degrés)
 * @param lng1 Longitude du point 1 (degrés)
 * @param lat2 Latitude du point 2 (degrés)
 * @param lng2 Longitude du point 2 (degrés)
 * @returns Distance en kilomètres (number)
 */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Convertir degrés -> radians
  const toRad = (deg: number) => (deg * Math.PI) / 180

  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = EARTH_RADIUS_KM * c

  return distance
}

/**
 * Formate une distance en km pour l'affichage
 * - < 1 km: affiche en mètres (ex: "850 m")
 * - 1-10 km: 1 décimale (ex: "3.5 km")
 * - >= 10 km: entier (ex: "15 km")
 * 
 * @param km Distance en kilomètres
 * @returns Chaîne formatée (ex: "3.5 km")
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    const meters = Math.round(km * 1000)
    return `${meters} m`
  } else if (km < 10) {
    return `${km.toFixed(1)} km`
  } else {
    return `${Math.round(km)} km`
  }
}

/**
 * Estime le temps de trajet en minutes
 * Basé sur une vitesse moyenne de 30 km/h (zone urbaine avec trafic)
 * 
 * @param km Distance en kilomètres
 * @returns Temps estimé en minutes (number arrondi)
 */
export function estimateMinutes(km: number): number {
  const minutes = (km / AVERAGE_SPEED_KMH) * 60
  
  // Si < 1 min, retourner 1 (pour afficher "<1 min")
  if (minutes < 1) {
    return 0
  }
  
  return Math.round(minutes)
}

/**
 * Formate le temps de trajet pour l'affichage en voiture
 * 
 * @param minutes Temps en minutes
 * @returns Chaîne formatée (ex: "🚗 ~15 min", "🚗 ~1h10", "🚗 <1 min")
 */
export function formatTravelTime(minutes: number): string {
  if (minutes === 0) {
    return '🚗 <1 min'
  }
  
  // Si >= 60 minutes, afficher en heures et minutes
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) {
      return `🚗 ~${hours}h`
    }
    return `🚗 ~${hours}h${mins.toString().padStart(2, '0')}`
  }
  
  return `🚗 ~${minutes} min`
}
