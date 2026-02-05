# ✅ TEST CLUB AUTH - Guide de vérification

## 🔍 DIAGNOSTIC : Pourquoi "rien n'a changé" ?

**Réponse** : Les modifications sont bien présentes dans les fichiers, mais Next.js utilise un cache.

### Vérification rapide

```bash
# Vérifier que les modifications sont bien là
cd /Users/mathisenault/Desktop/padup.one

# Login page contient "Identifiant club"
grep "Identifiant club" app/club/login/page.tsx
# ✅ Résultat attendu: ligne 55

# Signup page contient "Demander un accès club"
grep "Demander un accès club" app/club/signup/page.tsx
# ✅ Résultat attendu: ligne 113
```

---

## 🚀 REDÉMARRAGE OBLIGATOIRE

### Étape 1 : Nettoyer le cache

```bash
cd /Users/mathisenault/Desktop/padup.one

# Supprimer le cache Next.js
rm -rf .next

# (Optionnel) Supprimer node_modules/.cache si existe
rm -rf node_modules/.cache
```

### Étape 2 : Redémarrer le serveur

```bash
# Arrêter le serveur actuel (Ctrl+C)
# Puis relancer
npm run dev
```

### Étape 3 : Hard refresh navigateur

- **Chrome/Edge** : Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
- **Safari** : Cmd+Option+R
- Ou ouvrir en navigation privée

---

## ✅ TESTS D'ACCEPTATION

### Test 1 : Page Login (/club/login)

**URL** : http://localhost:3000/club/login

**Checklist UI** :
- [ ] Titre : "Espace Club"
- [ ] Label champ 1 : **"Identifiant club"** (PAS "Email")
- [ ] Placeholder : "Ex: PADUP-1234"
- [ ] Input en majuscules automatique
- [ ] Helper text : "Le code unique fourni par Pad'Up..."
- [ ] Label champ 2 : "Mot de passe"
- [ ] Lien "Mot de passe oublié ?" présent
- [ ] Bouton : "Se connecter"
- [ ] Lien en bas : "Demander un accès club →"
- [ ] **AUCUNE mention d'email**
- [ ] **Zéro bleu** (palette gris/noir/blanc)

**Test fonctionnel** :

```
Code : PADUP-1234
Password : club2026
→ Soumettre
→ ✅ Redirection vers /club (dashboard)
```

**Test erreur** :

```
Code : INVALID-CODE
Password : club2026
→ ✅ Erreur : "Identifiant club invalide"

Code : PADUP-1234
Password : wrong
→ ✅ Erreur : "Mot de passe incorrect"
```

---

### Test 2 : Page Demande (/club/signup)

**URL** : http://localhost:3000/club/signup

**Checklist UI** :
- [ ] Titre : **"Demander un accès club"** (PAS "Créer un compte")
- [ ] Sous-titre : "...nous vous recontactons sous 24-48h"
- [ ] Champs présents :
  - [ ] Nom du club *
  - [ ] Ville *
  - [ ] Nom/Prénom contact *
  - [ ] Téléphone *
  - [ ] Email *
  - [ ] Nombre de terrains (opt.)
  - [ ] Site web ou Instagram (opt.)
  - [ ] Message (opt.)
- [ ] Checkbox **obligatoire** : "J'accepte d'être recontacté" *
- [ ] Bouton : **"Envoyer ma demande"** (PAS "Créer mon compte")
- [ ] **AUCUN champ mot de passe** (pas de création de compte)
- [ ] **Zéro bleu** (palette gris/noir/blanc)

**Test fonctionnel** :

```
1. Remplir tous les champs obligatoires
2. NE PAS cocher la checkbox
   → Soumettre
   → ✅ Erreur : "Vous devez accepter d'être recontacté"

3. Cocher la checkbox
   → Soumettre
   → ✅ Écran de confirmation :
        "Demande envoyée !"
        "Notre équipe vous recontactera sous 24 à 48h"
```

**Test DB** :

```
1. Aller sur Supabase Dashboard
2. Table "club_requests"
3. ✅ Vérifier : ligne insérée avec :
   - club_name
   - city
   - contact_name
   - contact_email
   - status = 'pending'
   - accept_contact = true
   - website (si rempli)
   - request_day (DATE auto-généré)
```

**Test anti-spam** :

```
1. Soumettre demande avec test@club.fr
2. Réessayer IMMÉDIATEMENT avec test@club.fr
   → ✅ Erreur : "duplicate key" (ou message custom)
```

