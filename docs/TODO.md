# TODO Checklist - Pad'up MVP

Checklist ordonnée pour construire le MVP de A à Z.

---

## Phase 1 : Setup & Infrastructure

### 1.1 Base Projet
- [x] Initialiser Next.js 16 (App Router)
- [x] Configurer TypeScript
- [x] Installer Tailwind CSS
- [x] Configurer ESLint
- [ ] Créer `.env.example` avec toutes les variables requises

### 1.2 Supabase
- [ ] Créer projet Supabase (cloud ou local)
- [ ] Installer `@supabase/supabase-js` et `@supabase/ssr`
- [ ] Configurer clients Supabase (browser + server)
- [ ] Ajouter variables env (URL, ANON_KEY, SERVICE_ROLE_KEY)
- [ ] Tester connexion DB

### 1.3 Structure Dossiers
- [ ] Créer structure `app/(public)/*` pour joueurs
- [ ] Créer structure `app/club/*` pour dashboard clubs
- [ ] Créer `lib/` pour helpers (auth, supabase, email)
- [ ] Créer `docs/` pour documentation
- [ ] Créer `tests/` pour tests de sécurité

---

## Phase 2 : Base de Données

### 2.1 Migrations Supabase
- [ ] `001_create_clubs_table.sql`
- [ ] `002_create_courts_table.sql`
- [ ] `003_create_bookings_table.sql` (avec constraint anti double-booking)
- [ ] `004_create_products_table.sql`
- [ ] `005_create_orders_table.sql`
- [ ] `006_create_memberships_table.sql` (rôles clubs)
- [ ] Ajouter indexes de performance (voir ARCHITECTURE.md)

### 2.2 Row Level Security (RLS)
- [ ] RLS sur `bookings` : joueurs voient leurs réservations, clubs voient leurs créneaux
- [ ] RLS sur `clubs` : lecture publique, écriture owner/staff
- [ ] RLS sur `products` : lecture publique, écriture club
- [ ] RLS sur `orders` : lecture club, création via Server Action

### 2.3 Seed Data (Développement)
- [ ] Créer script de seed avec 2-3 clubs de test
- [ ] Créer 4-6 terrains par club
- [ ] Créer quelques produits (boissons, snacks)
- [ ] Créer utilisateur de test "owner" avec membership

---

## Phase 3 : Authentification

### 3.1 Auth Supabase
- [ ] Configurer Supabase Auth (email/password)
- [ ] Activer Magic Link (optionnel)
- [ ] Créer `lib/auth/getUserWithRole.ts`
- [ ] Créer `middleware.ts` pour protéger routes `/club/*`

### 3.2 Pages Auth
- [ ] `/login` - Login club (email/password)
- [ ] `/signup` - Inscription club (optionnel v0, peut être fait en SQL direct)
- [ ] Redirect après login : `/club` si role owner/staff, sinon `/403`

### 3.3 Tests Auth
- [ ] Test : Accès `/club` sans session → redirect `/login`
- [ ] Test : Accès `/club` avec session mais sans role → `/403`
- [ ] Test : Accès `/club` avec role owner → OK

---

## Phase 4 : Interface Joueur (Public)

### 4.1 Landing Page `/`
- [ ] Hero section simple (titre + CTA "Réserver")
- [ ] Liste des clubs disponibles (fetch Supabase)
- [ ] Lien vers `/book`

### 4.2 Page Réservation `/book`
- [ ] Liste des clubs (cards cliquables)
- [ ] Filtres simples : ville, date (optionnel v0)
- [ ] Lien vers `/book/[clubId]`

### 4.3 Calendrier Réservation `/book/[clubId]`
- [ ] Afficher infos du club (nom, adresse, téléphone)
- [ ] Sélecteur de date (input date HTML)
- [ ] Liste des terrains du club
- [ ] Grille horaire (créneaux 30 min, 8h-23h)
- [ ] Fetch disponibilités depuis Supabase
- [ ] Marquer créneaux réservés en gris
- [ ] Clic sur créneau disponible → Modal/Form réservation

