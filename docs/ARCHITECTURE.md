# Architecture Technique - Pad'up MVP

## 🏗️ Stack Technique

### Frontend
- **Framework** : Next.js 16 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS 4
- **UI Components** : HTML natif + Tailwind (pas de lib externe pour MVP)

### Backend
- **BaaS** : Supabase (Postgres + Auth + Storage)
- **API** : Next.js Server Actions + Supabase Client
- **Auth** : Supabase Auth (Email/Magic Link)

### Déploiement
- **Hosting** : Vercel (recommandé) ou Railway
- **Database** : Supabase Cloud (Postgres 15+)
- **CDN** : Vercel Edge Network (automatique)

---

## 🗂️ Structure des Routes

### Routes Publiques (Joueurs)
```
/                          → Landing page (liste clubs ou hero)
/book                      → Page de réservation (choix club)
/book/[clubId]             → Calendrier de réservation pour un club
/book/[clubId]/confirm     → Confirmation de réservation
/login                     → Login optionnel joueur (pour historique)
```

### Routes Authentifiées (Clubs)
```
/club                      → Dashboard club (stats, overview)
/club/bookings             → Liste des réservations (calendrier)
/club/bookings/[id]        → Détail d'une réservation
/club/products             → Gestion extras (boissons/snacks)
/club/orders               → Liste des commandes extras
/club/settings             → Paramètres du club (horaires, terrains)
```

### Routes Système
```
/api/webhooks/stripe       → Webhook paiement (v1+)
/api/cron/reminders        → Cron rappels (v1+)
/403                       → Page accès interdit
/404                       → Page non trouvée
```

---

## 🔐 Authentification & Autorisation

### Supabase Auth
- **Méthode** : Email/Password + Magic Link (optionnel)
- **Session** : Cookie HTTP-only (géré par `@supabase/ssr`)
- **Refresh** : Automatique via middleware Next.js

### Gestion des Rôles

#### Table `memberships`
```sql
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, club_id)
);
```

#### Middleware de Protection
- **Fichier** : `middleware.ts`
- **Logique** :
  - Routes `/club/*` → Vérifier session Supabase
  - Si session valide → Vérifier `memberships` (user_id a un rôle dans un club)
  - Si pas de rôle → Redirect `/403`

#### Helper `getUserWithRole`
```typescript
// lib/auth/getUserWithRole.ts
export async function getUserWithRole() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { user: null, role: null, clubId: null }
  
  const { data: membership } = await supabase
    .from('memberships')
    .select('role, club_id')
    .eq('user_id', user.id)
    .single()
  
  return { 
    user, 
    role: membership?.role || null, 
    clubId: membership?.club_id || null 
  }
}
```

---

## 🗄️ Base de Données (Supabase Postgres)

### Tables Principales

#### `clubs`
```sql
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  phone TEXT,
  email TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `courts` (Terrains)
```sql
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- ex: "Terrain 1", "Court A"
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `bookings` (Réservations)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optionnel si joueur non authentifié
  player_name TEXT NOT NULL, -- Nom du joueur (même si user_id existe)
  player_email TEXT NOT NULL,
  player_phone TEXT,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL, -- ex: 10:00:00
  end_time TIME NOT NULL,   -- ex: 11:30:00
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  price DECIMAL(10,2),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint anti double-booking
  UNIQUE(court_id, booking_date, start_time)
);
```

#### `products` (Extras : boissons, snacks)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'boisson', -- boisson, snack, repas
  price DECIMAL(10,2) NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `orders` (Commandes extras)
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL, -- Prix au moment de la commande
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes Recommandés
```sql
-- Performance bookings
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_user ON bookings(user_id);

