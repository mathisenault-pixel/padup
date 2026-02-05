# Guide de migration - Nouveau système d'auth club

## ✅ Modifications effectuées

### 1. Système d'authentification par CODE

**Avant** : Email + Mot de passe  
**Après** : Code club (ex: PADUP-1234) + Mot de passe

#### Fichiers modifiés :
- `lib/clubAuth.ts` : Ajout mapping `CODE_TO_CLUB` + fonction `loginClubWithCode()`
- `app/club/login/page.tsx` : UI modifiée (champ code au lieu d'email)

#### Codes démo disponibles :
- `PADUP-1234` → Le Hangar Sport & Co
- `PADUP-5678` → Paul & Louis Sport  
- `PADUP-9012` → ZE Padel
- `PADUP-3456` → QG Padel Club

Mot de passe : `club2026`

---

### 2. Formulaire de demande d'accès

**Avant** : Création de compte immédiate (MVP fictif)  
**Après** : Formulaire de demande → Validation manuelle → Envoi du code

#### Fichiers modifiés :
- `app/club/signup/page.tsx` : Transformé en formulaire de demande
- `app/actions/clubRequests.ts` : **NOUVEAU** - Server Action pour gérer les demandes

#### Champs du formulaire :
- Nom du club *
- Ville *
- Nom/Prénom contact *
- Téléphone *
- Email *
- Nombre de terrains (opt.)
- Message (opt.)
- Checkbox "Accepte d'être recontacté" (opt.)

---

### 3. Base de données - Table `club_requests`

#### Migration SQL créée :
📄 `supabase/migrations/create_club_requests.sql`

#### Structure de la table :
```sql
club_requests (
  id UUID PRIMARY KEY,
  club_name TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  num_courts INTEGER,
  message TEXT,
  accept_contact BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending', -- pending, contacted, approved, rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  admin_notes TEXT
)
```

---

## 🚀 Étapes pour déployer

### Étape 1 : Exécuter la migration SQL

#### Option A : Via Supabase Dashboard (Recommandé pour MVP)
1. Allez sur [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Menu "SQL Editor"
4. Copier-coller le contenu de `supabase/migrations/create_club_requests.sql`
5. Cliquer "Run"

#### Option B : Via CLI Supabase
```bash
# Si vous avez supabase CLI installé
cd /Users/mathisenault/Desktop/padup.one
supabase db push
```

### Étape 2 : Tester le nouveau flow

1. **Connexion avec code** :
   - Aller sur `/club/login`
   - Entrer : `PADUP-1234` + `club2026`
   - Vérifier l'accès au dashboard club

2. **Demande d'accès** :
   - Aller sur `/club/signup`
   - Remplir le formulaire
   - Soumettre
   - Vérifier la confirmation
   - Vérifier dans Supabase → Table `club_requests` → La demande est bien enregistrée

### Étape 3 : Workflow admin (manuel pour MVP)

Quand une demande arrive :
1. Vérifier dans Supabase → `club_requests` → Status = `pending`
2. Recontacter le club par téléphone/email
3. Si validé :
   - Créer le club dans la table `clubs` (si pas déjà fait)
   - Générer un code unique (ex: `PADUP-7890`)
   - Ajouter le mapping dans `lib/clubAuth.ts` (CODE_TO_CLUB)
   - Mettre à jour le status → `approved`
   - Envoyer le code au club
4. Si refusé :
   - Mettre à jour le status → `rejected`
   - Ajouter une note dans `admin_notes`

---

## 🎯 Points clés

### Sécurité actuelle (MVP)
- ✅ Authentification par code (mapping hardcodé pour MVP)
- ✅ Session cookie (7 jours)
- ✅ Demandes stockées en DB avec validation serveur
- ⚠️ **TODO Production** : Migrer vers Supabase Auth + RLS complet

### UX
- ✅ Code visible et facile à communiquer (ex: PADUP-1234)
- ✅ Pas de création de compte automatique (contrôle qualité)
- ✅ Confirmation immédiate après demande
- ✅ Délai annoncé : 24-48h

### Design
- ✅ Zéro bleu (palette gris/noir/blanc uniquement)
- ✅ UI cohérente avec le reste du site
- ✅ Messages d'erreur clairs

---

## 📝 TODO Futures améliorations

### Court terme
- [ ] Email de notification admin quand demande reçue
- [ ] Backoffice simple pour gérer les demandes
- [ ] Génération automatique des codes

### Moyen terme
- [ ] Migration vers Supabase Auth avec codes personnalisés
- [ ] RLS policies complètes
- [ ] Système de rôles (admin club, staff, etc.)

### Long terme
- [ ] Onboarding automatisé après validation
- [ ] Self-service pour certaines modifications
- [ ] Analytics dashboard club

---

## 🔍 Vérifications

### Checklist de test

- [ ] Login avec code fonctionne (`PADUP-1234` + `club2026`)
- [ ] Message d'erreur si code invalide
- [ ] Message d'erreur si mot de passe incorrect
- [ ] Formulaire de demande fonctionne
- [ ] Validation des champs obligatoires
- [ ] Confirmation affichée après soumission
- [ ] Demande enregistrée dans `club_requests` (vérifier Supabase)
- [ ] Lien "Demander un accès" visible sur page login
- [ ] Lien "Se connecter" visible sur page demande

---

## 🐛 Troubleshooting

### Erreur : "Table club_requests does not exist"
→ La migration SQL n'a pas été exécutée. Voir Étape 1.

### Erreur : "Identifiant club invalide"
→ Vérifier que le code est bien dans `CODE_TO_CLUB` (lib/clubAuth.ts)

### Erreur lors de la soumission de la demande
→ Vérifier la console navigateur et les logs serveur
→ Vérifier que Supabase est accessible

### La demande ne s'enregistre pas
→ Vérifier les RLS policies dans Supabase (policy "Anyone can create club request")

---

## 📧 Contact

Pour toute question : **contact@padup.one**
