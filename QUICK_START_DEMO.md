# 🚀 Démarrage Rapide - Mode Démo

## ✅ Configuration Terminée !

Le mode démo est **déjà configuré et prêt à l'emploi** ! Tous les fichiers nécessaires ont été créés et modifiés.

## 🎯 Démarrer l'Application

```bash
npm run dev
```

C'est tout ! L'application démarre maintenant en mode démo sans aucune connexion à Supabase. 🎉

## 📱 Que Puis-je Faire ?

### Pages Accessibles

- **`/`** ou **`/player/accueil`** - Page d'accueil
- **`/player/clubs`** - Explorer les clubs (données statiques dans le code)
- **`/player/reservations`** - Voir les 3 réservations de démo
- **`/player/profil`** - Profil de l'utilisateur démo
- **`/player/tournois`** - Page des tournois

### Fonctionnalités Actives

✅ **Navigation complète** - Toutes les pages sont accessibles  
✅ **Pas d'authentification** - Pas besoin de se connecter  
✅ **Données de démo** - 4 clubs, 3 réservations, 1 utilisateur  
✅ **Actions simulées** - Les boutons fonctionnent (création/annulation)  
✅ **UI complète** - Toute l'interface est fonctionnelle  

### Limitations

⚠️ **Pas de persistance** - Les changements ne sont pas sauvegardés  
⚠️ **Données fixes** - Les données ne changent pas entre les sessions  
⚠️ **Pas d'emails** - Les notifications ne sont pas envoyées  

## 🔧 Gestion du Mode Démo

### Option 1 : Script Automatique

```bash
# Activer le mode démo
./scripts/toggle-demo-mode.sh on

# Désactiver le mode démo
./scripts/toggle-demo-mode.sh off
```

### Option 2 : Manuel

Éditez `.env.local` :

```bash
# Activer
NEXT_PUBLIC_DEMO_MODE=true

# Désactiver
NEXT_PUBLIC_DEMO_MODE=false
```

## 📊 Données de Démonstration

### Utilisateur

- **Email** : demo@padup.com
- **Nom** : Joueur Démo
- **Rôle** : Player

### Clubs (4)

1. **Le Hangar Sport & Co** - Rochefort-du-Gard
2. **Paul & Louis Sport** - Le Pontet
3. **ZE Padel** - Boulbon
4. **QG Padel Club** - Saint-Laurent-des-Arbres

### Réservations (3)

- 2 réservations futures (25 & 27 janvier 2026)
- 1 réservation passée (15 janvier 2026, payée)

## 🔍 Vérifier le Mode Actuel

Regardez la console de votre terminal au démarrage. Vous verrez :

```
[AUTH] Demo mode: returning demo user
[RESERVATION] Demo mode: simulating...
```

## 📖 Documentation Complète

Pour plus de détails techniques, consultez **DEMO_MODE.md**

## ❓ Problèmes Courants

### L'application ne démarre pas

Vérifiez que `.env.local` existe et contient :
```bash
NEXT_PUBLIC_DEMO_MODE=true
```

### Erreurs Supabase

Si vous voyez des erreurs Supabase, vérifiez que `NEXT_PUBLIC_DEMO_MODE=true` est bien défini.

### Changements non sauvegardés

C'est normal ! Le mode démo n'enregistre rien. C'est voulu pour la démonstration.

## 🎨 Personnaliser les Données

Éditez `lib/demoData.ts` pour modifier :
- Clubs
- Réservations
- Utilisateur démo
- Terrains

## 🔌 Revenir à Supabase

1. Mettez `NEXT_PUBLIC_DEMO_MODE=false`
2. Ajoutez vos vraies credentials :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```
3. Redémarrez l'application

## 🎯 Cas d'Usage Idéaux

- 🎨 Développement UI sans backend
- 🎭 Démonstrations clients
- 🧪 Tests frontend isolés
- 📱 Prototypage rapide
- 👨‍🏫 Formation d'équipe

---

**Prêt à démarrer ?** Lancez simplement `npm run dev` ! 🚀



