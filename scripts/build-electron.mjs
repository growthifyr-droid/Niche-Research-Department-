import { build } from 'esbuild';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const outDir = path.join(root, 'dist-electron');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('[Build Electron] Compiling Main and Preload with esbuild...');

try {
  // 1. Build Main Process
  await build({
    entryPoints: [path.join(root, 'src/main/index.ts')],
    outfile: path.join(outDir, 'main/index.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['electron', 'better-sqlite3', 'electron-updater'],
    sourcemap: true,
    minify: false,
  });
  console.log('✓ Main process compiled to dist-electron/main/index.js');

  // 2. Build Preload Script
  await build({
    entryPoints: [path.join(root, 'src/preload/index.ts')],
    outfile: path.join(outDir, 'preload/index.js'),
    bundle: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    external: ['electron'],
    sourcemap: true,
    minify: false,
  });
  console.log('✓ Preload script compiled to dist-electron/preload/index.js');
  console.log('[Build Electron] Electron build completed successfully.');
} catch (err) {
  console.error('[Build Electron] Compilation failed:', err);
  process.exit(1);
}
