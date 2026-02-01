# 🚀 Espace Club - Guide de démarrage rapide

## 🎯 Ce qui a été créé

✅ **Espace d'administration /club** (MVP front-only)  
✅ **5 pages** : Login, Dashboard, Terrains, Réservations, Paramètres  
✅ **Auth club** : Cookie-based, multi-clubs  
✅ **Store global** : Réservations + blocages (Zustand)  
✅ **Synchronisation** : Annulation réservation → créneau dispo instantanément  

---

## 📁 Fichiers créés (9 nouveaux)

### Infrastructure
1. `lib/data/clubs.ts` - Source unique clubs (4 clubs avec courts)
2. `lib/clubAuth.ts` - Auth front-only (login/logout/session)
3. `store/reservationsStore.ts` - Store global Zustand

### Pages UI
4. `app/club/login/page.tsx` - Connexion
5. `app/club/layout.tsx` - Layout + guard + header
6. `app/club/page.tsx` - Dashboard
7. `app/club/courts/page.tsx` - Gestion terrains
8. `app/club/reservations/page.tsx` - Réservations + annulations
9. `app/club/settings/page.tsx` - Paramètres + logout

### Documentation
10. `CLUB_ADMIN_SPACE.md` - Doc complète
11. `CLUB_QUICK_START.md` - Ce guide

---

## 🔑 Identifiants de test (MVP)

**Emails disponibles:**
```
admin@lehangar.fr       → Le Hangar Sport & Co
admin@pauletlouis.fr    → Paul & Louis Sport
admin@zepadel.fr        → ZE Padel
admin@qgpadel.fr        → QG Padel Club
club@padup.one          → Le Hangar (fallback)
```

**Mot de passe (tous):**
```
club2026
```

---

## 🧪 Tester l'espace club

### 1. Lancer le serveur
```bash
npm run dev
```

### 2. Ouvrir `/club`
```
http://localhost:3000/club
```

### 3. Se connecter
```
Email: admin@lehangar.fr
Password: club2026
```

### 4. Explorer
- ✅ Dashboard : Voir les stats (réservations, blocages)
- ✅ Terrains : Activer/désactiver terrains
- ✅ Réservations : Voir et annuler réservations
- ✅ Paramètres : Infos club + logout

---

## 📊 Données de démo

### Réservations (Le Hangar)
```typescript
{
  id: 'res-1',
  clubId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde', // Le Hangar
  courtId: 'court-hangar-1',
  slotId: 'slot-14h00-15h30',
  date: '2026-01-25',
  playerName: 'Jean Dupont',
  status: 'confirmed',
}
```

### Blocages (Le Hangar)
```typescript
{
  id: 'block-1',
  clubId: 'a1b2c3d4-e5f6-4789-a012-3456789abcde',
  courtId: 'court-hangar-1',
  slotId: 'slot-10h00-11h30',
  date: '2026-01-26',
  reason: 'Maintenance terrain',
}
```

---

## 🔐 Protection des routes

**Sans session:**
```
/club           → redirect /club/login
/club/courts    → redirect /club/login
/club/...       → redirect /club/login
```

**Avec session valide:**
```
/club           → Dashboard ✅
/club/courts    → Terrains ✅
/club/...       → Page OK ✅
```

---

## 🎨 Structure UI

```
┌─────────────────────────────────────────────────┐
│  [Logo] Le Hangar Sport & Co                    │
│  Dashboard | Terrains | Réservations | Params   │
│                            admin@lehangar.fr  [X]│
├─────────────────────────────────────────────────┤
│                                                  │
│  📊 Dashboard                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│  │ Réserv. │ │ Actives │ │  Total  │ │ Bloqués││
│  │ auj.    │ │         │ │         │ │        ││
│  │   2     │ │    2    │ │    2    │ │   1    ││
│  └─────────┘ └─────────┘ └─────────┘ └────────┘│
│                                                  │
│  Quick actions:                                  │
│  [Gérer terrains] [Voir réservations] [Params]  │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Synchronisation temps réel

### Scénario: Annulation réservation

**Côté Club:**
1. Aller sur `/club/reservations`
2. Cliquer "Annuler" sur une réservation
3. Confirmer

**Résultat:**
```typescript
// Store global
cancelReservation(reservationId)
  → reservations.map(r => r.id === reservationId ? { ...r, status: 'cancelled' } : r)
  → isSlotAvailable(...) return true
  → Créneau redevient disponible ✅
```

**Côté Player:**
1. Rafraîchir la page `/player/clubs/[id]/reserver`
2. Le créneau est maintenant disponible (pas grisé)

---

## 📦 Dépendances ajoutées

```bash
npm install zustand  # State management ✅
```

---

## ✅ Build

```bash
npm run build
```

**Résultat:**
```
✓ Compiled successfully
✓ TypeScript check passed
✓ 34 routes generated (5 nouvelles routes /club)
```

---

## 🚀 Prochaines étapes (suggestions)

### Court terme
1. **Bloquer un créneau (UI)**
   - Formulaire dans `/club/reservations`
   - Sélection: date, court, créneau, raison
   - Action: `blockSlot(payload)`

2. **Calendrier visuel**
   - Grille terrains × créneaux
   - Vue semaine/jour
   - Réservations (vert), blocages (orange), disponible (blanc)

### Moyen terme
3. **Migration Supabase**
   - Table `club_admins` (user → club)
   - RLS policies
   - Auth Supabase au lieu de cookie

4. **Édition club**
   - Modifier nom, adresse, email, téléphone
   - Upload logo
   - Gérer équipements

5. **Analytics**
   - Taux d'occupation
   - Revenus
   - Joueurs récurrents

---

## 🐛 Debug

### Session ne persiste pas
```typescript
// Vérifier le cookie dans DevTools
document.cookie // doit contenir "club_session=..."

// Forcer logout + login
logoutClub()
loginClub('admin@lehangar.fr', 'club2026')
```

### Redirect loop
```typescript
// Vérifier que /club/login n'est pas protégé
if (pathname === '/club/login') {
  return <>{children}</>  // Pas de guard ✅
}
```

### Store ne se met pas à jour
```typescript
// Vérifier import
import { useReservationsStore } from '@/store/reservationsStore'

// Utiliser dans composant
const { cancelReservation } = useReservationsStore()
```

---

## 💡 Tips

### Multi-onglets
Le store Zustand est local (par onglet). Si vous ouvrez `/club` et `/player` dans 2 onglets, ils ne seront pas synchronisés en temps réel. Rafraîchir pour voir les changements.

### Session expiration
La session dure 7 jours. Après, logout automatique au prochain accès.

### Mot de passe personnalisé
```bash
# .env.local
NEXT_PUBLIC_CLUB_DEMO_PASSWORD=monmotdepasse2026
```

---

## 📚 Documentation complète

Voir `CLUB_ADMIN_SPACE.md` pour:
- Architecture technique détaillée
- Types TypeScript
- Fonctions du store
- Tests à faire
- Roadmap

---

## 🎉 Résumé

✅ **Espace /club fonctionnel** en 9 fichiers  
✅ **Auth + protection** des routes  
✅ **Multi-clubs** (4 clubs disponibles)  
✅ **Store global** (réservations + blocages)  
✅ **MVP front-only** (pas de Supabase requis)  
✅ **Build OK** (aucune erreur)  

**Prêt à gérer votre club ! 🏆**
