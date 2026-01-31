# 🎭 Mode Démo - Pad'Up

## ✅ Configuration Terminée !

Votre application est maintenant **100% fonctionnelle en mode démo** sans aucune dépendance à Supabase.

---

## 🚀 Démarrage Immédiat

```bash
npm run dev
```

C'est tout ! L'application charge maintenant avec :
- ✅ 0 requête Supabase
- ✅ Authentification désactivée
- ✅ Données de démo intégrées
- ✅ Toutes les pages accessibles

---

## 📁 Ce Qui a Été Créé

### Fichiers Principaux

1. **`lib/demoData.ts`** ⭐️
   - Toutes les données de démo
   - Mock du client Supabase
   - 4 clubs, 3 réservations, 1 utilisateur

2. **`.env.local`**
   - `NEXT_PUBLIC_DEMO_MODE=true`

3. **Documentation**
   - `DEMO_MODE.md` - Documentation complète
   - `QUICK_START_DEMO.md` - Guide rapide
   - `CHANGES_SUMMARY.md` - Détail des modifications

4. **Script Utilitaire**
   - `scripts/toggle-demo-mode.sh` - Activer/désactiver facilement

### Fichiers Modifiés (10 fichiers)

- `lib/supabase/client.ts` - Utilise le mock en mode démo
- `lib/supabase/server.ts` - Utilise le mock en mode démo
- `middleware.ts` - Désactive l'auth en mode démo
- `lib/auth/getUserWithRole.ts` - Retourne l'utilisateur démo
- `app/actions/auth.ts` - Actions auth simulées
- `app/login/actions.ts` - Login/signup simulés
- `app/onboarding/actions.ts` - Onboarding simulé
- `app/player/(authenticated)/reservations/actions.ts` - Actions réservations simulées
- `app/player/(authenticated)/reservations/page.tsx` - Utilise données démo
- `app/player/(authenticated)/layout.tsx` - Affiche utilisateur démo

---

## 🎯 Pages Fonctionnelles

### Routes Accessibles

| Route | Description | Données |
|-------|-------------|---------|
| `/` ou `/player/accueil` | Page d'accueil | - |
| `/player/clubs` | Liste des clubs | 4 clubs en dur (déjà dans le code) |
| `/player/reservations` | Mes réservations | 3 réservations de démo |
| `/player/profil` | Mon profil | Utilisateur démo |
| `/player/tournois` | Tournois | Page statique |

### Fonctionnalités

- ✅ **Navigation complète** : Tous les liens fonctionnent
- ✅ **Création de réservation** : Simulée (pas de DB)
- ✅ **Annulation de réservation** : Simulée (pas de DB)
- ✅ **Profil utilisateur** : Affiche "Joueur Démo"
- ✅ **Logout** : Fonctionne (juste un refresh)

---

## 📊 Données Incluses

### Utilisateur

```typescript
Email: demo@padup.com
Nom: Joueur Démo
Rôle: Player
```

### Clubs (dans lib/demoData.ts)

1. **Le Hangar Sport & Co** - Rochefort-du-Gard
2. **Paul & Louis Sport** - Le Pontet
3. **ZE Padel** - Boulbon
4. **QG Padel Club** - Saint-Laurent-des-Arbres

### Réservations (dans lib/demoData.ts)

- **Réservation 1** : 25 janvier 2026, 14h-15h30, Le Hangar
- **Réservation 2** : 27 janvier 2026, 10h-11h30, Paul & Louis
- **Réservation 3** : 15 janvier 2026, 18h-19h30, ZE Padel (payée)

---

## 🔧 Gestion du Mode

### Activer le Mode Démo

```bash
# Option 1 : Script (recommandé)
./scripts/toggle-demo-mode.sh on

# Option 2 : Manuel
# Éditez .env.local et mettez :
NEXT_PUBLIC_DEMO_MODE=true
```

### Désactiver le Mode Démo

