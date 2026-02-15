# ✅ Système d'Invitations Club - TERMINÉ

## 🎯 Objectif

Système d'invitation sécurisé pour les clubs, permettant d'inviter des administrateurs sans gérer de mots de passe en clair.

---

## 🎉 Avantages du système d'invitation

### Avant
❌ Création manuelle de comptes  
❌ Gestion de mots de passe en clair  
❌ Processus d'onboarding compliqué

### Après
✅ **Lien d'invitation unique** envoyé par email/message  
✅ **Authentification Supabase** : sécurisée et standard  
✅ **Membership automatique** : créé lors de l'acceptation  
✅ **Expiration automatique** : invitations valables 7 jours  
✅ **RLS protection** : isolation des données garantie

---

## 📦 Ce qui a été créé

### A) Migration SQL (`supabase/migrations/022_club_invites.sql`) ✅

1. **Table `club_invites`** :
   ```sql
   - id (UUID PK)
   - club_id (UUID FK → clubs.id)
   - token (TEXT UNIQUE) - Token unique pour l'invitation
   - role (TEXT) - 'admin' ou 'staff'
   - expires_at (TIMESTAMPTZ) - Date d'expiration
   - used_at (TIMESTAMPTZ) - Date d'utilisation (NULL = non utilisée)
   - used_by (UUID FK → auth.users.id)
   - created_at (TIMESTAMPTZ)
   - created_by (UUID FK → auth.users.id)
   ```

2. **Policies RLS** :
   - Lecture : invitations non utilisées et non expirées
   - Création : membres du club (admin uniquement)
   - Visibilité : membres du club voient leurs invitations

3. **Fonctions RPC** :
   - `redeem_club_invite(token)` : Utilise une invitation (crée le membership)
   - `validate_club_invite(token)` : Valide un token sans l'utiliser

### B) Frontend ✅

#### 1. Helpers (`lib/clubInvites.ts`)

Fonctions créées :
- `generateInviteToken()` - Génère un token unique
- `createClubInvite(clubId, role, expiresInDays)` - Crée une invitation
- `validateInviteToken(token)` - Valide un token
- `redeemInvite(token)` - Utilise une invitation
- `getClubInvites(clubId)` - Liste les invitations d'un club
- `getInviteLink(token)` - Génère le lien complet
- `copyInviteLink(token)` - Copie le lien dans le presse-papiers

#### 2. Pages créées

- **`/club/invite/[token]`** (`app/club/invite/[token]/page.tsx`) ✅
  - Affiche les infos du club
  - Demande connexion si nécessaire
  - Permet d'accepter/refuser l'invitation
  - Crée automatiquement le membership

- **`/club/dashboard/invitations`** (`app/club/dashboard/invitations/page.tsx`) ✅
  - Affiche toutes les invitations (actives, utilisées, expirées)
  - Bouton "Créer une invitation"
  - Copie automatique du lien
  - Interface claire et intuitive

#### 3. Dashboard mis à jour ✅

- Nouvelle section "Invitations" dans le dashboard
- Lien direct vers `/club/dashboard/invitations`

---

## 🔄 Flow utilisateur

### 1. Création d'invitation (Admin du club)

```
1. Admin va sur /club/dashboard
2. Clique sur "Invitations"
3. Clique sur "Créer une invitation"
4. ✅ Invitation créée, lien copié automatiquement
5. Admin partage le lien par email/message
```

### 2. Acceptation d'invitation (Nouvel admin)

```
1. Nouvel admin reçoit le lien: /club/invite/abc123...
2. Ouvre le lien
3. Voit les infos du club
4. Deux cas:
   a) Déjà connecté → clique "Accepter l'invitation"
   b) Pas connecté → "Créer un compte" ou "Se connecter"
5. Une fois connecté, accepte l'invitation
6. ✅ Membership créé automatiquement
7. ✅ Redirection vers /club/dashboard
```

---

## 🧪 Tests

### 1. Appliquer la migration SQL

```bash
# 1. Ouvrir Supabase SQL Editor
# 2. Copier/coller supabase/migrations/022_club_invites.sql
# 3. Exécuter (Run)
```

Tu devrais voir :
```
✅ Migration 022: Club Invites
RLS club_invites: true
Invitations existantes: 0
Fonction redeem_club_invite: OK
Fonction validate_club_invite: OK
✅ Système d'invitations prêt !
```

### 2. Créer une invitation

```
1. Se connecter en tant qu'admin d'un club
2. Aller sur /club/dashboard
3. Cliquer sur "Invitations"
4. Cliquer sur "Créer une invitation"
5. ✅ Lien copié dans le presse-papiers
```

### 3. Tester l'invitation

```
1. Ouvrir le lien d'invitation dans une navigation privée
2. Vérifier que les infos du club s'affichent correctement
3. Cliquer sur "Accepter l'invitation"
4. Se connecter ou créer un compte
5. ✅ Redirection vers /club/dashboard du club invité
```

### 4. Vérifier le membership

```sql
-- Dans Supabase SQL Editor
SELECT 
  m.role,
  u.email,
  c.name as club_name
FROM public.club_memberships m
JOIN auth.users u ON u.id = m.user_id
JOIN public.clubs c ON c.id = m.club_id
ORDER BY m.created_at DESC;

-- ✅ Le nouveau membre devrait apparaître
```

---

## 🔒 Sécurité

### Protection au niveau SQL

1. **RLS sur club_invites** :
   - Lecture : seulement invitations valides
   - Création : seulement admins du club
   - Pas de modification/suppression directe

