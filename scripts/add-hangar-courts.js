/**
 * Script pour ajouter les 6 terrains du club Le Hangar
 * Exécution : node scripts/add-hangar-courts.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function addHangarCourts() {
  console.log('🏟️  Ajout des terrains pour Le Hangar...\n')

  // 1️⃣ Récupérer l'ID du club Hangar
  const { data: club, error: clubError } = await supabase
    .from('clubs')
    .select('id, name')
    .eq('club_code', 'HANGAR1')
    .single()

  if (clubError || !club) {
    console.error('❌ Club HANGAR1 introuvable:', clubError?.message)
    return
  }

  console.log(`✅ Club trouvé: ${club.name} (ID: ${club.id})\n`)

  // 2️⃣ Vérifier si des terrains existent déjà
  const { data: existingCourts } = await supabase
    .from('courts')
    .select('id, name')
    .eq('club_id', club.id)

  if (existingCourts && existingCourts.length > 0) {
    console.log(`ℹ️  Le club a déjà ${existingCourts.length} terrain(s):`)
    existingCourts.forEach(court => console.log(`   - ${court.name}`))
    console.log('\n⚠️  Annulation pour éviter les doublons.')
    return
  }

  // 3️⃣ Créer les 6 terrains
  const courts = [
    {
      club_id: club.id,
      name: 'Terrain 1',
      type: 'padel',
      description: 'Terrain couvert avec éclairage LED',
      surface: 'gazon synthétique',
      lighting: true,
      covered: true,
      is_active: true
    },
    {
      club_id: club.id,
      name: 'Terrain 2',
      type: 'padel',
      description: 'Terrain couvert avec éclairage LED',
      surface: 'gazon synthétique',
      lighting: true,
      covered: true,
      is_active: true
    },
    {
      club_id: club.id,
      name: 'Terrain 3',
      type: 'padel',
      description: 'Terrain couvert avec éclairage LED',
      surface: 'gazon synthétique',
      lighting: true,
      covered: true,
      is_active: true
    },
    {
      club_id: club.id,
      name: 'Terrain 4',
      type: 'padel',
      description: 'Terrain couvert avec éclairage LED',
      surface: 'gazon synthétique',
      lighting: true,
      covered: true,
      is_active: true
    },
    {
      club_id: club.id,
      name: 'Terrain 5',
      type: 'padel',
      description: 'Terrain couvert avec éclairage LED',
      surface: 'gazon synthétique',
      lighting: true,
      covered: true,
      is_active: true
    },
    {
      club_id: club.id,
      name: 'Terrain 6',
      type: 'padel',
      description: 'Terrain couvert avec éclairage LED',
      surface: 'gazon synthétique',
      lighting: true,
      covered: true,
      is_active: true
    }
  ]

  const { data: insertedCourts, error: insertError } = await supabase
    .from('courts')
    .insert(courts)
    .select()

  if (insertError) {
    console.error('❌ Erreur lors de l\'insertion:', insertError.message)
    return
  }

  console.log(`✅ ${insertedCourts.length} terrains ajoutés avec succès!\n`)
  insertedCourts.forEach(court => {
    console.log(`   ✓ ${court.name}`)
  })

  console.log('\n🎉 Terminé!')
}

addHangarCourts()
  .catch(err => {
    console.error('❌ Erreur:', err)
    process.exit(1)
  })
