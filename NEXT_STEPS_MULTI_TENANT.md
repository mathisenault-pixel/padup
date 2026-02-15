# 🎯 Multi-tenant : Prochaines étapes

## ✅ Ce qui est terminé

### 1. Base de données
- ✅ Migration SQL créée : `supabase/migrations/020_multi_tenant_setup.sql`
- ✅ Colonnes `club_id` sur toutes les tables (courts, bookings, products)
- ✅ Foreign keys vers `clubs(id)` avec CASCADE
- ✅ Backfill automatique des données existantes
- ✅ Contrainte NOT NULL sur `club_id`
- ✅ Index de performance

### 2. Frontend
- ✅ Helpers créés : `lib/clubHelpers.ts`
- ✅ Pages mises à jour :
  - `/club/login` - Stocke le club en localStorage
  - `/club/dashboard` - Affiche les infos du club
  - `/club/courts` - CRUD complet avec filtrage par club_id
  - `/club/bookings` - Liste des réservations filtrées
  - `/club/planning` - Planning avec club_id

### 3. Documentation
- ✅ `docs/CLUB_MULTI_TENANT.md` - Guide complet
- ✅ `CLUB_MULTI_TENANT_SETUP.md` - Résumé de la mise en place
- ✅ `MULTI_TENANT_IMPLEMENTATION.md` - Documentation technique complète

---

## 🚀 Action immédiate : Appliquer la migration

### Étape 1 : Ouvrir Supabase SQL Editor

1. Aller sur https://supabase.com
2. Sélectionner ton projet
3. Aller dans "SQL Editor"

### Étape 2 : Exécuter la migration

1. Copier le contenu du fichier `supabase/migrations/020_multi_tenant_setup.sql`
2. Coller dans le SQL Editor
3. Cliquer sur "Run"

### Étape 3 : Vérifier le résultat

Tu devrais voir des messages de confirmation comme :

```
========================================
✅ Migration 020: Multi-tenant Setup
========================================
Courts: X enregistrements (0 NULL)
Bookings: X enregistrements (0 NULL)
Products: X enregistrements (0 NULL)
========================================
✅ Toutes les données sont liées à un club !
```

---

## 🧪 Tests à effectuer

### Test 1 : Connexion club
```
URL: http://localhost:3000/club/login
Identifiant: PADUP-XXXX
Mot de passe: ton_mot_de_passe
```

✅ Devrait rediriger vers `/club/dashboard`

### Test 2 : Dashboard
```
URL: http://localhost:3000/club/dashboard
```

✅ Devrait afficher :
- Nom du club
- Ville
- Code club
- Menu avec 3 sections (Terrains, Réservations, Produits)

### Test 3 : Gestion des terrains
```
URL: http://localhost:3000/club/courts
```

✅ Tester :
- Créer un terrain
- Voir la liste des terrains
- Activer/désactiver un terrain
- Supprimer un terrain

✅ Vérifier que seuls les terrains du club connecté sont affichés

### Test 4 : Réservations
```
URL: http://localhost:3000/club/bookings
```

✅ Tester :
- Voir les réservations
- Filtrer par date
- Filtrer par terrain
- Filtrer par statut

✅ Vérifier que seules les réservations du club connecté sont affichées

### Test 5 : Isolation des données
1. Se connecter avec le club A
2. Créer des terrains
3. Se déconnecter
4. Se connecter avec le club B
5. ✅ Vérifier que les terrains du club A ne sont PAS visibles

---

## 📊 Vérification en base de données

### Requête SQL pour vérifier l'isolation

```sql
-- Voir tous les terrains avec leur club
SELECT 
  c.name as court_name,
  cl.name as club_name,
  cl.club_code
FROM courts c
JOIN clubs cl ON cl.id = c.club_id
ORDER BY cl.name, c.name;

-- Voir toutes les réservations avec leur club
SELECT 
  b.player_name,
  b.slot_start,
  co.name as court_name,
  cl.name as club_name
FROM bookings b
JOIN courts co ON co.id = b.court_id
JOIN clubs cl ON cl.id = b.club_id
ORDER BY b.slot_start DESC
LIMIT 20;
```

---

## 🔒 Sécurité : Prochaines étapes

### 1. Row Level Security (RLS) Supabase
**Objectif** : Garantir l'isolation au niveau base de données

Actuellement, les policies RLS existent déjà pour les tables `courts` et `bookings` (voir migrations précédentes). Elles utilisent l'authentification Supabase avec `auth.uid()`.

