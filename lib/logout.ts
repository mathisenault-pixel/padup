/**
 * FONCTION UNIQUE DE DÉCONNEXION
 * Source de vérité pour tous les logouts de l'application
 * 
 * RÈGLE ABSOLUE: Redirect UNIQUEMENT vers /club (JAMAIS /club/login)
 */

"use client"

import { supabaseBrowser } from "@/lib/supabaseBrowser"

export async function logout() {
  console.log('[LOGOUT] 🔥 DÉBUT DÉCONNEXION - BUILD 2026-02-15-01')
  
  try {
    // 1. Supabase signOut (scope: global pour tout effacer)
    const { error } = await supabaseBrowser.auth.signOut({ scope: 'global' })
    
    if (error) {
      console.error('[LOGOUT] ❌ Erreur signOut:', error)
    } else {
      console.log('[LOGOUT] ✅ SignOut Supabase réussi')
    }
    
    // 2. Nettoyage localStorage (au cas où)
    try {
      localStorage.removeItem("club")
      localStorage.removeItem("supabase.auth.token")
      console.log('[LOGOUT] ✅ localStorage nettoyé')
    } catch (e) {
      console.warn('[LOGOUT] ⚠️ Erreur nettoyage localStorage:', e)
    }
    
    // 3. Vérification que la session est bien supprimée
    const { data: { session } } = await supabaseBrowser.auth.getSession()
    if (session) {
      console.warn('[LOGOUT] ⚠️ Session encore présente après signOut!')
    } else {
      console.log('[LOGOUT] ✅ Session bien supprimée')
    }
    
  } catch (error) {
    console.error('[LOGOUT] ❌ Erreur inattendue:', error)
  }
  
  // 4. Redirection HARD vers /club (window.location.assign force reload complet)
  console.log('[LOGOUT] 🚀 REDIRECTION VERS /club (PAS /club/login)')
  console.log('[LOGOUT] 📍 window.location.assign("/club")')
  window.location.assign("/club")
}
