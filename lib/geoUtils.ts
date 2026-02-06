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

// ============================================
// API OSRM pour temps de trajet réel en voiture
// ============================================

// Cache en mémoire pour éviter de spammer l'API
const osrmCache = new Map<string, { km: number; min: number }>()

/**
 * Obtient le temps de trajet réel en voiture via l'API OSRM
 * Avec fallback sur estimation Haversine si l'API échoue
 * 
 * @param userLat Latitude utilisateur
 * @param userLon Longitude utilisateur
 * @param placeLat Latitude destination
 * @param placeLon Longitude destination
 * @returns Promise<{ km: number; min: number }> Distance en km et temps en minutes
 */
export async function getDrivingMetrics(
  userLat: number,
  userLon: number,
  placeLat: number,
  placeLon: number
): Promise<{ km: number; min: number }> {
  // Créer une clé de cache basée sur les coordonnées arrondies (3 décimales = ~100m précision)
  const cacheKey = `${userLat.toFixed(3)},${userLon.toFixed(3)}->${placeLat.toFixed(3)},${placeLon.toFixed(3)}`
  
  // Vérifier le cache
  const cached = osrmCache.get(cacheKey)
  if (cached) {
    return cached
  }
  
  try {
    // Appel OSRM avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5s timeout
    
    const url = `https://router.project-osrm.org/route/v1/driving/${userLon},${userLat};${placeLon},${placeLat}?overview=false`
    
    const response = await fetch(url, {
      signal: controller.signal,
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('OSRM: No route found')
    }
    
    const route = data.routes[0]
    const distanceMeters = route.distance // en mètres
    const durationSeconds = route.duration // en secondes
    
    const km = Math.round((distanceMeters / 1000) * 10) / 10 // Arrondi à 1 décimale
    const min = Math.round(durationSeconds / 60)
    
    const result = { km, min }
    
    // Mettre en cache
    osrmCache.set(cacheKey, result)
    
    return result
  } catch (error) {
    // Fallback : calcul Haversine + estimation temps
    console.warn('[OSRM] Fallback to Haversine:', error)
    
    const km = Math.round(haversineKm(userLat, userLon, placeLat, placeLon) * 10) / 10
    const min = estimateMinutes(km)
    
    const result = { km, min }
    
    // Mettre en cache le fallback aussi
    osrmCache.set(cacheKey, result)
    
    return result
  }
}

/**
 * Formate l'affichage de la distance et du temps de trajet
 * 
 * @param km Distance en kilomètres
 * @param min Temps en minutes
 * @returns Chaîne formatée (ex: "4,8 km • 12 min en voiture")
 */
export function formatDrivingInfo(km: number, min: number): string {
  const kmStr = km < 10 ? km.toFixed(1).replace('.', ',') : Math.round(km).toString()
  return `${kmStr} km • ${min} min en voiture`
}
