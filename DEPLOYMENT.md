# 🚀 Pad'Up - Guide de déploiement v1.0.0

## ✅ Pré-requis

- [x] Build réussi (`npm run build` OK)
- [x] Types TypeScript corrects
- [x] Migrations SQL appliquées (9 migrations)
- [x] Variables d'environnement configurées
- [x] Version v1.0.0 gelée

---

## 📦 Déploiement Vercel

### 1. Préparer le repository Git

```bash
# Si pas encore initialisé
git init
git add .
git commit -m "chore: freeze v1.0.0 - production ready"

# Créer le tag v1.0.0
git tag -a v1.0.0 -m "Pad'Up v1.0.0 - MVP Production Ready"

# Push vers GitHub
git remote add origin https://github.com/votre-username/padup.git
git branch -M main
git push -u origin main
git push origin v1.0.0
```

### 2. Configurer Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "Add New Project"
3. Importer le repository GitHub
4. Configurer les variables d'environnement :

```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://votreprojet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Emails (optionnel - logs en dev si absent)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@padup.com

# App
NEXT_PUBLIC_APP_URL=https://padup.vercel.app
NODE_ENV=production
```

5. Cliquer sur "Deploy"

### 3. Vérifier le déploiement

Une fois déployé :

✅ Tester la page d'accueil : https://padup.vercel.app  
✅ Tester l'inscription : https://padup.vercel.app/login  
✅ Tester le parcours Club  
✅ Tester le parcours Joueur  
✅ Vérifier les emails (si Resend configuré)

---

## 🔧 Configuration Supabase Production

### 1. Appliquer les migrations

Dans Supabase Dashboard → SQL Editor, exécuter les 9 fichiers :

```
supabase/migrations/001_create_profiles_table.sql
supabase/migrations/002_create_profile_trigger.sql
supabase/migrations/003_create_clubs_table.sql
supabase/migrations/004_create_courts_table.sql
supabase/migrations/005_create_availabilities_table.sql
supabase/migrations/006_create_reservations_table.sql
supabase/migrations/007_add_payment_columns.sql
supabase/migrations/008_add_reminder_flags.sql
supabase/migrations/009_add_club_subscription.sql
```

### 2. Vérifier les RLS Policies

Aller dans Supabase Dashboard → Authentication → Policies

Vérifier que toutes les tables ont des policies actives :
- ✅ profiles
- ✅ clubs
- ✅ courts
- ✅ availabilities
- ✅ reservations

### 3. Configurer les emails (optionnel)

Si vous utilisez Supabase Auth Email :
1. Aller dans Authentication → Email Templates
2. Personnaliser les templates (confirmation, reset password)

---

## 📧 Configuration Resend (Emails transactionnels)

### 1. Créer un compte Resend

1. Aller sur [resend.com](https://resend.com)
2. Créer un compte
3. Vérifier votre domaine (ou utiliser le domaine de test)

### 2. Obtenir l'API Key

1. Aller dans API Keys
2. Créer une nouvelle clé
3. Copier la clé : `re_xxx...`

### 3. Configurer dans Vercel

Ajouter les variables :
```env
RESEND_API_KEY=re_xxx...
RESEND_FROM_EMAIL=noreply@votredomaine.com
```

### 4. Tester l'envoi

Créer une réservation → Vérifier que l'email est reçu

---

## 🔐 Sécurité Production

### Checklist de sécurité

- [x] RLS actif sur toutes les tables
- [x] Middleware de protection des routes
- [x] Variables d'environnement sécurisées
- [x] HTTPS activé (automatique sur Vercel)
- [x] Cookies sécurisés (sameSite: lax)
- [x] Pas de données sensibles dans le code
- [x] Logs conditionnels (dev uniquement)

### Variables sensibles

⚠️ **Ne jamais commiter** :
- `.env.local`
- `.env.production`
- Clés API Supabase (sauf ANON_KEY publique)
- Clés API Resend

---

## 📊 Monitoring

### Vercel Analytics

Activer dans Vercel Dashboard :
- Analytics (trafic, performance)
- Speed Insights (Web Vitals)
- Logs (erreurs runtime)

### Supabase Monitoring

Surveiller dans Supabase Dashboard :
- Database → Usage (requêtes, storage)
- Auth → Users (inscriptions, connexions)
- Logs → Postgres (erreurs SQL)

---

## 🐛 Troubleshooting

### Erreur : "Cookies can only be modified in a Server Action"

**Cause** : Tentative de modification de cookies côté client  
**Solution** : Vérifier que `middleware.ts` n'essaie pas de modifier les cookies

### Erreur : Redirection infinie après login

**Cause** : Middleware mal configuré  
**Solution** : Vérifier que `/player/accueil` est bien dans les routes publiques

### Erreur : Emails ne sont pas envoyés

**Cause** : `RESEND_API_KEY` non configuré ou invalide  
**Solution** : 
1. Vérifier la clé dans Vercel → Settings → Environment Variables
2. Vérifier les limites du compte Resend
3. Consulter les logs Vercel

### Erreur : RLS bloque les requêtes

**Cause** : Policies RLS trop restrictives  
**Solution** : Vérifier les policies dans Supabase Dashboard

---

## 🔄 Rollback (si nécessaire)

### Rollback Vercel

1. Aller dans Vercel Dashboard → Deployments
2. Trouver le déploiement précédent
3. Cliquer sur "..." → "Promote to Production"

### Rollback Supabase

⚠️ **Attention** : Les migrations SQL ne peuvent pas être rollback facilement

Créer une migration inverse si nécessaire :
```sql
-- Exemple : rollback de la colonne plan
ALTER TABLE clubs DROP COLUMN IF EXISTS plan;
```

---

## 📝 Post-déploiement

### 1. Tester les parcours complets

- [ ] Inscription Player → Onboarding → Réservations
- [ ] Inscription Club → Onboarding → Dashboard → Terrains
- [ ] Emails de confirmation reçus
- [ ] Annulation de réservation fonctionne
- [ ] Statistiques s'affichent correctement

### 2. Monitorer les erreurs

- Consulter Vercel Logs pendant les premières heures
- Vérifier Supabase Logs pour les erreurs SQL
- Tester sur mobile (responsive)

### 3. Communiquer

- Annoncer la mise en production
- Partager le lien : https://padup.vercel.app
- Préparer la prospection clubs

---

## ✅ Checklist finale

- [x] Build réussi localement
- [x] Migrations SQL appliquées
- [x] Variables d'env configurées
- [x] Déploiement Vercel OK
- [x] Tests de parcours réussis
- [x] Emails fonctionnels (si configuré)
- [x] Monitoring activé
- [x] Version v1.0.0 taguée

---

**🎉 Pad'Up v1.0.0 est en production !**

**URL de production** : https://padup.vercel.app (à remplacer par votre URL)

**Dernière mise à jour** : Décembre 2024











