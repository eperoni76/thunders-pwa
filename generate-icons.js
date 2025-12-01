const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceImage = './src/assets/images/thunders_app.JPG';
const srcDir = './src';
const iconsDir = path.join(srcDir, 'assets', 'icons');

// Crea la directory icons se non esiste
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

async function generateIcons() {
  try {
    console.log('Generazione icone PWA Thunders...');
    
    // Genera le icone PNG per la PWA
    for (const size of sizes) {
      const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'cover',
          position: 'center'
        })
        .png()
        .toFile(outputPath);
      console.log(`✓ Generata icona ${size}x${size}`);
    }

    // Genera il favicon.ico (32x32) con bordi arrotondati
    const faviconPath = path.join(srcDir, 'favicon.ico');
    const size = 32;
    const radius = 6; // Raggio dei bordi arrotondati
    
    // Crea una maschera SVG con bordi arrotondati
    const roundedCorners = Buffer.from(
      `<svg><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`
    );
    
    await sharp(sourceImage)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .composite([{
        input: roundedCorners,
        blend: 'dest-in'
      }])
      .png()
      .toFile(faviconPath.replace('.ico', '-temp.png'));
    
    // Rinomina il file PNG in ICO (alcuni browser accettano PNG con estensione .ico)
    fs.renameSync(faviconPath.replace('.ico', '-temp.png'), faviconPath);
    console.log('✓ Generato favicon.ico con bordi arrotondati');

    // Genera anche apple-touch-icon per iOS
    const appleTouchIconPath = path.join(iconsDir, 'apple-touch-icon.png');
    await sharp(sourceImage)
      .resize(180, 180, {
        fit: 'cover',
        position: 'center'
      })
      .png()
      .toFile(appleTouchIconPath);
    console.log('✓ Generato apple-touch-icon.png');

    console.log('\n✅ Tutte le icone sono state generate con successo!');
  } catch (error) {
    console.error('❌ Errore durante la generazione delle icone:', error);
    process.exit(1);
  }
}

generateIcons();
