# 🧪 TEST DU FREEZE - À FAIRE MAINTENANT

## ✅ CE QUI A ÉTÉ FAIT

1. ✅ Clean install : `rm -rf node_modules .next package-lock.json && npm install`
2. ✅ Instrumentation ajoutée dans `clubs/page.tsx` (onClick sur Link)
3. ✅ Instrumentation ajoutée dans `tournois/page.tsx` (onClick sur div)
4. ✅ Timer de navigation ajouté dans `ReservationPage`
5. ✅ Build réussi sans erreurs

---

## 🚀 PROTOCOLE DE TEST (2 minutes)

### Étape 1 : Lancer le serveur
```bash
cd /Users/mathisenault/Desktop/padup.one
npm run dev
```

### Étape 2 : Ouvrir l'app
```
http://localhost:3000/player/clubs
```

### Étape 3 : Ouvrir la console Chrome
```
F12 ou Cmd+Option+I
→ Onglet Console
```

---

## 📝 TEST A : Clic sur club (freeze attendu)

### Action :
1. Sur la page `/player/clubs`
2. Cliquer sur **"Le Hangar Sport & Co"** (premier club)

### Ce qui DOIT apparaître immédiatement dans la console :
```
🔘 [CLICK] Club navigation start: 1 Le Hangar Sport & Co 1737577200000
```

### Puis SI la navigation fonctionne :
```
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
club-navigation: XXXms  ← Temps de navigation
🔄 [SLOTS] Generating: 1
⏱️ [SLOTS] Generated in X.XXms
🔄 [DAYS] Generating: 1
⏱️ [DAYS] Generated in X.XXms
🔄 [TERRAINS] Generating: 1
⏱️ [TERRAINS] Generated X in X.XXms
🔄 [CACHE] Recalculating: 1
⏱️ [CACHE] Built for 8 terrains in X.XXms
⏱️ [RENDER] Total compute: X.XXms
```

---

## 🔍 DIAGNOSTIC SELON LES LOGS

### CAS 1 : Boucle de render infinie
```
🔘 [CLICK] Club navigation start: 1 Le Hangar Sport & Co
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
🔄 ReservationPage render: 2
🔄 ReservationPage render: 3
🔄 ReservationPage render: 4
🔄 ReservationPage render: 5
... (continue jusqu'à 20, 50, 100+)
🔄 [CACHE] Recalculating: 1
🔄 [CACHE] Recalculating: 2
🔄 [CACHE] Recalculating: 3
... (spam)
⚠️ [DEPS] club changed reference!  ← Peut apparaître
```

**Diagnostic** : Boucle de re-renders
**Cause** : Dépendances instables (`club`, `terrains`, `unavailableSet`)
**Solution** : Stabiliser les deps (useMemo déjà appliqué, vérifier pourquoi ça ne marche pas)

---

### CAS 2 : Calcul lourd unique
```
🔘 [CLICK] Club navigation start: 1 Le Hangar Sport & Co
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
🔄 [CACHE] Recalculating: 1
⏱️ [CACHE] Built for 8 terrains in 2500.00ms  ← TROP LONG !
🔴 [RENDER] SLOW! 2600.45ms > 50ms
... puis freeze 5-10 secondes
⏱️ [RENDER] Total compute: 2600.45ms
```

**Diagnostic** : Calcul trop lent (> 1 seconde)
**Cause** : `generateUnavailableSlots()` prend trop de temps
**Solution** : Précalculer ou optimiser l'algorithme

---

### CAS 3 : Navigation bloquée
```
🔘 [CLICK] Club navigation start: 1 Le Hangar Sport & Co
... puis rien (pas de "🚀 RESERVER PAGE VERSION")
... freeze
```

**Diagnostic** : Next.js routing bloqué
**Cause** : Problème de navigation/middleware
**Solution** : Vérifier `middleware.ts` et mode démo

---

