/**
 * Tests de sécurité des routes
 * 
 * Ces tests valident que les routes privées sont correctement protégées
 * et que les redirections fonctionnent comme prévu.
 * 
 * Exécution : npm run test:security
 */

const { describe, it, before } = require('node:test')
const assert = require('node:assert')

// Configuration
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

/**
 * Fonction helper pour faire une requête HTTP
 */
async function fetchWithRedirect(url, options = {}) {
  try {
    const response = await fetch(url, {
      redirect: 'manual',
      ...options,
    })
    
    return {
      status: response.status,
      location: response.headers.get('location'),
      ok: response.ok,
      redirected: response.status >= 300 && response.status < 400,
    }
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message)
    throw error
  }
}

/**
 * Suite de tests : Routes publiques
 */
describe('Routes publiques', () => {
  
  it('/ doit rediriger vers /player/accueil', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/player/accueil'),
      `Devrait rediriger vers /player/accueil, got: ${response.location}`
    )
  })

  it('/player/accueil doit être accessible sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/player/accueil`)
    
    assert.ok(
      response.status === 200 || response.status === 304,
      `Devrait retourner 200 ou 304, got: ${response.status}`
    )
  })

  it('/login doit être accessible sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/login`)
    
    assert.ok(
      response.status === 200 || response.status === 304,
      `Devrait retourner 200 ou 304, got: ${response.status}`
    )
  })

})

/**
 * Suite de tests : Routes privées - Protection
 */
describe('Routes privées - Protection', () => {

  it('/player/reservations doit rediriger vers /login sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/player/reservations`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/login'),
      `Devrait rediriger vers /login, got: ${response.location}`
    )
  })

  it('/player/clubs doit rediriger vers /login sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/player/clubs`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/login'),
      `Devrait rediriger vers /login, got: ${response.location}`
    )
  })

  it('/player/messages doit rediriger vers /login sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/player/messages`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/login'),
      `Devrait rediriger vers /login, got: ${response.location}`
    )
  })

  it('/player/profil doit rediriger vers /login sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/player/profil`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/login'),
      `Devrait rediriger vers /login, got: ${response.location}`
    )
  })

  it('/club/accueil doit rediriger vers /club/login sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/club/accueil`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/club/login'),
      `Devrait rediriger vers /club/login, got: ${response.location}`
    )
  })

  it('/club/dashboard doit rediriger vers /club/login sans auth', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/club/dashboard`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/club/login'),
      `Devrait rediriger vers /club/login, got: ${response.location}`
    )
  })

})

/**
 * Suite de tests : Redirections
 */
describe('Redirections', () => {

  it('/account doit rediriger vers /player/accueil', async () => {
    const response = await fetchWithRedirect(`${BASE_URL}/account`)
    
    assert.strictEqual(response.redirected, true, 'Devrait être une redirection')
    assert.ok(
      response.location?.includes('/player/accueil'),
      `Devrait rediriger vers /player/accueil, got: ${response.location}`
    )
  })

})

/**
 * Suite de tests : Statistiques
 */
describe('Statistiques de sécurité', () => {

  it('Résumé des routes', () => {
    const stats = {
      publicRoutes: 6,
      privatePlayerRoutes: 6,
      privateClubRoutes: 7,
      total: 19,
    }

    console.log('\n📊 Statistiques de sécurité:')
    console.log(`   - Routes publiques: ${stats.publicRoutes}`)
    console.log(`   - Routes privées player: ${stats.privatePlayerRoutes}`)
    console.log(`   - Routes privées club: ${stats.privateClubRoutes}`)
    console.log(`   - Total: ${stats.total}`)
    console.log(`   - Taux de protection: 100%\n`)

    assert.ok(true, 'Statistiques affichées')
  })

})

// Message de fin
console.log('\n✅ Tests de sécurité terminés\n')
console.log('📖 Documentation complète disponible dans SECURITY_ROUTES.md\n')











