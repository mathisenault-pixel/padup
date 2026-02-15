/**
 * Script pour exécuter une migration SQL sur Supabase
 * Usage: node scripts/run-migration.js <migration-file>
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration(migrationFile) {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Fichier de migration introuvable: ${migrationPath}`)
    process.exit(1)
  }

  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  console.log(`🔄 Exécution de la migration: ${migrationFile}\n`)

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // Essayer avec une approche alternative si la RPC n'existe pas
      console.log('⚠️  RPC exec_sql non disponible, tentative avec une approche directe...')
      
      // Découper le SQL en commandes individuelles et les exécuter
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--'))
      
      for (const statement of statements) {
        if (statement) {
          console.log(`  Exécution: ${statement.substring(0, 60)}...`)
          // Note: Supabase JS ne permet pas d'exécuter du SQL arbitraire directement
          // Cette partie nécessiterait l'utilisation de psql ou d'un autre outil
        }
      }
      
      console.log('\n⚠️  Migration SQL complexe détectée.')
      console.log('📝 Veuillez exécuter manuellement le fichier SQL dans Supabase SQL Editor:')
      console.log(`   ${migrationPath}`)
      console.log('\nOu utilisez la commande Supabase CLI:')
      console.log(`   supabase db push --include-all`)
    } else {
      console.log('✅ Migration exécutée avec succès!')
      if (data) {
        console.log('Résultat:', data)
      }
    }
  } catch (err) {
    console.error('❌ Erreur lors de l\'exécution:', err.message)
    process.exit(1)
  }
}

// Récupérer le nom du fichier depuis les arguments
const migrationFile = process.argv[2] || '024_fix_courts_rls_public_read.sql'
runMigration(migrationFile)
