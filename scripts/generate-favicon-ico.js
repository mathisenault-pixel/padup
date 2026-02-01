/**
 * Script de génération de favicon.ico multi-tailles
 * 
 * Génère un fichier favicon.ico contenant les tailles 16x16, 32x32, 48x48
 * à partir de public/icon.png
 */

const pngToIco = require('png-to-ico').default || require('png-to-ico');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../public/icon.png');
const OUTPUT_FILE = path.join(__dirname, '../public/favicon.ico');
const TEMP_DIR = path.join(__dirname, '../.temp-favicons');

async function generateFaviconIco() {
  console.log('🎨 Génération de favicon.ico multi-tailles...\n');

  try {
    // Créer dossier temporaire
    if (!fs.existsSync(TEMP_DIR)) {
      fs.mkdirSync(TEMP_DIR, { recursive: true });
    }

    // Générer les 3 tailles PNG temporaires
    console.log('📦 Génération des PNG temporaires...');
    
    const temp16 = path.join(TEMP_DIR, 'favicon-16.png');
    const temp32 = path.join(TEMP_DIR, 'favicon-32.png');
    const temp48 = path.join(TEMP_DIR, 'favicon-48.png');

    await sharp(INPUT_FILE)
      .resize(16, 16, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(temp16);
    console.log('   ✅ 16x16 créé');

    await sharp(INPUT_FILE)
      .resize(32, 32, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(temp32);
    console.log('   ✅ 32x32 créé');

    await sharp(INPUT_FILE)
      .resize(48, 48, {
        kernel: sharp.kernel.lanczos3,
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toFile(temp48);
    console.log('   ✅ 48x48 créé\n');

    // Générer le fichier .ico
    console.log('📦 Génération de favicon.ico...');
    const buf = await pngToIco([temp16, temp32, temp48]);
    fs.writeFileSync(OUTPUT_FILE, buf);
    console.log('   ✅ favicon.ico créé\n');

    // Nettoyer les fichiers temporaires
    console.log('🧹 Nettoyage...');
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    console.log('   ✅ Fichiers temporaires supprimés\n');

    console.log('✅ favicon.ico multi-tailles généré avec succès!\n');
    console.log('📂 Fichier créé: public/favicon.ico');
    console.log('📏 Tailles incluses: 16x16, 32x32, 48x48\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    // Nettoyer en cas d'erreur
    if (fs.existsSync(TEMP_DIR)) {
      fs.rmSync(TEMP_DIR, { recursive: true, force: true });
    }
    process.exit(1);
  }
}

generateFaviconIco();
