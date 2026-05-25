const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Disable Sharp caching to prevent file locking
sharp.cache(false);

const mediaDir = path.join(__dirname, 'media');

async function compressImages() {
  console.log('Starting image compression in directory:', mediaDir);
  try {
    const files = fs.readdirSync(mediaDir);
    
    // Clean up any leftover temporary files from previous failed runs
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

    const targetFiles = cleanFiles.filter(f => {
      const ext = path.extname(f).toLowerCase();
      // Skip any temporary files
      if (f.includes('.tmp')) return false;
      return ext === '.webp' || ext === '.jpg' || ext === '.jpeg' || ext === '.png';
    });

    console.log(`Found ${targetFiles.length} image files to process.`);

    let totalSaved = 0;

    for (const file of targetFiles) {
      const inputPath = path.join(mediaDir, file);
      
      const stats = fs.statSync(inputPath);
      const beforeSize = stats.size;
      const beforeSizeMB = (beforeSize / (1024 * 1024)).toFixed(2);
      
      // Skip if already very small (e.g. logos/icons) to avoid loss of quality
      if (beforeSize < 120 * 1024) {
        console.log(`Skipping small file: ${file} (${(beforeSize / 1024).toFixed(1)} KB)`);
        continue;
      }

      console.log(`Processing: ${file} (${beforeSizeMB} MB)`);

      const tempPath = inputPath + '.tmp.webp';
      const outputName = path.parse(file).name + '.webp';
      const outputPath = path.join(mediaDir, outputName);

      // Read file into buffer to avoid keeping the file locked
      const imageBuffer = fs.readFileSync(inputPath);

      // Compress and resize from the buffer
      await sharp(imageBuffer)
        .resize({ width: 1200, withoutEnlargement: true }) // limit max width to 1200px for super-fast loading
        .webp({ quality: 75 }) // high performance WebP optimization sweet-spot
        .toFile(tempPath);

      // Overwrite/Replace the original file safely
      if (path.extname(file).toLowerCase() === '.webp') {
        fs.unlinkSync(inputPath);
        fs.renameSync(tempPath, inputPath);
      } else {
        // If it was a jpg/png, we convert it to webp and delete the old format
        fs.renameSync(tempPath, outputPath);
        fs.unlinkSync(inputPath);
        console.log(`  Converted ${file} -> ${outputName}`);
      }

      const afterStats = fs.statSync(outputPath);
      const afterSizeKB = (afterStats.size / 1024).toFixed(1);
      const reduction = ((1 - afterStats.size / beforeSize) * 100).toFixed(1);
      const savedBytes = beforeSize - afterStats.size;
      totalSaved += savedBytes;

      console.log(`  Size after: ${afterSizeKB} KB - Reduced by ${reduction}%`);
    }

    console.log('\n=========================================');
    console.log(`Image compression completed successfully!`);
    console.log(`Total storage saved: ${(totalSaved / (1024 * 1024)).toFixed(2)} MB`);
    console.log('=========================================');
  } catch (error) {
    console.error('Error compressing images:', error);
  }
}

compressImages();