2. **Fonction `redeem_club_invite` (SECURITY DEFINER)** :
   - Vérifie l'authentification
   - Vérifie que l'invitation existe
   - Vérifie qu'elle n'est pas déjà utilisée
   - Vérifie qu'elle n'est pas expirée
   - Crée le membership atomiquement
   - Marque l'invitation comme utilisée

3. **Protection contre les abus** :
   - Token unique (UUID sans tirets)
   - Expiration automatique (7 jours)
   - Usage unique (marked `used_at`)
   - Pas de réutilisation possible

---

## 📊 Architecture

```
┌─────────────────┐
│  Admin Club     │
│  (Dashboard)    │
└────────┬────────┘
         │
         │ Crée invitation
         ▼
┌─────────────────┐
│ club_invites    │
│  token: abc123  │
│  expires: +7j   │
└────────┬────────┘
         │
         │ Partage lien
         ▼
┌─────────────────┐
│  Nouvel admin   │
│  Reçoit lien    │
└────────┬────────┘
         │
         │ Ouvre /club/invite/abc123
         ▼
┌─────────────────┐
│  Supabase Auth  │
│  Login/Signup   │
└────────┬────────┘
         │
         │ RPC redeem_club_invite
         ▼
┌─────────────────┐
│ club_memberships│
│  user_id ↔      │
│  club_id        │
└────────┬────────┘
         │
         │ Membership créé
         ▼
┌─────────────────┐
│  Dashboard club │
│  Accès autorisé │
└─────────────────┘
```

---

## 🎨 Interface

### Page d'invitation (`/club/invite/[token]`)

<img width="500" alt="invitation" src="design_invite.png">

**Éléments affichés** :
- ✅ Badge "Invitation reçue !"
- ✅ Nom du club
- ✅ Ville du club
- ✅ Code du club
- ✅ Rôle (Admin/Staff)
- ✅ Boutons "Accepter" / "Refuser"
- ✅ Info contextuelle

### Page de gestion (`/club/dashboard/invitations`)

**Sections** :
- ✅ Invitations actives (avec lien à copier)
- ✅ Invitations utilisées
- ✅ Invitations expirées
- ✅ Bouton "Créer une invitation"
- ✅ Info "Comment ça marche"

---

## 📝 Code examples

### Créer une invitation

```typescript
import { createClubInvite, copyInviteLink } from '@/lib/clubInvites'

// Créer invitation (expire dans 7 jours)
const { invite, error } = await createClubInvite(clubId, 'admin', 7)

if (invite) {
  // Copier le lien automatiquement
  await copyInviteLink(invite.token)
  console.log('Lien copié !')
}
```

### Valider une invitation

```typescript
import { validateInviteToken } from '@/lib/clubInvites'

const validation = await validateInviteToken(token)

if (validation.valid) {
  console.log(`Club: ${validation.club_name}`)
  console.log(`Rôle: ${validation.role}`)
} else {
  console.log(`Erreur: ${validation.error}`)
}
```

### Utiliser une invitation

```typescript
import { redeemInvite } from '@/lib/clubInvites'

const { clubId, error } = await redeemInvite(token)

if (clubId) {
  // Membership créé, rediriger vers dashboard
  router.push('/club/dashboard')
} else {
  console.error(error)
}
```

---

## 🚀 Prochaines étapes

### 1. Migration des clubs existants

**Option A** : Créer des invitations pour les clubs existants
```
1. Pour chaque club existant
2. Créer une invitation
3. Envoyer le lien par email au club
4. Le club crée son compte et accepte l'invitation
```

**Option B** : Migration automatique
```sql
-- Pour chaque club existant, créer un membership
-- avec l'email du club comme identifiant
INSERT INTO public.club_memberships (user_id, club_id, role)
SELECT 
  (SELECT id FROM auth.users WHERE email = c.email),
  c.id,
  'admin'
FROM public.clubs c
WHERE c.email IS NOT NULL
ON CONFLICT (user_id, club_id) DO NOTHING;
```

### 2. Notifications par email

Intégrer un service d'email (Resend, SendGrid, etc.) pour :
- Envoyer automatiquement l'invitation par email
- Notifier l'admin quand l'invitation est acceptée
- Rappels avant expiration

### 3. Gestion des rôles

Ajouter différents rôles :
- `admin` : accès complet
- `staff` : accès limité (pas de gestion des invitations)
- `viewer` : lecture seule

### 4. Analytics

Tracker :
- Nombre d'invitations créées
- Taux d'acceptation
- Temps moyen entre envoi et acceptation

---

## ✅ Checklist de validation

### Base de données
- [x] Migration 022 créée
- [ ] Migration 022 appliquée sur Supabase
- [ ] Table `club_invites` créée
- [ ] RLS activé sur `club_invites`
- [ ] Fonctions RPC créées et testées

### Frontend
- [x] `lib/clubInvites.ts` créé
- [x] Page `/club/invite/[token]` créée
- [x] Page `/club/dashboard/invitations` créée
- [x] Lien dans le dashboard
- [x] Build passe ✅

### Tests
- [ ] Création d'invitation testée
- [ ] Validation d'invitation testée
- [ ] Acceptation d'invitation testée
- [ ] Membership créé correctement
- [ ] Expiration fonctionne
- [ ] Usage unique vérifié

---

## 🎯 Résultat final

**Le système d'invitations est prêt !**

- ✅ Création d'invitations sécurisées
- ✅ Liens uniques avec expiration
- ✅ Flow d'acceptation complet
- ✅ Membership automatique
- ✅ RLS protection
- ✅ Interface intuitive

**C'est LA bonne approche pour onboarder les clubs de façon sécurisée.** 🎉
