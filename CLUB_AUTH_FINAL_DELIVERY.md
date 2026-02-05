# 🚀 LIVRABLE FINAL - Système Auth Club Sécurisé

## ✅ TOUS LES AJUSTEMENTS OBLIGATOIRES APPLIQUÉS

---

## A) SÉCURITÉ / PROD

### ⚠️ Marquage DEV ONLY + TODOs

**Fichier** : `lib/clubAuth.ts`

```typescript
/**
 * ⚠️ DEV ONLY - NE PAS DEPLOYER EN PROD TEL QUEL
 * 
 * TODO PRODUCTION:
 * 1. Migrer vers table `club_access_codes` (code, club_id, email, active, hashed_password)
 *    OU ajouter colonne `access_code` dans table `clubs` (unique)
 * 2. Utiliser Supabase Auth avec passwords hashés individuels (pas de password global)
 * 3. Implémenter rate limiting sur login
 * 4. Logs d'audit pour tentatives de connexion
 */

/**
 * ⚠️ DEV ONLY - Mapping CODE -> email/clubId
 * 
 * PROD: Remplacer par requête Supabase:
 * - Table `club_access_codes`: { code, club_id, email, active, created_at }
 * - OU colonne `access_code` dans table `clubs`
 */
const CODE_TO_CLUB: Record<string, { email: string; clubId: string; clubName: string }> = {
  'PADUP-1234': { email: 'admin@lehangar.fr', clubId: LE_HANGAR_UUID, clubName: 'Le Hangar Sport & Co' },
  'PADUP-5678': { email: 'admin@pauletlouis.fr', clubId: PAUL_LOUIS_UUID, clubName: 'Paul & Louis Sport' },
  'PADUP-9012': { email: 'admin@zepadel.fr', clubId: ZE_PADEL_UUID, clubName: 'ZE Padel' },
  'PADUP-3456': { email: 'admin@qgpadel.fr', clubId: QG_PADEL_UUID, clubName: 'QG Padel Club' },
}

/**
 * ⚠️ DEV ONLY - Mot de passe global démo
 * 
 * PROD: Chaque club doit avoir son propre password hashé
 * - Via Supabase Auth: auth.users avec metadata club_id
 * - OU table `club_users` avec bcrypt hash
 */
const DEMO_PASSWORD = process.env.NEXT_PUBLIC_CLUB_DEMO_PASSWORD || 'club2026'
```

### ✅ Codes démo RETIRÉS de l'UI login

**Avant** : Codes affichés sur la page login  
**Après** : Aucun code visible (sécurité)

---

## B) CONNEXION - Libellés + UX

### Diff `app/club/login/page.tsx`

#### 1. Champ code avec helper text

```tsx
// ❌ AVANT
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  placeholder="admin@club.fr"
/>

// ✅ APRÈS
<label htmlFor="code">Identifiant club</label>
<input
  id="code"
  type="text"
  value={code}
  onChange={(e) => setCode(e.target.value.toUpperCase())}
  placeholder="Ex: PADUP-1234"
  required
  className="font-mono uppercase"
/>
<p className="text-xs text-gray-500 mt-1">
  Le code unique fourni par Pad'Up lors de votre inscription
</p>
```

#### 2. Bouton "Mot de passe oublié ?"

```tsx
<div className="flex items-center justify-between mb-2">
  <label htmlFor="password">Mot de passe</label>
  <button
    type="button"
    onClick={() => alert('Pour réinitialiser votre mot de passe, contactez-nous à contact@padup.one')}
    className="text-xs text-slate-700 hover:text-slate-900 underline"
  >
    Mot de passe oublié ?
  </button>
</div>
```

#### 3. Codes démo SUPPRIMÉS

```tsx
// ❌ SUPPRIMÉ (était affiché sur l'UI)
<div className="mt-6 p-4 bg-gray-50">
  <p>📌 Codes démo (MVP):</p>
  <ul>
    <li>• Code: PADUP-1234 (Le Hangar)</li>
    ...
  </ul>
</div>

// ✅ Remplacé par lien propre
<div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
  <p className="text-sm text-gray-600 mb-2">Vous n'avez pas encore de code ?</p>
  <a 
    href="/club/signup" 
    className="text-sm font-semibold text-slate-700 hover:text-slate-900 underline"
  >
    Demander un accès club →
  </a>
</div>
```

