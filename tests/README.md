# 🧪 Tests de Sécurité

## 📋 Vue d'ensemble

Les tests de sécurité valident que toutes les routes privées sont correctement protégées et que les redirections fonctionnent comme prévu.

**Couverture :**
- ✅ Routes publiques accessibles
- ✅ Routes privées protégées
- ✅ Redirections correctes
- ✅ Séparation des rôles (player/club)

---

## 🚀 Exécution des tests

### Prérequis

1. Le serveur Next.js doit être démarré :
```bash
npm run dev
```

2. Le serveur doit être accessible sur `http://localhost:3000` (par défaut)

### Commandes

**Exécuter tous les tests de sécurité :**
```bash
npm run test:security
```

**Exécuter tous les tests (alias) :**
```bash
npm test
```

**Avec une URL personnalisée :**
```bash
TEST_BASE_URL=http://localhost:3001 npm run test:security
```

---

## 📊 Résultats attendus

### Exemple de sortie réussie

```
TAP version 13
# Routes publiques
ok 1 - / doit rediriger vers /player/accueil
ok 2 - /player/accueil doit être accessible sans auth
ok 3 - /login doit être accessible sans auth

# Routes privées - Protection
ok 4 - /player/reservations doit rediriger vers /login sans auth
ok 5 - /player/clubs doit rediriger vers /login sans auth
ok 6 - /player/messages doit rediriger vers /login sans auth
ok 7 - /player/profil doit rediriger vers /login sans auth
ok 8 - /club/accueil doit rediriger vers /club/login sans auth
ok 9 - /club/dashboard doit rediriger vers /club/login sans auth

# Redirections
ok 10 - /account doit rediriger vers /player/accueil

# Statistiques de sécurité
📊 Statistiques de sécurité:
   - Routes publiques: 6
   - Routes privées player: 6
   - Routes privées club: 7
   - Total: 19
   - Taux de protection: 100%

ok 11 - Résumé des routes

✅ Tests de sécurité terminés

📖 Documentation complète disponible dans SECURITY_ROUTES.md

1..11
# tests 11
# pass 11
# fail 0
```

---

## 🧪 Tests inclus

### 1. Routes publiques (3 tests)

- ✅ `/` redirige vers `/player/accueil`
- ✅ `/player/accueil` accessible sans auth
- ✅ `/login` accessible sans auth

### 2. Routes privées - Protection (6 tests)

- ✅ `/player/reservations` → redirect `/login`
- ✅ `/player/clubs` → redirect `/login`
- ✅ `/player/messages` → redirect `/login`
- ✅ `/player/profil` → redirect `/login`
- ✅ `/club/accueil` → redirect `/club/login`
- ✅ `/club/dashboard` → redirect `/club/login`

### 3. Redirections (1 test)

- ✅ `/account` → redirect `/player/accueil`

### 4. Statistiques (1 test)

- ✅ Affichage des statistiques de sécurité

**Total : 11 tests**

---

## 🔧 Configuration

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `TEST_BASE_URL` | URL du serveur à tester | `http://localhost:3000` |
| `NODE_ENV` | Environnement | `development` |

### Personnalisation

Pour tester sur un autre port ou URL :

```bash
TEST_BASE_URL=https://staging.example.com npm run test:security
```

---

## 🐛 Débogage

### Les tests échouent ?

**1. Vérifier que le serveur est démarré**
```bash
curl http://localhost:3000
```

**2. Vérifier les logs du middleware**
```bash
# En dev, les logs s'affichent dans la console
[SECURITY] Non-authenticated user trying to access /player/reservations → redirect to /login
```

**3. Vérifier la configuration Supabase**
```bash
# Les variables d'environnement doivent être définies
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

**4. Build propre**
```bash
npm run build
npm start
```

---

## 📝 Ajouter de nouveaux tests

### Structure d'un test

```javascript
it('description du test', async () => {
  const response = await fetchWithRedirect(`${BASE_URL}/route`)
  
  // Assertions
  assert.strictEqual(response.redirected, true)
  assert.ok(response.location?.includes('/expected'))
})
```

### Helper disponible

```javascript
async function fetchWithRedirect(url, options = {})
```

**Retourne :**
```javascript
{
  status: 200,           // Code HTTP
  location: '/path',     // Header Location (si redirect)
  ok: true,              // Status 2xx
  redirected: true,      // Status 3xx
}
```

---

## 🎯 Intégration continue (CI)

### GitHub Actions

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm run build
      - run: npm start &
      - run: sleep 5
      - run: npm run test:security
```

---

## 📚 Documentation liée

- `SECURITY_ROUTES.md` - Documentation complète des routes et règles
- `SECURITY_TESTS.md` - Scénarios de test détaillés
- `middleware.ts` - Implémentation de la protection

---

## ✅ Checklist avant déploiement

- [ ] Tous les tests passent (`npm test`)
- [ ] Build réussit (`npm run build`)
- [ ] Documentation à jour (`SECURITY_ROUTES.md`)
- [ ] Variables d'environnement configurées
- [ ] Logs désactivés en production (`NODE_ENV=production`)

---

## 🔗 Liens utiles

- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

**Dernière mise à jour :** 2024-12-18  
**Version :** 1.0.0











