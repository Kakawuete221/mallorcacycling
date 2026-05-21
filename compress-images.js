const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const mediaDir = path.join(__dirname, 'media');

async function compressImages() {
  console.log('Starting image compression in directory:', mediaDir);
  try {
    const files = fs.readdirSync(mediaDir);
    const jpegs = files.filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg'));

    console.log(`Found ${jpegs.length} JPEG files to compress.`);

    for (const file of jpegs) {
      const inputPath = path.join(mediaDir, file);
      const outputName = path.parse(file).name + '.webp';
      const outputPath = path.join(mediaDir, outputName);

      console.log(`Processing: ${file} -> ${outputName}`);

      const beforeStats = fs.statSync(inputPath);
      const beforeSize = (beforeStats.size / (1024 * 1024)).toFixed(2);

      // Compress and resize
      await sharp(inputPath)
        .resize({ width: 1920, withoutEnlargement: true }) // limit max width to 1920px
        .webp({ quality: 80 }) // WebP format with quality 80
        .toFile(outputPath);

      const afterStats = fs.statSync(outputPath);
      const afterSize = (afterStats.size / (1024 * 1024)).toFixed(2);
      const reduction = ((1 - afterStats.size / beforeStats.size) * 100).toFixed(1);

      console.log(`  Size before: ${beforeSize} MB`);
      console.log(`  Size after: ${afterSize} MB (Reduced by ${reduction}%)`);
    }

    console.log('Image compression completed successfully!');
  } catch (error) {
    console.error('Error compressing images:', error);
  }
}

compressImages();
