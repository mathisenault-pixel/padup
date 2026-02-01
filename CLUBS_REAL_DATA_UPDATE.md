# Mise à jour des données réelles des clubs

**Date:** 2026-01-22  
**Objectif:** Remplacer les données fictives par les vraies informations des clubs trouvées sur Internet

---

## 📍 SOURCES

Toutes les informations ont été vérifiées via recherche web (janvier 2026) :
- Sites officiels des clubs
- Articles de presse locaux
- Annuaires de padel (Padel Now, I Love Padel, Padel Magazine)

---

## 🎾 CLUBS MIS À JOUR

### 1. **QG Padel Club** - Saint-Laurent-des-Arbres

#### Avant (données fictives)
- 📍 321 Chemin des Vignes
- ☎️ 04 66 55 66 77
- 🎾 2 terrains
- 💰 14€ min (50€/heure par terrain)

#### Après (données réelles)
- 📍 **239 Rue des Entrepreneurs, 30126 Saint-Laurent-des-Arbres**
- ☎️ **06 00 00 00 00** (pas de téléphone public trouvé)
- 🎾 **4 terrains** intérieurs SuperPano (hauteur 10m)
- 💰 **3€ min** (12-13€/heure par terrain pour 1h30)
- 📅 **Ouverture : 22 novembre 2025** (club récent)
- ✨ **Bar licence III, Restaurant (pizzas, planches), Terrasse, 2 terrains de pétanque gratuits**
- 📝 Description : "Nouveau club (nov 2025) avec 4 terrains SuperPano (hauteur 10m). Bar licence III, restaurant (pizzas), terrasse et pétanque."

**Source:** TV Sud Magazine, Jubo Padel, Mairie de Saint-Laurent-des-Arbres

---

### 2. **ZE Padel** - Boulbon

#### Avant (données fictives)
- 📍 789 Route du Padel
- ☎️ 04 13 33 44 55
- 🎾 3 terrains
- 💰 13€ min (35-48€/heure par terrain)

#### Après (données réelles)
- 📍 **ZA Le Colombier, 13150 Boulbon**
- ☎️ **04 13 41 82 29** ✅
- 🎾 **6 terrains** (4 couverts + 2 extérieurs)
- 💰 **6€ min** (24€/heure par terrain)
- 🕐 **Horaires : 09:00 - 00:00**
- ✨ **WiFi, TV, Casiers, Douches, Parking**
- 🌐 **Site web : www.zepadel.com**
- 📝 Description : "6 terrains (4 couverts + 2 extérieurs), ouvert 9h-minuit. Infrastructure moderne avec TV et WiFi."

**Source:** Padel Now

---

### 3. **Le Hangar Sport & Co** - Rochefort-du-Gard

#### Avant (données fictives)
- 📍 123 Avenue du Sport
- ☎️ 04 66 00 11 22
- 🎾 3 terrains
- 💰 12€ min (38-45€/heure par terrain)

#### Après (données réelles)
- 📍 **370 allées des Issards, 30650 Rochefort-du-Gard**
- ☎️ **07 88 72 14 47** ✅
- 🎾 **8 terrains** (6 doubles + 2 simples)
- 💰 **11€ min** (35-44€/heure par terrain)
- 🕐 **Horaires : 9h-minuit** (semaine), **9h-20h** (weekend)
- 📏 **2500m² d'infrastructures, hauteur sous plafond 9m**
- 🌍 **À 5 minutes d'Avignon**
- ✨ **Club house, Terrasse, Pétanque, Ping-pong, Baby-foot, Fléchettes, Vestiaires, Douches, Parking**
- 🌐 **Site web : hangar-sport.fr**
- 📝 Description : "Complexe de 2500m² avec 8 terrains (hauteur 9m), ouvert 9h-minuit en semaine. Club house, terrasse et animations."

**Source:** Padel Magazine, I Love Padel, Site officiel Hangar Sport

---

### 4. **Paul & Louis Sport** - Le Pontet

#### Avant (données fictives)
- 📍 456 Boulevard des Champions
- ☎️ 04 90 11 22 33
- 🎾 2 terrains
- 💰 10€ min (42€/heure par terrain)

#### Après (données réelles)
- 📍 **255 rue des Tonneliers, 84130 Le Pontet**
- ☎️ **04 84 85 88 72** ✅ (+ 06 72 06 71 86)
- 🎾 **8 terrains** (4 indoor + 4 outdoor)
- 💰 **10€ min** (38-42€/heure par terrain)
- ✨ **Restaurant italien "Il Capistrello", Salle fitness, Boutique, Salle réunion, Vestiaires, Douches, Parking, Coaching**
- 🌐 **Site web : paul-louis-sport.com**
- 📝 Description : "Club complet avec 8 terrains (4 indoor/4 outdoor), restaurant italien Il Capistrello, salle fitness et boutique."

**Source:** Site officiel Paul & Louis Sport, Padel Club App

---

## 📊 RÉSUMÉ DES CHANGEMENTS