-- Performance orders
CREATE INDEX idx_orders_booking ON orders(booking_id);
```

---

## 🛡️ Anti Double-Booking (Stratégie MVP)

### Créneaux Fixes 30 Minutes
- **Plages horaires** : 08:00, 08:30, 09:00, ..., 22:30, 23:00
- **Réservation typique** : 1h30 (3 créneaux consécutifs)
- **Exemple** : Réserver 10h00 → bloque 10:00, 10:30, 11:00 (jusqu'à 11:30)

### Vérification Avant Insertion
```typescript
// Server Action : app/actions/createBooking.ts
export async function createBooking(data: BookingData) {
  const supabase = createServerClient()
  
  // 1. Vérifier disponibilité
  const { data: existing } = await supabase
    .from('bookings')
    .select('id')
    .eq('court_id', data.courtId)
    .eq('booking_date', data.date)
    .eq('start_time', data.startTime)
    .neq('status', 'cancelled') // Exclure annulées
    .single()
  
  if (existing) {
    return { error: 'Créneau déjà réservé' }
  }
  
  // 2. Insérer si disponible
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert({
      court_id: data.courtId,
      player_name: data.playerName,
      player_email: data.playerEmail,
      booking_date: data.date,
      start_time: data.startTime,
      end_time: data.endTime,
      status: 'pending'
    })
    .select()
    .single()
  
  if (error) return { error: error.message }
  
  // 3. Envoyer email confirmation (optionnel)
  // await sendConfirmationEmail(booking)
  
  return { booking }
}
```

### Constraint Base de Données (Sécurité Ultime)
```sql
-- Garantit l'unicité même en cas de race condition
ALTER TABLE bookings 
ADD CONSTRAINT unique_court_slot 
UNIQUE (court_id, booking_date, start_time);
```

---

## 📧 Notifications (v0 Minimaliste)

### Email via Resend (ou Supabase Email si dispo)
- **Trigger** : Après création/confirmation/annulation de booking
- **Template** : HTML simple avec détails réservation
- **Implémentation** :
  ```typescript
  // lib/email/send.ts
  import { Resend } from 'resend'
  
  const resend = new Resend(process.env.RESEND_API_KEY)
  
  export async function sendBookingConfirmation(booking: Booking) {
    await resend.emails.send({
      from: 'Pad\'up <noreply@padup.com>',
      to: booking.player_email,
      subject: `Réservation confirmée - ${booking.club_name}`,
      html: `<p>Bonjour ${booking.player_name}, ...</p>`
    })
  }
  ```

---

## 🚀 Déploiement

### Vercel (Recommandé)
1. Connecter repo GitHub
2. Ajouter variables d'environnement :
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
   RESEND_API_KEY=re_xxx...
   ```
3. Build automatique à chaque push sur `main`

### Variables d'Environnement
```bash
# .env.local (dev)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
RESEND_API_KEY=xxx
NEXT_PUBLIC_DEMO_MODE=false
```

---

## 🧪 Tests

### Tests de Sécurité (Priorité MVP)
```javascript
// tests/security.test.js
import { test } from 'node:test'
import assert from 'node:assert'

test('Route /club/* doit bloquer les non-authentifiés', async () => {
  const response = await fetch('http://localhost:3000/club')
  assert.strictEqual(response.status, 307) // Redirect login
})

test('Anti double-booking : même créneau doit être rejeté', async () => {
  // Créer booking 1
  // Tenter booking 2 (même court, date, heure)
  // Assert : erreur "déjà réservé"
})
```

### Tests E2E (Optionnel v0)
- Playwright pour parcours joueur/club
- À ajouter en v1

---

## 📊 Performance & Monitoring

### Optimisations MVP
- Server Components par défaut (Next.js App Router)
- Images optimisées avec `next/image`
- Lazy loading des modals/composants lourds

### Monitoring (v1+)
- Vercel Analytics (gratuit)
- Supabase Dashboard (logs requêtes)
- Sentry (erreurs) optionnel

---

## 🔄 Migrations & Versioning

### Supabase Migrations
```bash
supabase/migrations/
  001_create_clubs_table.sql
  002_create_courts_table.sql
  003_create_bookings_table.sql
  004_create_products_table.sql
  005_create_orders_table.sql
  006_add_memberships_table.sql
```

### Commandes
```bash
# Créer nouvelle migration
supabase migration new add_feature_x

# Appliquer localement
supabase db reset

# Push en prod
supabase db push
```

---

## 📝 Décisions Techniques Clés

### Pourquoi Next.js App Router ?
- Server Components par défaut (perf)
- Routing file-based simple
- Server Actions (pas besoin d'API routes pour tout)

### Pourquoi Supabase ?
- Auth + DB en un seul service
- Row Level Security (RLS) natif
- Migrations SQL versionnées
- Pas de gestion serveur

### Pourquoi créneaux fixes 30 min ?
- Simplifie énormément l'anti double-booking
- Évite les calculs de chevauchement complexes
- Standard dans l'industrie des réservations

### Pourquoi pas de lib UI (shadcn/MUI) en v0 ?
- Réduire la surface de debug
- Tailwind suffit pour MVP
- Peut être ajouté en v1 facilement

---

**Version** : 0.1 MVP  
**Dernière mise à jour** : 2026-01-22  
**Auteur** : Équipe Pad'up
