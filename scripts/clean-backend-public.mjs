// Membersihkan hasil build lama di backend/public sebelum `vite build` (dijalankan otomatis oleh
// `npm run build` lewat hook `prebuild`). Hanya berkas hasil build yang dihapus; index.php, .htaccess,
// favicon.ico, robots.txt, dan storage (symlink unggahan) tidak disentuh.
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../backend/public');

// Penjaga: hanya bersihkan bila ini benar-benar folder public Laravel.
if (!existsSync(resolve(publicDir, 'index.php'))) {
  console.error(`Folder public Laravel tidak ditemukan di ${publicDir} (index.php tidak ada).`);
  console.error('Letakkan folder backend sejajar dengan frontend, atau build manual: npx vite build --outDir dist');
  process.exit(1);
}

const stale = ['assets', 'index.html', 'sw.js', 'manifest.webmanifest', 'registerSW.js'];
for (const name of readdirSync(publicDir)) {
  if (stale.includes(name) || /^workbox-.*\.js$/.test(name)) {
    rmSync(resolve(publicDir, name), { recursive: true, force: true });
    console.log(`dihapus: backend/public/${name}`);
  }
}
