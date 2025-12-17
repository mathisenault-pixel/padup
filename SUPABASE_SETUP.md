# Configuration Supabase pour Pad'Up

## 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Créez un nouveau projet
3. Notez votre **URL du projet** et votre **clé anon publique**

## 2. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine du projet avec vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
```

## 3. Exécuter le schéma SQL

1. Dans le dashboard Supabase, allez dans **SQL Editor**
2. Copiez le contenu du fichier `supabase/schema.sql`
3. Collez-le dans l'éditeur SQL et exécutez-le

Cela va créer :
- ✅ La table `profiles` pour stocker les profils des clubs
- ✅ Les politiques RLS (Row Level Security) pour protéger les données
- ✅ Un trigger pour créer automatiquement un profil lors de l'inscription
- ✅ Un trigger pour mettre à jour automatiquement la date de modification

## 4. Configurer l'authentification par email

1. Dans le dashboard Supabase, allez dans **Authentication > Providers**
2. Assurez-vous que **Email** est activé
3. Configurez les paramètres selon vos besoins :
   - **Email confirmation** : Activé ou désactivé selon votre préférence
   - **Email templates** : Personnalisez si nécessaire

## 5. Structure de la table profiles

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | ID de l'utilisateur (FK vers auth.users) |
| `email` | text | Email du club (unique) |
| `role` | text | Rôle de l'utilisateur (default: 'club') |
| `club_name` | text | Nom du club (nullable) |
| `created_at` | timestamp | Date de création |
| `updated_at` | timestamp | Date de dernière modification |

## 6. Tester l'authentification

1. Démarrez votre serveur de développement : `npm run dev`
2. Allez sur `/club/login`
3. Créez un nouveau compte avec un email et un mot de passe
4. Vous devriez être redirigé vers `/club/dashboard`
5. Vérifiez dans Supabase **Authentication > Users** que l'utilisateur a été créé
6. Vérifiez dans **Table Editor > profiles** que le profil a été créé automatiquement

## 7. Fonctionnalités implémentées

✅ **Connexion** : Email/mot de passe sur `/club/login`  
✅ **Inscription** : Création de compte via le même formulaire  
✅ **Protection des routes** : `/club/dashboard` redirige vers login si non connecté  
✅ **Déconnexion** : Bouton dans le header du dashboard  
✅ **Profils automatiques** : Créés automatiquement avec role='club'  

## 8. Sécurité

- ✅ Row Level Security (RLS) activé
- ✅ Les utilisateurs ne peuvent voir que leur propre profil
- ✅ Middleware Next.js pour protéger les routes
- ✅ Sessions gérées via cookies sécurisés

## 9. Prochaines étapes (optionnel)

- Ajouter la récupération de mot de passe
- Personnaliser les emails de confirmation
- Ajouter des champs supplémentaires au profil (nom du club, adresse, etc.)
- Implémenter la gestion des terrains et réservations