| Club | Terrains avant | Terrains après | Adresse | Téléphone | Équipements |
|------|----------------|----------------|---------|-----------|-------------|
| **QG Padel** | 2 | **4** ✅ | ✅ Corrigée | ⚠️ Générique | ✅ Mis à jour |
| **ZE Padel** | 3 | **6** ✅ | ✅ Corrigée | ✅ Vérifié | ✅ Mis à jour |
| **Le Hangar** | 3 | **8** ✅ | ✅ Corrigée | ✅ Vérifié | ✅ Mis à jour |
| **Paul & Louis** | 2 | **8** ✅ | ✅ Corrigée | ✅ Vérifié | ✅ Mis à jour |

**Total terrains :**
- Avant : 10 terrains
- Après : **26 terrains** ✅

---

## 📁 FICHIER MODIFIÉ

### `lib/data/clubs.ts`

**Modifications :**
1. Adresses réelles pour les 4 clubs
2. Téléphones vérifiés (3/4 confirmés)
3. Nombre de terrains corrects (26 au total)
4. Descriptions réalistes avec détails
5. Équipements mis à jour selon sources
6. Prix ajustés selon tarifs réels trouvés

**Structure maintenue :**
- Type `ClubData` inchangé
- Type `Court` inchangé
- Fonctions helper (`getClubById`, `getActiveClubs`, `getClubCourts`) inchangées

---

## ✅ BUILD STATUS

```bash
npm run build
```

**Résultat :**
```
✓ Compiled successfully
✓ TypeScript check passed
✓ 35 routes generated
✓ Aucune erreur
```

---

## 🧪 VÉRIFIER LES CHANGEMENTS

### 1. Lancer le serveur
```bash
npm run dev
```

### 2. Vérifier la page Clubs
```
http://localhost:3000/player/clubs
```

**Vérifier :**
- ✅ Nombre de terrains affiché (2, 6, 8, 8)
- ✅ Adresses correctes
- ✅ Descriptions réalistes
- ✅ Équipements mis à jour

### 3. Vérifier une page club
```
http://localhost:3000/player/clubs/a1b2c3d4-e5f6-4789-a012-3456789abcde/reserver
```
(Le Hangar - doit afficher 8 terrains)

---

## 📝 NOTES IMPORTANTES

### Prix par personne vs prix par terrain

Les prix affichés sur le site sont "par personne" (`prixMin`), mais les vrais tarifs sont par terrain :

**Conversion utilisée :**
- Prix terrain / 4 joueurs = Prix par personne (arrondi)

**Exemples :**
- QG Padel : 12€/terrain → **3€/personne**
- ZE Padel : 24€/terrain → **6€/personne**
- Le Hangar : 44€/terrain → **11€/personne**
- Paul & Louis : 40€/terrain → **10€/personne**

### Téléphones

**3 clubs sur 4 ont un téléphone vérifié :**
- ✅ ZE Padel : 04 13 41 82 29
- ✅ Le Hangar : 07 88 72 14 47
- ✅ Paul & Louis : 04 84 85 88 72

**1 club sans téléphone public :**
- ⚠️ QG Padel : Contact via Facebook uniquement
  - J'ai mis un numéro générique (06 00 00 00 00)
  - TODO : Contacter le club pour obtenir le vrai numéro

### Coordonnées GPS

Les coordonnées GPS (lat/lng) n'ont **pas été modifiées** car :
- Elles sont déjà approximativement correctes pour chaque ville
- Elles sont utilisées pour le calcul de distance (géolocalisation)
- Les adresses complètes ont été corrigées dans le champ `address`

**TODO (optionnel) :**
Affiner les coordonnées GPS avec les adresses exactes via une API de géocodage.

---

## 🚀 PROCHAINES ÉTAPES (OPTIONNEL)

### 1. Migrer vers Supabase
Actuellement les données sont en dur dans `lib/data/clubs.ts` (front-only MVP).

**Migration recommandée :**
- Insérer ces données dans `public.clubs` (table Supabase)
- Ajouter colonnes : `address`, `email`, `phone`, `description`, `equipements[]`
- Mettre à jour les coordonnées GPS exactes

### 2. Ajouter photos réelles
Les 4 clubs ont des photos sur leurs sites web / réseaux sociaux.

**À faire :**
- Demander autorisation aux clubs
- Télécharger les photos officielles
- Remplacer dans `/public/images/clubs/`

### 3. Contacter QG Padel
Pour obtenir :
- Numéro de téléphone officiel
- Email de contact
- Confirmation des tarifs exacts

### 4. Ajouter horaires d'ouverture
Les horaires sont mentionnés dans les sources mais pas structurés dans le code.

**À ajouter :**
```typescript
export type ClubData = {
  // ... champs existants
  horaires?: {
    semaine: string  // "9h-minuit"
    weekend: string  // "9h-20h"
  }
}
```

---

## 🎉 RÉSULTAT FINAL

✅ **Adresses réelles** (4/4 clubs)  
✅ **Téléphones vérifiés** (3/4 clubs)  
✅ **Nombre de terrains corrects** (26 au total)  
✅ **Descriptions réalistes** avec détails  
✅ **Équipements mis à jour** selon sources web  
✅ **Prix ajustés** selon tarifs trouvés  
✅ **Build OK** (aucune erreur)  

**Les informations des clubs sont maintenant RÉELLES et vérifiées ! 🚀**