### 4.4 Modal/Form Confirmation `/book/[clubId]/confirm`
- [ ] Formulaire : Nom, Email, Téléphone
- [ ] Récapitulatif : Club, Terrain, Date, Heure, Prix
- [ ] Bouton "Confirmer la réservation"
- [ ] Server Action `createBooking`
  - [ ] Vérifier disponibilité (anti double-booking)
  - [ ] Insérer dans `bookings` avec status `pending`
  - [ ] Envoyer email confirmation (optionnel v0)
- [ ] Afficher message succès ou erreur
- [ ] Redirect vers page "Réservation confirmée"

---

## Phase 5 : Dashboard Club

### 5.1 Page Accueil `/club`
- [ ] Stats du jour : nombre réservations, CA estimé
- [ ] Liste des réservations du jour (aperçu)
- [ ] Liens rapides : Voir planning, Gérer produits

### 5.2 Planning `/club/bookings`
- [ ] Sélecteur de date
- [ ] Vue calendrier ou tableau par terrain
- [ ] Filtres : statut (pending, confirmed, cancelled)
- [ ] Clic sur réservation → Modal détails

### 5.3 Détail Réservation `/club/bookings/[id]`
- [ ] Afficher toutes les infos : joueur, contact, terrain, heure, statut
- [ ] Boutons actions :
  - [ ] Confirmer (pending → confirmed)
  - [ ] Annuler (→ cancelled)
  - [ ] Ajouter extras (boissons)
- [ ] Server Actions pour chaque action
- [ ] Update `updated_at` à chaque modification

### 5.4 Gestion Produits `/club/products`
- [ ] Liste des produits du club (nom, catégorie, prix, disponible)
- [ ] Bouton "Ajouter un produit"
- [ ] Modal création/édition produit
- [ ] Bouton supprimer/désactiver produit

### 5.5 Commandes Extras `/club/orders`
- [ ] Liste des commandes (ordre chronologique inversé)
- [ ] Colonnes : Date, Réservation (joueur), Produits, Quantité, Total
- [ ] Filtres : Date, Produit

---

## Phase 6 : Fonctionnalités Transversales

### 6.1 Emails
- [ ] Installer Resend (ou utiliser Supabase Email)
- [ ] Créer template email confirmation joueur
- [ ] Créer template email notification club (nouvelle réservation)
- [ ] Créer template email annulation
- [ ] Fonction `lib/email/send.ts` pour chaque type

### 6.2 Gestion Erreurs
- [ ] Page `app/error.tsx` globale
- [ ] Page `app/403` (accès interdit)
- [ ] Page `app/404` (page non trouvée)
- [ ] Toast notifications (succès/erreur) avec state React ou lib simple

### 6.3 Loading States
- [ ] Suspense boundaries sur pages async
- [ ] Loading skeletons (Tailwind) pour listes/calendriers
- [ ] Disable buttons pendant actions (anti double-submit)

---

## Phase 7 : Sécurité

### 7.1 Tests de Sécurité
- [ ] Test : Route `/club` sans auth → redirect
- [ ] Test : Route `/club` avec user sans role → 403
- [ ] Test : Anti double-booking (même créneau) → erreur
- [ ] Test : RLS empêche lecture bookings autres clubs
- [ ] Script `npm run test:security` qui passe

### 7.2 Validation Inputs
- [ ] Valider inputs côté serveur (Server Actions)
- [ ] Sanitize inputs (XSS protection)
- [ ] Rate limiting sur création bookings (optionnel v0)

### 7.3 Row Level Security
- [ ] Activer RLS sur toutes les tables
- [ ] Policies testées manuellement
- [ ] Docs RLS dans `docs/SECURITY.md`

---

## Phase 8 : UI/UX Polish

### 8.1 Design Responsive
- [ ] Mobile-first (Tailwind breakpoints)
- [ ] Tester sur iPhone/Android (viewport)
- [ ] Tester sur desktop (1920px+)

### 8.2 Accessibilité (a11y)
- [ ] Labels sur tous les inputs
- [ ] Focus visible sur navigation clavier (Tab)
- [ ] Contraste couleurs suffisant (WCAG AA)
- [ ] Attributs ARIA sur modals/dialogs