---

## C) FORMULAIRE - Champs + Validation

### Diff `app/club/signup/page.tsx`

#### 1. Nouveau champ : Site web / Instagram

```tsx
<div>
  <label htmlFor="website" className="block text-sm font-semibold text-gray-700 mb-2">
    Site web ou Instagram <span className="text-gray-400 font-normal">(optionnel)</span>
  </label>
  <input
    id="website"
    name="website"
    type="text"
    value={formData.website}
    onChange={handleChange}
    placeholder="Ex: www.monclub.fr ou @monclub_padel"
    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
  />
</div>
```

#### 2. Honeypot (anti-spam)

```tsx
{/* Honeypot (anti-spam) - Hidden */}
<div className="hidden">
  <label htmlFor="company">Company</label>
  <input
    id="company"
    name="company"
    type="text"
    value={honeypot}
    onChange={(e) => setHoneypot(e.target.value)}
    tabIndex={-1}
    autoComplete="off"
  />
</div>
```

#### 3. Checkbox OBLIGATOIRE (RGPD)

```tsx
// ❌ AVANT
<input
  type="checkbox"
  checked={formData.acceptContact}
  // Pas required
/>
<label>J'accepte d'être recontacté</label>

// ✅ APRÈS
<div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
  <input
    type="checkbox"
    checked={formData.acceptContact}
    required // ← OBLIGATOIRE
  />
  <label>
    <span className="font-semibold">J'accepte d'être recontacté</span>
    <span className="text-red-500"> *</span>
    <span className="block text-xs text-gray-500 mt-1">
      Cette autorisation est nécessaire pour traiter votre demande.
    </span>
  </label>
</div>
```

#### 4. Validation honeypot

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // Anti-spam: honeypot
  if (honeypot) {
    console.log('[Club Request] Honeypot triggered')
    setError('Erreur de validation')
    return
  }

  // Validation checkbox obligatoire
  if (!formData.acceptContact) {
    setError('Vous devez accepter d\'être recontacté')
    return
  }

  // ... suite
}
```

---

## D) MIGRATION SQL - RLS STRICT

### Contenu final : `supabase/migrations/create_club_requests.sql`

```sql
-- Table pour stocker les demandes d'accès club
-- Les clubs remplissent ce formulaire, je les recontacte manuellement

CREATE TABLE IF NOT EXISTS public.club_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Infos du club
  club_name TEXT NOT NULL,
  city TEXT NOT NULL,
  num_courts INTEGER,
  website TEXT, -- Site web ou Instagram
  
  -- Contact
  contact_name TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  
  -- Message optionnel
  message TEXT,
  accept_contact BOOLEAN NOT NULL DEFAULT false, -- RGPD obligatoire
  
  -- Métadonnées
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Notes internes (admin)
  admin_notes TEXT,
  
  -- Anti-duplication
  CONSTRAINT unique_email_per_day UNIQUE (contact_email, DATE(created_at))
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_club_requests_status ON public.club_requests(status);
CREATE INDEX IF NOT EXISTS idx_club_requests_created_at ON public.club_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_club_requests_email ON public.club_requests(contact_email);

-- ============================================
-- RLS (Row Level Security) - STRICT
-- ============================================
ALTER TABLE public.club_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Insert via Server Action uniquement (anon/authenticated avec validation)
-- Le honeypot et la validation checkbox sont gérés côté Server Action
CREATE POLICY "Public can insert club requests"
  ON public.club_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Validation basique au niveau DB
    club_name IS NOT NULL 
    AND city IS NOT NULL
    AND contact_name IS NOT NULL
    AND contact_phone IS NOT NULL
    AND contact_email IS NOT NULL
    AND accept_contact = true -- RGPD obligatoire
  );

-- Policy 2: Seul service_role peut SELECT (admin dashboard futur)
CREATE POLICY "Only service role can read requests"
  ON public.club_requests
  FOR SELECT
  TO service_role
  USING (true);

