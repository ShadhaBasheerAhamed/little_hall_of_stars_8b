// Build script for The Little Hall of Stars (bundles React + CSS into ./dist).
//   node build.mjs            -> production build into dist/
//   node build.mjs --serve    -> build, then serve dist/ locally on http://localhost:5173
//   ADMIN_PASSCODE=yourword node build.mjs   -> sets the teacher/admin passcode
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(here, 'dist');

async function loadEsbuild() {
  try {
    return await import('esbuild');
  } catch {
    // Fallback for machines where esbuild is installed globally / in a shared tools folder.
    return await import('/opt/npm-tools/node_modules/esbuild/lib/main.js');
  }
}

function globalNodeModules() {
  try {
    return [execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()];
  } catch {
    return [];
  }
}

const passcode = process.env.ADMIN_PASSCODE || 'ShadhaMam8B';
const adminHash = crypto.createHash('sha256').update(passcode).digest('hex');
if (!process.env.ADMIN_PASSCODE) {
  console.warn('\n[!] Using the DEFAULT admin passcode. Before sharing the site, rebuild with:\n    ADMIN_PASSCODE="your-own-passcode" node build.mjs\n');
}

const esbuild = await loadEsbuild();
const options = {
  entryPoints: [path.join(here, 'src/main.jsx')],
  bundle: true,
  minify: true,
  sourcemap: false,
  format: 'iife',
  target: ['es2020', 'chrome90', 'safari15', 'firefox90'],
  jsx: 'automatic',
  loader: { '.json': 'json' },
  outdir: path.join(dist, 'assets'),
  nodePaths: globalNodeModules(),
  define: {
    'process.env.NODE_ENV': '"production"',
    __ADMIN_HASH__: JSON.stringify(adminHash),
  },
  logLevel: 'info',
};

fs.mkdirSync(dist, { recursive: true });
fs.copyFileSync(path.join(here, 'index.html'), path.join(dist, 'index.html'));
// Copy student.html to dist root for direct URL access (e.g., /student.html?id=823)
fs.copyFileSync(path.join(here, 'public', 'student.html'), path.join(dist, 'student.html'));
// Copy QR codes ZIP and PDF to dist root for direct download
fs.copyFileSync(path.join(here, 'public', 'qr-codes.zip'), path.join(dist, 'qr-codes.zip'));
fs.copyFileSync(path.join(here, 'public', 'qr-codes.pdf'), path.join(dist, 'qr-codes.pdf'));
// Static files (3D bouquet model etc.) are copied as-is into dist/assets/.
if (fs.existsSync(path.join(here, 'public'))) fs.cpSync(path.join(here, 'public'), path.join(dist, 'assets'), { recursive: true });

if (process.argv.includes('--serve')) {
  const ctx = await esbuild.context(options);
  await ctx.watch();
  const { port } = await ctx.serve({ servedir: dist, port: 5173 });
  console.log(`Serving on http://localhost:${port}  (rebuilds on save)`);
} else {
  await esbuild.build(options);
  console.log('Built to', dist);
}
