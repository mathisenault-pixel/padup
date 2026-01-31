# 🚀 Pad'Up - Guide de démarrage rapide

## 1️⃣ Installation & Configuration (5 min)

### Installer les dépendances
```bash
cd /Users/mathisenault/Desktop/padup.one
npm install
```

### Configurer les variables d'environnement

Créer `.env.local` :
```env
# Supabase (obligatoire)
NEXT_PUBLIC_SUPABASE_URL=https://votreprojet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...

# Emails (optionnel - logs en dev si absent)
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=noreply@padup.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Appliquer les migrations SQL

Dans Supabase Dashboard → SQL Editor, exécuter les 9 fichiers dans l'ordre :
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

---

## 2️⃣ Lancer l'app en local (30 sec)

```bash
npm run dev
```

Ouvrir http://localhost:3000

---

## 3️⃣ Tester le parcours complet (10 min)

### A) Compte Club

1. Cliquer sur "Connexion / Inscription"
2. S'inscrire avec un email (ex: `club@test.com`)
3. Choisir "Je suis un club"
4. **Dashboard s'affiche** avec checklist à 0%

5. **Créer le club**
   - Nom: "Mon Padel Club"
   - Checklist passe à 33%

6. **Ajouter un terrain**
   - Cliquer "Ajouter un terrain"
   - Nom: "Court 1"
   - Type: Indoor
   - Checklist passe à 66%

7. **Ajouter des créneaux**
   - (Pour l'instant : utiliser SQL directement ou attendre la page dédiée)
   - Checklist passe à 100% et disparaît

8. **Voir les statistiques**
   - Réservations aujourd'hui / semaine / mois

9. **Voir l'abonnement**
   - Plan Free actuel
   - CTA "Passer à Pro"

### B) Compte Joueur

1. Se déconnecter
2. S'inscrire avec un autre email (ex: `player@test.com`)
3. Choisir "Je suis joueur"
4. **Aller sur "Mes réservations"**
   - Liste vide pour l'instant

5. **Créer une réservation (via SQL ou API)**
   ```sql
   INSERT INTO reservations (court_id, player_id, date, start_time, end_time, status)
   VALUES (
     'id-du-court',
     'id-du-player',
     '2024-12-20',
     '14:00:00',
     '15:30:00',
     'confirmed'
   );
   ```

6. **Vérifier l'email**
   - Si `RESEND_API_KEY` configuré: email reçu
   - Sinon: logs dans la console serveur

7. **Annuler la réservation**
   - Bouton "Annuler"
   - Email d'annulation envoyé

---

## 4️⃣ Build production (2 min)

```bash
npm run build
```

Vérifier qu'aucune erreur TypeScript n'apparaît.

Si tout est OK :
```bash
npm run start
```

---

## 5️⃣ Déploiement Vercel (5 min)

### Prérequis
- Compte Vercel connecté à GitHub

### Étapes
1. Push le code sur GitHub
2. Aller sur vercel.com
3. Importer le projet
4. Ajouter les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (ex: https://padup.vercel.app)
5. Deploy !

---

## 6️⃣ Troubleshooting

### Problème: Erreur "Cookies can only be modified in a Server Action"
**Solution**: Vérifier que `middleware.ts` n'essaie pas de modifier les cookies directement.

### Problème: Redirection infinie après login
**Solution**: Vérifier que le `middleware.ts` autorise bien `/player/accueil` comme route publique.

### Problème: Emails ne sont pas envoyés
**Solution**: 
1. Vérifier que `RESEND_API_KEY` est configuré
2. En dev, les logs s'affichent dans la console serveur
3. Vérifier les limites de votre compte Resend

### Problème: Les réservations ne s'affichent pas
**Solution**: 
1. Vérifier que les migrations SQL sont appliquées
2. Vérifier les RLS policies dans Supabase
3. Vérifier que le `court_id` et `player_id` existent

---

## 7️⃣ Commandes utiles

### Dev
```bash
npm run dev          # Lancer en développement
npm run build        # Build production
npm run start        # Lancer le build
npm run lint         # Linter
```

### Supabase (si CLI installé)
```bash
supabase start       # DB locale
supabase db reset    # Reset + migrations
supabase gen types typescript --local > lib/supabase/types.ts
```

---

## 8️⃣ Fichiers importants

| Fichier | Description |
|---------|-------------|
| `middleware.ts` | Protection des routes |
| `lib/supabase/server.ts` | Client Supabase serveur |
| `lib/supabase/client.ts` | Client Supabase browser |
| `lib/email/resend.ts` | Service email |
| `app/login/actions.ts` | Actions de connexion |
| `app/club/(authenticated)/dashboard/` | Dashboard club |
| `app/player/(authenticated)/reservations/` | Réservations joueur |

---

## 9️⃣ Contact & Support

- **Docs Next.js**: https://nextjs.org/docs
- **Docs Supabase**: https://supabase.com/docs
- **Docs Resend**: https://resend.com/docs

---

**🎉 Félicitations ! Pad'Up est prêt à être utilisé.**











