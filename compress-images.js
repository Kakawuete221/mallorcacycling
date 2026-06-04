const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const heicConvert = require('heic-convert');

// Disable Sharp caching to prevent file locking
sharp.cache(false);

const mediaDir = path.join(__dirname, 'media');

const SIZES = {
  sm: 400,
  md: 800,
  lg: 1200
};

async function compressImages() {
  console.log('Starting image compression in directory:', mediaDir);
  try {
    const files = fs.readdirSync(mediaDir);
    
    // Clean up temporary files first
    files.forEach(f => {
      if (f.includes('.tmp')) {
        try {
          fs.unlinkSync(path.join(mediaDir, f));
          console.log(`Cleaned up temporary file: ${f}`);
        } catch (e) {}
      }
    });

    // Refresh file list after cleanup
    const cleanFiles = fs.readdirSync(mediaDir);

    // Group files by base name
    const groups = {};
    cleanFiles.forEach(file => {
      const ext = path.extname(file).toLowerCase();
      // Skip directories
      if (fs.statSync(path.join(mediaDir, file)).isDirectory()) return;
      // Skip non-image files or icons/logos
      if (!['.webp', '.jpg', '.jpeg', '.png', '.heic'].includes(ext)) return;
      if (file.startsWith('icon-') || file === 'icon.svg' || file === 'icon.png') return;
      if (file.includes('mallorcaCyclingLogo') || file.includes('mallorcaCyclingIso')) return;
      
      // Skip generated files (e.g. name ends with -sm, -md, -lg before extension)
      const base = path.parse(file).name;
      if (base.endsWith('-sm') || base.endsWith('-md') || base.endsWith('-lg')) return;

      if (!groups[base]) {
        groups[base] = [];
      }
      groups[base].push(file);
    });

    const basenames = Object.keys(groups);
    console.log(`Found ${basenames.length} distinct images to process.`);

    for (const base of basenames) {
      console.log(`\nProcessing image: [${base}]`);
      const groupFiles = groups[base];

      // Determine best source file
      let bestFile = null;
      const extensionsOrder = ['.heic', '.jpeg', '.jpg', '.png', '.webp'];
      for (const ext of extensionsOrder) {
        bestFile = groupFiles.find(f => path.extname(f).toLowerCase() === ext);
        if (bestFile) break;
      }

      if (!bestFile) {
        console.log(`  No suitable source file found for ${base}.`);
        continue;
      }

      const sourcePath = path.join(mediaDir, bestFile);
      const sourceExt = path.extname(bestFile).toLowerCase();
      console.log(`  Selected source: ${bestFile} (${sourceExt})`);

      let imageBuffer;
      if (sourceExt === '.heic') {
        console.log(`  Decoding HEIC to JPEG buffer...`);
        const heicBuffer = fs.readFileSync(sourcePath);
        imageBuffer = await heicConvert({
          buffer: heicBuffer,
          format: 'JPEG',
          quality: 1
        });
      } else {
        imageBuffer = fs.readFileSync(sourcePath);
      }

      // Generate each size and format
      for (const [sizeName, width] of Object.entries(SIZES)) {
        console.log(`  Generating size: ${sizeName} (${width}px)...`);

        // AVIF
        const avifPath = path.join(mediaDir, `${base}-${sizeName}.avif`);
        await sharp(imageBuffer)
          .resize({ width, withoutEnlargement: true })
          .avif({ quality: 65 })
          .toFile(avifPath);
        
        // WebP
        const webpPath = path.join(mediaDir, `${base}-${sizeName}.webp`);
        await sharp(imageBuffer)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 75 })
          .toFile(webpPath);

        // JPEG
        const jpgPath = path.join(mediaDir, `${base}-${sizeName}.jpg`);
        await sharp(imageBuffer)
          .resize({ width, withoutEnlargement: true })
          .jpeg({ quality: 80, progressive: true })
          .toFile(jpgPath);

        console.log(`    Generated: ${base}-${sizeName}.avif, .webp, .jpg`);
      }
    }

    console.log('\n=========================================');
    console.log(`All images compressed and formatted successfully!`);
    console.log('=========================================');
  } catch (error) {
    console.error('Error during image processing:', error);
  }
}

compressImages();
