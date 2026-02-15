/**
 * Script de correction du timezone des bookings
 * 
 * PROBLÈME: Les bookings ont slot_start/slot_end stockés à l'heure locale + UTC
 * Ex: 08:00 Paris stocké comme "08:00:00+00:00" (08:00 UTC) ❌
 * 
 * ATTENDU: 08:00 Paris devrait être "07:00:00+00:00" (07:00 UTC car Paris = UTC+1) ✅
 * 
 * CORRECTION: Soustraire 1 heure à tous les bookings
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Variables d\'environnement manquantes:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async function main() {
  console.log('🔍 Récupération des bookings...\n')
  
  // Récupérer tous les bookings
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, slot_start, slot_end, status, created_at')
    .order('slot_start', { ascending: true })
  
  if (error) {
    console.error('❌ Erreur lors de la récupération:', error)
    process.exit(1)
  }
  
  if (!bookings || bookings.length === 0) {
    console.log('✅ Aucun booking à corriger')
    return
  }
  
  console.log(`📊 ${bookings.length} bookings trouvés\n`)
  
  // Afficher un aperçu des corrections
  console.log('📋 APERÇU DES CORRECTIONS (premiers 5):')
  console.log('─'.repeat(80))
  
  bookings.slice(0, 5).forEach((b, idx) => {
    const oldStart = new Date(b.slot_start)
    const newStart = new Date(oldStart.getTime() - 60 * 60 * 1000) // -1 heure
    
    const oldEnd = new Date(b.slot_end)
    const newEnd = new Date(oldEnd.getTime() - 60 * 60 * 1000) // -1 heure
    
    console.log(`\n${idx + 1}. Booking ID: ${b.id.substring(0, 8)}...`)
    console.log(`   slot_start:`)
    console.log(`     Avant:  ${b.slot_start} (UTC: ${oldStart.toUTCString()})`)
    console.log(`     Après:  ${newStart.toISOString()} (UTC: ${newStart.toUTCString()})`)
    console.log(`   slot_end:`)
    console.log(`     Avant:  ${b.slot_end} (UTC: ${oldEnd.toUTCString()})`)
    console.log(`     Après:  ${newEnd.toISOString()} (UTC: ${newEnd.toUTCString()})`)
  })
  
  console.log('\n' + '─'.repeat(80))
  console.log(`\n⚠️  ${bookings.length} bookings seront modifiés`)
  console.log('⚠️  Cette opération est IRRÉVERSIBLE (sans backup)')
  console.log('\n💡 Pour confirmer, relancez avec: node scripts/fix-timezone-bookings.js --confirm\n')
  
  // Vérifier si on doit vraiment appliquer
  if (!process.argv.includes('--confirm')) {
    console.log('ℹ️  Mode PREVIEW uniquement (aucune modification appliquée)')
    return
  }
  
  console.log('\n🚀 APPLICATION DES CORRECTIONS...\n')
  
  // Appliquer les corrections
  let successCount = 0
  let errorCount = 0
  
  for (const booking of bookings) {
    const oldStart = new Date(booking.slot_start)
    const newStart = new Date(oldStart.getTime() - 60 * 60 * 1000)
    
    const oldEnd = new Date(booking.slot_end)
    const newEnd = new Date(oldEnd.getTime() - 60 * 60 * 1000)
    
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        slot_start: newStart.toISOString(),
        slot_end: newEnd.toISOString()
      })
      .eq('id', booking.id)
    
    if (updateError) {
      console.error(`❌ Erreur pour ${booking.id}:`, updateError.message)
      errorCount++
    } else {
      successCount++
      process.stdout.write(`✅ ${successCount}/${bookings.length}\r`)
    }
  }
  
  console.log(`\n\n✅ TERMINÉ !`)
  console.log(`   Succès: ${successCount}`)
  console.log(`   Erreurs: ${errorCount}`)
  
  if (errorCount === 0) {
    console.log('\n🎉 Tous les bookings ont été corrigés avec succès !')
    console.log('🔄 Redémarrez l\'application pour voir les changements.')
  } else {
    console.log('\n⚠️  Certains bookings n\'ont pas pu être corrigés')
    console.log('   Vérifiez les erreurs ci-dessus')
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Erreur fatale:', err)
    process.exit(1)
  })
