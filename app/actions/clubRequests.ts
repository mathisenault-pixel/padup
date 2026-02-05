'use server'

import { supabase } from '@/lib/supabaseClient'

export type ClubRequestData = {
  clubName: string
  city: string
  contactName: string
  contactPhone: string
  contactEmail: string
  numCourts?: number
  website?: string
  message?: string
  acceptContact?: boolean
}

export type ClubRequestResult = {
  success: boolean
  error?: string
  requestId?: string
}

/**
 * Server Action: Créer une demande d'accès club
 * Stocke dans la table club_requests
 * 
 * ⚠️ Rate limiting à ajouter en PROD (ex: max 3 demandes/IP/heure)
 */
export async function createClubRequest(data: ClubRequestData): Promise<ClubRequestResult> {
  try {
    // Validation basique
    if (!data.clubName || !data.city || !data.contactName || !data.contactPhone || !data.contactEmail) {
      return {
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis',
      }
    }

    // Validation checkbox acceptContact (RGPD)
    if (!data.acceptContact) {
      return {
        success: false,
        error: 'Vous devez accepter d\'être recontacté pour envoyer votre demande',
      }
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.contactEmail)) {
      return {
        success: false,
        error: 'Email invalide',
      }
    }

    // Validation téléphone (basique)
    const phoneRegex = /^[\d\s+()-]{8,}$/
    if (!phoneRegex.test(data.contactPhone)) {
      return {
        success: false,
        error: 'Numéro de téléphone invalide',
      }
    }

    // Insérer dans Supabase
    const { data: insertData, error: insertError } = await supabase
      .from('club_requests')
      .insert([
        {
          club_name: data.clubName,
          city: data.city,
          contact_name: data.contactName,
          contact_phone: data.contactPhone,
          contact_email: data.contactEmail,
          num_courts: data.numCourts || null,
          website: data.website || null,
          message: data.message || null,
          accept_contact: data.acceptContact,
          status: 'pending',
        },
      ])
      .select('id')
      .single()

    if (insertError) {
      console.error('[Club Request] Database error:', insertError)
      return {
        success: false,
        error: 'Erreur lors de l\'enregistrement de votre demande',
      }
    }

    console.log('[Club Request] ✅ Created:', insertData.id)

    // TODO (optionnel): Envoyer email de notification à contact@padup.one
    // Pour MVP: on vérifie juste la DB

    return {
      success: true,
      requestId: insertData.id,
    }
  } catch (error) {
    console.error('[Club Request] Unexpected error:', error)
    return {
      success: false,
      error: 'Une erreur inattendue s\'est produite',
    }
  }
}