---

### Test 3 : Navigation cohérente

**Depuis header** :
- [ ] Lien "Espace club" → `/club-access` (page d'accueil espace club)

**Depuis /club-access** :
- [ ] Bouton "Connexion" → `/club/login`
- [ ] Bouton "Demander un accès" → `/club/signup`

**Depuis /club/login** :
- [ ] Lien "Demander un accès club →" → `/club/signup`

**Depuis /club/signup** :
- [ ] Lien "Se connecter" → `/club/login`

---

## 🐛 Si ça ne fonctionne toujours pas

### Vérifier les imports

**Dans `app/club/login/page.tsx`** :
```typescript
import { loginClubWithCode } from '@/lib/clubAuth' // ✅ Correct

// ❌ Si c'est encore:
// import { loginClub } from '@/lib/clubAuth'
// → Il faut changer
```

**Dans `app/club/signup/page.tsx`** :
```typescript
import { createClubRequest, type ClubRequestData } from '@/app/actions/clubRequests' // ✅ Correct
```

### Vérifier qu'il n'y a pas de doublons

```bash
# Chercher d'autres pages club/login ou club/signup
find app -name "*login*" -o -name "*signup*" | grep club
```

### Forcer le rebuild complet

```bash
cd /Users/mathisenault/Desktop/padup.one

# 1. Nettoyer tout
rm -rf .next
rm -rf node_modules/.cache

# 2. Réinstaller (si nécessaire)
npm install

# 3. Redémarrer en mode dev
npm run dev
```

---

## 📝 RÉSUMÉ DES MODIFICATIONS

### Fichiers modifiés (confirmés) :

1. **`lib/clubAuth.ts`**
   - ✅ Fonction `loginClubWithCode(code, password)`
   - ✅ Mapping `CODE_TO_CLUB` avec codes PADUP-xxxx
   - ✅ Marqué DEV ONLY

2. **`app/club/login/page.tsx`**
   - ✅ Champ "Identifiant club" (pas Email)
   - ✅ Placeholder "Ex: PADUP-1234"
   - ✅ Auto-uppercase
   - ✅ Bouton "Mot de passe oublié ?"
   - ✅ Codes démo retirés de l'UI

3. **`app/club/signup/page.tsx`**
   - ✅ Titre "Demander un accès club"
   - ✅ Formulaire complet (7 champs)
   - ✅ Checkbox obligatoire (RGPD)
   - ✅ Honeypot anti-spam
   - ✅ Aucun champ mot de passe

4. **`app/actions/clubRequests.ts`**
   - ✅ Server Action `createClubRequest()`
   - ✅ Validation honeypot + checkbox
   - ✅ Insert dans `public.club_requests`

5. **`supabase/migrations/create_club_requests.sql`**
   - ✅ Table avec colonne générée `request_day`
   - ✅ Contrainte unique anti-spam
   - ✅ RLS strict (4 policies)

---

## 🎯 CODES DÉMO (DEV ONLY)

**Pour tester la connexion** :

```
Code : PADUP-1234
Password : club2026
Club : Le Hangar Sport & Co

Code : PADUP-5678
Password : club2026
Club : Paul & Louis Sport

Code : PADUP-9012
Password : club2026
Club : ZE Padel

Code : PADUP-3456
Password : club2026
Club : QG Padel Club
```

⚠️ **Ces codes ne sont PAS affichés sur l'UI** (sécurité)

---

## ✅ CHECKLIST FINALE

Après redémarrage du serveur :

- [ ] `/club/login` affiche "Identifiant club" (pas Email)
- [ ] `/club/signup` affiche "Demander un accès club" (pas Créer compte)
- [ ] Connexion avec PADUP-1234 fonctionne
- [ ] Formulaire de demande fonctionne et insère en DB
- [ ] Checkbox obligatoire bloque si non cochée
- [ ] Navigation cohérente entre pages
- [ ] Zéro bleu partout
- [ ] Messages d'erreur clairs

---

## 📞 Si problème persiste

1. Vérifier la console navigateur (erreurs JS)
2. Vérifier les logs serveur Next.js
3. Ouvrir en navigation privée
4. Vérifier que les routes sont bien `/club/login` et `/club/signup` (pas d'autres chemins)

**Les modifications sont déjà dans le code. Il suffit de redémarrer Next.js !** 🚀
