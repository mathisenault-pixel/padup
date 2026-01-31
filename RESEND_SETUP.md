# Configuration Resend - Envoi d'emails d'invitation 📧

## ✅ Installation complète

### 1. Dépendance installée
```bash
npm install resend
```
✅ **Package ajouté:** `resend` (33 nouveaux packages)

---

## 🔑 Configuration de la clé API

### 1. Obtenir votre clé API Resend

1. Créer un compte sur [resend.com](https://resend.com)
2. Aller dans **Settings** → **API Keys**
3. Créer une nouvelle clé API avec le scope "Sending access"
4. Copier la clé (format: `re_xxxxxxxxxxxxx`)

### 2. Ajouter la clé dans `.env.local`

```bash
# .env.local
RESEND_API_KEY=re_YOUR_REAL_API_KEY_HERE
```

⚠️ **IMPORTANT:**
- ✅ **RESEND_API_KEY** n'a **PAS** le préfixe `NEXT_PUBLIC_` → côté serveur uniquement
- ❌ Ne jamais exposer cette clé côté client
- ✅ Ajoutée au `.gitignore` via `.env.local`

---

## 📁 Structure créée

### Route API: `/app/api/invite/route.ts`

```
app/
└── api/
    └── invite/
        └── route.ts (nouveau)
```

---

## 🚀 Utilisation

### Endpoint: `POST /api/invite`

#### Request Body (JSON)
```typescript
{
  to: string,              // ✅ REQUIS - Email destinataire
  clubName: string,        // ✅ REQUIS - Nom du club
  dateText: string,        // ✅ REQUIS - Date/heure formatée
  message?: string,        // ❌ OPTIONNEL - Message personnel
  bookingUrl?: string      // ❌ OPTIONNEL - Lien vers la réservation
}
```

#### Exemple d'appel depuis le client

```typescript
// ✅ Exemple dans un composant React
async function sendInvitation() {
  try {
    const response = await fetch('/api/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'ami@example.com',
        clubName: 'Le Hangar Sport & Co',
        dateText: 'Samedi 25 janvier 2026 à 14h00 - 15h30',
        message: 'Salut ! Ça te dit de faire un match de padel ce weekend ?',
        bookingUrl: 'https://padup.one/player/reservations/res_12345'
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Erreur lors de l\'envoi')
    }

    console.log('✅ Email envoyé:', data)
    alert('Invitation envoyée avec succès !')
  } catch (error) {
    console.error('❌ Erreur:', error)
    alert('Erreur lors de l\'envoi de l\'invitation')
  }
}
```

---

## 📧 Template Email

### Design de l'email

L'email utilise un template HTML responsive et élégant avec :

✅ **Header gradient bleu** avec icône 🎾
✅ **Bloc info** (club + date) avec bordure bleue
✅ **Message personnel** (optionnel) en bleu clair
✅ **Bouton CTA** "Voir ma réservation" (si URL fournie)
✅ **Instructions** (confirmer présence, arriver en avance, chaussures)
✅ **Footer** avec branding Pad'Up
✅ **Version texte** pour clients email sans HTML

### Aperçu du contenu

```
┌────────────────────────────────────┐
│  🎾 Invitation Padel               │  ← Header gradient
│  Vous avez été invité à une partie │
├────────────────────────────────────┤
│  📍 Club                           │
│  Le Hangar Sport & Co              │
│                                    │
│  📅 Date & Heure                   │
│  Samedi 25 janvier à 14h00        │
├────────────────────────────────────┤
│  💬 Message                        │  ← Si fourni
│  Salut ! Ça te dit...              │
├────────────────────────────────────┤
│  [Voir ma réservation]             │  ← CTA button
├────────────────────────────────────┤
│  Comment ça marche ?               │
│  • Confirmer présence              │
│  • Arriver 10 min avant            │
│  • N'oubliez pas vos chaussures    │
├────────────────────────────────────┤
│  Pad'Up                            │  ← Footer
│  © 2026 Tous droits réservés       │
└────────────────────────────────────┘
```

---

## ✅ Validation et sécurité

### Validations implémentées

1. **Champs requis**
   - `to` (email destinataire)
   - `clubName`
   - `dateText`

2. **Format email**
   - Regex validation: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

3. **Configuration serveur**
   - Vérification de `RESEND_API_KEY`
   - Erreur 500 si non configuré

### Codes d'erreur

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Données invalides (champ manquant, email invalide) |
| `RESEND_NOT_CONFIGURED` | 500 | Clé API Resend non configurée |
| `RESEND_ERROR` | 500 | Erreur lors de l'envoi via Resend |
| `INTERNAL_ERROR` | 500 | Erreur non gérée |

### Réponses

#### ✅ Succès (200)
```json
{
  "success": true,
  "message": "Invitation envoyée avec succès",
  "emailId": "abc123-def456-ghi789"
}
```

#### ❌ Erreur validation (400)
```json
{
  "error": "Le champ \"to\" (email destinataire) est requis",
  "code": "VALIDATION_ERROR"
}
```

#### ❌ Erreur serveur (500)
```json
{
  "error": "Service email non configuré",
  "code": "RESEND_NOT_CONFIGURED"
}
```

---

## 🔒 Sécurité

### ✅ Bonnes pratiques implémentées

1. **Clé API côté serveur uniquement**
   - Variable `RESEND_API_KEY` sans préfixe `NEXT_PUBLIC_`
   - Jamais exposée au client
   - Vérification au runtime

2. **Validation stricte des entrées**
   - Type checking
   - Format email validé
   - Messages d'erreur clairs

3. **Gestion d'erreurs robuste**
   - Try/catch global
   - Logs détaillés côté serveur
   - Détails d'erreur seulement en dev (pas en prod)

4. **Rate limiting (à ajouter en production)**
   ```typescript
   // TODO: Ajouter rate limiting pour éviter spam
   // Exemple: max 10 emails par IP par heure
   ```

---

## 🧪 Test de l'API

### 1. Test avec curl

```bash
curl -X POST http://localhost:3000/api/invite \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "clubName": "Le Hangar Sport & Co",
    "dateText": "Samedi 25 janvier 2026 à 14h00 - 15h30",
    "message": "On fait un match ce weekend ?",
    "bookingUrl": "https://padup.one/player/reservations/res_12345"
  }'
```

### 2. Test depuis la console browser

```javascript
fetch('/api/invite', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: 'test@example.com',
    clubName: 'Le Hangar Sport & Co',
    dateText: 'Samedi 25 janvier 2026 à 14h00',
    message: 'Salut ! Match de padel ?'
  })
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

---

## 📊 Logs

### Logs côté serveur

```
[API /invite POST] Start
[API /invite POST] Request body received: {
  to: 'ami@example.com',
  clubName: 'Le Hangar Sport & Co',
  dateText: 'Samedi 25 janvier à 14h00',
  hasMessage: true,
  hasBookingUrl: true
}
[API /invite POST] Sending email via Resend to: ami@example.com
[API /invite POST] Email sent successfully: { id: 'abc123...' }
```

---

## 🚀 Production checklist

Avant le déploiement en production :

- [ ] ✅ Remplacer la clé API de test par une vraie clé Resend
- [ ] ✅ Vérifier le domaine d'envoi (remplacer `onboarding@resend.dev`)
- [ ] ⚠️ Ajouter rate limiting (anti-spam)
- [ ] ⚠️ Ajouter logs dans un service externe (Sentry, LogRocket)
- [ ] ⚠️ Tester avec plusieurs clients email (Gmail, Outlook, Apple Mail)
- [ ] ⚠️ Vérifier les SPF/DKIM records pour éviter spam
- [ ] ⚠️ Ajouter un système de queue si volume important

---

## 🔧 Configuration avancée (optionnel)

### Domaine personnalisé

Pour utiliser votre propre domaine (ex: `invitation@padup.one`):

1. Dans Resend Dashboard → **Domains**
2. Ajouter votre domaine
3. Configurer les DNS records (SPF, DKIM, DMARC)
4. Modifier le `from` dans l'API :

```typescript
from: "Pad'up <invitation@padup.one>"
```

### Templates multiples

Pour supporter plusieurs types d'emails :

```typescript
// Créer un dossier /lib/email-templates/
export function generateInviteEmail(...) { ... }
export function generateConfirmationEmail(...) { ... }
export function generateReminderEmail(...) { ... }
```

---

## ✅ Résumé

### Fichiers créés
- ✅ `/app/api/invite/route.ts` - Route API POST
- ✅ `/RESEND_SETUP.md` - Documentation complète

### Fichiers modifiés
- ✅ `.env.local` - Ajout de `RESEND_API_KEY`
- ✅ `package.json` - Dépendance `resend` ajoutée

### Fonctionnalités
- ✅ Validation des données d'entrée
- ✅ Format email validé
- ✅ Template HTML responsive et élégant
- ✅ Version texte pour fallback
- ✅ Gestion d'erreurs complète
- ✅ Logs détaillés
- ✅ Sécurité côté serveur (clé API jamais exposée)

**Statut:** ✅ Prêt pour production (après configuration de la vraie clé API Resend)
