# ⚡ Quick Start : Votre premier accès admin

**Temps estimé** : 3 minutes

---

## ✅ Checklist

### 1. Vérifier que la migration SQL est appliquée

Dans **Supabase Dashboard → SQL Editor** :

```sql
-- Vérifier que les tables existent
SELECT COUNT(*) FROM public.club_memberships;
SELECT COUNT(*) FROM public.club_invites;
```

Si erreur → Exécuter le fichier `supabase/migrations/022_club_invites.sql`

---

### 2. Créer votre compte

**Option A : Nouveau club (recommandé)**

```
http://localhost:3000/club/auth/signup
```
→ Créer club + compte admin en une fois

**Option B : Compte existant**

```
http://localhost:3000/club/auth/login
```
→ Se connecter avec email/password existant

---

### 3. Créer votre membership (si Option B)

```
http://localhost:3000/dev/seed-membership
```

Cliquer sur **"Me lier au club démo"**

✅ Membership admin créée sur "Club Démo Pad'up"

---

### 4. Accéder au dashboard

```
http://localhost:3000/club/dashboard
```

✅ Vous devriez voir : "Bienvenue [Nom du club]"

---

### 5. Tester les invitations

1. Cliquer **"Inviter un admin"**
2. Copier le lien
3. Ouvrir en **mode privé**
4. Se connecter ou créer un compte
5. ✅ Invitation acceptée automatiquement

---

### 6. Vérifier dans Supabase

```sql
-- Voir vos memberships
SELECT 
  u.email, 
  c.name as club_name, 
  m.role
FROM club_memberships m
JOIN auth.users u ON u.id = m.user_id
JOIN clubs c ON c.id = m.club_id;

-- Voir vos invitations
SELECT * FROM club_invites ORDER BY created_at DESC;
```

---

### 7. Nettoyer (après validation)

```bash
# Supprimer la page temporaire
rm -rf app/dev/
```

---

## 🎯 Résultat

✅ Compte créé  
✅ Membership admin active  
✅ Accès au dashboard  
✅ Invitations fonctionnelles  
✅ Données sécurisées (RLS actif)

---

## 🐛 Problème ?

**"Aucun club associé"**  
→ Aller sur `/dev/seed-membership`

**"Club Démo Pad'up introuvable"**  
→ Créer le club dans Supabase :
```sql
INSERT INTO clubs (name, city, club_code)
VALUES ('Club Démo Pad''up', 'Paris', 'DEMO-2024');
```

**"Not authenticated"**  
→ Se reconnecter via `/club/auth/login`

---

## 📚 Plus d'infos ?

Lire `FLOW_COMPLET_FIRST_ACCESS.md` pour le guide détaillé.

---

**C'est tout ! 🚀**
