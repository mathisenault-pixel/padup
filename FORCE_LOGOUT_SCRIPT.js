/**
 * SCRIPT DE FORCE LOGOUT
 * 
 * À copier-coller dans la console du navigateur (F12)
 * pour forcer une déconnexion complète
 */

(async function forceLogout() {
  console.log('🚀 DÉMARRAGE DU FORCE LOGOUT...')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  try {
    // 1. Vérifier si Supabase est disponible
    if (typeof window.supabaseBrowser === 'undefined') {
      console.log('⚠️ Supabase client non trouvé dans window.supabaseBrowser')
      console.log('🔄 Tentative de création...')
      
      // Importer dynamiquement si nécessaire
      const { supabaseBrowser } = await import('./lib/supabaseBrowser')
      window.supabaseBrowser = supabaseBrowser
      console.log('✅ Supabase client créé')
    }
    
    const supabase = window.supabaseBrowser
    
    // 2. Vérifier la session actuelle
    console.log('')
    console.log('📊 ÉTAT ACTUEL')
    console.log('━━━━━━━━━━━━━━')
    const { data: { session: beforeSession } } = await supabase.auth.getSession()
    
    if (beforeSession) {
      console.log('✅ Session active trouvée')
      console.log('   User ID:', beforeSession.user.id)
      console.log('   Email:', beforeSession.user.email)
    } else {
      console.log('❌ Pas de session active')
    }
    
    // 3. Afficher les cookies
    console.log('')
    console.log('🍪 COOKIES AVANT NETTOYAGE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━')
    const cookiesBefore = document.cookie.split(';')
    const supabaseCookies = cookiesBefore.filter(c => c.includes('sb-'))
    if (supabaseCookies.length > 0) {
      console.log(`✅ ${supabaseCookies.length} cookie(s) Supabase trouvé(s):`)
      supabaseCookies.forEach(c => console.log('  -', c.trim().substring(0, 50) + '...'))
    } else {
      console.log('❌ Aucun cookie Supabase')
    }
    
    // 4. Afficher le storage
    console.log('')
    console.log('💾 STORAGE AVANT NETTOYAGE')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('localStorage items:', localStorage.length)
    console.log('sessionStorage items:', sessionStorage.length)
    
    // 5. FORCE LOGOUT
    console.log('')
    console.log('🔥 NETTOYAGE COMPLET')
    console.log('━━━━━━━━━━━━━━━━━━━')
    
    // 5.1. SignOut Supabase
    console.log('1️⃣ Déconnexion Supabase (scope: global)...')
    const { error: signOutError } = await supabase.auth.signOut({ scope: 'global' })
    
    if (signOutError) {
      console.error('   ❌ Erreur signOut:', signOutError.message)
    } else {
      console.log('   ✅ SignOut réussi')
    }
    
    // 5.2. Vérifier que la session est supprimée
    const { data: { session: afterSignOut } } = await supabase.auth.getSession()
    if (afterSignOut) {
      console.warn('   ⚠️ Session encore présente après signOut!')
    } else {
      console.log('   ✅ Session bien supprimée')
    }
    
    // 5.3. Clear localStorage
    console.log('2️⃣ Nettoyage localStorage...')
    const localStorageLength = localStorage.length
    localStorage.clear()
    console.log(`   ✅ ${localStorageLength} items supprimés`)
    
    // 5.4. Clear sessionStorage
    console.log('3️⃣ Nettoyage sessionStorage...')
    const sessionStorageLength = sessionStorage.length
    sessionStorage.clear()
    console.log(`   ✅ ${sessionStorageLength} items supprimés`)
    
    // 5.5. Supprimer les cookies manuellement (au cas où)
    console.log('4️⃣ Suppression cookies Supabase...')
    const cookiesAfter = document.cookie.split(';')
    let cookiesRemoved = 0
    cookiesAfter.forEach(cookie => {
      const cookieName = cookie.split('=')[0].trim()
      if (cookieName.includes('sb-')) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
        cookiesRemoved++
      }
    })
    console.log(`   ✅ ${cookiesRemoved} cookie(s) supprimé(s)`)
    
    // 6. VÉRIFICATION FINALE
    console.log('')
    console.log('🔍 VÉRIFICATION FINALE')
    console.log('━━━━━━━━━━━━━━━━━━━━━')
    
    const { data: { session: finalSession } } = await supabase.auth.getSession()
    console.log('Session:', finalSession ? '⚠️ ENCORE PRÉSENTE' : '✅ BIEN SUPPRIMÉE')
    console.log('localStorage:', localStorage.length === 0 ? '✅ VIDE' : '⚠️ ENCORE DES ITEMS')
    console.log('sessionStorage:', sessionStorage.length === 0 ? '✅ VIDE' : '⚠️ ENCORE DES ITEMS')
    
    const finalCookies = document.cookie.split(';').filter(c => c.includes('sb-'))
    console.log('Cookies Supabase:', finalCookies.length === 0 ? '✅ SUPPRIMÉS' : '⚠️ ENCORE PRÉSENTS')
    
    // 7. REDIRECTION
    console.log('')
    console.log('🚀 REDIRECTION')
    console.log('━━━━━━━━━━━━━')
    console.log('Redirection vers /club dans 2 secondes...')
    
    setTimeout(() => {
      console.log('✅ GO!')
      window.location.replace('/club')
    }, 2000)
    
  } catch (error) {
    console.error('')
    console.error('❌ ERREUR FATALE')
    console.error('━━━━━━━━━━━━━━')
    console.error(error)
    console.error('')
    console.error('🔄 Tentative de redirection quand même...')
    
    // Redirection de secours
    setTimeout(() => {
      window.location.replace('/club')
    }, 2000)
  }
})()