```bash
# Option 1 : Script
./scripts/toggle-demo-mode.sh off

# Option 2 : Manuel
# Éditez .env.local et mettez :
NEXT_PUBLIC_DEMO_MODE=false
```

---

## 🧪 Test Rapide

### 1. Vérifier le Mode

Démarrez l'app avec `npm run dev` et regardez la console :

```
[AUTH] Demo mode: returning demo user
[RESERVATION] Demo mode: simulating...
```

Si vous voyez ces messages → **Mode démo actif** ✅

### 2. Tester les Pages

- Allez sur `/player/clubs` → Devrait afficher 4 clubs
- Allez sur `/player/reservations` → Devrait afficher 3 réservations
- Cliquez sur "Mon compte" → Devrait afficher le profil

### 3. Tester une Action

- Sur `/player/reservations`, essayez d'annuler une réservation
- Devrait fonctionner (mais pas de persistance)

---

## 📖 Documentation

### Guides Disponibles

1. **`QUICK_START_DEMO.md`** 
   → Démarrage rapide (2 minutes)

2. **`DEMO_MODE.md`**
   → Documentation technique complète

3. **`CHANGES_SUMMARY.md`**
   → Liste détaillée de toutes les modifications

4. **Ce fichier (`MODE_DEMO_README.md`)**
   → Vue d'ensemble

---

## ⚠️ Limitations du Mode Démo

### Ce qui NE fonctionne PAS

- ❌ **Persistance** : Les modifications ne sont pas sauvegardées
- ❌ **Emails** : Aucun email n'est envoyé
- ❌ **Upload d'images** : Pas de stockage
- ❌ **Paiements** : Pas de transactions réelles

### C'est Normal !

Le mode démo est conçu pour :
- Développer l'UI sans backend
- Faire des démos clients
- Tester l'interface isolément
- Prototyper rapidement

---

## 🔄 Revenir à Supabase

Quand vous voulez réactiver Supabase :

1. **Désactiver le mode démo** :
   ```bash
   ./scripts/toggle-demo-mode.sh off
   ```

2. **Configurer Supabase** :
   Ajoutez dans `.env.local` :
   ```bash
   NEXT_PUBLIC_DEMO_MODE=false
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

3. **Redémarrer** :
   ```bash
   npm run dev
   ```

---

## 💡 Personnalisation

### Modifier les Données

Éditez **`lib/demoData.ts`** pour changer :
- Utilisateur démo
- Clubs
- Réservations
- Terrains

Exemple :
```typescript
// lib/demoData.ts
export const demoUser = {
  id: 'demo-user-123',
  email: 'votre-email@example.com', // Changez ici
  created_at: '2024-01-15T10:00:00.000Z',
}
```

### Ajouter des Données

Ajoutez simplement plus d'éléments aux tableaux :
```typescript
export const demoReservations = [
  // ... existantes
  {
    id: '4', // Nouvelle réservation
    // ...
  }
]
```

---

## ❓ FAQ

### Pourquoi créer un mode démo ?

- Supabase est en pause
- Besoin de travailler sur l'UI
- Démos sans données réelles
- Développement frontend isolé

### Les données sont-elles sécurisées ?

Oui ! Ce sont des données fictives dans le code. Aucune donnée réelle.

### Puis-je utiliser le mode démo en production ?

Non, c'est uniquement pour le développement/démo. En production, utilisez Supabase.

### Comment savoir si je suis en mode démo ?

Regardez la console au démarrage, vous verrez :
```
[AUTH] Demo mode: returning demo user
```

---

## 🎉 C'est Prêt !

Votre application fonctionne maintenant **100% sans Supabase**.

### Pour Démarrer

```bash
npm run dev
```

### Pour Toute Question

Consultez :
- `DEMO_MODE.md` - Documentation complète
- `QUICK_START_DEMO.md` - Guide rapide
- `lib/demoData.ts` - Code source des données

---

**Mode démo opérationnel** ✅  
**Zéro dépendance Supabase** ✅  
**Prêt pour la démo** ✅

🚀 **Bon développement !**



