/**
 * Utilitaires de gestion des dates et timezones
 * 
 * ⚠️ SOURCE DE VÉRITÉ UNIQUE POUR L'AFFICHAGE DES HEURES
 * Tous les composants DOIVENT utiliser ces fonctions pour garantir la cohérence.
 */

import { format, parseISO } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

// Timezone de référence pour l'application (France)
export const APP_TIMEZONE = 'Europe/Paris'

/**
 * Formater une heure en timezone Paris (HH:mm)
 * ✅ Utiliser PARTOUT où on affiche une heure de slot
 * 
 * @param isoString - Date ISO (ex: "2026-02-15T07:00:00.000Z" ou "2026-02-15T07:00:00+00:00")
 * @returns Heure formatée en timezone Paris (ex: "08:00")
 * 
 * @example
 * // Slot stocké en UTC : "2026-02-15T07:00:00+00:00"
 * formatTimeInParisTz("2026-02-15T07:00:00+00:00") // => "08:00" (UTC+1)
 */
export function formatTimeInParisTz(isoString: string): string {
  try {
    // Parser la date ISO
    const date = parseISO(isoString)
    
    // Convertir en timezone Paris
    const zonedDate = toZonedTime(date, APP_TIMEZONE)
    
    // Formater HH:mm
    return format(zonedDate, 'HH:mm')
  } catch (error) {
    console.error('[formatTimeInParisTz] Error formatting:', isoString, error)
    return '00:00'
  }
}

/**
 * Formater une date complète en timezone Paris
 * 
 * @param isoString - Date ISO
 * @param formatStr - Format date-fns (défaut: "dd/MM/yyyy HH:mm")
 * @returns Date formatée en timezone Paris
 */
export function formatDateInParisTz(isoString: string, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
  try {
    const date = parseISO(isoString)
    const zonedDate = toZonedTime(date, APP_TIMEZONE)
    return format(zonedDate, formatStr)
  } catch (error) {
    console.error('[formatDateInParisTz] Error formatting:', isoString, error)
    return ''
  }
}

/**
 * Créer un slot_start en UTC depuis une date locale (YYYY-MM-DD) et une heure locale (HH:mm)
 * ✅ Utiliser lors de la CRÉATION de réservations
 * 
 * @param dateStr - Date locale (ex: "2026-02-15")
 * @param timeStr - Heure locale (ex: "08:00")
 * @returns ISO string en UTC (ex: "2026-02-15T07:00:00.000Z")
 * 
 * @example
 * // Créneau à 08:00 heure de Paris
 * createSlotStartUTC("2026-02-15", "08:00") // => "2026-02-15T07:00:00.000Z" (stocké en UTC)
 */
export function createSlotStartUTC(dateStr: string, timeStr: string): string {
  try {
    // Construire une date en timezone Paris
    const [hours, minutes] = timeStr.split(':').map(Number)
    const dateTimeStr = `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
    
    // Parser comme une date en timezone Paris
    const parisDate = fromZonedTime(dateTimeStr, APP_TIMEZONE)
    
    // Retourner en ISO UTC
    return parisDate.toISOString()
  } catch (error) {
    console.error('[createSlotStartUTC] Error creating:', dateStr, timeStr, error)
    throw error
  }
}

/**
 * Calculer slot_end à partir de slot_start (+ 90 minutes)
 * 
 * @param slotStartISO - ISO string du slot_start
 * @returns ISO string du slot_end (slot_start + 90 minutes)
 */
export function calculateSlotEnd(slotStartISO: string): string {
  try {
    const start = parseISO(slotStartISO)
    const end = new Date(start.getTime() + 90 * 60 * 1000) // +90 minutes
    return end.toISOString()
  } catch (error) {
    console.error('[calculateSlotEnd] Error calculating:', slotStartISO, error)
    throw error
  }
}

/**
 * Logger pour debug timezone
 * Affiche une date sous tous ses formats pour diagnostic
 */
export function debugTimezone(label: string, isoString: string): void {
  console.log(`[TIMEZONE DEBUG] ${label}`)
  console.log('  - ISO raw:', isoString)
  console.log('  - Date object:', new Date(isoString))
  console.log('  - UTC:', new Date(isoString).toUTCString())
  console.log('  - Paris (formatTimeInParisTz):', formatTimeInParisTz(isoString))
  console.log('  - toLocaleTimeString:', new Date(isoString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }))
}
