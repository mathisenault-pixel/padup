# MVP Pad'up - Définition Produit

## 🎯 Vision

**Pad'up** est une plateforme de réservation en ligne pour clubs de padel indépendants, permettant aux joueurs de réserver facilement un terrain et aux clubs de gérer leur planning et leurs services additionnels (boissons, snacks).

---

## 👥 Cibles

### Clubs de Padel Indépendants
- **Taille** : 2 à 8 terrains
- **Besoin** : Gérer les réservations, éviter les doubles réservations, vendre des extras (boissons/snacks)
- **Persona** : Propriétaire/gérant qui veut digitiser son club sans complexité

### Joueurs de Padel
- **Besoin** : Trouver un terrain disponible près de chez eux, réserver en quelques clics
- **Persona** : Joueur amateur/régulier, 25-45 ans, mobile-first

---

## 🎮 Parcours Joueur MVP (v0)

### 1. **Découvrir les disponibilités**
- Accéder au site (pas de login obligatoire pour consulter)
- Voir la liste des clubs disponibles
- Filtrer par date/heure/localisation (optionnel v0)

### 2. **Réserver un terrain**
- Sélectionner un club
- Voir le calendrier des créneaux disponibles (30 min fixes)
- Choisir un créneau
- Fournir ses coordonnées (nom, email, téléphone)
- Confirmer la réservation

### 3. **Confirmer et payer (optionnel v0)**
- Recevoir un email de confirmation
- **Paiement** : Optionnel en v0 (peut être "sur place")
- Voir la réservation dans "Mes réservations" (si authentifié)

### Hors scope Joueur v0
- ❌ Compte utilisateur obligatoire (optionnel)
- ❌ Historique avancé
- ❌ Abonnements/fidélité
- ❌ Inviter des joueurs
- ❌ Tournois
- ❌ Notation/avis

---

## 🏢 Parcours Club MVP (v0)

### 1. **Accéder au dashboard club** (`/club`)
- Login requis (email/magic link Supabase)
- Vérification du rôle (owner/staff via table `memberships`)
- Vue d'accueil : stats rapides (réservations du jour, semaine)

### 2. **Voir le planning** (`/club/bookings`)
- Calendrier visuel des réservations par terrain
- Filtrer par date, terrain, statut
- Voir détails : qui a réservé (nom, contact), horaire, statut

### 3. **Gérer une réservation**
- Voir détail d'une réservation (modal/page)
- Modifier le statut : `pending` → `confirmed` → `completed` / `cancelled`
- Annuler une réservation (notification email optionnelle)

### 4. **Ajouter des extras** (`/club/products`)
- Ajouter des boissons/snacks à une réservation existante
- Voir liste des commandes (nom produit, prix, quantité)

### 5. **Voir liste des commandes**
- Page `/club/orders` (ou intégré dans bookings)
- Liste des extras vendus par date/réservation

### Hors scope Club v0
- ❌ Gestion multi-clubs avancée (1 club par owner pour MVP)
- ❌ Rapports financiers détaillés
- ❌ Gestion du staff (permissions granulaires)
- ❌ Promotions/coupons
- ❌ Configuration horaires d'ouverture complexe
- ❌ Intégration comptable

---

## 📋 Règles Métier MVP

### Anti Double-Booking
- **Source de vérité** : Supabase Postgres
- **Créneaux fixes** : 30 minutes (ex: 10h00, 10h30, 11h00...)
- **Vérification** : Avant de créer une réservation, checker si `court_id` + `date` + `time_slot` est déjà pris
- **Statut réservation** : `pending`, `confirmed`, `completed`, `cancelled`

### Annulation
- **Joueur** : Peut annuler jusqu'à X heures avant (à définir, défaut 24h)
- **Club** : Peut annuler n'importe quand avec notification
- **Effet** : Statut → `cancelled`, créneau redevient disponible

### Statuts de réservation
```
pending     → Réservation créée, en attente de confirmation club (ou paiement)
confirmed   → Confirmée par le club (ou auto-confirmée si paiement)
completed   → Créneau passé, terrain utilisé
cancelled   → Annulée (joueur ou club)
```

---

## 🚫 Hors Scope v0 (pour versions futures)

### Fonctionnalités avancées
- ❌ Tournois / compétitions
- ❌ Abonnements Pad'up+ / fidélité
- ❌ Multi-clubs avancé (réseau de clubs)
- ❌ App mobile native (iOS/Android)
- ❌ Paiement en ligne intégré (Stripe/PayPal)
- ❌ Notifications push
- ❌ Chat joueur-club
- ❌ Système de notation/avis
- ❌ Matchmaking (trouver des partenaires)
- ❌ Gestion des membres/abonnés du club
- ❌ Cours de padel / coaching

### Technique
- ❌ Multi-tenant complexe (isolation stricte par club)
- ❌ Analytics avancés
- ❌ API publique pour tiers
- ❌ Webhooks

---

## ✅ Critères de Succès MVP

### Fonctionnel
- [ ] Un joueur peut voir les dispos et réserver un terrain en < 2 min
- [ ] Un club peut voir son planning et confirmer/annuler une réservation
- [ ] Aucun double-booking possible (tests inclus)
- [ ] Emails de confirmation envoyés (joueur + club)

### Technique
- [ ] Build Next.js stable (0 erreur)
- [ ] Auth Supabase fonctionnelle (joueur optionnel, club requis)
- [ ] DB Supabase avec migrations versionnées
- [ ] Tests de sécurité passent (pas d'accès club sans rôle)

### UX
- [ ] Design simple, épuré (Tailwind)
- [ ] Responsive (mobile-first)
- [ ] Temps de chargement < 2s (home/booking)

---

## 📅 Roadmap Post-MVP

### v1 - Paiement & Notifications
- Intégration Stripe
- Notifications SMS (Twilio)
- Rappels automatiques 24h avant

### v2 - Expérience joueur avancée
- Compte utilisateur complet
- Historique de réservations
- Inviter des partenaires
- Favoris clubs

### v3 - Fonctionnalités club avancées
- Multi-clubs pour un owner
- Rapports financiers
- Gestion staff (permissions)
- Promotions/codes promo

### v4 - Social & Communauté
- Tournois
- Matchmaking
- Système de notation
- Feed d'activité

---

## 🎯 Métriques de Succès (post-lancement)

- **Joueurs** : Taux de conversion visite → réservation > 10%
- **Clubs** : Réduction du temps de gestion planning (vs papier/tel) > 50%
- **Technique** : Uptime > 99.5%
- **Support** : Temps de réponse < 24h

---

**Version** : 0.1 MVP  
**Dernière mise à jour** : 2026-01-22  
**Auteur** : Équipe Pad'up