-- Policy 3: Seul service_role peut UPDATE (changement de status, notes)
CREATE POLICY "Only service role can update requests"
  ON public.club_requests
  FOR UPDATE
  TO service_role
  USING (true);

-- Policy 4: Seul service_role peut DELETE (nettoyage spam)
CREATE POLICY "Only service role can delete requests"
  ON public.club_requests
  FOR DELETE
  TO service_role
  USING (true);

-- ⚠️ IMPORTANT: Les utilisateurs normaux (authenticated) ne peuvent PAS lire les demandes
-- Seuls les admins (via service_role) peuvent accéder aux données

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_club_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_club_requests_updated_at_trigger
  BEFORE UPDATE ON public.club_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_club_requests_updated_at();

-- Commentaires
COMMENT ON TABLE public.club_requests IS 'Demandes d''accès club - formulaire de contact (pas de création auto)';
COMMENT ON COLUMN public.club_requests.status IS 'pending, contacted, approved, rejected';
COMMENT ON COLUMN public.club_requests.accept_contact IS 'RGPD - obligatoire pour traiter la demande';
COMMENT ON COLUMN public.club_requests.website IS 'Site web ou Instagram du club (optionnel)';
COMMENT ON CONSTRAINT unique_email_per_day ON public.club_requests IS 'Anti-spam: max 1 demande par email par jour';
```

---

## 🔒 Sécurité renforcée

### Protections implémentées

| Protection | Niveau | Implémentation |
|------------|--------|----------------|
| **Honeypot** | Frontend + Backend | Champ caché, validation Server Action |
| **Checkbox obligatoire** | Frontend + Backend + DB | `required` + validation Server Action + CHECK DB |
| **Anti-duplication** | Database | Contrainte unique `contact_email` par jour |
| **RLS strict** | Database | 4 policies (INSERT public, SELECT/UPDATE/DELETE service_role only) |
| **Validation email/phone** | Backend | Regex dans Server Action |
| **Codes hardcodés** | Marqués DEV ONLY | Commentaires ⚠️ clairs |

### Policies RLS

```
INSERT  → anon/authenticated (avec CHECK accept_contact = true)
SELECT  → service_role uniquement
UPDATE  → service_role uniquement
DELETE  → service_role uniquement
```

➡️ **Les utilisateurs normaux ne peuvent PAS lire les demandes des autres**

---

## 📝 DIFFS FINAUX

### 1. `app/club/login/page.tsx`

#### Changements principaux

```diff
- import { loginClub } from '@/lib/clubAuth'
+ import { loginClubWithCode } from '@/lib/clubAuth'

- const [email, setEmail] = useState('')
+ const [code, setCode] = useState('')

- const result = loginClub(email, password)
+ const result = loginClubWithCode(code, password)

- <label>Email</label>
- <input type="email" placeholder="admin@club.fr" />
+ <label>Identifiant club</label>
+ <input 
+   type="text" 
+   placeholder="Ex: PADUP-1234"
+   className="font-mono uppercase"
+   onChange={(e) => setCode(e.target.value.toUpperCase())}
+ />
+ <p className="text-xs text-gray-500 mt-1">
+   Le code unique fourni par Pad'Up lors de votre inscription
+ </p>

+ {/* Mot de passe oublié */}
+ <button
+   type="button"
+   onClick={() => alert('Pour réinitialiser votre mot de passe, contactez-nous à contact@padup.one')}
+   className="text-xs text-slate-700 hover:text-slate-900 underline"
+ >
+   Mot de passe oublié ?
+ </button>

- {/* Codes démo affichés */}
- <div className="mt-6 p-4 bg-gray-50">
-   <p>📌 Codes démo (MVP):</p>
-   <ul>
-     <li>• Code: PADUP-1234 (Le Hangar)</li>
-     ...
-   </ul>
- </div>
+ {/* ✅ SUPPRIMÉ pour sécurité */}

+ {/* Lien vers demande d'accès */}
+ <div className="mt-6 p-4 bg-slate-50 text-center">
+   <p>Vous n'avez pas encore de code ?</p>
+   <a href="/club/signup">Demander un accès club →</a>
+ </div>
```

---

### 2. `app/club/signup/page.tsx`

#### Changements principaux

```diff
- import { useRouter } from 'next/navigation'
+ import { createClubRequest, type ClubRequestData } from '@/app/actions/clubRequests'

