import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

async function generateIcons() {
  const sourceImage = path.join(process.cwd(), 'src/assets/images/niche_icon_1789122182071.jpg');
  const buildDir = path.join(process.cwd(), 'build');
  const publicDir = path.join(process.cwd(), 'public');

  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
  }

  console.log('[IconGen] Reading source asset:', sourceImage);

  // Generate individual size PNGs
  const sizes = [256, 128, 64, 48, 32, 16];
  const pngFiles = [];

  for (const size of sizes) {
    const outPath = path.join(buildDir, `icon-${size}.png`);
    await sharp(sourceImage)
      .resize(size, size, { fit: 'cover' })
      .png({ quality: 100 })
      .toFile(outPath);
    pngFiles.push(outPath);
    console.log(`[IconGen] Generated ${size}x${size} PNG: ${outPath}`);
  }

  // Generate 512x512 master icon.png in build and public
  const masterIconPath = path.join(buildDir, 'icon.png');
  await sharp(sourceImage)
    .resize(512, 512, { fit: 'cover' })
    .png({ quality: 100 })
    .toFile(masterIconPath);
  fs.copyFileSync(masterIconPath, path.join(publicDir, 'icon.png'));

  // Generate multi-resolution icon.ico for Windows
  console.log('[IconGen] Packing multi-resolution ICO file...');
  const icoBuffer = await pngToIco(pngFiles);
  const icoPath = path.join(buildDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);

  console.log(`[IconGen] Successfully generated Windows multi-size ICO at: ${icoPath}`);
  console.log(`[IconGen] Successfully generated master PNG at: ${masterIconPath}`);
}

generateIcons().catch(err => {
  console.error('[IconGen] Failed to generate icons:', err);
  process.exit(1);
});