**Action** : Vérifier que les policies RLS sont actives

```sql
-- Vérifier RLS sur courts
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('courts', 'bookings', 'products');
```

### 2. Authentification côté club
**Problème actuel** : Le système club utilise localStorage, pas l'auth Supabase

**Options** :
- Option A : Migrer vers Supabase Auth avec `supabase.auth.signInWithPassword()`
- Option B : Implémenter JWT custom avec vérification côté serveur
- Option C : Garder localStorage mais ajouter des vérifications API

**Recommandation** : Option A (Supabase Auth) pour une meilleure sécurité

### 3. Protection des APIs
**Action** : Ajouter des vérifications d'authentification dans les API routes

Exemple pour `/api/club/planning` :

```typescript
// Vérifier le token
const authHeader = req.headers.get('authorization')
if (!authHeader) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Vérifier que le club_id appartient bien à l'utilisateur connecté
const { data: club } = await supabase
  .from('clubs')
  .select('id')
  .eq('id', clubId)
  .eq('owner_id', auth.uid())
  .single()

if (!club) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

---

## 🎨 Améliorations UI/UX

### 1. Afficher les infos du club partout
Ajouter un header persistant avec :
- Logo du club
- Nom du club
- Bouton de déconnexion

### 2. Notifications
Ajouter des toasts pour les actions :
- ✅ "Terrain créé avec succès"
- ❌ "Erreur lors de la création"

### 3. Loading states
Ajouter des spinners pendant les chargements

### 4. États vides
Améliorer les messages quand il n'y a pas de données

---

## 📈 Fonctionnalités à développer

### 1. Gestion des produits
- Créer `/club/products/page.tsx`
- CRUD complet avec filtrage par `club_id`
- Catégories de produits
- Prix en centimes

### 2. Statistiques
- Dashboard avec KPIs
- Taux d'occupation des terrains
- Revenus par période
- Joueurs les plus actifs

### 3. Paramètres du club
- Modifier les infos du club
- Horaires d'ouverture
- Tarifs par terrain
- Règles de réservation

### 4. Gestion du staff
- Ajouter des membres de l'équipe
- Rôles : owner, staff
- Permissions différentes

---

## 🐛 Points d'attention

### Problèmes potentiels

1. **Données orphelines**
   - Vérifier qu'il n'y a pas de `court_id` qui pointent vers des clubs inexistants
   - La migration devrait avoir tout nettoyé, mais vérifier quand même

2. **Performance**
   - Avec beaucoup de données, ajouter la pagination
   - Optimiser les requêtes avec des index appropriés

3. **Concurrence**
   - Gérer les conflits quand deux staff modifient en même temps
   - Ajouter des locks optimistes

---

## 📝 Checklist finale

### Base de données
- [ ] Migration 020 appliquée
- [ ] Vérification : aucun `club_id` NULL
- [ ] Vérification : tous les foreign keys actifs
- [ ] Vérification : RLS activé sur toutes les tables

### Frontend
- [ ] Connexion club fonctionne
- [ ] Dashboard affiche les bonnes infos
- [ ] Terrains : CRUD complet fonctionne
- [ ] Réservations : liste filtrée fonctionne
- [ ] Isolation : un club ne voit pas les données d'un autre

### Tests
- [ ] Test avec 2 clubs différents
- [ ] Test de création de données
- [ ] Test de modification
- [ ] Test de suppression
- [ ] Test d'isolation

### Documentation
- [ ] Lire `MULTI_TENANT_IMPLEMENTATION.md`
- [ ] Lire `docs/CLUB_MULTI_TENANT.md`
- [ ] Comprendre les helpers dans `lib/clubHelpers.ts`

---

## 🎯 Priorités

### Priorité 1 - CRITIQUE ⚠️
- [ ] Appliquer la migration SQL 020
- [ ] Tester l'isolation des données

### Priorité 2 - IMPORTANT
- [ ] Migrer vers Supabase Auth pour les clubs
- [ ] Ajouter les protections API

### Priorité 3 - AMÉLIORATION
- [ ] Développer la gestion des produits
- [ ] Ajouter les statistiques
- [ ] Améliorer l'UI/UX

---

## 💡 Besoin d'aide ?

Si tu rencontres des problèmes :

1. Vérifier les logs de la console
2. Vérifier les données en base avec les requêtes SQL fournies
3. Relire `MULTI_TENANT_IMPLEMENTATION.md`
4. Vérifier que la migration a bien été appliquée

---

**🎉 Bravo ! Le système multi-tenant est prêt à être testé !**