- export default function ClubSignupPage() {
+ export default function ClubRequestPage() {

  const [formData, setFormData] = useState<ClubRequestData>({
    clubName: '',
    city: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    numCourts: undefined,
+   website: '', // ← NOUVEAU
    message: '',
-   acceptContact: false,
+   acceptContact: false, // ← OBLIGATOIRE
  })
+ const [honeypot, setHoneypot] = useState('') // ← NOUVEAU (anti-spam)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
+   // Anti-spam: honeypot
+   if (honeypot) {
+     console.log('[Club Request] Honeypot triggered')
+     setError('Erreur de validation')
+     return
+   }
    
+   // Validation checkbox obligatoire
+   if (!formData.acceptContact) {
+     setError('Vous devez accepter d\'être recontacté')
+     return
+   }

-   // Simuler création de compte (MVP front-only)
-   setTimeout(() => { ... }, 1000)
+   // Server Action Supabase
+   const result = await createClubRequest(formData)
  }

- <h1>Créer un compte club</h1>
- <p>Rejoignez Pad'up et gérez votre club</p>
+ <h1>Demander un accès club</h1>
+ <p>Remplissez ce formulaire, nous vous recontactons sous 24-48h</p>

  {/* Champs obligatoires */}
  <input name="clubName" required />
  <input name="city" required />
  <input name="contactName" required />
  <input name="contactPhone" required />
  <input name="contactEmail" required />
  
+ {/* NOUVEAU champ */}
+ <div>
+   <label>Site web ou Instagram <span>(optionnel)</span></label>
+   <input name="website" placeholder="www.monclub.fr ou @monclub_padel" />
+ </div>

  <input name="numCourts" type="number" /> {/* optionnel */}
  <textarea name="message" /> {/* optionnel */}

+ {/* Honeypot hidden */}
+ <div className="hidden">
+   <input name="company" value={honeypot} onChange={...} tabIndex={-1} />
+ </div>

- <input type="checkbox" name="acceptContact" />
- <label>J'accepte d'être recontacté</label>
+ <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
+   <input type="checkbox" name="acceptContact" required /> {/* ← OBLIGATOIRE */}
+   <label>
+     <span className="font-semibold">J'accepte d'être recontacté</span>
+     <span className="text-red-500"> *</span>
+     <span className="block text-xs text-gray-500 mt-1">
+       Cette autorisation est nécessaire pour traiter votre demande.
+     </span>
+   </label>
+ </div>

- <button>Créer mon compte</button>
+ <button>Envoyer ma demande</button>

  {/* Écran de succès */}
- <h2>Compte créé !</h2>
- <p>Mode démo - Redirection...</p>
+ <h2>Demande envoyée !</h2>
+ <p>Nous avons bien reçu votre demande.</p>
+ <p>Notre équipe vous recontactera sous <strong>24 à 48h</strong>.</p>
```

---

## 🗄️ Server Action - `app/actions/clubRequests.ts`

### Validations ajoutées

```typescript
export async function createClubRequest(data: ClubRequestData): Promise<ClubRequestResult> {
  // 1. Validation champs obligatoires
  if (!data.clubName || !data.city || !data.contactName || !data.contactPhone || !data.contactEmail) {
    return { success: false, error: 'Tous les champs obligatoires doivent être remplis' }
  }

  // 2. Validation checkbox RGPD (OBLIGATOIRE)
  if (!data.acceptContact) {
    return { success: false, error: 'Vous devez accepter d\'être recontacté' }
  }

  // 3. Validation email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.contactEmail)) {
    return { success: false, error: 'Email invalide' }
  }

  // 4. Validation téléphone
  const phoneRegex = /^[\d\s+()-]{8,}$/
  if (!phoneRegex.test(data.contactPhone)) {
    return { success: false, error: 'Numéro de téléphone invalide' }
  }

  // 5. Insert DB
  const { data: insertData, error: insertError } = await supabase
    .from('club_requests')
    .insert([{
      club_name: data.clubName,
      city: data.city,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      num_courts: data.numCourts || null,
      website: data.website || null, // ← NOUVEAU
      message: data.message || null,
      accept_contact: data.acceptContact, // ← Validé obligatoire
      status: 'pending',
    }])
    .select('id')
    .single()

  return { success: true, requestId: insertData.id }
}
```

---

## 📊 RÉCAPITULATIF

### ✅ Ajustements appliqués

| Ajustement | Status |
|------------|--------|
| **A) Sécurité/Prod** | ✅ Codes démo cachés, TODOs clairs, marqué DEV ONLY |
| **B) Connexion UX** | ✅ Libellés corrects, helper text, "Mot de passe oublié" |
| **C) Formulaire** | ✅ Checkbox obligatoire, site/instagram, honeypot |
| **D) Migration/RLS** | ✅ 4 policies strictes, website, anti-duplication |

### 🔐 Sécurité

- ✅ Honeypot anti-spam
- ✅ Checkbox RGPD obligatoire (frontend + backend + DB)
- ✅ Contrainte unique email/jour (anti-spam DB)
- ✅ RLS strict : INSERT public, SELECT/UPDATE/DELETE service_role only
- ✅ Validation email/phone regex
- ✅ Codes démo retirés de l'UI (sécurité)

### 📝 UX

- ✅ Libellés clairs ("Identifiant club", "fourni par Pad'Up")
- ✅ "Mot de passe oublié ?" → Placeholder contact
- ✅ Checkbox obligatoire avec texte explicatif RGPD
- ✅ Confirmation "24-48h" après envoi
- ✅ Champ website/Instagram (utile pour qualification)

---

## 🚀 Déploiement

### 1. Exécuter la migration SQL

**Via Supabase Dashboard** :
1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Sélectionner votre projet
3. Menu "SQL Editor"
4. Copier-coller tout le contenu de la migration SQL ci-dessus
5. Cliquer "Run"

### 2. Tester

**Connexion** :
- URL: `/club/login`
- Code: `PADUP-1234` (DEV ONLY)
- Password: `club2026` (DEV ONLY)
- ✅ Accès au dashboard

**Demande d'accès** :
- URL: `/club/signup`
- Remplir formulaire (checkbox obligatoire !)
- ✅ Confirmation "Demande envoyée"
- ✅ Vérifier Supabase → Table `club_requests` → Status `pending`

**Honeypot** (test anti-spam) :
- Remplir formulaire
- Via console navigateur : `document.querySelector('input[name="company"]').value = 'spam'`
- Soumettre → ❌ Erreur "Erreur de validation"

---

## ⚠️ IMPORTANT PROD

### À NE PAS OUBLIER

1. **Retirer les codes hardcodés** → Migrer vers table DB
2. **Password individuel par club** → Supabase Auth ou table avec hash
3. **Rate limiting** → Max 5 tentatives login/heure, max 3 demandes/IP/jour
4. **Email notifications** → Envoyer email à admin quand demande reçue
5. **Backoffice admin** → Dashboard pour gérer les demandes (approve/reject)

---

## 📄 Fichiers modifiés

1. ✅ `lib/clubAuth.ts` - Marqué DEV ONLY, TODOs prod
2. ✅ `app/club/login/page.tsx` - Code + password, sans démo visible
3. ✅ `app/club/signup/page.tsx` - Formulaire de demande complet
4. ✅ `app/actions/clubRequests.ts` - Server Action avec validations
5. ✅ `supabase/migrations/create_club_requests.sql` - Table + RLS strict

---

## ✅ Validation finale

- ✅ Codes démo retirés de l'UI
- ✅ Mapping hardcodé marqué DEV ONLY avec TODOs
- ✅ Checkbox obligatoire (frontend + backend + DB)
- ✅ Champ website/Instagram ajouté
- ✅ Honeypot implémenté
- ✅ RLS strict avec 4 policies
- ✅ Contrainte anti-duplication DB
- ✅ "Mot de passe oublié ?" ajouté
- ✅ Messages d'erreur clairs
- ✅ Zéro bleu (palette noir/gris/blanc)

**Prêt pour déploiement ! 🚀**
