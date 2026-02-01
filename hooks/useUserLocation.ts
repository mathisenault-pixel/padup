'use client'

import { useState, useEffect } from 'react'

/**
 * Hook de géolocalisation utilisateur avec cache localStorage
 * 
 * TTL: 10 minutes (600000ms) - les coords ne changent pas souvent pendant une session
 * Options: enableHighAccuracy pour position GPS précise
 * 
 * @returns {status, coords, error, requestLocation}
 * - status: 'idle' | 'loading' | 'ready' | 'error'
 * - coords: { lat, lng } | null
 * - error: GeolocationPositionError | null
 * - requestLocation: fonction pour forcer une nouvelle demande
 */

type UserLocation = {
  lat: number
  lng: number
}

type CachedLocation = {
  lat: number
  lng: number
  ts: number // timestamp
}

type LocationStatus = 'idle' | 'loading' | 'ready' | 'error'

const CACHE_KEY = 'user_location_cache'
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export function useUserLocation() {
  const [status, setStatus] = useState<LocationStatus>('idle')
  const [coords, setCoords] = useState<UserLocation | null>(null)
  const [error, setError] = useState<GeolocationPositionError | null>(null)

  const requestLocation = () => {
    // Vérifier que l'API est disponible
    if (typeof window === 'undefined' || !navigator.geolocation) {
      console.error('[useUserLocation] Geolocation API not available')
      setStatus('error')
      return
    }

    setStatus('loading')
    setError(null)

    // Options de géolocalisation
    const options: PositionOptions = {
      enableHighAccuracy: true, // GPS précis (peut prendre plus de temps)
      timeout: 8000, // 8 secondes max
      maximumAge: 600000 // Cache navigateur: 10 minutes
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newCoords: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        const cached: CachedLocation = {
          ...newCoords,
          ts: Date.now()
        }

        // Sauvegarder dans localStorage
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
        } catch (e) {
          console.warn('[useUserLocation] Failed to cache location', e)
        }

        setCoords(newCoords)
        setStatus('ready')
        console.log('[useUserLocation] ✅ Position obtained:', newCoords)
      },
      (err) => {
        console.error('[useUserLocation] ❌ Error:', err.message)
        setError(err)
        setStatus('error')
      },
      options
    )
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Vérifier le cache d'abord
    try {
      const cachedStr = localStorage.getItem(CACHE_KEY)
      if (cachedStr) {
        const cached: CachedLocation = JSON.parse(cachedStr)
        const age = Date.now() - cached.ts

        // Si le cache est valide (< 10 min)
        if (age < CACHE_TTL) {
          console.log('[useUserLocation] Using cached location (age:', Math.round(age / 1000), 's)')
          setCoords({ lat: cached.lat, lng: cached.lng })
          setStatus('ready')
          return
        } else {
          console.log('[useUserLocation] Cache expired, requesting fresh location')
        }
      }
    } catch (e) {
      console.warn('[useUserLocation] Failed to read cache', e)
    }

    // Pas de cache valide -> demander la position
    requestLocation()
  }, []) // Mount uniquement

  return {
    status,
    coords,
    error,
    requestLocation
  }
}
