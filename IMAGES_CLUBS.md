# Guide pour remplacer les images des clubs

## 📸 Images actuelles

Pour le moment, le site utilise des **images temporaires de terrains de padel** provenant d'Unsplash. Pour une expérience optimale, vous devriez les remplacer par les **vraies photos** de chaque club.

## 🔍 Comment obtenir les vraies images

### Option 1 : Sites officiels des clubs

1. **Le Hangar Sport & Co**
   - Site : https://hangar-sport.fr
   - Téléchargez des photos de leurs installations

2. **Paul & Louis Sport**
   - Site : https://www.paul-louis-sport.com
   - Téléchargez des photos de leurs terrains

3. **ZE Padel**
   - Site : https://zepadel.com
   - Téléchargez des photos de leur complexe

4. **QG Padel Club**
   - Contact : +33 6 16 72 31 13
   - Demandez des photos officielles

### Option 2 : Créer un dossier d'images local

1. Créez un dossier `/public/images/clubs/` dans votre projet
2. Placez-y les images des clubs avec ces noms :
   - `le-hangar.jpg`
   - `paul-louis.jpg`
   - `ze-padel.jpg`
   - `qg-padel.jpg`

## 🔧 Comment remplacer les images dans le code

### Dans le fichier `app/player/(authenticated)/clubs/page.tsx` :

Remplacez les URLs Unsplash par les chemins de vos images :

```typescript
const [clubs, setClubs] = useState<Club[]>([
  {
    id: 1,
    nom: 'Le Hangar Sport & Co',
    // ... autres propriétés
    imageUrl: '/images/clubs/le-hangar.jpg', // ← Changez cette ligne
  },
  {
    id: 2,
    nom: 'Paul & Louis Sport',
    // ... autres propriétés
    imageUrl: '/images/clubs/paul-louis.jpg', // ← Changez cette ligne
  },
  {
    id: 3,
    nom: 'ZE Padel',
    // ... autres propriétés
    imageUrl: '/images/clubs/ze-padel.jpg', // ← Changez cette ligne
  },
  {
    id: 4,
    nom: 'QG Padel Club',
    // ... autres propriétés
    imageUrl: '/images/clubs/qg-padel.jpg', // ← Changez cette ligne
  },
])
```

### Faites la même chose dans `app/player/dashboard/page.tsx`

## ✨ Recommandations pour les images

- **Format** : JPG ou WebP (pour de meilleures performances)
- **Taille recommandée** : 1200x800 pixels
- **Poids** : Moins de 500 Ko par image (optimisez avec [TinyPNG](https://tinypng.com))
- **Qualité** : Images nettes et bien éclairées
- **Contenu** : Montrez les terrains, l'ambiance, les installations

## 📝 Notes importantes

⚠️ **Droits d'utilisation** : Assurez-vous d'avoir l'autorisation d'utiliser les photos des clubs sur votre site.

💡 **Astuce** : Contactez directement les clubs par téléphone ou email pour demander des photos officielles en haute qualité.

## 🆘 Besoin d'aide ?

Si vous avez des questions ou besoin d'aide pour intégrer les images, n'hésitez pas à demander !



