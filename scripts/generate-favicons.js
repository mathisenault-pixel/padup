/**
 * Script de génération de favicons optimisés
 * 
 * Génère :
 * - favicon-16.png (16x16)
 * - favicon-32.png (32x32)
 * - favicon.ico (multi-sizes 16/32/48)
 * 
 * À partir de public/icon.png (1024x1024)
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../public/icon.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

async function generateFavicons() {
  console.log('🎨 Génération des favicons optimisés...\n');

  try {
    // Vérifier que le fichier source existe
    if (!fs.existsSync(INPUT_FILE)) {
      throw new Error(`Fichier source introuvable: ${INPUT_FILE}`);
    }

    // Générer favicon-16.png (16x16)
    console.log('📦 Génération de favicon-16.png (16x16)...');
    await sharp(INPUT_FILE)
      .resize(16, 16, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-16.png'));
    console.log('   ✅ favicon-16.png créé\n');

    // Générer favicon-32.png (32x32)
    console.log('📦 Génération de favicon-32.png (32x32)...');
    await sharp(INPUT_FILE)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(path.join(OUTPUT_DIR, 'favicon-32.png'));
    console.log('   ✅ favicon-32.png créé\n');

    // Générer les versions intermédiaires pour favicon.ico
    console.log('📦 Génération des versions pour favicon.ico...');
    
    // 16x16 pour ICO
    const buffer16 = await sharp(INPUT_FILE)
      .resize(16, 16, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // 32x32 pour ICO
    const buffer32 = await sharp(INPUT_FILE)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    // 48x48 pour ICO
    const buffer48 = await sharp(INPUT_FILE)
      .resize(48, 48, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    console.log('   ✅ Versions 16/32/48 générées\n');

    // Note: Sharp ne peut pas créer directement des fichiers .ico
    // Il faut utiliser un outil externe ou une lib dédiée
    console.log('⚠️  ATTENTION: favicon.ico doit être généré avec un outil externe');
    console.log('   Utiliser: https://www.favicon-generator.org/');
    console.log('   Ou installer: npm install png-to-ico --save-dev\n');

    console.log('✅ Génération terminée!\n');
    console.log('📂 Fichiers créés:');
    console.log('   - public/favicon-16.png');
    console.log('   - public/favicon-32.png');
    console.log('\n⚠️  TODO: Créer favicon.ico avec un outil externe\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

generateFavicons();
