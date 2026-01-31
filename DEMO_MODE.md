# Mode Démo - Pad'Up

## Vue d'ensemble

Le mode démo permet de faire fonctionner l'application **sans Supabase actif**. Toutes les données proviennent de fichiers locaux et aucune requête backend n'est effectuée.

## Activation du Mode Démo

### Étape 1 : Créer le fichier .env.local

Créez un fichier `.env.local` à la racine du projet avec le contenu suivant :

```bash
# Mode Démo - Désactive Supabase et utilise des données locales
NEXT_PUBLIC_DEMO_MODE=true

# Ces variables ne sont pas utilisées en mode démo
# mais peuvent être nécessaires pour éviter des erreurs de build
NEXT_PUBLIC_SUPABASE_URL=https://demo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=demo-key
```

### Étape 2 : Démarrer l'application

```bash
npm run dev
```

L'application démarre maintenant en mode démo ! 🎉

## Fonctionnalités en Mode Démo

### ✅ Fonctionnel

- **Navigation** : Toutes les pages sont accessibles
- **Authentification simulée** : Pas de login requis, utilisateur démo automatique
- **Données de clubs** : Liste de 4 clubs avec informations complètes
- **Réservations** : 3 réservations de démonstration
- **Actions** : Les actions (créer/annuler réservation) sont simulées

### ⚠️ Limitations

- **Aucune persistance** : Les modifications ne sont pas sauvegardées
- **Pas d'emails** : Les notifications par email ne sont pas envoyées
- **Données statiques** : Les données ne changent pas entre les sessions

## Données de Démonstration

### Utilisateur Démo

- **Email** : demo@padup.com
- **Rôle** : Joueur
- **Nom** : Joueur Démo

### Clubs Disponibles

1. **Le Hangar Sport & Co** (Rochefort-du-Gard)
2. **Paul & Louis Sport** (Le Pontet)
3. **ZE Padel** (Boulbon)
4. **QG Padel Club** (Saint-Laurent-des-Arbres)

### Réservations

- 2 réservations à venir
- 1 réservation passée (déjà payée)

## Architecture Technique

### Fichiers Modifiés

1. **`lib/demoData.ts`** : Contient toutes les données de démo et le mock du client Supabase
2. **`lib/supabase/client.ts`** : Retourne un client mocké en mode démo
3. **`lib/supabase/server.ts`** : Retourne un client mocké en mode démo
4. **`middleware.ts`** : Désactive toutes les vérifications d'authentification
5. **`lib/auth/getUserWithRole.ts`** : Retourne l'utilisateur démo
6. **Actions** (`app/*/actions.ts`) : Court-circuitent les appels Supabase
7. **Pages** : Utilisent les données de démo au lieu de requêtes Supabase

### Vérification du Mode

```typescript
import { isDemoMode } from '@/lib/demoData'

if (isDemoMode()) {
  // Logique mode démo
} else {
  // Logique production avec Supabase
}
```

## Désactivation du Mode Démo

Pour revenir en mode production avec Supabase :

1. Modifiez `.env.local` :
   ```bash
   NEXT_PUBLIC_DEMO_MODE=false
   ```

2. Ou supprimez complètement la variable `NEXT_PUBLIC_DEMO_MODE`

3. Ajoutez vos vraies credentials Supabase :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-clé-anonyme
   ```

## Utilisation Recommandée

Le mode démo est idéal pour :

- 🎨 **Développement UI** : Travailler sur l'interface sans backend
- 🎭 **Démonstrations** : Montrer l'application sans données réelles
- 🧪 **Tests frontend** : Tester les composants de manière isolée
- 📱 **Prototypage** : Itérer rapidement sur les fonctionnalités

## Questions Fréquentes

### Puis-je créer de nouvelles réservations en mode démo ?

Oui, mais elles ne seront pas persistées. Un ID temporaire sera généré et l'action retournera un succès simulé.

### Le middleware bloque-t-il l'accès en mode démo ?

Non, le middleware est complètement désactivé en mode démo. Toutes les routes sont accessibles.

### Les emails sont-ils envoyés en mode démo ?

Non, les actions d'envoi d'emails sont court-circuitées en mode démo.

### Comment ajouter plus de données de démo ?

Éditez le fichier `lib/demoData.ts` et ajoutez vos données dans les exports appropriés (`demoClubs`, `demoReservations`, etc.).

## Support

Pour toute question ou problème lié au mode démo, consultez le code source dans `lib/demoData.ts` ou contactez l'équipe de développement.



