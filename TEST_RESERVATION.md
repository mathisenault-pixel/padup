# ⚡ TEST RAPIDE - RÉSERVATIONS

## 🚀 LANCER LE TEST

```bash
npm run dev
```

---

## ✅ TEST EN 1 MINUTE

### 1. Créer une réservation

```
1. Aller sur http://localhost:3000/player/clubs
2. Cliquer sur "Le Hangar Sport & Co"
3. Cliquer sur un créneau VERT (ex: 14:00)
4. Cliquer "Continuer" (sans choisir de joueurs)
5. Cliquer "Confirmer la réservation"
```

**Attendu** :
- ✅ Alert "Réservation confirmée !"
- ✅ Redirection vers "Mes réservations"
- ✅ **Votre réservation apparaît en PREMIER** 🎉

---

### 2. Vérifier la persistance

```
1. Recharger la page (F5)
2. Vérifier que la réservation est toujours là
```

**Attendu** :
- ✅ **Réservation toujours visible** après rechargement

---

### 3. Annuler la réservation

```
1. Cliquer sur votre réservation
2. Cliquer "Annuler la réservation"
3. Confirmer
```

**Attendu** :
- ✅ Badge "Annulée" (rouge)
- ✅ Bouton "Annuler" disparaît

---

## 🔍 DEBUG SI PROBLÈME

### Vérifier localStorage

**Chrome DevTools** :
```
F12 → Application → Local Storage → localhost:3000
→ Chercher "demoReservations"
```

### Effacer les réservations

**Console** :
```javascript
localStorage.removeItem('demoReservations')
```

---

**⏱️ Temps** : 1 minute
**🎯 Résultat** : Réservations persistantes fonctionnelles ✅