### CAS 4 : Deps instables sans boucle
```
🔘 [CLICK] Club navigation start: 1 Le Hangar Sport & Co
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
⚠️ [DEPS] club changed reference!
🔄 [CACHE] Recalculating: 1
⏱️ [CACHE] Built for 8 terrains in 0.52ms
🔄 ReservationPage render: 2  ← 1 re-render de trop
⚠️ [DEPS] club changed reference!
🔄 [CACHE] Recalculating: 2
⏱️ [CACHE] Built for 8 terrains in 0.48ms
... puis s'arrête (2-3 renders max)
⏱️ [RENDER] Total compute: 5.34ms
```

**Diagnostic** : Deps instables mais pas de boucle (React Strict Mode ?)
**Cause** : `club` change de référence 1-2 fois puis se stabilise
**Solution** : Normal en dev, vérifier en prod

---

## 📊 TEST B : Clic sur tournoi (pour comparer)

### Action :
1. Aller sur `/player/tournois`
2. Cliquer sur un tournoi

### Ce qui doit apparaître :
```
🔘 [CLICK] Tournoi clicked: 1 Tournoi du Hangar 1737577200000
tournoi-modal: XXXms
... modal s'ouvre
```

**Si freeze aussi** : Problème général (pas spécifique à ReservationPage)
**Si pas freeze** : Problème spécifique à ReservationPage

---

## 🎯 INFORMATIONS À FOURNIR

### 1. Copier-coller TOUS les logs console
```
[Depuis le moment où vous cliquez jusqu'à 10 secondes après]
```

### 2. Répondre à ces questions :
```
- Le message "🔘 [CLICK] Club navigation start" apparaît ? OUI/NON
- Le message "🚀 RESERVER PAGE VERSION" apparaît ? OUI/NON
- Combien de fois "🔄 ReservationPage render" ? (compter)
- Combien de fois "🔄 [CACHE] Recalculating" ? (compter)
- Des warnings "⚠️ [DEPS]" apparaissent ? OUI/NON
- Un message "🔴 [RENDER] SLOW!" apparaît ? OUI/NON
```

### 3. CPU usage
```
Moniteur d'activité (⌘ + Espace → "Moniteur")
→ Chrome Helper (Renderer) : X%
```

### 4. Comportement
```
- Freeze immédiat (< 1 seconde) ? OUI/NON
- Freeze progressif (5-10 secondes) ? OUI/NON
- Page ne charge jamais ? OUI/NON
- Page charge mais lag ? OUI/NON
```

---

## 🆘 RÉSULTATS ATTENDUS

### ✅ SI RÉUSSI (pas de freeze)
```
🔘 [CLICK] Club navigation start: 1 Le Hangar Sport & Co
club-navigation: 50.23ms
🚀 RESERVER PAGE VERSION 1737577200000
🔄 ReservationPage render: 1
🔄 [CACHE] Recalculating: 1
⏱️ [CACHE] Built for 8 terrains in 0.52ms
⏱️ [RENDER] Total compute: 2.34ms

CPU : 20-30%
Page : S'affiche normalement
```

**→ Problème résolu !** 🎉

### 🔴 SI ÉCHEC (freeze)
```
Envoyer :
1. TOUS les logs console (copier-coller)
2. Réponses aux 4 questions ci-dessus
3. Screenshot du Moniteur d'activité (CPU)
```

---

## 📂 FICHIERS MODIFIÉS

1. `app/player/(authenticated)/clubs/page.tsx`
   - Ligne 296-301 : Ajout onClick avec logs

2. `app/player/(authenticated)/tournois/page.tsx`
   - Ligne 350-355 : Ajout console.log dans onClick

3. `app/player/(authenticated)/clubs/[id]/reserver/page.tsx`
   - Ligne 178-181 : Ajout console.timeEnd('club-navigation')

---

**⏱️ Temps estimé** : 2 minutes de test
**🎯 Objectif** : Identifier si boucle render, calcul lourd, ou navigation bloquée
**📝 Action** : Tester maintenant et envoyer les logs !