### 8.3 Performance
- [ ] Images optimisées (next/image)
- [ ] Lazy loading composants lourds (React.lazy)
- [ ] Paginer liste bookings si > 50 items
- [ ] Lighthouse score > 90 (Performance)

---

## Phase 9 : Tests & QA

### 9.1 Tests Fonctionnels
- [ ] Parcours joueur complet : landing → réservation → confirmation
- [ ] Parcours club complet : login → voir planning → confirmer réservation
- [ ] Test double-booking : 2 joueurs simultanés, même créneau → 1 seul passe
- [ ] Test annulation : créneau redevient disponible

### 9.2 Tests Navigateurs
- [ ] Chrome (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Firefox

### 9.3 Tests de Charge (optionnel v0)
- [ ] 10 réservations simultanées → aucun double-booking

---

## Phase 10 : Déploiement

### 10.1 Pré-Déploiement
- [ ] Variables env en production (Vercel/Railway)
- [ ] Migrations Supabase appliquées en prod (`supabase db push`)
- [ ] DNS configuré (si domaine custom)
- [ ] Seed data prod (1-2 clubs réels de test)

### 10.2 Déploiement Vercel
- [ ] Connecter repo GitHub
- [ ] Build réussit sans erreurs
- [ ] Déployer en preview
- [ ] Tester URL preview
- [ ] Promote en production

### 10.3 Post-Déploiement
- [ ] Monitoring activé (Vercel Analytics)
- [ ] Logs Supabase vérifiés
- [ ] Test réservation en prod (end-to-end)
- [ ] Envoyer lien à 2-3 beta testeurs

---

## Phase 11 : Documentation

### 11.1 Docs Internes
- [x] `docs/MVP.md` - Définition produit
- [x] `docs/ARCHITECTURE.md` - Architecture technique
- [x] `docs/TODO.md` - Cette checklist
- [ ] `docs/DEPLOYMENT.md` - Guide déploiement
- [ ] `docs/SECURITY.md` - Règles de sécurité

### 11.2 README.md
- [ ] Mettre à jour README avec :
  - Description projet
  - Stack technique
  - Installation locale (`npm install`, `.env.local`)
  - Commandes (`npm run dev`, `npm run build`)
  - Lien vers docs/

### 11.3 Changelog
- [ ] Créer `CHANGELOG.md` pour tracker versions
- [ ] v0.1 MVP - Date de release

---

## Phase 12 : Post-MVP (v1+)

### 12.1 Paiement en Ligne
- [ ] Intégrer Stripe
- [ ] Webhook Stripe → update `payment_status`
- [ ] Page succès/échec paiement

### 12.2 Notifications Avancées
- [ ] SMS via Twilio (rappels 24h avant)
- [ ] Notifications push (PWA)

### 12.3 Compte Joueur
- [ ] Page "Mes réservations" pour joueurs authentifiés
- [ ] Historique complet
- [ ] Réserver sans re-saisir infos

### 12.4 Multi-Clubs
- [ ] Owner peut gérer plusieurs clubs
- [ ] Switch entre clubs dans dashboard

### 12.5 Analytics Club
- [ ] Rapports CA par période
- [ ] Taux d'occupation terrains
- [ ] Graphiques (Chart.js ou Recharts)

---

## Priorités

### 🔴 Bloquant MVP
- [ ] DB + migrations
- [ ] Auth & middleware
- [ ] Anti double-booking
- [ ] Parcours joueur (réservation)
- [ ] Dashboard club (planning)

### 🟡 Important Avant Release
- [ ] Tests de sécurité
- [ ] Emails confirmation
- [ ] Design responsive
- [ ] Page 403/404

### 🟢 Nice to Have v0
- [ ] Filtres avancés
- [ ] Gestion produits UI polish
- [ ] Tests E2E automatisés

---

**Estimation totale MVP** : 40-60h de dev  
**Date cible v0** : À définir  
**Dernière mise à jour** : 2026-01-22
